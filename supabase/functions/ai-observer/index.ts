import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Use service role to ensure background tasks have access to all necessary data
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { leadId, userId, action, messageId } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: aiConfig, error: configError } = await supabase
      .from('ai_configs')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (configError || !aiConfig || !aiConfig.api_key) {
      return new Response(JSON.stringify({ error: 'AI not configured or disabled' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- MANUAL AUDIO TRANSCRIPTION ---
    if (action === 'transcribe_audio') {
      if (!messageId) return new Response(JSON.stringify({ error: 'Missing messageId' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      
      const { data: msg } = await supabase.from('messages').select('*').eq('id', messageId).single();
      if (!msg || !msg.media_url) return new Response(JSON.stringify({ error: 'Message or media not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      try {
        const audioRes = await fetch(msg.media_url);
        if (audioRes.ok) {
          const audioBlob = await audioRes.blob();
          const formData = new FormData();
          const ext = msg.media_url.includes('.mp4') ? 'm4a' : (msg.media_url.includes('.ogg') ? 'ogg' : 'webm');
          formData.append('file', audioBlob, `audio.${ext}`);
          formData.append('model', 'whisper-1');

          const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${aiConfig.api_key}` },
            body: formData
          });

          if (whisperRes.ok) {
            const whisperData = await whisperRes.json();
            const content = `[Áudio Transcrito]: ${whisperData.text}`;
            await supabase.from('messages').update({ content }).eq('id', messageId);
            return new Response(JSON.stringify({ success: true, text: whisperData.text }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
          } else {
             const errorText = await whisperRes.text();
             console.error('Whisper API error:', errorText);
             return new Response(JSON.stringify({ error: 'Whisper failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        }
      } catch (err) {
        console.error('Transcription error:', err);
        return new Response(JSON.stringify({ error: 'Transcription error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    if (!leadId) {
      return new Response(JSON.stringify({ error: 'Missing leadId' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!aiConfig.enabled) {
      return new Response(JSON.stringify({ error: 'AI disabled globally' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('phone, ai_enabled, ai_triggered, company_id')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });

    if (messagesError || !messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages found' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let conversationText = '';
    
    for (const msg of messages) {
      let content = msg.content;

      if (msg.message_type === 'audio' && msg.media_url && (content === '[Áudio recebido]' || !content)) {
        try {
          const audioRes = await fetch(msg.media_url);
          if (audioRes.ok) {
            const audioBlob = await audioRes.blob();
            const formData = new FormData();
            const ext = msg.media_url.includes('.mp4') ? 'm4a' : (msg.media_url.includes('.ogg') ? 'ogg' : 'webm');
            formData.append('file', audioBlob, `audio.${ext}`);
            formData.append('model', 'whisper-1');

            const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${aiConfig.api_key}` },
              body: formData
            });

            if (whisperRes.ok) {
              const whisperData = await whisperRes.json();
              content = `[Áudio Transcrito]: ${whisperData.text}`;
              await supabase.from('messages').update({ content }).eq('id', msg.id);
            }
          }
        } catch (transcriptionErr) {
          console.error('Error during silent transcription:', transcriptionErr);
        }
      }

      const role = msg.direction === 'inbound' ? 'Lead' : 'Atendimento';
      conversationText += `[${new Date(msg.created_at).toLocaleString()}] ${role}: ${content}\n`;
    }

    // --- QUALIFICATION / SUMMARIZATION ---
    let summary = '';
    let score = 0;

    if (action === 'summarize' && conversationText) {
      const systemPrompt = `You are a highly capable AI assistant acting as a silent observer in a law firm CRM.
Your task is to analyze the following conversation history between a potential client (Lead) and the business (Atendimento).

Instructions:
${aiConfig.qualification_prompt || 'Analyze the conversation and provide a score from 0 to 100 indicating the probability of closing the deal or how qualified the lead is. Write a concise summary of the client needs, current situation, and missing documentation.'}
If a Knowledge Base is provided below, use it as context for your evaluation.
Knowledge Base: ${aiConfig.knowledge_base || 'None'}

Output Requirements:
You MUST respond strictly with a valid JSON object containing exactly two keys:
- "summary": A concise string (max 3-4 sentences) summarizing the lead's situation in Portuguese.
- "score": An integer number between 0 and 100 representing the qualification score.`;

      try {
        const completionRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${aiConfig.api_key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: aiConfig.model || 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            temperature: 0.3,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: conversationText }
            ]
          })
        });

        if (completionRes.ok) {
          const completionData = await completionRes.json();
          const resultJson = JSON.parse(completionData.choices[0].message.content);
          summary = resultJson.summary || '';
          score = parseInt(resultJson.score) || 0;

          await supabase
            .from('leads')
            .update({ ai_summary: summary, ai_score: score })
            .eq('id', leadId);
        }
      } catch (e) {
        console.error('Error during summarization:', e);
      }
    }

    // --- AI RESPONSE GENERATION (Triage) ---
    if (action !== 'summarize') {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.direction === 'inbound') {
        const msgText = lastMsg.content || '';
        
        // Anti-loop and placeholder check: Do not reply automatically to pure media/placeholders
        const isPlaceholder = [
          '[Mensagem/Mídia]', 
          '[Imagem recebida]', 
          '[Vídeo recebido]', 
          '[Documento recebido]', 
          '[Figurinha recebida]', 
          '[Localização recebida]', 
          '[Contato recebido]',
          '[Áudio recebido]'
        ].includes(msgText.trim());

        if (isPlaceholder) {
           return new Response(JSON.stringify({ success: true, reason: 'ignoring placeholder' }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
           });
        }

        const cleanMsg = msgText.trim().toLowerCase();
        let shouldTrigger = false;

        if (lead.ai_enabled === false) {
          shouldTrigger = false;
        } else {
          if (lead.ai_triggered) {
            shouldTrigger = true;
          } else if (aiConfig.trigger_mode === 'always') {
            shouldTrigger = true;
          } else if (aiConfig.trigger_mode === 'keyword' && aiConfig.trigger_keyword) {
            const kw = aiConfig.trigger_keyword.toLowerCase().trim();
            if (aiConfig.trigger_condition === 'equals' && cleanMsg === kw) {
              shouldTrigger = true;
            } else if (aiConfig.trigger_condition === 'contains' && cleanMsg.includes(kw)) {
              shouldTrigger = true;
            }
          }
        }

        if (shouldTrigger) {
          if (!lead.ai_triggered) {
            await supabase.from('leads').update({ ai_triggered: true }).eq('id', leadId);
          }

          const triagePrompt = aiConfig.prompt || 'Respond as the assistant directly to the user.';
          const historyMessages = messages.map((m: any) => ({
            role: m.direction === 'inbound' ? 'user' : 'assistant',
            content: m.content
          }));

          const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${aiConfig.api_key}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: aiConfig.model || 'gpt-4o-mini',
              messages: [
                { role: 'system', content: triagePrompt },
                ...historyMessages
              ],
              temperature: 0.7,
            })
          });

          if (chatRes.ok) {
            const chatData = await chatRes.json();
            const aiReply = chatData.choices[0]?.message?.content || '';

            if (aiReply) {
              const responseDelay = aiConfig.response_delay || 0;
              if (responseDelay > 0) {
                await new Promise(r => setTimeout(r, responseDelay * 1000));
              }

              const { data: waConfig } = await supabase.from('whatsapp_configs').select('instance_id, token, client_token').eq('user_id', userId).single();

              const sendWhatsApp = async (text: string) => {
                if (!waConfig || !waConfig.instance_id || !waConfig.token || !waConfig.client_token || !lead.phone) return;
                try {
                  const cleanPhone = String(lead.phone).replace(/\D/g, '');
                  const res = await fetch(`https://api.z-api.io/instances/${waConfig.instance_id}/token/${waConfig.token}/send-text`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Client-Token': waConfig.client_token
                    },
                    body: JSON.stringify({
                      phone: cleanPhone,
                      message: text
                    })
                  });

                  if (!res.ok) {
                    const errText = await res.text();
                    console.error('Failed to send WhatsApp message', errText);
                    await supabase.from('whatsapp_logs').insert({
                      company_id: lead.company_id,
                      user_id: userId,
                      event_type: 'AI_SEND_ERROR',
                      message: `Falha ao enviar mensagem de IA para ${lead.phone}`,
                      details: { error: errText, status: res.status }
                    });

                    if (res.status === 401 || res.status === 403 || res.status === 404 || res.status === 400) {
                       await supabase.from('whatsapp_configs').update({
                         status: 'error',
                         last_error: `Falha na API: HTTP ${res.status}`
                       }).eq('user_id', userId);
                    }
                  } else {
                    await supabase.from('whatsapp_logs').insert({
                      company_id: lead.company_id,
                      user_id: userId,
                      event_type: 'AI_SEND_SUCCESS',
                      message: `Mensagem de IA enviada para ${lead.phone}`,
                      details: { text }
                    });
                    
                    await supabase.from('whatsapp_configs').update({
                      status: 'connected',
                      last_error: null
                    }).eq('user_id', userId);
                  }
                } catch (e: any) {
                  console.error('Error sending WhatsApp message', e);
                  await supabase.from('whatsapp_logs').insert({
                      company_id: lead.company_id,
                      user_id: userId,
                      event_type: 'AI_SEND_ERROR',
                      message: `Erro de rede ao enviar mensagem de IA para ${lead.phone}`,
                      details: { error: e.message }
                  });
                  await supabase.from('whatsapp_configs').update({
                      status: 'error',
                      last_error: `Erro de rede: ${e.message}`
                  }).eq('user_id', userId);
                }
              };

              if (aiConfig.fragment_messages) {
                let chunks = aiReply.split(/\n\n+/).filter((c: string) => c.trim().length > 0);
                if (chunks.length === 1) chunks = aiReply.match(/[^.!?]+[.!?]+/g) || [aiReply];
                chunks = chunks.map((c: string) => c.trim()).filter((c: string) => c.length > 0);

                for (let i = 0; i < chunks.length; i++) {
                  const chunkText = chunks[i];
                  await supabase.from('messages').insert({
                    company_id: lead.company_id, user_id: userId, lead_id: leadId, content: chunkText, direction: 'outbound', message_type: 'text'
                  });
                  await sendWhatsApp(chunkText);
                  if (i < chunks.length - 1) await new Promise(r => setTimeout(r, Math.floor(Math.random() * 2000) + 1000));
                }
              } else {
                await supabase.from('messages').insert({
                  company_id: lead.company_id, user_id: userId, lead_id: leadId, content: aiReply, direction: 'outbound', message_type: 'text'
                });
                await sendWhatsApp(aiReply);
              }
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, summary, score }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('AI Observer Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
