import { Pup } from "https://deno.land/x/pup/mod.ts"

const processConfiguration = {
  notorious: 'sillonious',
  client: true,
  reverseClient: true,
  server: true,
  reverseServer: true,
  plugDrive: true,
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
    plugDrive: {
      "id": "plan98-plug-drive",
      "cmd": "deno task plug-drive",
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
