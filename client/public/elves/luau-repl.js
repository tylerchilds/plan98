import elf from '@plan98/elf'

const data = {
  input: `
print("Hello, World from Luau!")

-- You can add more Luau code here
local message = "The answer is: "
local number = 42
print(message .. number)

-- Function example
local function greet(name)
    return "Hello, " .. name .. "!"
end

print(greet("Luau User"))
  `,
  output: []
}

const $ = elf('luau-repl', data)

function init(Module) {
  function executeScript(script) {
    var err = Module.ccall('executeScript', 'string', ['string'], [script]);
    if (err) {
        log('Error:' + err.replace('stdin:', ''));
    }
  }

  $.draw(render, { beforeUpdate, afterUpdate })
  $.when('click', '[data-run]', run)

  function run() {
    const { input } = $.learn()
    executeScript(input)
  }
}

window.Module = {
  print: function (msg) { log(msg) }
}
function log(text) {
  $.teach(text, mergeOutput)
}

const script = document.createElement('script');
script.src = '/public/cdn/roblox.com/Luau.Web.js'
document.head.appendChild(script); 

script.onload = function () {
  Module.onRuntimeInitialized = () => {
    init(Module)
  }
    /*
    executeScript('print(2+2)')
    executeScript('print("Hello World!")')
    executeScript('print(2*2)')
    executeScript('print(2/2)')
    */
}

function render(target) {
  const { input, output } = $.learn()
  return `
    <div class="action-bar">
      <button data-run>Run</button>
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
      <div class="textarea">${escapeHyperText(output.join('\n'))}</div>
    </div>
  `
}

function beforeUpdate(target) {

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
