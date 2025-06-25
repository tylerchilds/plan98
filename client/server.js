import { Ed25519Signer } from "https://esm.sh/@did.coop/did-key-ed25519";
import { StorageClient } from "https://esm.sh/@wallet.storage/fetch-client@^1.1.3"

const signer = await Ed25519Signer.generate()
const spaceId = self.crypto.randomUUID()

const contentTypes = {
  // Web documents
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  'default': 'application/octet-stream'
};

function getContentType(filename) {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return contentTypes[ext] || contentTypes.default;
}

function getContentTypeByPath(filePath) {
  const filename = filePath.split('/').pop() || '';
  return getContentType(filename);
}

Deno.serve(
  { hostname: "localhost", port: 1024 },
  async (request) => {
    const url = new URL(request.url);
    let filepath = decodeURIComponent(url.pathname);

    if(filepath === '/') {
      filepath = '/index.html'
    }

    try {
      const file = await Deno.open("." + filepath, { read: true });
      if(file) {
        return new Response(file.readable,  { status: 200, headers: { 'content-type': getContentTypeByPath(filepath) } });
      }
      const resource = space.resource(filepath)
      const data = await resource.get({ signer })
        .then(async res => {
          if(res.status !== 200) {
            throw new Error('Not a 200')
          }
          return (await res)
        })

      if(data) {
        console.log(data)
        return new Response(file.readable,  { status: 200, headers: { 'content-type': getContentTypeByPath(filepath) } });
      }

    } catch {

      const configObject = {
        PLAN98_WAS_HOST: "http://localhost:8080",
        PLAN98_WAS_SPACE_ID: spaceId,
        PLAN98_WAS_SIGNER: JSON.stringify(signer.toJSON())
      }
      const configArray = []
      for(const key of Object.keys(configObject)) {
        configArray.push(`${key}: '${configObject[key]}'`)
      }
      const ENVIRONMENT_VARIABLES = configArray.join(',\n')
      return new Response(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>&lt;:-)</title>
    <style>
      :root {
        --shadow: 0px 0px 2px 2px rgba(0,0,0,.25),
                  0px 0px 6px 6px rgba(0,0,0,.15),
                  0px 0px 2rem 2rem rgba(0,0,0,.05);
        --red: firebrick;
        --orange: darkorange;
        --yellow: gold;
        --green: mediumseagreen;
        --blue: dodgerblue;
        --indigo: slateblue;
        --purple: mediumpurple;
        --violet: mediumpurple;
        --brown: sienna;
        --grey: dimgray;
        --gray: dimgray;
      }

      * {
        box-sizing: border-box;
      }

      html, body {
        height: 100%;
        background: rgba(255,255,255,.85);
        overscroll-behavior: none;
        transform: translateZ(0);
        padding: 0;
        margin: 0;
      }

      body > *{
        position: relative;
        z-index: 2;
      }

      main {
        position: relative;
        height: 100%;
      }

      img {
        max-width: 100%;
        max-height: 100%;
        margin: auto;
      }

      button * {
        pointer-events: none;
      }
    </style>
    <script type="importmap">
      {
        "imports": {
          "@did.coop/did-key-ed25519": "https://esm.sh/@did.coop/did-key-ed25519",
          "@wallet.storage/fetch-client": "https://esm.sh/@wallet.storage/fetch-client@^1.1.3"
        }
      }
    </script>
    <script>
      plan98 = {
        env: {
          ${ENVIRONMENT_VARIABLES}
        }
      }
    </script>
  </head>
  <body>
    <main>
      <h1>Congratulations!</h1>
      <p>
        If you're seeing this you have an identity shared between the server that processed this request and your current session.
      </p>
      <p>
        ${JSON.stringify(signer.toJSON(), '', 2)}
      </p>
    </main>
    <script type="module">
      import { StorageClient } from "@wallet.storage/fetch-client";
      import { Ed25519Signer } from "@did.coop/did-key-ed25519"

      (async function init() {
        const signer = await Ed25519Signer.fromJSON(${JSON.stringify(configObject.PLAN98_WAS_SIGNER)})

        const storageId = plan98.env.PLAN98_WAS_HOST
        if(!storageId) return
        const storageUrl = new URL(storageId)
        const storage = new StorageClient(storageUrl)

        // create the space with signer so all requests get signed by it
        const space = storage.space({
          signer,
          id: "urn:uuid:${configObject.PLAN98_WAS_SPACE_ID}"
        })

        const linkset = space.resource('linkset')
        const spaceObject = {
          controller: signer.controller,
          link: linkset.path,
        }
        const spaceObjectBlob = new Blob(
          [JSON.stringify(spaceObject)],
          { type: 'application/json' },
        )

        const resource = space.resource(window.location.pathname)
        const response = await resource.get()
          .then(res => {
            if (res.status === 200) {
              return res
            }
          })
          .catch(e => {
            console.debug(e)
          })

        if(!response) {
          const responseToPutSpace = await space.put(spaceObjectBlob)
            .then(res => {
              console.debug({ res })
              return res
            })
            .catch(e => {
              console.debug(e)
            })

          if (!responseToPutSpace.ok) throw new Error('Failed to control space')
          if (!responseToPutSpace) return
          const file = await fetch(window.location.href).then(res => res.text()).catch(console.error)

          if(!file) {
            return
          }

          const blobForIndex = new Blob([file], { type: 'text/html' })
            const responseToPutContent = await resource.put(blobForIndex, { signer })
              .then(res => {
                console.debug({ res })
                return res
              })
              .catch(e => {
                console.debug(e)
              })

            if (!responseToPutContent.ok) throw new Error('Failed to upload index')

            if (!responseToPutContent) return
        }

      })()
    </script>
  </body>
</html>`, { status: 404, headers: { 'content-type': 'text/html'} });
    }
  },
);
