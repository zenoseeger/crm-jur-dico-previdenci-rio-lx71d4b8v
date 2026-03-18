import { supabase } from '@/lib/supabase/client'

export const logWhatsAppEvent = async (
  userId: string,
  eventType: string,
  message: string,
  details?: any,
) => {
  try {
    await supabase.from('whatsapp_logs').insert({
      user_id: userId,
      event_type: eventType,
      message,
      details: details || {},
    })
  } catch (error) {
    console.error('Failed to log WhatsApp event:', error)
  }
}
