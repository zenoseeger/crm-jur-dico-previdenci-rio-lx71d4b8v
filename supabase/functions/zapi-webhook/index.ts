import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('Webhook payload received', JSON.stringify(payload));

    if (payload.isGroup) {
        return new Response('ok - ignored group', { status: 200, headers: corsHeaders });
    }

    // Ignore status updates
    const isStatusUpdate = payload.status !== undefined || payload.event === 'onMessageStatus' || payload.deliveryStatus || payload.waitingMessage;
    if (isStatusUpdate && !payload.text && !payload.image && !payload.audio && !payload.document && !payload.video && !payload.sticker) {
        return new Response('ok - ignored status update', { status: 200, headers: corsHeaders });
    }

    const instanceId = payload.instanceId;
    const phone = payload.phone;
    
    if (!instanceId || !phone) {
      return new Response('Missing required fields (instanceId, phone)', { status: 400, headers: corsHeaders });
    }

    const isFromMe = payload.fromMe === true;

    // Advanced extraction mapping
    let content = '';
    let messageType = 'text';

    if (payload.text) {
      content = payload.text.message?.trim() || '';
    } else if (payload.audio) {
      content = '[Áudio recebido]';
      messageType = 'audio';
    } else if (payload.video) {
      content = payload.video.caption?.trim() || '';
      if (!content) content = '[Vídeo recebido]';
      messageType = 'video';
    } else if (payload.image) {
      content = payload.image.caption?.trim() || '';
      if (!content) content = '[Imagem recebida]';
      messageType = 'image';
    } else if (payload.document) {
      content = payload.document.caption?.trim() || payload.document.fileName?.trim() || '';
      if (!content) content = '[Documento recebido]';
      messageType = 'document';
    } else if (payload.sticker) {
      content = '[Figurinha recebida]';
      messageType = 'sticker';
    } else if (payload.location) {
      content = '[Localização recebida]';
      messageType = 'location';
    } else if (payload.contacts) {
      content = '[Contato recebido]';
      messageType = 'contact';
    } else if (payload.buttonResponseMessage) {
      content = payload.buttonResponseMessage.buttonText || '[Botão clicado]';
    } else if (payload.listResponseMessage) {
      content = payload.listResponseMessage.title || '[Opção selecionada]';
    } else if (payload.extendedTextMessage) {
      content = payload.extendedTextMessage.text || '[Mensagem estendida]';
    }

    if (!content) {
      content = '[Mensagem/Mídia]';
    }

    const mediaUrl = payload.image?.imageUrl || payload.document?.documentUrl || payload.audio?.audioUrl || payload.video?.videoUrl || null;
    
    const { data: config } = await supabase
      .from('whatsapp_configs')
      .select('id, user_id, status, company_id')
      .eq('instance_id', instanceId)
      .single();

    if (!config) {
      return new Response('Instance not found or not linked to any user', { status: 404, headers: corsHeaders });
    }

    if (config.status !== 'connected') {
      await supabase.from('whatsapp_configs').update({ status: 'connected', last_error: null }).eq('id', config.id);
    }

    const { data: leads } = await supabase
      .from('leads')
      .select('id, phone')
      .eq('company_id', config.company_id);

    let leadId = null;
    if (leads) {
      const normalizedIncomingPhone = String(phone).replace(/\D/g, '');
      const match = leads.find(l => {
        const normalizedLeadPhone = String(l.phone || '').replace(/\D/g, '');
        if (!normalizedLeadPhone) return false;
        return normalizedIncomingPhone.endsWith(normalizedLeadPhone) || normalizedLeadPhone.endsWith(normalizedIncomingPhone);
      });
      if (match) leadId = match.id;
    }

    if (!leadId && !isFromMe) {
      const pushName = payload.senderName || payload.pushName || payload.contactName || phone;
      
      let pipelineId = 'p1';
      const { data: userPipelines } = await supabase
        .from('pipelines')
        .select('id, user_id, user_ids')
        .eq('company_id', config.company_id)
        .order('created_at', { ascending: true });
        
      if (userPipelines) {
        const userPipeline = userPipelines.find((p: any) => p.user_id === config.user_id || (p.user_ids && p.user_ids.includes(config.user_id)));
        if (userPipeline) {
            pipelineId = userPipeline.id;
        } else if (userPipelines.length > 0) {
            pipelineId = userPipelines[0].id;
        }
      }

      let stageName = 'NOVO LEAD';
      const { data: stages } = await supabase
        .from('pipeline_stages')
        .select('name')
        .eq('pipeline_id', pipelineId)
        .order('order', { ascending: true })
        .limit(1);
        
      if (stages && stages.length > 0) {
        stageName = stages[0].name;
      }

      const { data: newLead, error: createLeadError } = await supabase
        .from('leads')
        .insert({
          company_id: config.company_id,
          user_id: config.user_id,
          name: pushName,
          phone: phone,
          stage: stageName,
          pipeline_id: pipelineId,
          unread: true
        })
        .select('id')
        .single();
        
      if (createLeadError) {
        console.error('Error creating lead:', createLeadError);
      } else if (newLead) {
        leadId = newLead.id;
        
        await supabase.from('whatsapp_logs').insert({
          company_id: config.company_id,
          user_id: config.user_id,
          event_type: 'LEAD_CREATED',
          message: `Novo lead criado via WhatsApp: ${pushName} (${phone})`,
          details: { leadId: newLead.id, phone, pipelineId, stageName }
        });
      }
    }

    if (leadId) {
      const direction = isFromMe ? 'outbound' : 'inbound';

      // Anti-duplicate loop check for fromMe messages
      if (isFromMe) {
        const { data: recentMsgs } = await supabase
          .from('messages')
          .select('id, content')
          .eq('lead_id', leadId)
          .eq('direction', 'outbound')
          .order('created_at', { ascending: false })
          .limit(10);

        const isDuplicate = recentMsgs?.some(m => {
          const c1 = m.content.trim().toLowerCase().replace(/^\[ia\]\s*/, '');
          const c2 = content.trim().toLowerCase();
          return c1 === c2;
        });
        
        if (isDuplicate) {
           return new Response('ok - ignored duplicate fromMe', { status: 200, headers: corsHeaders });
        }
      }

      const { error: insertError } = await supabase.from('messages').insert({
        company_id: config.company_id,
        user_id: config.user_id,
        lead_id: leadId,
        content,
        direction,
        media_url: mediaUrl,
        message_type: messageType,
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response('Database Error', { status: 500, headers: corsHeaders });
      }

      if (direction === 'inbound') {
        await supabase.from('leads').update({ unread: true }).eq('id', leadId);

        // Invoke ai-observer asynchronously only for inbound messages
        try {
          fetch(`${supabaseUrl}/functions/v1/ai-observer`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ leadId, userId: config.user_id })
          }).catch(err => console.error('Failed to trigger ai-observer', err));
        } catch (e) {
          console.error('Error invoking ai-observer:', e);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
  }
});
