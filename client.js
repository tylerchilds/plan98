import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { readAll } from "https://deno.land/std@0.221.0/io/read_all.ts";
import { Status } from "https://deno.land/std@0.210.0/http/http_status.ts";
import * as path from "https://deno.land/std@0.184.0/path/mod.ts";
import { typeByExtension } from "https://deno.land/std@0.186.0/media_types/type_by_extension.ts";
import { walk } from "https://deno.land/std/fs/mod.ts";
import sortPaths from "https://esm.sh/sort-paths"
import { existsSync } from "https://deno.land/std@0.208.0/fs/exists.ts";
import { DOMParser } from "https://esm.sh/linkedom";
import { Podcast } from 'npm:podcast';
import { render } from "@sillonious/saga"
import { doingBusinessAs } from "@sillonious/brand"
import { marked } from "marked"
import { config } from "https://deno.land/x/dotenv/mod.ts";

config()

const terminalHeaders = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

// polyfill window with DOMParser for deno;
self.DOMParser = DOMParser

const command = Deno.args[0];
const commands = {
  link,
  unlink
}

async function link(pkg) {
  const dom = await page()
  console.log('should install to the importmap of index.html')
  const list = dom.querySelector('[type="importmap"]').innerHTML
  console.log(pkg, list)
}

async function unlink(pkg) {
  const dom = await page()
  console.log('should uninstall from the importmap of index.html')
  const list = dom.querySelector('[type="importmap"]').innerHTML
  console.log(pkg, list)
}

if(commands[command]) {
  const food = Deno.args[1];
  await commands[command](Deno.args[1])
  console.log(`Running as ${command}, I like ${food}!`);
  Deno.exit();
}

async function page() {
  const index = await Deno.readTextFile(`./client/public/index.html`)
  return new DOMParser().parseFromString(index, "text/html");
}

async function markdownSanitizer(md) {
  const dom = await page()
  dom.getElementById('main').remove()
  dom.body.insertAdjacentHTML('afterbegin', `
    <saga-genesis class="markdown">
      ${marked(md)}
    </saga-genesis>
  `)
  return `<!DOCTYPE html>${dom.documentElement}`
}

async function sagaSanitizer(saga) {
  const dom = await page()
  dom.body.insertAdjacentHTML('afterbegin', `
    <sillonious-brand>
      <saga-genesis>
        <noscript>
          ${render(saga)}
        </noscript>
      </saga-genesis>
    </sillonious-brand>
  `)
  // remove the lazy-bootstrap to lock the document
  //dom.getElementById('lazy-bootstrap').remove()
  dom.getElementById('main').remove()
  return `<!DOCTYPE html>${dom.documentElement}`
}

const sanitizers = {
  '.saga': sagaSanitizer,
  '.md': markdownSanitizer,
}

const extensions = {
  '.md': {
    raw: 'text/plain',
    rich: 'text/html',
  },
}

function buildHeaders(parameters, pathname, extension) {
  const type = pathname.startsWith('/public/') ? 'raw' : 'rich'
  const debug = parameters.get('debug')
  let headers = {
    'Cross-Origin-Resource-Policy': 'same-origin',
    'content-type': extensions[extension]
      ? extensions[extension][type]
      : typeByExtension(extension)
  }

  if(debug === 'true') {
    headers = {
      ...headers,
      ...terminalHeaders
    }
  }

  return headers
}

async function router(request, context) {
  const { pathname, host, search } = new URL(request.url);
  const parameters = new URLSearchParams(search)
  const world = parameters.get('world')
  const extension = path.extname(pathname);
  const headers = buildHeaders(parameters, pathname, extension);

  let file
  let statusCode = Status.Success

  if(request.method === 'POST') {
    const data = await request.json()

    if(pathname === '/plan98/subscribe') {
      return ResponseData({ subscribe: await createEmailSubscriber(data) })
    }

    if(pathname === '/plan98/pay-by-link') {
      return data.mode === 'CREATE'
        ? ResponseData({ payment: await newPayment(data) })
        : ResponseData({ payment: await getPaymentStatus(data) })
    }

    try {
      console.log(data.src)
      await Deno.writeTextFile(`./client${data.src}`, data.file)
      return new Response(JSON.stringify({ ok: 'ok' }, null, 2), {
        headers: { "content-type": "application/json; charset=utf-8" },
        status: 200
      });
    } catch (error) {
      console.error(error)
      return new Response(JSON.stringify({ error }, null, 2), {
        headers: { "content-type": "application/json; charset=utf-8" },
        status: 400
      });

    }
  }

  if(pathname === '/') {
    const file = await home(request, doingBusinessAs[world || host || 'sillyz.computer'])
    if(file) {
      return new Response(file, {
        headers,
        status: statusCode
      })
    }
  }

  if(pathname === '/news.xml') {
    const feed = new Podcast({
        title: 'title',
        description: 'description',
        feedUrl: 'http://example.com/rss.xml',
        siteUrl: 'http://example.com',
        imageUrl: 'http://example.com/icon.png',
        docs: 'http://example.com/rss/docs.html',
        author: 'Dylan Greene',
        managingEditor: 'Dylan Greene',
        webMaster: 'Dylan Greene',
        copyright: '2013 Dylan Greene',
        language: 'en',
        categories: ['Category 1','Category 2','Category 3'],
        pubDate: 'May 20, 2012 04:00:00 GMT',
        ttl: 60,
        itunesAuthor: 'Max Nowack',
        itunesSubtitle: 'I am a sub title',
        itunesSummary: 'I am a summary',
        itunesOwner: { name: 'Max Nowack', email: 'max@unsou.de' },
        itunesExplicit: false,
        itunesCategory: [{
            text: 'Entertainment',
            subcats: [{
              text: 'Television'
            }]
        }],
        itunesImage: 'http://example.com/image.png'
    });

    /* loop over data and add to feed */
    feed.addItem({
        title:  'item title',
        description: '<ul><li>aw, yiss</li><li>aw, yiss</li><li>yee haw</li></ul>',
        url: 'http://example.com/article4?this&that', // link to the item
        guid: '1123', // optional - defaults to url
        categories: ['Category 1','Category 2','Category 3','Category 4'], // optional - array of item categories
        author: 'Guest Author', // optional - defaults to feed author property
        date: 'May 27, 2012', // any format that js Date can parse.
        lat: 33.417974, //optional latitude field for GeoRSS
        long: -111.933231, //optional longitude field for GeoRSS
        itunesAuthor: 'Max Nowack',
        itunesExplicit: false,
        itunesSubtitle: 'I am a sub title',
        itunesSummary: 'I am a summary',
        itunesDuration: 12345,
        itunesNewFeedUrl: 'https://newlocation.com/example.rss',
    });

    let xml
    try {
      xml = feed.buildXml();
      const stylesheetPI = '<?xml-stylesheet type="text/xsl" href="news.xsl"?>';
xml = xml.replace(/<\?xml version="1.0" encoding="UTF-8"\?>/, `$&\n${stylesheetPI}`);
    } catch(e) {
      console.log(e)
    }
        // Set content type as XML
    const headers = new Headers();
    headers.set("Content-Type", "text/xml");

    console.log(xml)
    return new Response(xml, { headers });
  }

  if(pathname === '/plan98/about') {
    return about(headers, request)
  }

  if(pathname === '/plan98/owncast') {
    return owncast(headers, request)
  }

  try {
		if(existsSync(`./client/${pathname}`, { isFile: true })) {
			file = await Deno.readFile(`./client/${pathname}`)
			return new Response(file, {
				headers,
				status: statusCode
			})
		}
  } catch (e) {
		console.error(e)
  }

  try {
    if(sanitizers[extension]) {
      file = await Deno.readTextFile(`./client/public${pathname}`)
      file = await sanitizers[extension](file)
    } else {
      file = await Deno.readFile(`./client/public${pathname}`)
    }
  } catch (e) {

    let file
    if(pathname.startsWith('/public/')) {
      file = await Deno.readTextFile(`./client/public/404.saga`)
    } else {
      const saga = await Deno.readTextFile(`./client/public/404.saga`)
      file = await sagaSanitizer(saga)
    }
    statusCode = Status.NotFound
    console.error(e + '\n' + pathname + '\n' + e)
    return new Response(file, {
      headers: { ...headers, ...terminalHeaders },
      status: statusCode
    })

  }


  return new Response(file, {
    headers,
    status: statusCode
  })
}

const byPath = (x) => x.path
const byName = (x) => x.name

async function home(request, business) {
  if(!business) {
    return await Deno.readTextFile(`./client/public/index.html`)
  }

  let file
  try {
    const { saga } = business
    console.log(saga)

    file = await Deno.readTextFile(`./client/${saga}`)
    file = await sanitizers['.saga'](file)
  } catch (e) {
    console.error(e + '\n' + pathname + '\n' + e)
  } 
  return file
}


async function about(headers, request) {
  const { search } = new URL(request.url);
  const parameters = new URLSearchParams(search)
  const world = parameters.get('world')
  if(world) {
    const data = await fetch('https://'+world+'/plan98/about').then(res => res.json())
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        ...headers,
        "content-type": "application/json; charset=utf-8"
      },
    });
  } else {
    let paths = []

    const currentPath = Deno.cwd() + '/client'
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
      paths.push({ path, name })
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
        ...headers,
        "content-type": "application/json; charset=utf-8"
      },
    });

  }
}

function ResponseData(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function owncast(headers, request) {
  const onlinePromise = fetch('https://94404-969-g-edgewater-blvd-123.thelanding.page/api/status').then(res => res.json())
  const data = { broadcast: await onlinePromise }
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      ...headers,
      "content-type": "application/json; charset=utf-8"
    },
  });
}

function kids(paths) {
  const root = { name: '', type: 'Directory', children: [] };

  for (const system of paths) {
    const [_, ...pathComponents] = system.path.split('/');
    let currentNode = root;

    for (const component of pathComponents) {
      if (!currentNode.children) {
        currentNode.children = [];
      }

      let childNode = currentNode.children.find(node => node.name === component);

      if (!childNode) {
        const extension = path.extname(system.path);
        childNode = { extension, path: system.path, name: component, type: 'Directory', children: [] };
        currentNode.children.push(childNode);
      }

      currentNode = childNode;
    }

    currentNode.type = 'File'; // Mark the last node as a file
    delete currentNode.children
  }

  return root;
}

serve(router);
console.log("Listening on http://localhost:8000");

async function createEmailSubscriber(data) {
  const response = await fetch('https://api.buttondown.email/v1/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Token ' + Deno.env.get('BUTTONDOWN_TOKEN'),
    },
    body: JSON.stringify({
      "email": data.email,
    })
  }).then( response => response.text())

  try {
    return JSON.parse(response)
  } catch(e) {
    return { error: e, note: 'Failed to parse response...' }
  }
}

async function newPayment(data) {
  const response = await fetch('https://checkout-test.adyen.com/v70/paymentLinks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-API-key': Deno.env.get('ADYEN_API_KEY'),
    },
    body: JSON.stringify({
      "reference": data.reference,
      "amount": data.amount,
      "shopperReference": data.shopperReference,
      "description": data.description,
      "countryCode": data.countryCode,
      "merchantAccount": Deno.env.get('ADYEN_MERCHANT_ACCOUNT'),
      "shopperLocale": data.shopperLocale
    })
  }).then( response => response.text())

  try {
    return JSON.parse(response)
  } catch(e) {
    return { error: e, note: 'Failed to parse response...' }
  }
}

async function getPaymentStatus(data) {
  const response = await fetch(`https://checkout-test.adyen.com/v68/paymentLinks/${data.id}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-API-key': Deno.env.get('ADYEN_API_KEY'),
    }
  }).then(res => res.text())

  try {
    return JSON.parse(response)
  } catch(e) {
    return { error: e, note: 'Failed to parse response...' }
  }
}
