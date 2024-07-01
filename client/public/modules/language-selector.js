import tag from '@silly/tag'

const $ = tag('language-selector')

$.draw((target) => {
  const { mode } = $.learn()
  return modes(target, mode)
})

const map = {
  unknown: language,
  known: dialect
}

function modes(target, mode) {
  if(map[mode]) {
    map[mode](target)
  }
}

function language(target) {
  const l = target.getAttribute('language')

  return `
    ${l}
    <select>
      <option value="en">English</option>
    </select>
  `
}

function dialect(target) {
  const d = target.getAttribute('dialect')

  return `
    ${d}
    <select>
      <option value="us">American</option>
    </select>
  `
}
