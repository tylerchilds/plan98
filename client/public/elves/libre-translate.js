import elf from '@silly/elf'
import translate from 'translate'

translate.engine = "libre";
translate.url = plan98.env.LIBRE_TRANSLATE_URL + '/translate'

const $ = elf('libre-translate', {
  input:'',
  output:'',
  to: 'es',
  from: 'en',
  sourceLanguages: [],
  destinationLanguages: []
})

let languages = []
async function loadLanguages() {
  const response = await fetch(plan98.env.LIBRE_TRANSLATE_URL + '/languages', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  languages = await response.json();
  $.teach({
    sourceLanguages: languages.map(x => ({code: x.code, name: x.name})),
    destinationLanguages: languages[0].targets
  })
}

try {
  loadLanguages()
} catch (error) {
  alert('Error submitting form.');
}

async function convert(input, config) {
  const output = await translate(input, config);
  $.teach({ output })
}

$.draw(() => {
  const {
    input,
    output,
    to,
    from,
    sourceLanguages,
    destinationLanguages
  } = $.learn()

  return `
    <div class="controls">
      <label class="field">
        <span class="label">Source</span>
        <select name="from" data-bind>
          ${sourceLanguages.map(x => {
            return `
              <option value="${x.code}" ${from === x.code ? 'selected="true"':''}>${x.name}</option>
            `
          }).join('')}
        </select>
      </label>
      <button data-swap>
        Swap
      </button>
      <label class="field">
        <span class="label">Destination</span>
        <select name="to" data-bind>
          ${destinationLanguages.map(x => {
            return `
              <option value="${x}" ${to === x ? 'selected="true"':''}>${x}</option>
            `
          }).join('')}

        </select>
      </label>
    </div>
    <div class="input">
      <textarea data-bind name="input" value="${input}"></textarea>
    </div>
    <div class="output">
      <textarea name="output">${output}</textarea>
    </div>
  `
}, {
  beforeUpdate: function before(target) {
    const { input, to, from } = $.learn()
    if(input !== '' && (target.input !== input || target.to !== to || target.from !== from)) {
      target.input = input
      target.to = to
      target.from = from
      convert(input, { to, from })
    }
  }
})

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.when('change', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.when('click', '[data-swap]', (event) => {
  const { to, from, output, input } = $.learn()
  $.teach({ to: from, from: to, input: output, output: input })
})

$.style(`
  & {
    display: grid;
    grid-template-rows: auto 1fr 1fr;
    height: 100%;
    grid-template-areas: "controls" "input" "output";
  }

  & .controls {
    grid-area: controls;
    display: grid;
    gap: .5rem;
    grid-template-columns: 1fr auto 1fr;
  }

  @media (min-width: 768px) {
    & {
      grid-template-areas: "controls controls" "input output";
      grid-template-rows: auto 1fr;
      grid-template-columns: 1fr 1fr;
    }
  }

  & textarea {
    resize: none;
    width: 100%;
    height: 100%;
    display: block;
  }
`)
