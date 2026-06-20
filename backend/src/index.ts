import { Hono } from 'hono'
import { cors } from 'hono/cors' // 1. Import CORS
import { createClient } from '@supabase/supabase-js'

type Bindings = {
  SUPABASE_URL: string
  SUPABASE_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 2. Tell the server to allow requests from your web browser
app.use('/*', cors())

// Simple health check route
app.get('/', (c) => {
  return c.text('Duva API is running!')
})

// The Profile Registration Route
app.post('/register', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY)

  try {
    const body = await c.req.json()

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          first_name: body.firstName,
          last_name: body.lastName,
          location: body.location,
          bio: body.bio,
          dob: body.dob,
          work: body.work,
          education: body.education,
          gender_id: body.genderId
        }
      ])
      .select() 

    if (error) throw error

    return c.json({ success: true, profile: data[0] })

  } catch (error: any) {
    console.error("Database Error:", error)
    return c.json({ success: false, error: error.message }, 400)
  }
})

// 4. The Pool Route (Fetch profiles for the feed)
app.get('/pool', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY)

  try {
    // Fetch 10 random profiles from the database
    // Later, we will add logic to exclude profiles the user has already swiped on
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, location, bio, dob, work, education, images')
      .limit(10)

    if (error) throw error

    return c.json({ success: true, profiles: data })

  } catch (error: any) {
    console.error("Database Error:", error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default app