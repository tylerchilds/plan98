import { Ed25519Signer } from "https://esm.sh/@did.coop/did-key-ed25519@0.0.14";
import { StorageClient } from "https://esm.sh/@wallet.storage/fetch-client@^1.1.3"
import { walk } from "https://deno.land/std/fs/mod.ts";
import sortPaths from "https://esm.sh/sort-paths@1.1.1"
import { DOMParser } from "npm:linkedom@0.18.5";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { typeByExtension } from "https://deno.land/std@0.186.0/media_types/type_by_extension.ts";
import { buildIndex } from './public/elves/build-index.js';

config()
const PASSPHRASE = safeEnv('PLAN98_PASSPHRASE')
self.DOMParser = DOMParser

const byPath = (x) => x.path

const port = safeEnv('PLAN98_PORT', 1024)

function safeEnv(key, type='') {
  return Deno.env.get(key) || type
}

const ALLOWED_ORIGINS = safeEnv('PLAN98_ALLOWED_ORIGINS', '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

function corsHeaders(request) {
  const origin = request.headers.get('origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) || 
    (ALLOWED_ORIGINS.includes('localhost') && origin.startsWith('http://localhost:'));
  return allowed ? {
    'access-control-allow-origin': origin,
    'vary': 'Origin',
    'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'access-control-allow-headers': 'Content-Type, Authorization',
  } : {};
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
  title: "ROOT ACCESS KEY CARD",
  id: spaceId,
  src: '/app/time-machine?id='+spaceId,
})

function newKeycard(overrides={}) {
  const id = self.crypto.randomUUID()
  const keycard = {
    id,
    src: '/app/time-machine?id='+id,
    title: 'Memex',
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

const baseHTML = await Deno.readTextFile("./public/index.html");

let importMapJSON = null;
try {
  importMapJSON = await Deno.readTextFile("./public/vendor/importmap.json");
  console.log("Using vendored import map");
} catch {
  console.log("Using CDN import map");
}

const cachedDefaultTemplate = template();
const cachedSagaIndex = await sagaIndex()

function page() {
  const index = template()
  return new DOMParser().parseFromString(index, "text/html");
}

async function showApp(request, tag) {
  const url = new URL(request.url)

  let attributes = ''
  for (const p of url.searchParams) {
    attributes += `${[p[0]]}="${p[1]}"`
  }

  const body = `
    <sillonious-brand>
      <${tag} ${attributes}></${tag}>
    </sillonious-brand>
  `
  return template(body)
}

async function fileSystem(request) {
  const { search } = new URL(request.url);
  const parameters = new URLSearchParams(search)
  const world = parameters.get('world')
  if(world) {
    const data = await fetch('https://'+world+'/plan98/about').then(res => res.json())
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        ...corsHeaders(request),
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
        sagaIndex: cachedSagaIndex,
        type: 'FileSystem',
        children: [kids(paths)]
      }
    }

    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        ...corsHeaders(request),
        "content-type": "application/json; charset=utf-8"
      },
    });

  }
}

async function fileSystemByExtension(ext) {
  let paths = []

  const currentPath = Deno.cwd()
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
    includeDirs: false
  })

  for await(const file of files) {
    const { name } = file
    const [_, path] = file.path.split(currentPath)
    if(name.endsWith(ext)) {
      paths.push({ path, name })
    }
  }

  paths = sortPaths([...paths], byPath, '/')

  return {
    plan98: {
      type: 'FileSystem',
      children: [kids(paths)]
    }
  }
}

function sagas(request) {
  return new Response(JSON.stringify(cachedSagaIndex, null, 2), {
    headers: {
      ...corsHeaders(request),
      "content-type": "application/json; charset=utf-8"
    },
  });
}

async function mp3s(request) {
  const { search } = new URL(request.url);
  const parameters = new URLSearchParams(search)
  const world = parameters.get('world')
  if(world) {
    const data = await fetch('https://'+world+'/plan98/about').then(res => res.json())
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        ...corsHeaders(request),
        "content-type": "application/json; charset=utf-8"
      },
    });
  } else {
    const data = await fileSystemByExtension('.mp3')
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        ...corsHeaders(request),
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

async function proxy(request) {
  const { search } = new URL(request.url);
  const parameters = new URLSearchParams(search)
  const src = parameters.get('src')
  return await fetch(src)
    .then(res => res.json())
}

const activeStreams = new Map();
const streamWriteQueues = new Map(); // Track write queues

// Your stream functions here
async function startRTMPStream(request) {
  const { passphrase, hasAudio } = await request.json();

  const streamKey = safeEnv('OWNCAST_STREAM_KEY', null)
  const rtmpUrl = safeEnv('OWNCAST_STREAM_URL', null)

  if (!streamKey || !rtmpUrl) {
    return new Response('Missing streamKey or rtmpUrl', { status: 400, headers: corsHeaders(request) });
  }

  if (passphrase !== PASSPHRASE) {
    return new Response('incorrect passphrase', { status: 400, headers: corsHeaders(request) });
  }

  const streamId = crypto.randomUUID();

  let args;

  if (hasAudio) {
    // With audio from WebM
    args = [
      '-re',
      '-f', 'webm',
      '-i', 'pipe:0',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-tune', 'zerolatency',
      '-b:v', '2500k',
      '-maxrate', '2500k',
      '-bufsize', '5000k',
      '-pix_fmt', 'yuv420p',
      '-g', '60',
      '-r', '30',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ar', '48000',
      '-ac', '2',
      '-f', 'flv',
      '-flvflags', 'no_duration_filesize',
      `${rtmpUrl}/${streamKey}`
    ];
  } else {
    // Without audio - generate silent audio
    args = [
      '-f', 'lavfi',
      '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
      '-re',
      '-f', 'webm',
      '-i', 'pipe:0',
      '-map', '1:v',  // Map video from input 1 (pipe)
      '-map', '0:a',  // Map audio from input 0 (anullsrc)
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-tune', 'zerolatency',
      '-b:v', '2500k',
      '-maxrate', '2500k',
      '-bufsize', '5000k',
      '-pix_fmt', 'yuv420p',
      '-g', '60',
      '-r', '30',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ar', '48000',
      '-ac', '2',
      '-shortest',
      '-f', 'flv',
      '-flvflags', 'no_duration_filesize',
      `${rtmpUrl}/${streamKey}`
    ];
  }

  console.log('FFmpeg command:', args.join(' '));

  const command = new Deno.Command('ffmpeg', {
    args,
    stdin: 'piped',
    stdout: 'piped',
    stderr: 'piped'
  });

  const process = command.spawn();

  (async () => {
    const decoder = new TextDecoder();
    for await (const chunk of process.stderr) {
      console.error('FFmpeg:', decoder.decode(chunk));
    }
  })();

  activeStreams.set(streamId, process);
  streamWriteQueues.set(streamId, Promise.resolve()); // Initialize queue

  console.log('Started stream:', streamId, 'Active streams:', activeStreams.size);

  return new Response(JSON.stringify({ streamId }), {
    headers: {
      ...corsHeaders(request),
      'content-type': 'application/json'
    }
  });
}

async function sendVideoChunk(request) {
  const url = new URL(request.url);
  const streamId = url.searchParams.get('streamId');

  const process = activeStreams.get(streamId);

  if (!process) {
    console.warn('Stream not found:', streamId);
    return new Response('Stream not found', { status: 404, headers: corsHeaders(request) });
  }

  try {
    const chunk = await request.arrayBuffer();

    // Get the current queue for this stream
    let writeQueue = streamWriteQueues.get(streamId) || Promise.resolve();

    // Chain this write onto the queue
    writeQueue = writeQueue.then(async () => {
      if (!process.stdin) {
        throw new Error('Stream stdin not available');
      }

      const writer = process.stdin.getWriter();
      try {
        await writer.write(new Uint8Array(chunk));
      } finally {
        writer.releaseLock();
      }
    }).catch(error => {
      // Log but don't throw - keeps queue alive
      console.error('Write error for stream', streamId, ':', error.message);

      if (error.name === 'BrokenPipe' || error.code === 'EPIPE') {
        activeStreams.delete(streamId);
        streamWriteQueues.delete(streamId);
      }

      throw error; // Re-throw for the response
    });

    // Update the queue
    streamWriteQueues.set(streamId, writeQueue);

    // Wait for this write to complete
    await writeQueue;

    return new Response('OK', { headers: corsHeaders(request) });
  } catch (error) {
    console.error('Chunk write error:', error.name, error.message);

    if (error.name === 'BrokenPipe' || error.code === 'EPIPE') {
      activeStreams.delete(streamId);
      streamWriteQueues.delete(streamId);
      return new Response('Stream ended', { status: 410, headers: corsHeaders(request) });
    }

    return new Response(error.message, { status: 500, headers: corsHeaders(request) });
  }
}

async function stopRTMPStream(request) {
  try {
    const { streamId } = await request.json();

    console.log('Stopping stream:', streamId);

    const process = activeStreams.get(streamId);

    if (process) {
      const writer = process.stdin.getWriter();
      await writer.close();
      activeStreams.delete(streamId);
      streamWriteQueues.delete(streamId); // Clean up queue
    }

    return new Response('OK', { headers: corsHeaders(request) } );
  } catch (error) {
    console.error('Stop stream error:', error);
    return new Response(error.message, { status: 500, headers: corsHeaders(request) });
  }
}

Deno.serve(
  { hostname: "::", port },
  async (request) => {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    let filepath = decodeURIComponent(url.pathname);

    if(filepath === '/') {
      filepath = '/index.html'
    }

    if(filepath === '/plan98/about') {
      return fileSystem(request)
    }

    if(filepath === '/plan98/mp3s') {
      return mp3s(request)
    }

    if(filepath === '/plan98/sagas') {
      return sagas(request)
    }

    if(filepath.startsWith('/proxy/')) {
      const data = await proxy(request)
      return new Response(JSON.stringify(data, null, 2), {
        headers: {
          ...corsHeaders(request),
          "content-type": "application/json; charset=utf-8"
        },
      });
    }

    if (filepath === '/rtmp/start') {
      return await startRTMPStream(request);
    }

    if (filepath === '/rtmp/chunk') {
      return await sendVideoChunk(request);
    }

    if (filepath === '/rtmp/stop') {
      return await stopRTMPStream(request);
    }

    if(filepath.startsWith('/admin/')) {
      const rootKeycard = {
        jsonrpc: "2.0",
        id: keycard.id,
        method: methods.importKeycard,
        params: {
          type: 'keycard',
          keycard: {
            id: keycard.id,
            title: keycard.title,
            asJSON: keycard.asJSON,
            src: keycard.src,
            host: keycard.host,
          }
        }
      }

      const stringifiedKeycard = JSON.stringify(rootKeycard)
      const encodedKeycard = btoa(stringifiedKeycard)
      const encryptedKeycard = CryptoJS.AES.encrypt(encodedKeycard, PASSPHRASE).toString();
      const safeKeycard = encodeURIComponent(encryptedKeycard);

      return new Response(template(`
        <div style="background: white; height: 100%; width: 100%; overflow: hidden;">
          <div style="padding: 51px; height: 100%; display: flex;">
            <qr-code lazy-prefix="true" src="/app/plan98-wallet?data=${safeKeycard}" style="width: 75vmin; height: 75vmin;" target="_top"></qr-code>
          </div>
        </div>
      `), {
        headers: {
          ...corsHeaders(request),
          'content-type': 'text/html',
        },
        status: 200
      })
    }

    if(filepath.startsWith('/app/')) {
      const [app] = filepath.split('/app/')[1].split('/')
      const file = await showApp(request, app)

      if(file) {
        return new Response(file, {
          headers: {
            ...corsHeaders(request),
            'content-type': 'text/html',
          },
          status: 200
        })
      }
    }

    if (filepath === '/api/anthropic') {
      try {
        // Get API key from client's Authorization header
        const authHeader = request.headers.get('authorization');
        const apiKey = authHeader?.replace('Bearer ', '');

        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: 'API key required in Authorization header' }),
            {
              status: 401,
              headers: {
                ...corsHeaders(request),
                'content-type': 'application/json'
              }
            }
          );
        }

        const body = await request.json();

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(body)
        });

        // Handle streaming response
        if (body.stream) {
          return new Response(response.body, {
            headers: {
              ...corsHeaders(request),
              'content-type': 'text/event-stream',
              'cache-control': 'no-cache',
              'connection': 'keep-alive'
            }
          });
        }

        // Handle regular response
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: {
            ...corsHeaders(request),
            'content-type': 'application/json'
          }
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            ...corsHeaders(request),
            status: 500,
            headers: { 'content-type': 'application/json' }
          }
        );
      }
    }

    try {
      const headers = {
        ...corsHeaders(request),
        'content-type': getContentTypeByPath(filepath)
      }

      // Try disk FIRST (fast)
      try {
        const file = await Deno.open("." + filepath, { read: true });
        if (file) {
          console.log('Serving ' + filepath + ' from disk.');
          if (request.method === 'HEAD') {
            file.close();
            return new Response(null, { status: 200, headers });
          }
          return new Response(file.readable, { status: 200, headers });
        }
      } catch {
        // Not on disk — try remote storage (slow)
        const storageId = walletDefaultHost;
        if (storageId) {
          const storageUrl = new URL(storageId);
          const storage = new StorageClient(storageUrl);
          const space = storage.space({
            signer,
            id: `urn:uuid:${spaceId}`
          });
          const resource = space.resource(filepath);
          const data = await resource.get({ signer }).catch(() => null);

          if (data?.status === 200) {
            console.log('Serving ' + filepath + ' from ' + spaceId + ' @ ' + storageId);
            if (request.method === 'HEAD') {
              return new Response(null, { status: 200, headers });
            }
            return new Response(await data.blob(), { status: 200, headers });
          }
        }
      }

      // Neither disk nor remote had it
      return new Response(cachedDefaultTemplate, {
        status: 404,
        headers: {
          ...corsHeaders(request),
          'content-type': 'text/html'
        }
      });

    } catch(e) {
      console.error(e);
      return new Response(cachedDefaultTemplate, {
        status: 404,
        headers: {
          ...corsHeaders(request),
          'content-type': 'text/html'
        }
      });
    }
  },
);

async function sagaIndex() {
  const { plan98 } = await fileSystemByExtension('.saga')
  const result = buildIndex(plan98)
  return result
  //idx = lunr.Index.load(index)
}

function template(body) {
  const configObject = {
    PLAN98_WAS_HOST: walletDefaultHost,
    PLAN98_WAS_SPACE_ID: spaceId,
    PLAN98_WAS_SIGNER: JSON.stringify(keycard.asJSON),
    PLAN98_REALTIME: safeEnv('PLAN98_REALTIME'),
    PLAN98_PROXY: safeEnv('PLAN98_PROXY'),
    ANTHROPIC_API_KEY: safeEnv('ANTHROPIC_API_KEY'),
    LIBRE_TRANSLATE_URL: safeEnv('LIBRE_TRANSLATE_URL'),
    ELEVEN_LABS_API_KEY: safeEnv('ELEVEN_LABS_API_KEY'),
    BRAID_TEXT_PROXY: safeEnv('BRAID_TEXT_PROXY'),
    PROTOMAPS_API_KEY: safeEnv('PROTOMAPS_API_KEY'),
    VAULT_APP_ID: safeEnv('VAULT_APP_ID'),
    VAULT_APP_SECRET: safeEnv('VAULT_APP_SECRET'),
    VAULT_APP_SALT: safeEnv('VAULT_APP_SALT'),
    VAULT_BASE_URL: safeEnv('VAULT_BASE_URL'),
    VAULT_PUBLIC_KEY: safeEnv('VAULT_PUBLIC_KEY'),
    SUPABASE_URL: safeEnv('SUPABASE_URL'),
    SUPABASE_KEY: safeEnv('SUPABASE_KEY'),
    FASTMAIL_API_KEY: safeEnv('FASTMAIL_API_KEY'),
    FASTMAIL_USERNAME: safeEnv('FASTMAIL_USERNAME'),
    PLAN98_EMAIL: safeEnv('PLAN98_EMAIL'),
    PLAN98_EMAIL_URL: safeEnv('PLAN98_EMAIL_URL'),
    PLAN98_EMAIL_USERNAME: safeEnv('PLAN98_EMAIL_USERNAME'),
    PLAN98_EMAIL_PASSWORD: safeEnv('PLAN98_EMAIL_PASSWORD'),
    ROWS_N_COLUMNS_LICENSE_KEY: safeEnv('ROWS_N_COLUMNS_LICENSE_KEY'),
    HEAVY_ASSET_CDN_URL: safeEnv('HEAVY_ASSET_CDN_URL'),
    JITSI_MAGIC_COOKIE: safeEnv('JITSI_MAGIC_COOKIE'),
  };

  const ENVIRONMENT_VARIABLES = Object.entries(configObject)
    .map(([k, v]) => `${k}: '${v}'`)
    .join(',\n          ');

  let html = baseHTML;

  // Swap import map if vendored
  if (importMapJSON) {
    html = html.replace(
      /<script type="importmap">[\s\S]*?<\/script>/,
      `<script type="importmap">\n${importMapJSON}\n</script>`
    );
  }

  // Inject env variables — replace the plan98 script block
  // We look for the placeholder or inject before the bootstrap script
  html = html.replace(
    /<script async type="module" id="lazy-bootstrap"/,
    `<script>
      plan98 = {
        env: {
          ${ENVIRONMENT_VARIABLES}
        },
        registry: {}
      }
    </script>
    <script async type="module" id="lazy-bootstrap"`
  );

  // Inject body content into main
  if (body) {
    html = html.replace(
      /<main[^>]*>[\s\S]*?<\/main>/,
      `<main class="the-main-area">${body}</main>`
    );
  }

  return html;
}

function shhhhhh_this_is_the_source_code() {
  return `
    <div style="width: 100%; height: 100%; max-width: 100vw; max-height: 100vh;">
      <div style="overflow: auto; height: 100%;">
        <source-code></source-code>
      </div>
    </div>
  `
}
