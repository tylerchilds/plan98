const express = require('express')
const fetch = require('node-fetch')
const request = require("request");
const OAuth = require("oauth-1.0a");
const crypto = require("crypto");
const session = require('express-session')
const bodyParser = require('body-parser')
const grant = require('grant').express()
require('dotenv').config()

const oauthConfig = {
  "defaults": {
    "origin": "http://localhost:1989",
    "transport": "session"
  },
  "smugmug": {
    "key": process.env.SMUGMUG_API_KEY,
    "secret": process.env.SMUGMUG_API_SECRET,
    "callback": "/api/smugmug/callback"
  }
}

const oauth = OAuth({
  consumer: {
    key: process.env.SMUGMUG_API_KEY, // Replace with your actual consumer key
    secret: process.env.SMUGMUG_API_SECRET, // Replace with your actual consumer secret
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto
      .createHmac("sha1", key)
      .update(base_string)
      .digest("base64");
  },
});

const bus = require('statebus')({
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

app = express()
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(bodyParser.raw())

app.use(session({secret: 'grant', saveUninitialized: true, resave: false}))
app.use(grant(oauthConfig))
app.get('/api/smugmug/callback', (req, res) => {
  res.end(JSON.stringify(req.session.grant.response, null, 2))
})

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

function uriByType(user) {
  return {
  }
}

// Create the HTTP server
require('http')
    .createServer(app)
    .listen(1989, () => console.log('listening on 1989'))


// Serve files from disk
var send_file = (f) => (r, res) => res.sendFile(__dirname + '/' + f)
app.get('/client',             send_file('client.html'))

// Serve libraries
app.get('/statebus.js',  send_file('node_modules/statebus/statebus.js'))
app.get('/cutestrap.css',  send_file('node_modules/cutestrap/dist/css/cutestrap.css'))
app.get('/statebus-client-library.js',
                         send_file('node_modules/statebus/client-library.js'))
app.get('/braidify.js',  send_file('node_modules/braidify/braidify-client.js'))

app.get("/api/smugmug/current-user", (req, res) => {
  const url = `https://api.smugmug.com/api/v2!authuser`;
  smugmug({ url }, req, res)
})

function smugmug(options, req, res) {
  const { url, method="GET", key, secret } = options

  try {
    // Set up the OAuth 1.0a parameters
    const requestData = {
      url,
      method,
    };
    const token = {
      key: process.env.HARDCODED_ACCESS_TOKEN,
      secret: process.env.HARDCODED_ACCESS_SECRET,
    };
    const headers = oauth.toHeader(oauth.authorize(requestData, token));

    // Make the HTTP GET request using the 'request' package
    request.get(
      {
        url,
        headers,
        json: true,
      },
      (error, response, body) => {
        if (error) {
          return res.status(500).json({ error: "Internal server error" });
        }

        console.log(response, body)
        // Check if the request was successful (status code 200)
        if (response.statusCode === 200) {
          // Respond with the albums data
          res.json(body);
        } else {
          // Respond with an error message if the request failed
          res.status(response.statusCode).json({ error: "Request failed" });
        }
      }
    );
  } catch (error) {
    console.error(error)
    // Handle any errors that occurred during the request
    res.status(500).json({ error: 'whoops' });
  }

}

app.get("/api/smugmug/node", (req, res) => {
  const url = `https://api.smugmug.com/api/v2/user/${process.env.HARDCODED_USER_ID}?_expand=Node.ChildNodes`;
  smugmug({ url }, req, res)
});

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


