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
    console.log('Webhook payload received')

    const instanceId = payload.instanceId
    const phone = payload.phone
    const content =
      payload.text?.message ||
      payload.image?.caption ||
      payload.document?.caption ||
      '[Media/Unknown]'
    const mediaUrl = payload.image?.imageUrl || payload.document?.documentUrl || null

    let messageType = 'text'
    if (payload.image) messageType = 'image'
    if (payload.document) messageType = 'document'

    if (!instanceId || !phone) {
      return new Response('Missing required fields (instanceId, phone)', {
        status: 400,
        headers: corsHeaders,
      })
    }

    // 1. Encontrar o usuário através do instance_id configurado no Z-api
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

    // 2. Encontrar o lead associado ao número de telefone
    const { data: leads } = await supabase
      .from('leads')
      .select('id, phone')
      .eq('user_id', config.user_id)

    let leadId = null
    if (leads) {
      const normalizedIncomingPhone = String(phone).replace(/\D/g, '')
      const match = leads.find((l) => {
        const normalizedLeadPhone = String(l.phone || '').replace(/\D/g, '')
        // Validação flexível para cobrir DDI/DDD
        return (
          normalizedIncomingPhone.endsWith(normalizedLeadPhone) ||
          normalizedLeadPhone.endsWith(normalizedIncomingPhone)
        )
      })
      if (match) leadId = match.id
    }

    // 3. Inserir a mensagem recebida no histórico (tabela messages)
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

    // 4. Marcar o lead como não lido para notificar o atendente
    if (leadId) {
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
