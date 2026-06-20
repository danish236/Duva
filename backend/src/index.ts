import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'

type Bindings = {
  SUPABASE_URL: string
  SUPABASE_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()
app.use('/*', cors())

app.get('/', (c) => c.text('Duva API is running!'))

// 1. UPDATED: The Registration Route
app.post('/register', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY)
  
  try {
    const body = await c.req.json()

    // Step A: Create the secure authentication user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true // Skips the email verification step so you can test instantly
    })

    if (authError) throw authError

    // Step B: Save their public profile details, linking the new Auth ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id, // This permanently links the profile to the secure account!
        first_name: body.firstName,
        last_name: body.lastName,
        location: body.location,
        bio: body.bio,
        dob: body.dob,
        work: body.work,
        education: body.education,
        gender_id: body.genderId
      }])
      .select()

    if (profileError) throw profileError

    return c.json({ success: true, profile: profileData[0] })

  } catch (error: any) {
    console.error("Registration Error:", error)
    return c.json({ success: false, error: error.message }, 400)
  }
})

// 2. NEW: The Login Route
app.post('/login', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY)
  
  try {
    const body = await c.req.json()

    // Supabase securely checks the email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })

    if (error) throw error

    // Returns a secure session token
    return c.json({ success: true, session: data.session })

  } catch (error: any) {
    console.error("Login Error:", error)
    return c.json({ success: false, error: error.message }, 400)
  }
})

// 3. The Pool Route (Fetching the feed)
app.get('/pool', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY)
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, location, bio, dob, work, education, images')
      .limit(10)

    if (error) throw error
    return c.json({ success: true, profiles: data })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default app