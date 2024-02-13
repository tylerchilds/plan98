import module from "@sillonious/module";

import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

const link = document.createElement('link')
link.setAttribute('rel', 'stylesheet')
link.setAttribute('href', 'https://esm.sh/xterm@5.3.0/css/xterm.css')
document.head.appendChild(link);

const $ = module('terminal-demo', {
  statusLine: 'Nothing.',
  pythonVersion: '...',
  script: '/public/python/main.py'
})

$.draw(target => {
  if(!target.booting) start(target)
})

$.style(`
  & {
    display: block;
    height: 100%;
  }
`)

async function start(target) {
  target.booting = true
  const { Wasmer, init } = await import("@wasmer/sdk");
  await init();
  const term = new Terminal();
  const fit = new FitAddon();
  term.loadAddon(fit);
  term.open(target);
  fit.fit();

  term.writeln("Silly...");
  const pkg = await Wasmer.fromRegistry("sharrattj/bash");
  term.reset();
  const instance = await pkg.entrypoint.run();
	
  connectStreams(instance, term);
}

function connectStreams(instance, term) {
  const stdin = instance.stdin?.getWriter();
  const encoder = new TextEncoder();
  term.onData(data => stdin?.write(encoder.encode(data)));
  instance.stdout.pipeTo(new WritableStream({ write: chunk => term.write(chunk) }));
  instance.stderr.pipeTo(new WritableStream({ write: chunk => term.write(chunk) }));
}
