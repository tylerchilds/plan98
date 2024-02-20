import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
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
    ${marked(md)}
  `)
  return `<!DOCTYPE html>${dom.documentElement}`
}

async function sagaSanitizer(saga) {
  const dom = await page()
  dom.body.insertAdjacentHTML('afterbegin', `
    ${render(saga)}
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

function buildHeaders(pathname, extension) {
  const type = pathname.startsWith('/public/') ? 'raw' : 'rich'
  const wasmerEmbedEnabled = false

  let headers = {
    'content-type': extensions[extension]
      ? extensions[extension][type]
      : typeByExtension(extension)
  }

  if(wasmerEmbedEnabled) {
    headers = {
      ...headers,
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  }

  return headers
}

async function router(request, context) {
  let { pathname, host, search } = new URL(request.url);
  const parameters = new URLSearchParams(search)
  const world = parameters.get('world')
  let extension = path.extname(pathname);
  const headers = buildHeaders(pathname, extension);

  let file
  let statusCode = Status.Success

  if(pathname === '/' && doingBusinessAs[world || host]) {
    const file = await home(request)
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
    return about(request)
  }

  if(pathname === '/plan98/owncast') {
    return owncast(request)
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
    pathname = './client/public/index.html'
    extension = path.extname(pathname);
    file = await Deno.readFile(pathname)
    statusCode = Status.NotFound
    console.error(e + '\n' + pathname + '\n' + e)
  }


  return new Response(file, {
    headers,
    status: statusCode
  })
}

const byPath = (x) => x.path
const byName = (x) => x.name

async function home(request) {
  let file
  try {
    const { pathname, host, search } = new URL(request.url);
    const parameters = new URLSearchParams(search)
    const world = parameters.get('world')
    const { saga } = doingBusinessAs[world || host]
    console.log(saga)

    file = await Deno.readTextFile(`./client/${saga}`)
    file = await sanitizers['.saga'](file)
    } catch (e) {
    console.error(e + '\n' + pathname + '\n' + e)
  }
  return file
}


async function about(request) {
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
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function owncast(request) {
  const onlinePromise = fetch('https://94404-969-g-edgewater-blvd-123.thelanding.page/api/status').then(res => res.json())
  const data = { broadcast: await onlinePromise }
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
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

