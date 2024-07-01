import tag from '@silly/tag'

const $ = tag('language-selector', { mode: 'unknown' })

const map = {
  unknown: language,
  known: dialect
}

$.draw((target) => {
  const { mode } = $.learn()
  return modes(target, mode)
})

function modes(target, mode) {
  if(map[mode]) {
    return map[mode](target)
  }
}

function language(target) {
  const l = target.getAttribute('language')

  return `
    <label class="field">
      <span class="label">
        ${l}
      </span>
      <select>
        <option value="en">English</option>
      </select>
    </label>
  `
}

function dialect(target) {
  const d = target.getAttribute('dialect')

  return `
    <label class="field">
      <span class="label">
        ${d}
      </span>
      <select>
        <option value="us">American</option>
      </select>
    </label>
  `
}
