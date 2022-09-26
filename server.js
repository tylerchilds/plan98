var bus = require('statebus')()

// Create the HTTP server
require('http')
    .createServer(bus.libs.http_in)
    .listen(4323, () => console.log('listening on 4323'))

// Setup the statebus!
bus.honk = 1                // Print handy debugging output
bus.libs.file_store()       // Persist state onto disk
