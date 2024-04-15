import { Pup } from "https://deno.land/x/pup/mod.ts"

const processConfiguration = {
  notorious: 'sillonious',
  client: true,
  reverseClient: false,
  server: true,
  reverseServer: false,
  identity: true,
  reverseIdentity: false,
  repository: true,
  reverseRespository: false,
  relay: true,
  reverseRelay: false,
  database: false,
  reverseDatabase: false,
  features: {
    client: {
      "id": "plan98-start-client",
      "cmd": "deno task start-client",
      "autostart": true
    },
    reverseClient: {
      "id": "plan98-reverse-client",
      "cmd": "deno task reverse-client",
      "autostart": true
    },
    server: {
      "id": "plan98-start-server",
      "cmd": "deno task start-server",
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
      "cmd": "deno task start-relay",
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
