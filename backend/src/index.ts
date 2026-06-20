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

// --- [ NEW: Fetch Master Data ] ---
app.get('/master-data', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY)
  try {
    const { data: interests, error } = await supabase.from('master_interests').select('*').order('name')
    if (error) throw error
    return c.json({ success: true, interests })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// --- [ UPDATED: The Registration Route ] ---
app.post('/register', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY)
  
  try {
    const body = await c.req.json()

    // 1. Create the Auth account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true 
    })
    if (authError) throw authError

    const newUserId = authData.user.id

    // 2. Insert the main Profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: newUserId,
        first_name: body.firstName,
        last_name: body.lastName,
        location: body.location,
        bio: body.bio,
        dob: body.dob,
        work: body.work,
        education: body.education,
        gender_id: body.genderId,
        expectations: body.expectations 
      }])
      .select()
    if (profileError) throw profileError

    // 3. Insert the Many-to-Many Interest Mappings
    if (body.interestIds && body.interestIds.length > 0) {
      const mappings = body.interestIds.map((interestId: number) => ({
        profile_id: newUserId,
        interest_id: interestId
      }))

      const { error: mappingError } = await supabase
        .from('profile_interests')
        .insert(mappings)
      
      if (mappingError) throw mappingError
    }

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

// 3. UPDATED: The Smart Pool Route
app.get('/pool', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY)
  
  // Grab the user ID from the URL query parameter
  const userId = c.req.query('userId')

  try {
    if (!userId) {
      return c.json({ success: false, error: "Missing userId" }, 400)
    }

    // Step A: Find all the people this user has already swiped on
    const { data: pastSwipes, error: swipeError } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', userId)

    if (swipeError) throw swipeError

    // Create a list of IDs to hide (include the user's own ID so they don't see themselves)
    const hiddenIds = pastSwipes.map(swipe => swipe.swiped_id)
    hiddenIds.push(userId)

    // Step B: Fetch fresh profiles, explicitly excluding the hidden IDs
    let query = supabase
      .from('profiles')
      .select('id, first_name, location, bio, dob, work, education, images')
      .limit(10)

    if (hiddenIds.length > 0) {
      // Supabase format for "NOT IN" requires a comma-separated string enclosed in parentheses
      query = query.not('id', 'in', `(${hiddenIds.join(',')})`)
    }

    const { data, error } = await query

    if (error) throw error
    return c.json({ success: true, profiles: data })

  } catch (error: any) {
    console.error("Pool Error:", error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 4. UPDATED: The Smart Swipe Route
app.post('/swipe', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY)
  
  try {
    const body = await c.req.json()

    // Step A: Record the user's swipe
    const { error } = await supabase
      .from('swipes')
      .insert([{
        swiper_id: body.swiperId,
        swiped_id: body.swipedId,
        action: body.action
      }])

    // Ignore duplicate swipe errors so the app doesn't crash
    if (error && error.code !== '23505') throw error

    // Step B: The Match Engine
    let isMatch = false;
    
    // If we just 'liked' someone, check if they already 'liked' us!
    if (body.action === 'like') {
      const { data: mutualSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_id', body.swipedId) // Did they swipe on...
        .eq('swiped_id', body.swiperId) // ...us?
        .eq('action', 'like')
        .single() // We only need to know if one record exists

      if (mutualSwipe) {
        isMatch = true; // ✨ We have a connection!
      }
    }

    // Send the result back to the phone instantly
    return c.json({ success: true, match: isMatch })

  } catch (error: any) {
    console.error("Swipe Error:", error)
    return c.json({ success: false, error: error.message }, 400)
  }
})

// 5. NEW: The Image Upload Route
app.post('/upload-photo', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY)
  
  try {
    const body = await c.req.json()
    const { userId, base64Image, extension } = body
    
    // Create a unique filename (e.g., user123-17000000.jpg)
    const fileName = `${userId}-${Date.now()}.${extension}`

    // Cloudflare Workers require us to convert Base64 into a raw Byte Array
    const byteCharacters = atob(base64Image)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)

    // 1. Upload the image file to the "avatars" bucket
    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(fileName, byteArray, { 
        contentType: `image/${extension}`,
        upsert: true 
      })

    if (uploadError) throw uploadError

    // 2. Get the public URL of the uploaded image
    const { data: { publicUrl } } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(fileName)

    // 3. Update the user's profile with this new image URL
    // Fetch current profile to get existing images
    const { data: profile } = await supabase
      .from('profiles')
      .select('images')
      .eq('id', userId)
      .single()

    // Append the new image to the existing array (or create a new array if empty)
    const currentImages = profile?.images || []
    const updatedImages = [...currentImages, publicUrl]

    // Update the profile with the combined array
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ images: updatedImages })
      .eq('id', userId)

    if (updateError) throw updateError

    return c.json({ success: true, url: publicUrl })

  } catch (error: any) {
    console.error("Upload Error:", error)
    return c.json({ success: false, error: error.message }, 400)
  }
})

export default app