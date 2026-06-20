import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

// 1. Tell Hono about our environment variables
type Bindings = {
  SUPABASE_URL: string
  SUPABASE_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 2. Simple health check route
app.get('/', (c) => {
  return c.text('Duva API is running!')
})

// 3. The Profile Registration Route
app.post('/register', async (c) => {
  // Initialize Supabase using the keys from .dev.vars
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY)

  try {
    // Grab the data sent from the mobile app
    const body = await c.req.json()

    // Insert the data into your 'profiles' table
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          first_name: body.firstName,
          last_name: body.lastName,
          location: body.location,
          bio: body.bio,
          dob: body.dob, // Format expected: YYYY-MM-DD
          work: body.work,
          education: body.education,
          gender_id: body.genderId
        }
      ])
      .select() // Ask Supabase to return the newly created record

    // If Supabase throws an error (like a missing required field), catch it
    if (error) throw error

    // Send the success response back to the mobile app
    return c.json({ success: true, profile: data[0] })

  } catch (error: any) {
    console.error("Database Error:", error)
    return c.json({ success: false, error: error.message }, 400)
  }
})

export default app