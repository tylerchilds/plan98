import { Pup } from "https://deno.land/x/pup/mod.ts"

const processConfiguration = {
  notorious: 'sillonious',
  client: true,
  reverseClient: false,
  server: true,
  reverseServer: false,
  identity: false,
  reverseIdentity: false,
  repository: false,
  reverseRespository: false,
  relay: true,
  reverseRelay: false,
  database: false,
  reverseDatabase: false,
  braidmail: true,
  reverseBraidmail: false,
  multiplayer: true,
  reverseMultiplayer: false,
  features: {
    client: {
      "id": "plan98-start-client",
      "cmd": "deno run -A client.js",
      "autostart": true
    },
    reverseClient: {
      "id": "plan98-reverse-client",
      "cmd": "deno task reverse-client",
      "autostart": true
    },
    server: {
      "id": "plan98-start-server",
      "cmd": "plan98client=$(pwd)/client; cd rust-9p-master/example/unpfs && cargo run --release 'tcp!0.0.0.0!8888' $plan98client",
      "autostart": true
    },
    reverseServer: {
      "id": "plan98-reverse-server",
      "cmd": "deno task reverse-server",
      "autostart": true
    },
    identity: {
      "id": "plan98-start-identity",
      "cmd": "deno task start-identity",
      "autostart": true
    },
    reverseIdentity: {
      "id": "plan98-reverse-identity",
      "cmd": "deno task reverse-identity",
      "autostart": true
    },
    repository: {
      "id": "plan98-start-repository",
      "cmd": "deno task start-repository",
      "autostart": true
    },
    reverseRepository: {
      "id": "plan98-reverse-repository",
      "cmd": "deno task reverse-repository",
      "autostart": true
    },
    relay: {
      "id": "plan98-start-relay",
      "cmd": "cd server/relay && npm start",
      "autostart": true
    },
    reverseRelay: {
      "id": "plan98-reverse-relay",
      "cmd": "deno task reverse-relay",
      "autostart": true
    },
    database: {
      "id": "plan98-start-database",
      "cmd": "deno task start-database",
      "autostart": true
    },
    reverseDatabase: {
      "id": "plan98-reverse-database",
      "cmd": "deno task reverse-database",
      "autostart": true
    },
    braidmail: {
      "id": "plan98-start-braidmail",
      "cmd": "cd server/braidmail/braidmail-master && node server-demo.js",
      "autostart": true
    },
    reverseBraidmail: {
      "id": "plan98-reverse-braidmail",
      "cmd": "deno task reverse-braidmail",
      "autostart": true
    },
    multiplayer: {
      "id": "plan98-start-multiplayer",
      "cmd": "cd server/multiplayer && npm i && node index.mjs",
      "autostart": true
    },
    reverseMultiplayer: {
      "id": "plan98-reverse-multiplayer",
      "cmd": "deno task reverse-multiplayer",
      "autostart": true
    },


  }
}

const activeFeatures = Object.keys(processConfiguration)
  .filter(x => processConfiguration[x] === true)
  .map(x => processConfiguration.features[x])

console.log(activeFeatures)

const pup = await new Pup({
  "processes": activeFeatures
})

// Go!
pup.init()
