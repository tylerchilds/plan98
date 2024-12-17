import elf from '@silly/elf'

const defaults = {
  monospace: '0',
  casual: '.5',
  weight: '400',
  slant: '0',
  cursive: '.5',
}
const $ = elf('hypertext-variable')

const variables = ['size', 'height', 'monospace', 'casual', 'weight', 'slant', 'cursive']

$.draw((target) => {
  if(!target.initialized) {
    target.initialized = true
    mount(target, variables)
  }

  const {
    monospace,
    casual,
    weight,
    slant,
    cursive,
    size,
    height
  } = $.learn()[target.id] || defaults
  target.style= `
    --v-font-mono: ${monospace};
    --v-font-casl: ${casual};
    --v-font-wght: ${weight};
    --v-font-slnt: ${slant};
    --v-font-crsv: ${cursive};
    font-variation-settings:
      "MONO" var(--v-font-mono),
      "CASL" var(--v-font-casl),
      "wght" var(--v-font-wght),
      "slnt" var(--v-font-slnt),
      "CRSV" var(--v-font-crsv);
    font-family: 'Recursive';
    ${size ? `font-size: ${size};` : ''}
    ${height ? `line-height: ${height};` : ''}
  `

  return target.getAttribute('text')
});

async function mount(target, values) {
  values.map(x => {
    $.teach({
      [x]: target.getAttribute(x) || defaults[x]
    }, merge(target.id))
  })
}

function merge(id) {
  return (state, payload) => {
    return {
      ...state,
      [id]: {
        ...state[id],
        ...payload
      }
    }
  }
}

async function sleep(x) {
  new Promise(res => setTimeout(res, x))
}
