import tag from '@silly/tag'

const $ = tag('language-selector')

$.draw((target) => {
  const l = target.getAttribute('language')
  const go = target.getAttribute('go')

  state['ls/xx-yy'] = 'en-us'
  return `
    <label class="field">
      <span class="label">
        ${l}
      </span>
      <select>
        <option value="en-us">English</option>
        <option value="es-mx" disabled>Spanish</option>
        <option value="it-it" disabled>Italian</option>
        <option value="ca-fr" disabled>French</option>
        <option value="pt-br" disabled>Portuguese</option>
      </select>
    </label>
    <button class="call-to-action" data-action>
      ${go}
    </button>
  `
})

$.when('change', 'select', (event) => {
  const { value } = event.target
  state['ls/xx-yy'] = value
})


$.when('click', '[data-action]', async (event) => {
  const root = event.target.closest($.link)
  const { action, script } = root.dataset
  if(script) {
    const dispatch = (await import(script))[action]
    if(dispatch) {
      self.history.pushState({ action, script }, "");
      await dispatch(event, root)
    }
  }
})

$.style(`
  & {
    display: block;
    padding: 0 1rem;
    margin: 1rem auto;
  }

  & select {
    
  }
`)
