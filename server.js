const fetch = require('node-fetch')
var bus = require('statebus')({
    client: (client) => {
        client.honk = 1
        console.log('client loaded!')

        client('secret', {
            get: () => {
                if (client.state.current_user.logged_in)
                    return bus.state.profile
                else
                    return null
            }
        })

        client('profile/*', {
            get: (key) => {
                if (client.state.current_user.logged_in)
                    return bus.state[key]
                else
                    return null
            },
            set: (obj, t) => {
                var {key, val} = obj
                console.log('we save wit', obj, t, key, val)
                if (client.state.current_user.logged_in)
                    bus.state[key] = val
                else
                    t.abort()
            }
        })

        client.shadows(bus)
    }
})
var express = require('express')

app = express()

app.get('/exec/*', async (req, res) => {
  const pathname = req.params[0]
  const defaultHandler = (req, res) => res.send('default handler')
  const {
    handler = defaultHandler
  } = await fetch(`http://localhost:1989/edge/${pathname}.js`)
    .then((response) => response.json())
    .then(async (data) => {
      console.log(data)
      if(!data || !data.file) return 'did we edgespect that??'
      const b64moduleData = "data:text/javascript;base64," + btoa(data.file);

      console.log(b64moduleData)
      return await import(b64moduleData);
    })

  console.log(handler)
  handler(req, res)
})


app.use(express.static('public'))

// Create the HTTP server
require('http')
    .createServer(app)
    .listen(1989, () => console.log('listening on 1989'))


// Serve files from disk
var send_file = (f) => (r, res) => res.sendFile(__dirname + '/' + f)
app.get('/client',             send_file('client.html'))

// Serve libraries
app.get('/statebus.js',  send_file('node_modules/statebus/statebus.js'))
app.get('/statebus-client-library.js',
                         send_file('node_modules/statebus/client-library.js'))
app.get('/braidify.js',  send_file('node_modules/braidify/braidify-client.js'))


// Setup the statebus!
bus.honk = 1                // Print handy debugging output
bus.libs.file_store()       // Persist state onto disk


// Serve other state from statebus
app.use(bus.libs.http_in)

// Other libs you might like:
// bus.libs.sqlite_store()
// bus.libs.pg_store()
// bus.libs.firebase_store()
// bus.libs.sqlite_query_server()
// bus.libs.sqlite_table_server()
// bus.libs.serve_email()


