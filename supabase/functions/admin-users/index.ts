import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const isSuperAdmin = user.email === 'zhseeger@gmail.com'
    const isAdmin = isSuperAdmin || user.user_metadata?.role === 'Admin'
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()
    const callerCompanyId = callerProfile?.company_id

    if (req.method === 'POST') {
      const { email, password, name, role, company_id } = await req.json()
      const cleanEmail = String(email).trim().toLowerCase()
      const cleanName = String(name).trim()

      const targetCompanyId = isSuperAdmin && company_id ? company_id : callerCompanyId

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: { name: cleanName, role: role || 'SDR', company_id: targetCompanyId },
      })
      if (error) throw error

      if (data.user) {
        await supabaseAdmin.from('profiles').upsert({
          id: data.user.id,
          email: cleanEmail,
          name: cleanName,
          role: role || 'SDR',
          company_id: targetCompanyId,
        })
      }

      return new Response(JSON.stringify({ user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'PUT') {
      const { id, email, password, name, role } = await req.json()
      const cleanEmail = String(email).trim().toLowerCase()
      const cleanName = String(name).trim()

      if (!isSuperAdmin) {
        const { data: targetProfile } = await supabaseAdmin
          .from('profiles')
          .select('company_id')
          .eq('id', id)
          .single()
        if (targetProfile?.company_id !== callerCompanyId) {
          return new Response(JSON.stringify({ error: 'Unauthorized for this company' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
        email: cleanEmail,
        email_confirm: true,
        user_metadata: { name: cleanName, role },
      })
      if (error) throw error

      if (password) {
        const { error: pwdError } = await supabaseAdmin.auth.admin.updateUserById(id, {
          password: password,
        })
        if (pwdError) throw pwdError
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          email: cleanEmail,
          name: cleanName,
          role: role,
        })
        .eq('id', id)

      if (profileError) {
        console.error('Error syncing profile update:', profileError)
      }

      return new Response(JSON.stringify({ user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'DELETE') {
      const { id } = await req.json()
      if (!id) throw new Error('Missing user id')

      if (!isSuperAdmin) {
        const { data: targetProfile } = await supabaseAdmin
          .from('profiles')
          .select('company_id')
          .eq('id', id)
          .single()
        if (targetProfile?.company_id !== callerCompanyId) {
          return new Response(JSON.stringify({ error: 'Unauthorized for this company' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
