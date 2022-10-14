const { createClient } = require('@supabase/supabase-js')

const bus = require('statebus')()
const express = require('express')
require('dotenv').config()

const options = {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
}

const supabase = createClient(
	process.env.SUPABASE_PROJECT_URL,
	process.env.SUPABASE_PROJECT_KEY,
	options
)

const app = express()
const port = 1989

app.use(bus.libs.http_in)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// Setup the statebus!
bus.honk = 1                // Print handy debugging output
bus.libs.file_store()       // Persist state onto disk
