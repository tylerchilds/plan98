import elf from '@plan98/elf'
import { getQuickJS } from "quickjs-emscripten"

async function main() {
  const QuickJS = await getQuickJS()
  const vm = QuickJS.newContext()

  const world = vm.newString("world")
  vm.setProp(vm.global, "NAME", world)
  world.dispose()

  const result = vm.evalCode(`"Hello " + NAME + "!"`)
  if (result.error) {
    console.log("Execution failed:", vm.dump(result.error))
    result.error.dispose()
  } else {
    console.log("Success:", vm.dump(result.value))
    result.value.dispose()
  }

  vm.dispose()
}

main()

const data = {
  input: `function hello() { return 'world' } hello()`,
  output: null
}

const $ = elf('js-repl', data)
export default $

window.Module = {
  print: function (msg) { log(msg) }
}
function log(text) {
  $.teach(text, mergeOutput)
}

export async function runJs(program) {
  $.teach({ output: null })
  const QuickJS = await getQuickJS()
  const vm = QuickJS.newContext()

  const result = vm.evalCode(program)
  if (result.error) {
    const error = vm.dump(result.error)
    result.error.dispose()
    vm.dispose()
    return "Failed: " + JSON.stringify(error, '', 2)
  } else {
    const data = vm.dump(result.value)
    result.value.dispose()
    vm.dispose()
    return data
  }
}

async function run() {
  const { input } = $.learn()
  const output = await runJs(input)
  $.teach({ output })
}

$.when('click', '[data-run]', run)

$.draw(render, { beforeUpdate, afterUpdate })

function render(target) {
  const { input, output } = $.learn()
  return `
    <div class="action-bar">
      <button style="float: right;" data-run class="standard-button">Run</button>
      <div class="title">JS Repl</div>
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
      <div class="textarea">${output || ''}</div>
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
