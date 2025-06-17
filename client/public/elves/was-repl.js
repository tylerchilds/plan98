import elf from '@plan98/elf'
import { getQuickJS } from "quickjs-emscripten"

const sampleHTML = `<!DOCTYPE html>
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

      body[pathname$=".saga"] main {
        height: auto;
      }
    </style>
    <script type="importmap">
      {
        "imports": {
          "@did.coop/did-key-ed25519": "https://esm.sh/@did.coop/did-key-ed25519",
          "@wallet.storage/fetch-client": "https://esm.sh/@wallet.storage/fetch-client@^1.1.3",
          "@plan98/elf": "/elf.js"
        }
      }
    </script>
    <script>
      plan98 = {
        env: {
          PLAN98_WAS_HOST: "http://localhost:8080"
        }
      }
    </script>
    <script async type="module" src="/main.js"></script>
  </head>
  <body>
    <main>
      <was-hello></was-hello>
    </main>
  </body>
</html>`

const data = {
  src: '/tmp',
  file: sampleHTML,
}

const $ = elf('was-repl', data)
export default $

async function publish() {
  const { file } = $.learn()
  $.teach({ output })
}

$.when('click', '[data-publish]', publish)

$.draw(render, { beforeUpdate, afterUpdate })

function render(target) {
  const { file, src } = $.learn()
  return `
    <div class="action-bar">
      <div class="title">
        <input name="src" data-bind type="text" value="${escapeHyperText(src)}">
      </div>
      <button data-publish class="standard-button">Publish</button>
    </div>
    <div class="input">
      <textarea
        name="file"
        data-bind
        placeholder="Say it, don't spray it."
        value="${escapeHyperText(file)}"
      ></textarea>
    </div>
    <div class="output">
      <iframe src="${src}"></iframe>
    </div>
  `
}

function beforeUpdate(target) {
  { // convert a query string to new post
    const q = target.getAttribute('q')
    const src = target.getAttribute('src')
    if(!target.initialized) {
      target.initialized = true
      if(q) {
        const file = decodeURIComponent(q)
        $.teach({ file })
      }

      if(src) {
        $.teach({ src })
      }
    }
  }


}

function afterUpdate(target) {

}

function mergeOutput(state, payload) {
  return {
    ...state,
    output: [...state.output, payload]
  }
}

function escapeHyperText(text = '') {
  if(!text) return ''
  return text.replace(/[&<>'"]/g, 
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.style(`
  & {
    display: grid;
    grid-template-rows: auto 1fr 1fr;
    grid-template-columns: 1fr;
    height: 100%;
    overflow: hidden;
  }

  & .action-bar {
    background: rgba(0,0,0,1);
    padding: .5rem;
    display: grid;
    grid-template-columns: 1fr auto;
  }

  & .title {
    color: rgba(255,255,255,.85);
    font-weight: bold;
  }

  & .title input {
    max-width: 100%;
    padding: .5rem;
    width: 100%;
  }

  & .input textarea {
    border: none;
    height: 100%;
    width: 100%;
    resize: none;
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
    padding: .5rem;
    border-radius: 0;
  }

  & .output {
    height: 100%;
    overflow: auto;
  }

  & .output .textarea {
    white-space: preserve;
  }

  & .invisible {
    display: none;
  }

  @media (min-width: 36rem) {
    & {
      display: grid;
      grid-template-rows: auto 1fr;
      grid-template-columns: 1fr 1fr;
    }

    & .action-bar {
      grid-column: -1 / 1;
    }

    & .invisible {
      display: block;
    }

    & .hide-full {
      display: none;
    }
  }
`)
