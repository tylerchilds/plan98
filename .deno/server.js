#!/usr/bin/env -S deno run
import { serve } from "https://deno.land/std@0.186.0/http/server.ts";

async function handleRequest(request) {
  const { pathname } = new URL(request.url);

  console.log("get", pathname);
  console.log("get", Deno.cwd());

  if (pathname === '/') {
    const file = await Deno.readFile('index.html')
    return html(file)
  }

  let file = ''

  try {
    file = await Deno.readFile(`.${pathname}`)
  } catch(e) {
    try {
      file = await Deno.readFile(`.${pathname}/index.html`)
    } catch(e) {
      return await blank(request)
    }
  }

  const extension = pathname.split('.').slice(-1)

  return new Response(file, {
    headers: {
      'content-type': getType(extension),
    },
  })
}

async function blank(request) {
  const { pathname } = new URL(request.url);

  try {
    return html(`
      <!doctype html>
      <title>404: Not Found</title>
      <p>Sorry, nothing to see here.
    `
    )
  } catch(e) {
    console.error(e)
  }
}

function html(content) {
  return new Response(content, {
    headers: {
      'content-type': getType('html'),
    },
  })
}

const types = {
  'css': 'text/css; charset=utf-8',
  'html': 'text/html; charset=utf-8',
  'js': 'text/javascript; charset=utf-8'
}

function getType(ext) {
  return types[ext] || types['html']
}

serve(handleRequest, { port: 8226 });
