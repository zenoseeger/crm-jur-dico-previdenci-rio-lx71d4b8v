import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Use service role to ensure background tasks have access to all necessary data
const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { leadId, userId } = await req.json()

    if (!leadId || !userId) {
      return new Response('Missing required fields (leadId, userId)', {
        status: 400,
        headers: corsHeaders,
      })
    }

    // Fetch AI Config
    const { data: aiConfig, error: configError } = await supabase
      .from('ai_configs')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (configError || !aiConfig || !aiConfig.enabled || !aiConfig.api_key) {
      return new Response('AI not configured or disabled', { status: 200, headers: corsHeaders })
    }

    // Fetch Messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true })

    if (messagesError || !messages || messages.length === 0) {
      return new Response('No messages found', { status: 200, headers: corsHeaders })
    }

    // Process Transcriptions for audio messages
    let conversationText = ''

    for (const msg of messages) {
      let content = msg.content

      // Handle audio transcription
      if (
        msg.message_type === 'audio' &&
        msg.media_url &&
        (content === '[Áudio recebido]' || !content)
      ) {
        try {
          const audioRes = await fetch(msg.media_url)
          if (audioRes.ok) {
            const audioBlob = await audioRes.blob()
            const formData = new FormData()

            // OpenAI Whisper API requires a file extension
            const ext = msg.media_url.includes('.mp4')
              ? 'm4a'
              : msg.media_url.includes('.ogg')
                ? 'ogg'
                : 'webm'
            formData.append('file', audioBlob, `audio.${ext}`)
            formData.append('model', 'whisper-1')

            const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${aiConfig.api_key}`,
              },
              body: formData,
            })

            if (whisperRes.ok) {
              const whisperData = await whisperRes.json()
              content = `[Áudio Transcrito]: ${whisperData.text}`

              // Update database with transcription
              await supabase.from('messages').update({ content }).eq('id', msg.id)
            } else {
              console.error('Whisper API Error:', await whisperRes.text())
              content = '[Áudio não pôde ser transcrito]'
            }
          }
        } catch (transcriptionErr) {
          console.error('Error during transcription:', transcriptionErr)
          content = '[Erro na transcrição de áudio]'
        }
      }

      const role = msg.direction === 'inbound' ? 'Lead' : 'Atendimento'
      conversationText += `[${new Date(msg.created_at).toLocaleString()}] ${role}: ${content}\n`
    }

    if (!conversationText) {
      return new Response('Empty conversation', { status: 200, headers: corsHeaders })
    }

    // Call OpenAI for Summarization and Qualification
    const systemPrompt = `You are a highly capable AI assistant acting as a silent observer in a law firm CRM.
Your task is to analyze the following conversation history between a potential client (Lead) and the business (Atendimento).

Instructions:
${aiConfig.qualification_prompt || 'Analyze the conversation and provide a score from 0 to 100 indicating the probability of closing the deal or how qualified the lead is. Write a concise summary of the client needs, current situation, and missing documentation.'}
If a Knowledge Base is provided below, use it as context for your evaluation.
Knowledge Base: ${aiConfig.knowledge_base || 'None'}

Output Requirements:
You MUST respond strictly with a valid JSON object containing exactly two keys:
- "summary": A concise string (max 3-4 sentences) summarizing the lead's situation in Portuguese.
- "score": An integer number between 0 and 100 representing the qualification score.`

    const completionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${aiConfig.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiConfig.model || 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: conversationText },
        ],
      }),
    })

    if (!completionRes.ok) {
      const errorText = await completionRes.text()
      throw new Error(`OpenAI API Error: ${errorText}`)
    }

    const completionData = await completionRes.json()
    const resultJson = JSON.parse(completionData.choices[0].message.content)

    const summary = resultJson.summary || ''
    const score = parseInt(resultJson.score) || 0

    // Update Lead with new summary and score
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        ai_summary: summary,
        ai_score: score,
      })
      .eq('id', leadId)

    if (updateError) {
      throw updateError
    }

    return new Response(JSON.stringify({ success: true, summary, score }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('AI Observer Error:', err)

    // Attempt to log error asynchronously
    try {
      const { userId } = await req.json().catch(() => ({ userId: null }))
      if (userId) {
        await supabase.from('whatsapp_logs').insert({
          user_id: userId,
          event_type: 'AI_OBSERVER_ERROR',
          message: 'Erro durante a análise silenciosa da IA',
          details: { error: err.message },
        })
      }
    } catch (e) {
      // Ignore inner logging errors
    }

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
