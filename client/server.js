import { Ed25519Signer } from "https://esm.sh/@did.coop/did-key-ed25519";
import { StorageClient } from "https://esm.sh/@wallet.storage/fetch-client@^1.1.3"
import { walk } from "https://deno.land/std/fs/mod.ts";
import sortPaths from "https://esm.sh/sort-paths@1.1.1"
import { DOMParser } from "npm:linkedom@0.18.5";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { typeByExtension } from "https://deno.land/std@0.186.0/media_types/type_by_extension.ts";

config()
self.DOMParser = DOMParser

const port = safeEnv('PLAN98_PORT', 1024)

function safeEnv(key, type='') {
  return Deno.env.get(key) || type
}

const SECRET_KEY = safeEnv('PLAN98_SIGNER', null)
const signer = SECRET_KEY
  ? await Ed25519Signer.fromJSON(SECRET_KEY)
  : await Ed25519Signer.generate()

const SECRET_SPACE = safeEnv('PLAN98_SPACE_ID', null)
const spaceId = SECRET_SPACE
  ? SECRET_SPACE
  : self.crypto.randomUUID()

const walletDefaultHost = safeEnv('PLAN98_WAS_HOST', 'http://localhost:8080')

const keycard = newKeycard({
  name: "ROOT",
  id: spaceId,
  src: '/app/time-machine?id='+spaceId,
})

function newKeycard(overrides={}) {
  const id = self.crypto.randomUUID()
  const keycard = {
    id,
    src: '/app/time-machine?id='+id,
    name: 'Memex',
    host: walletDefaultHost,
    at: new Date().toJSON(),
    ...overrides
  }

  return {
    ...keycard,
    asJSON: signer.toJSON(),
  }
}



const methods = {
  importKeycard: 'import-keycard'
}

function getContentType(filename) {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return typeByExtension(ext);
}

function getContentTypeByPath(filePath) {
  const filename = filePath.split('/').pop() || '';
  return getContentType(filename);
}

function page() {
  const index = template()
  return new DOMParser().parseFromString(index, "text/html");
}

async function showApp(request, tag) {
  const url = new URL(request.url)

  let attributes = ''
  for(const p of url.searchParams) {
    attributes += `${[p[0]]}="${p[1]}"`
  }

  const dom = page()

  const main = dom.querySelector('.the-main-area')
  main.innerHTML = `
    <sillonious-brand>
      <${tag} ${attributes}></${tag}>
    </sillonious-brand>
  `
  return `<!DOCTYPE html>${dom.documentElement}`
}


const byPath = (x) => x.path
async function fileSystem(request) {
  const { search } = new URL(request.url);
  const parameters = new URLSearchParams(search)
  const world = parameters.get('world')
  if(world) {
    const data = await fetch('https://'+world+'/plan98/about').then(res => res.json())
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8"
      },
    });
  } else {
    let paths = []

    const currentPath = Deno.cwd() + (parameters.get('cwd') || '')
    const files = walk(currentPath, {
      skip: [
        /\.git/,
        /\.autosave/,
        /\.swp/,
        /\.swo/,
        /\.env/,
        /node_modules/,
        /backup/,
        /db/
      ],
      includeDirs: true,
    })

    for await(const file of files) {
      const { name } = file
      const [_, path] = file.path.split(currentPath)
      paths.push({ path, name, isDirectory: file.isDirectory })
    }

    paths = sortPaths([...paths], byPath, '/')

    const data = {
      plan98: {
        type: 'FileSystem',
        children: [kids(paths)]
      }
    }

    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8"
      },
    });

  }
}

function kids(paths) {
  const root = { name: '', path: '/', type: 'Directory', children: [] };

  for (const system of paths) {
    const [_, ...pathComponents] = system.path.split('/');
    let currentNode = root;

    for (const component of pathComponents) {
      if (!currentNode.children) {
        currentNode.children = [];
      }

      let childNode = currentNode.children.find(node => node.name === component);

      if (!childNode) {
        childNode = { path: system.path, name: component, type: 'Directory', children: [] };
        currentNode.children.push(childNode);
      }

      currentNode = childNode;
    }

    currentNode.type = system.isDirectory ? 'Directory' : 'File'; 
    delete currentNode.children
  }

  return root;
}

Deno.serve(
  { hostname: "localhost", port },
  async (request) => {
    const url = new URL(request.url);
    let filepath = decodeURIComponent(url.pathname);

    if(filepath === '/') {
      filepath = '/index.html'
    }

    if(filepath === '/plan98/about') {
      return fileSystem(request)
    }

    if(filepath.startsWith('/app/')) {
      const [app] = filepath.split('/app/')[1].split('/')
      const file = await showApp(request, app)

      if(file) {
        return new Response(file, {
          headers: {
            'content-type': 'text/html',
          },
          status: 200
        })
      }
    }

    try {
      const headers = {
        'content-type': getContentTypeByPath(filepath)
      }

      const storageId = walletDefaultHost
      if(storageId) {
        const storageUrl = new URL(storageId)
        const storage = new StorageClient(storageUrl)
        const space = storage.space({
          signer,
          id: `urn:uuid:${spaceId}`
        })

        console.log(spaceId)
        console.log(space)

        const resource = space.resource(filepath)

        const data = await resource.get({ signer })
          .then(async res => {
            if(res.status !== 200) {
              throw new Error('Failed private lookup: '+ filepath)
            }
            return res
          }).catch((e) => {
            return null
          })

        if(data) {
          console.log('Serving ' + filepath + ' from ' + spaceId + ' @ ' + storageId)
          if(request.method === 'HEAD') {
            return new Response(null, {
              status: 200,
              headers
            });
          }
          return new Response(await data.blob(), {
            status: 200,
            headers
          });
        }
      }

      const file = await Deno.open("." + filepath, { read: true });
      if(file) {
        console.log('Serving ' + filepath + ' from disk.')
        if(request.method === 'HEAD') {
          file.close()
          return new Response(null, {
            status: 200,
            headers
          });
        }
        return new Response(file.readable, {
          status: 200,
          headers
        });
      }

    } catch(e) {
      console.error(e)
      return new Response(template(), {
        status: 404,
        headers: {
          'content-type': 'text/html'
        }
      });
    }
  },
);

function template() {
  const configObject = {
    PLAN98_WAS_HOST: walletDefaultHost,
    PLAN98_WAS_SPACE_ID: spaceId,
    PLAN98_WAS_SIGNER: JSON.stringify(keycard.asJSON),
    PLAN98_REALTIME: safeEnv('PLAN98_REALTIME'),

    BRAID_TEXT_PROXY: safeEnv('BRAID_TEXT_PROXY'),

    PROTOMAPS_API_KEY: safeEnv('PROTOMAPS_API_KEY'),

    VAULT_APP_ID: safeEnv('VAULT_APP_ID'),
    VAULT_APP_SECRET: safeEnv('VAULT_APP_SECRET'),
    VAULT_APP_SALT: safeEnv('VAULT_APP_SALT'),
    VAULT_BASE_URL: safeEnv('VAULT_BASE_URL'),
    VAULT_PUBLIC_KEY: safeEnv('VAULT_PUBLIC_KEY'),
    SUPABASE_URL: safeEnv('SUPABASE_URL'),
    SUPABASE_KEY: safeEnv('SUPABASE_KEY'),

    ROWS_N_COLUMNS_LICENSE_KEY: safeEnv('ROWS_N_COLUMNS_LICENSE_KEY'),
    HEAVY_ASSET_CDN_URL: safeEnv('HEAVY_ASSET_CDN_URL'),
    JITSI_MAGIC_COOKIE: safeEnv('JITSI_MAGIC_COOKIE')
  }
  const configArray = []
  for(const key of Object.keys(configObject)) {
    configArray.push(`${key}: '${configObject[key]}'`)
  }
  const ENVIRONMENT_VARIABLES = configArray.join(',\n')
  const ENCODED_KEYCARD = btoa(
    JSON.stringify({
      jsonrpc: "2.0",
      id: keycard.id,
      method: methods.importKeycard,
      params: {
        type: 'keycard',
        keycard: {
          id: keycard.id,
          name: keycard.name,
          asJSON: keycard.asJSON,
          src: keycard.src,
          host: keycard.host,
        }
      }
    })
  )

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, viewport-fit=cover" />
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

      @keyframes lazy-fade-in {
        0% {
          opacity: 0;
          background: var(--root-theme, mediumseagreen);
        }
        100% {
          opacity: .5;
          background: white;
        }
      }

/*
      :not(:defined) {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      :not(:defined)::before {
        content: '';
        position: absolute;
        inset: 0;
        animation: lazy-fade-in 3000ms ease-in-out alternate infinite;
        width: 3.25in;
        height: 3.12in;
        opacity: .5;
        mix-blend-mode: multiply;
        margin: auto;
      }
*/

      html, body {
        height: 100%;
        background: rgba(255,255,255,.85);
        overscroll-behavior: none;
        transform: translateZ(0);
        padding: 0;
        margin: 0;
      }

      body {
       padding: env(safe-area-inset-top, 20px) env(safe-area-inset-right, 20px)
    env(safe-area-inset-bottom, 20px) env(safe-area-inset-left, 20px);
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
    <link href="/public/styles/system.css" rel="stylesheet">
    <script async src="/public/vendor/es-module-shims.js"></script>
    <script type="importmap">
      {
        "imports": {
          "@atproto/api": "https://esm.sh/@atproto/api@0.13.18",
          "@aws-sdk/client-s3": "https://esm.sh/@aws-sdk/client-s3@3.616.0",
          "@aws-sdk/middleware-endpoint": "https://esm.sh/@aws-sdk/middleware-endpoint@3.374.0",
          "@braid/mail": "/public/cdn/braid.org/feed-client.js",

          "@braid/myers-diff": "/public/cdn/braid.org/myers-diff1.js",
          "@braid/simpleton-client": "/public/cdn/braid.org/simpleton-client.js",
          "@electric-sql/pglite": "https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js",
          "@inrupt/solid-client-authn-browser": "https://esm.sh/@inrupt/solid-client-authn-browser@1.17.5?bundle-deps",
          "@lottiefiles/lottie-player": "https://esm.sh/@lottiefiles/lottie-player@2.0.3",
          "@pyscript/core": "https://pyscript.net/snapshots/2023.11.1.RC3/core.js",
          "@codemirror/basic-setup": "https://esm.sh/@codemirror/basic-setup@0.20.0",
          "@codemirror/lang-javascript": "https://esm.sh/@codemirror/lang-javascript@6.2.3",
          "@codemirror/lang-html": "https://esm.sh/@codemirror/lang-html@6.4.9",
          "@codemirror/lang-css": "https://esm.sh/@codemirror/lang-css@6.3.1",
          "@codemirror/state": "https://esm.sh/@codemirror/state@6.5.2",
          "@codemirror/view": "https://esm.sh/@codemirror/view",
          "@did.coop/did-key-ed25519": "https://esm.sh/@did.coop/did-key-ed25519",
          "@uix/codemirror-theme-gruvbox-dark":"https://esm.sh/@uiw/codemirror-theme-gruvbox-dark@4.23.10",
          "@dimforge/rapier2d": "https://cdn.skypack.dev/@dimforge/rapier2d-compat",
          "@dimforge/rapier3d": "https://cdn.skypack.dev/@dimforge/rapier3d-compat",
          "@fullcalendar/core": "https://cdn.skypack.dev/@fullcalendar/core@6.1.15",
          "@fullcalendar/daygrid": "https://cdn.skypack.dev/@fullcalendar/daygrid@6.1.15",
          "@fullcalendar/timegrid": "https://cdn.skypack.dev/@fullcalendar/timegrid@6.1.15",
          "@fullcalendar/list": "https://cdn.skypack.dev/@fullcalendar/list@6.1.15",
          "@fullcalendar/interaction": "https://cdn.skypack.dev/@fullcalendar/interaction@6.1.15",
          "@geckos.io/client": "https://esm.sh/@geckos.io/client@3.0.0",
          "@google/generative-ai": "https://esm.sh/@google/generative-ai",
          "@hive/brand": "/public/elves/hive-brand.js",
          "@iptv/playlist": "https://esm.sh/@iptv/playlist@1.1.0",
          "@lezer/highlight": "https://esm.sh/@lezer/highlight@1.2.0",
          "@mux/mux-player": "https://esm.sh/@mux/mux-player@2.9.1",
          "@replit/codemirror-vim": "https://esm.sh/@replit/codemirror-vim@6.2.1",
          "@shoelace-style/shoelace/tree": "https://esm.sh/@shoelace-style/shoelace@2.16.0/dist/components/tree/tree.js",
          "@shoelace-style/shoelace/relative-time": "https://esm.sh/@shoelace-style/shoelace@2.16.0/dist/components/relative-time/relative-time.js",
          "@shoelace-style/shoelace/icon": "https://esm.sh/@shoelace-style/shoelace@2.16.0/dist/components/icon/icon.js",
          "@sillonious/brand": "/public/brand.js",
          "@sillonious/computer": "/public/sillyz.computer.js",
          "@silly/tag": "/public/module.js",
          "@silly/elf": "/public/elf.js",
          "@plan98/elf": "/public/plan98.js",
          "@plan98/app": "/public/plan98.js",
          "@plan68/app": "/public/plan68.js",
          "@silly/gelf": "/public/gun-module.js",
          "@sillonious/payments": "/public/elves/payment-debugger.js",
          "@sillonious/saga": "/public/saga.js",
          "@sillonious/party": "/public/elves/sillonious-party.js",
          "@sillonious/sports": "/public/elves/sillonious-sports.js",
          "@sillonious/solid-utils": "/public/elves/illonious-party.js",
          "@sillonious/solid/user": "/public/elves/solid-user.js",
          "@sillonious/vault": "/public/cdn/bayunsystems.com/vault.js",
          "@sillonious/drive": "/public/drive.js",
          "@sillonious/database": "/public/database.js",
          "@plan98/modal": "/public/elves/plan98-modal.js",
          "@plan98/intro": "/public/elves/plan98-intro.js",
          "@tanstack/table-core": "https://esm.sh/@tanstack/table-core@8.16.0",
          "@theatre/studio": "https://esm.sh/@theatre/studio@0.7.1", "@theatre/core": "https://esm.sh/@theatre/core@0.7.1",
          "@uiw/codemirror-themes": "https://esm.sh/@uiw/codemirror-themes@4.21.25",
          "@uiw/codemirror-theme-gruvbox-dark": "https://esm.sh/@uiw/codemirror-theme-gruvbox-dark@4.21.25",
          "@wallet.storage/fetch-client": "https://esm.sh/@wallet.storage/fetch-client@^1.1.3",
          "@wasmer/sdk": "https://esm.sh/@wasmer/sdk@0.6.0",
          "activitypub-testing": "https://esm.sh/activitypub-testing@0.9.2",
          "activitypub-actor-tester": "https://cdn.jsdelivr.net/npm/activitypub-actor-tester@0.1.1/dist/activitypub-actor-tester.js",
          "aframe": "https://esm.sh/aframe@1.5.0",
          "ag-grid-community": "https://esm.sh/ag-grid-community",
          "babylonjs": "https://esm.sh/babylonjs@6.33.1",
          "braid-http": "https://esm.sh/braid-http@1.3.5",
          "cally": "https://esm.sh/cally@0.4.0",
          "cards": "https://esm.sh/cards@2.0.3",
          "codemirror": "https://esm.sh/codemirror@6.0.1",
          "chess": "https://esm.sh/chess@1.2.1",
          "colorjs.io": "https://esm.sh/colorjs.io@0.4.0",
          "d3": "https://esm.sh/d3@7.9.0",
          "diffhtml": "https://esm.sh/diffhtml@1.0.0-beta.30",
          "dompurify": "https://esm.sh/dompurify@3.2.4",
          "emoji-mart": "https://esm.sh/emoji-mart@5.6.0",
          "@emoji-mart/data": "https://esm.sh/@emoji-mart/data@1.2.1",
          "eruda": "https://esm.sh/eruda@3.4.0",
          "fantasydata-node-client": "https://esm.sh/fantasydata-node-client@1.6.0",
          "fast-deep-equal": "https://esm.sh/fast-deep-equal@3.1.3",
          "focus-trap" : "https://esm.sh/focus-trap@7.6.2",
          "grapheme-splitter": "https://esm.sh/grapheme-splitter@1.0.4",
          "gridjs": "https://esm.sh/gridjs@6.0.6",
          "@lottiefiles/lottie-player": "https://esm.sh/@lottiefiles/lottie-player@2.0.3",
          "gun": "https://cdn.jsdelivr.net/gh/amark/gun@master/gun.js",
          "gun/open": "https://cdn.jsdelivr.net/gh/amark/gun@master/lib/open.js",
          "gun/sea": "https://cdn.jsdelivr.net/gh/amark/gun@master/sea.js",
          "gun/rad": "https://cdn.jsdelivr.net/gh/amark/gun@master/rad.js",
          "jsx-runtime": "https://esm.sh/react/jsx-runtime",
          "jszip": "https://esm.sh/jszip@3.10.1",
          "havok": "https://esm.sh/@babylonjs/havok@1.3.0",
          "hls.js": "https://esm.sh/hls.js@1.5.15",
          "htmx.org": "https://esm.sh/htmx.org@1.9.11",
          "jspreadsheet-ce": "https://esm.sh/jspreadsheet-ce@4.15.0",
          "html5-qrcode": "https://esm.sh/html5-qrcode@2.3.8",
          "katex": "https://esm.sh/katex@0.16.9",
          "loro-crdt": "https://esm.sh/loro-crdt@0.10.1",
          "lunr": "https://esm.sh/lunr@2.3.9",
          "maplibre-gl": "https://esm.sh/maplibre-gl@4.0.2",
          "marked": "https://esm.sh/marked@11.1.0",
          "ml5": "https://esm.sh/ml5@0.12.2",
          "motion": "https://esm.sh/motion@10.17.0",
          "natsort": "https://esm.sh/natsort@2.0.3",
          "netplayjs": "https://esm.sh/netplayjs@0.4.1",
          "@observablehq/plot": "https://esm.sh/@observablehq/plot@0.6.14",
          "@christianliebel/paint": "https://esm.sh/@christianliebel/paint@1.2.0",
          "frh": "https://esm.sh/reference-frh@1.0.0",
          "ollama/browser": "https://esm.sh/ollama@0.5.16/browser",
          "papaparse": "https://esm.sh/papaparse@5.4.1",
          "p2panda-js": "https://esm.sh/p2panda-js@0.8.1",
          "phaser": "https://esm.sh/phaser@3.80.1",
          "pitchy": "https://esm.sh/pitchy@4",
          "plausible-tracker": "https://esm.sh/plausible-tracker@0.3.8",
          "prismjs": "https://esm.sh/prismjs@1.29.0",
          "protomaps-leaflet": "https://esm.sh/protomaps-leaflet@4.0.1",
          "pocketbase": "https://esm.sh/pocketbase@0.20.1",
          "pouchdb": "https://esm.sh/pouchdb@8.0.1",
          "qr-creator": "https://esm.sh/qr-creator@1.0.0",
          "quickjs-emscripten": "https://esm.sh/quickjs-emscripten@0.31.0",
          "quill" : "https://esm.sh/quill@1.3.7",
          "quill-to-pdf": "https://esm.sh/quill-to-pdf@1.0.7",
          "quill-to-word": "https://esm.sh/quill-to-word@1.3.0",
          "randomuuid": "https://esm.sh/randomuuid@1.0.1",
          "react": "https://registry.rowsncolumns.app/react@19.1.0",
          "react-dom/client": "https://registry.rowsncolumns.app/react-dom@19.1.0/client",
          "shelf-merge": "https://esm.sh/shelf-merge@0.2.1",
          "simple-peer": "https://esm.sh/simple-peer@9.11.1",
          "solid-file-client": "https://esm.sh/solid-file-client@2.1.3?bundle-deps",
          "statebus": "/public/_statebus.js",
          "sqlite": "/public/sqlite.js",
          "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2.39.8",
          "three": "https://esm.sh/three@0.160.0",
          "tlds": "https://esm.sh/tlds",
          "translate": "https://esm.sh/translate@3.0.1",
          "tone@next": "https://esm.sh/tone@next",
          "twgl.js": "https://esm.sh/twgl.js@5.5.3",
          "uuid": "https://esm.sh/uuid@9.0.1",
          "uxn.wasm": "https://esm.sh/uxn.wasm@0.8.0",
          "uxn.wasm/util": "https://esm.sh/uxn.wasm@0.8.0/util",
          "vosk-browser": "https://esm.sh/vosk-browser@0.0.8",
          "webamp": "https://esm.sh/webamp@1.5.0",
          "webpd": "https://esm.sh/webpd@1.0.0-alpha.8",
          "web-audio-daw": "https://esm.sh/web-audio-daw@4.13.2",
          "webaudiofont": "https://esm.sh/webaudiofont@3.0.4",
          "xterm": "https://esm.sh/xterm@5.3.0",
          "xterm-addon-fit": "https://esm.sh/xterm-addon-fit@0.8.0",


          "konva": "https://registry.rowsncolumns.app/konva/lib/Core.js",
          "konva-full": "https://registry.rowsncolumns.app/konva/lib/_FullInternals.js",
          "@rowsncolumns/charts": "https://registry.rowsncolumns.app/@rowsncolumns/charts?deps=react@19",
          "@rowsncolumns/icons": "https://registry.rowsncolumns.app/@rowsncolumns/icons?deps=react@19",
          "@rowsncolumns/functions": "https://registry.rowsncolumns.app/@rowsncolumns/functions?deps=react@19",
          "@rowsncolumns/spreadsheet": "https://registry.rowsncolumns.app/@rowsncolumns/spreadsheet?deps=react@19",
          "@rowsncolumns/spreadsheet-state": "https://registry.rowsncolumns.app/@rowsncolumns/spreadsheet-state?deps=react@19",
          "@rowsncolumns/ui": "https://registry.rowsncolumns.app/@rowsncolumns/ui?deps=react@19"
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
    <script async type="module" id="lazy-bootstrap" src="/public/main.js"></script>
    <link media="print" onload="this.media='all'" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.16.0/cdn/themes/light.css" />
    <script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.16.0/cdn/shoelace-autoloader.js"></script>
  </head>
  <body>
    <data-tooltip>
    <data-popover>
    <main class="the-main-area">
      <sillonious-brand></sillonious-brand>
      <div style="display: none; background: white; height: 100%; width: 100%; overflow: hidden;">
        <div style="padding: 51px; height: 100%; display: flex;">
          <qr-code lazy-prefix="true" src="/app/plan98-wallet?data=${ENCODED_KEYCARD}" style="width: 75vmin; height: 75vmin;" target="_top"></qr-code>
        </div>
      </div>
    </main>
    </data-popover>
    </data-tooltip>
    <script type="module">
      import { StorageClient } from "@wallet.storage/fetch-client";
      import { Ed25519Signer } from "@did.coop/did-key-ed25519"

      (async function init() {
        const signer = await Ed25519Signer.fromJSON(JSON.stringify(${configObject.PLAN98_WAS_SIGNER}))

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
</html>`
}
