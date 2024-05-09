import module from "@silly/tag";
import { init, Wasmer, Directory } from "@wasmer/sdk";

const $ = module('python-demo', {
  statusLine: 'Nothing.',
  pythonVersion: '...',
  script: '/public/python/main.py'
})

$.draw(target => {
  const { running, script, output, statusLine, pythonVersion } = $.learn()
  if(!running) {
    return `<input value="${script}" /><button>run</button>`
  }
  target.innerHTML = `
    ${!output ? '<boot-loader style="max-height: 100px"></boot-loader>' : ''}
    ${output && output.ok ? 'Successful' : '' }
    ${statusLine}<br />
    ${pythonVersion}
  `
});

$.when('click', 'button', start)
$.when('change', 'input', ({target}) => $.teach({ script: target.value }))

async function start() {
  const { script } = $.learn()
  $.teach({ running: true, statusLine: 'Initializing Wasmer SDK' })
  await init();

  $.teach({ statusLine: 'Loading Python Environment' })
  const python = await Wasmer.fromRegistry("python/python");

  $.teach({ statusLine: 'Downloading Python Script' })
  const pythonSource = await fetch(script).then(x => x.text())
  // A shared directory where the output will be written
  const out = new Directory();

  // Running the Python script
  const instance = await python.entrypoint.run({
    args: ["/src/main.py"],
    mount: {
      "out": out,
      "/src": {
        "main.py": pythonSource,
      }
    },
  });
  $.teach({ statusLine: 'Running Python Script' })
  const output = await instance.wait();

  if (!output.ok) {
    throw new Error(`Python failed ${output.code}: ${output.stderr}`);
  }

  // Read the version string back
  const pythonVersion = await out.readTextFile("/version.txt");
  $.teach({ pythonVersion, output, statusLine: 'Finished.' })
}
