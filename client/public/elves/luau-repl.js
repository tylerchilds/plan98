import elf from '@plan98/elf'

const data = {
  input: `print("Hello, World from Luau!")

-- You can add more Luau code here
local message = "The answer is: "
local number = 42
print(message .. number)

-- Function example
local function greet(name)
    return "Hello, " .. name .. "!"
end

print(greet("Luau User"))`,
  output: []
}

const $ = elf('luau-repl', data)
export default $

window.Module = {
  print: function (msg) { log(msg) }
}
function log(text) {
  $.teach(text, mergeOutput)
}

export function haveLuau(program) {
  const { ready, output } = $.learn()

  if(!ready) {
    return 'Luau not yet ready, please wait'
  }

  const err = Module.ccall('executeScript', 'string', ['string'], [program]);
  if (err) {
    const err2 = Module.ccall('executeScript', 'string', ['string'], ['return ' + program]);
    if(err2) {
      log('Error:' + err.replace('stdin:', ''));
    }
  }

  return $.learn().output.slice(output.length)
}

function run() {
  const { input } = $.learn()
  console.log(haveLuau(input))
}

$.when('click', '[data-run]', run)

const script = document.createElement('script');
script.src = '/public/cdn/roblox.com/Luau.Web.js'
document.head.appendChild(script); 

script.onload = function () {
  Module.onRuntimeInitialized = () => {
    $.teach({ ready: true })
    $.draw(render, { beforeUpdate, afterUpdate })
  }
}

function render(target) {
  const { input, output } = $.learn()
  return `
    <div class="action-bar">
      <button style="float: right;" data-run class="standard-button">Run</button>
      <div class="title">Luau Repl</div>
    </div>
    <div class="input">
      <textarea
        name="input"
        data-bind="input"
        placeholder="Say it, don't spray it."
        value="${escapeHyperText(input)}"
      ></textarea>
    </div>
    <div class="output">
      <div class="textarea">${output.map(x => {
        return `
          <div>
            ${escapeHyperText(x)}
          </div>
        `
      }).join('')}</div>
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
  }

  & .output {
    height: 100%;
    overflow: auto;
    padding: .5rem;
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
  }
`)
