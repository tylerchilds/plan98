import { Pup } from "https://deno.land/x/pup/mod.ts"

const processConfiguration = {
  api: true,
  server: true,
  modules: true,
  versionControl: true,
  translate: true,
  multiplayer: true,
  notorious: 'sillonious',
  brandi: 'sorry',
  charlie: 'sorry',
  client: false,
  reverseClient: false,
  reverseApi: false,
  reverseServer: false,
  identity: false,
  reverseIdentity: false,
  reverseModules: false,
  relay: false,
  reverseRelay: false,
  database: false,
  reverseDatabase: false,
  braidmail: false,
  reverseBraidmail: false,
  reverseVersionControl: false,
  solid: false,
  reverseSolid: false,
  reverseTranslate: false,
  activityPub: false,
  reverseActivityPub: false,
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
    api: {
      "id": "plan98-start-api",
      "cmd": "deno task start-api",
      "autostart": true
    },
    reverseApi: {
      "id": "plan98-reverse-api",
      "cmd": "deno task reverse-api",
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
    modules: {
      "id": "plan98-start-modules",
      "cmd": "deno task start-modules",
      "autostart": true
    },
    reverseRepository: {
      "id": "plan98-reverse-modules",
      "cmd": "deno task reverse-modules",
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
    versionControl: {
      "id": "plan98-start-version-control",
      "cmd": "cd server/braid-text/braid-text-master && node server-demo.js",
      "autostart": true
    },
    reverseVersionControl: {
      "id": "plan98-reverse-version-control",
      "cmd": "deno task reverse-version-control",
      "autostart": true
    },
    solid: {
      "id": "plan98-start-solid",
      "cmd": "deno task start-solid",
      "autostart": true
    },
    reverseSolid: {
      "id": "plan98-reverse-solid",
      "cmd": "deno task reverse-solid",
      "autostart": true
    },
    translate: {
      "id": "plan98-start-translate",
      "cmd": "deno task start-translate",
      "autostart": true
    },
    reverseTranslate: {
      "id": "plan98-reverse-translate",
      "cmd": "deno task reverse-translate",
      "autostart": true
    },
    activityPub: {
      "id": "plan98-start-activity-pub",
      "cmd": "deno task start-activity-pub",
      "autostart": true
    },
    reverseActivityPub: {
      "id": "plan98-reverse-activity-pub",
      "cmd": "deno task reverse-activity-pub",
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
