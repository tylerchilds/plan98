import elf from '@plan98/elf'

const data = {
  input: `<non-collection
  src="https://mastodon.social/users/bengo/outbox"
  cors-proxy="https://non-activity.stream/proxy/"
></non-collection>

<script
  src="https://non-activity.stream/elements/non-collection.js?define&importmap"
></script>`,
  output: null
}

const $ = elf('html-repl', data)
export default $

function run() {
  const { input } = $.learn()
  const blob = new Blob([input], { type: 'text/html' })
  const blobURL = URL.createObjectURL(blob) 
  $.teach({ output: blobURL })
}

$.when('click', '[data-run]', run)
$.when('click', '[data-edit]', () => $.teach({ output: null }))

$.draw(render, { beforeUpdate, afterUpdate })

function render(target) {
  const { input, output } = $.learn()
  return `
    <div class="action-bar">
      <button style="float: right; margin-left: 1rem;" data-run class="standard-button">Run</button>
      <button style="float: right;" data-edit class="standard-button -outlined hide-full">Edit</button>
      <div class="title">HyperScope</div>
    </div>
    <div class="input ${output?'invisible':'visible'}">
      <textarea
        name="input"
        data-bind="input"
        placeholder="Say it, don't spray it."
        value="${escapeHyperText(input)}"
      ></textarea>
    </div>
    <div class="output ${output?'visible':'invisible'}">
      <iframe src="${output}"></iframe>
    </div>
  `
}

function beforeUpdate(target) {
  { // convert a query string to new post
    const q = target.getAttribute('q')
    if(!target.initialized) {
      target.initialized = true
      if(q) {
        const input = decodeURIComponent(q)
        $.teach({ input })
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
