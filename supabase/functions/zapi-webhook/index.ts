import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log('Webhook payload received', JSON.stringify(payload))

    if (payload.fromMe) {
      return new Response('ok - ignored fromMe', { status: 200, headers: corsHeaders })
    }

    if (payload.isGroup) {
      return new Response('ok - ignored group', { status: 200, headers: corsHeaders })
    }

    const instanceId = payload.instanceId
    const phone = payload.phone

    if (!instanceId || !phone) {
      return new Response('Missing required fields (instanceId, phone)', {
        status: 400,
        headers: corsHeaders,
      })
    }

    let content = '[Mensagem/Mídia]'
    if (payload.text?.message) content = payload.text.message
    else if (payload.audio) content = '[Áudio recebido]'
    else if (payload.video) content = payload.video.caption || '[Vídeo recebido]'
    else if (payload.image) content = payload.image.caption || '[Imagem recebida]'
    else if (payload.document)
      content = payload.document.caption || payload.document.fileName || '[Documento recebido]'
    else if (payload.sticker) content = '[Figurinha recebida]'
    else if (payload.location) content = '[Localização recebida]'
    else if (payload.contacts) content = '[Contato recebido]'

    const mediaUrl =
      payload.image?.imageUrl ||
      payload.document?.documentUrl ||
      payload.audio?.audioUrl ||
      payload.video?.videoUrl ||
      null

    let messageType = 'text'
    if (payload.image) messageType = 'image'
    else if (payload.document) messageType = 'document'
    else if (payload.audio) messageType = 'audio'
    else if (payload.video) messageType = 'video'
    else if (payload.sticker) messageType = 'sticker'
    else if (payload.location) messageType = 'location'
    else if (payload.contacts) messageType = 'contact'

    const { data: config } = await supabase
      .from('whatsapp_configs')
      .select('user_id')
      .eq('instance_id', instanceId)
      .single()

    if (!config) {
      return new Response('Instance not found or not linked to any user', {
        status: 404,
        headers: corsHeaders,
      })
    }

    await supabase.from('whatsapp_logs').insert({
      user_id: config.user_id,
      event_type: 'WEBHOOK_RECEIVED',
      message: `Mensagem recebida de ${phone}`,
      details: payload,
    })

    const { data: leads } = await supabase
      .from('leads')
      .select('id, phone')
      .eq('user_id', config.user_id)

    let leadId = null
    if (leads) {
      const normalizedIncomingPhone = String(phone).replace(/\D/g, '')
      const match = leads.find((l) => {
        const normalizedLeadPhone = String(l.phone || '').replace(/\D/g, '')
        if (!normalizedLeadPhone) return false
        return (
          normalizedIncomingPhone.endsWith(normalizedLeadPhone) ||
          normalizedLeadPhone.endsWith(normalizedIncomingPhone)
        )
      })
      if (match) leadId = match.id
    }

    if (!leadId) {
      const pushName = payload.senderName || payload.pushName || payload.contactName || phone
      const { data: newLead, error: createLeadError } = await supabase
        .from('leads')
        .insert({
          user_id: config.user_id,
          name: pushName,
          phone: phone,
          stage: 'NOVO LEAD',
          unread: true,
        })
        .select('id')
        .single()

      if (createLeadError) {
        console.error('Error creating lead:', createLeadError)
      } else if (newLead) {
        leadId = newLead.id

        await supabase.from('whatsapp_logs').insert({
          user_id: config.user_id,
          event_type: 'LEAD_CREATED',
          message: `Novo lead criado via WhatsApp: ${pushName} (${phone})`,
          details: { leadId: newLead.id, phone },
        })
      }
    }

    if (leadId) {
      const { error: insertError } = await supabase.from('messages').insert({
        user_id: config.user_id,
        lead_id: leadId,
        content,
        direction: 'inbound',
        media_url: mediaUrl,
        message_type: messageType,
      })

      if (insertError) {
        console.error('Insert error:', insertError)
        return new Response('Database Error', { status: 500, headers: corsHeaders })
      }

      await supabase.from('leads').update({ unread: true }).eq('id', leadId)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})
