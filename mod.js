import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";
import * as path from "https://deno.land/std@0.184.0/path/mod.ts";
import { typeByExtension } from "https://deno.land/std@0.186.0/media_types/type_by_extension.ts";

async function router(request, context) {
  let { pathname } = new URL(request.url);
  let extension = path.extname(pathname);

  let file
  let statusCode = Status.Success
  try {
    file = await Deno.readFile(`./public${pathname}`)
  } catch (e) {
    pathname = './public/index.html'
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

serve(router);
console.log("Listening on http://localhost:8000");

