require('dotenv').config()

const bus = require('statebus')({
  client: (client) => {
    client.honk = 1
    client('profile/*', {
      get: (key) => {
        return client.state.current_user.logged_in
          ? bus.state[key] : null
      },
      set: (obj, t) => {
        const { key, val } = obj
        if(client.state.current_user.logged_in) {
          master.state[key] = val
        } else {
          t.abort()
        }
      }
    })

    client.shadows(bus)
  }
})
const express = require('express')

const bodyParser = require('body-parser');
const OAuthServer = require('express-oauth-server');

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


const app = express()
const port = 1989

/*
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all('*', checkUser);

function checkUser(req, res, next) {
  const nonSecurePaths = ['/', '/about', '/contact'];
  // data is public by default-- not a rule, but an artistic liberty
  if (req.method === 'GET') return next()
  if (nonSecurePaths.includes(req.path)) return next()

  //authenticate user
  if(req.path.startsWith('/~')) {
    // if some token in the request matches the given user...
    return next()
  }

  res.send(401, 'Unauthorized');
}
*/

app.get('/', (req, res) => {
  res.send(`
    <oauth-flow></oauth-flow>
    <script type="module">
      import tag from 'https://deno.land/x/tag@v0.3.2/mod.js'
      const $ = tag('oauth-flow')

      $.render(target => {
        return 'hello world'
      })
    </script>
  `)
})

app.use(bus.libs.http_in)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// Setup the statebus!
bus.honk = 1                // Print handy debugging output
bus.libs.file_store()       // Persist state onto disk
