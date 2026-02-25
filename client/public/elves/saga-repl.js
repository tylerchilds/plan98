import { Self, Saga } from '@plan98/types'

const data = {
  input: `<title-page
author: Your Name
title: Your Idea

# Int/Ext. Some Where

Some text describing the actions of a scene

@ Character
& with feeling
> Saying Something

! Remove this line later

^ Fade to black

...
`,
  output: null
}

const $ = Self('saga-repl', data)
export default $

async function print(event) {
  const template = await fetch('/').then(async res => {
    return await res.text()
  })
  const { input } = $.learn()
  const html = Saga(input)
  if(event.target.preview) event.target.preview.close()
  event.target.preview = window.open('', 'PRINT');
  const { preview } = event.target

  const page = new DOMParser().parseFromString(template, "text/html");
  page.body.innerHTML = ''
  page.body.insertAdjacentHTML('beforeend', `
    <div class="screenplay">
      ${html}
    </div>
    <div class="print-banner">
      <button class="standard-button bias-positive" onclick="(()=>{window.print();window.close()})()">Print</button>
      <button class="standard-button bias-generic" onclick="(()=>{window.close()})()">Cancel</button>
    </div>
    <style type="text/css">
      body {overflow: auto; height: auto !important; }
      xml-html {height: 100%; overflow: auto; }
      .print-banner {
        padding: 1rem;
        text-align: right;
        color: white;
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        z-index: 9001;
      }

      @media print {
        .print-banner {
          display: none;
        }
      }
    </style>
  `)

  preview.document.write(`<!DOCTYPE html>${page.documentElement.outerHTML}`)
  preview.document.close(); // necessary for IE >= 10
  preview.focus(); // necessary for IE >= 10*/
}

$.when('click', '[data-print]', print)
$.when('click', '[data-edit]', () => $.teach({ output: null }))

$.draw(render, { beforeUpdate, afterUpdate })

function render(target) {
  const { input } = $.learn()
  return `
    <div class="action-bar">
      <button style="float: right; margin-left: 1rem;" data-print class="standard-button">Preview</button>
      <div class="title">Saga</div>
    </div>
    <div class="input">
      <textarea
        name="input"
        data-bind="input"
        placeholder="Say it, don't spray it."
        value="${escapeHyperText(input)}"
      ></textarea>
    </div>
  `
}

function beforeUpdate(target) {
  {
    const q = target.getAttribute('q')
    const src = target.getAttribute('src')
    if(!target.initialized) {
      target.initialized = true
      if(q) {
        const input = decodeURIComponent(q)
        $.teach({ input })
      }
      if(src) {
        fetch(src).then(async (res) => {
          $.teach({ input: await res.text() })
        })
      }
    }
  }
}

function afterUpdate(target) {

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
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr;
    height: 100%;
    overflow: hidden;
  }

  & .action-bar {
    background: rgba(0,0,0,1);
    padding: .5rem;
    display: block;
  }

  & .title {
    color: rgba(255,255,255,.85);
    font-weight: bold;
    font-size: 1.5rem;
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
    padding: .5rem;
  }

  & .output .textarea {
    white-space: preserve;
  }

  & .invisible {
    display: none;
  }
`)
