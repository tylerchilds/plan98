const express = require('express')
const fetch = require('node-fetch')
const request = require("request");
const OAuth = require("oauth-1.0a");
const crypto = require("crypto");
const session = require('express-session')
const bodyParser = require('body-parser')

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

// Create the HTTP server
require('http')
    .createServer(app)
    .listen(3000, () => console.log('listening on 3000'))

// Serve files from disk
var send_file = (f) => (r, res) => res.sendFile(__dirname + '/' + f)
app.get('/client',             send_file('client.html'))

// Serve libraries
app.get('/statebus.js',  send_file('node_modules/statebus/statebus.js'))
app.get('/cutestrap.css',  send_file('node_modules/cutestrap/dist/css/cutestrap.css'))
app.get('/statebus-client-library.js',
                         send_file('node_modules/statebus/client-library.js'))
app.get('/braidify.js',  send_file('node_modules/braidify/braidify-client.js'))

// Setup the statebus!
bus.honk = 1                // Print handy debugging output
bus.libs.file_store()       // Persist state onto disk

// Serve other state from statebus
app.use(bus.libs.http_in)
