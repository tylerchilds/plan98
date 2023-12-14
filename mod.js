import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";
import * as path from "https://deno.land/std@0.184.0/path/mod.ts";
import { typeByExtension } from "https://deno.land/std@0.186.0/media_types/type_by_extension.ts";
import { walk } from "https://deno.land/std/fs/mod.ts";
import sortPaths from "https://esm.sh/sort-paths"
import { existsSync } from "https://deno.land/std@0.208.0/fs/exists.ts";

async function router(request, context) {
  let { pathname } = new URL(request.url);
  let extension = path.extname(pathname);

  if(pathname === '/plan98/about') {
    return about(request)
  }

  if(pathname === '/plan98/owncast') {
    return owncast(request)
  }

  let file
  let statusCode = Status.Success
  try {
		if(existsSync(`.${pathname}`, { isFile: true })) {
			file = await Deno.readFile(`.${pathname}`)
			return new Response(file, {
				headers: {
					'content-type': typeByExtension(extension),
				},
				status: statusCode
			})
		}
  } catch (e) {
		console.error(e)
  }

  try {
    file = await Deno.readFile(`./public${pathname}`)
  } catch (e) {
    pathname = './public/index.xml'
    extension = path.extname(pathname);
    file = await Deno.readFile(pathname)
    statusCode = Status.NotFound
    console.error(pathname + '\n' + e)
  }


  return new Response(file, {
    headers: {
      'content-type': typeByExtension(extension),
    },
    status: statusCode
  })
}

const byPath = (x) => x.path
const byName = (x) => x.name
async function about(request) {
  let paths = []

  const files = walk(Deno.cwd(), {
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
    const [_, path] = file.path.split(Deno.cwd())
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

