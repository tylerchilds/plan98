import mvc from '@plan98/elf'

const $ = mvc('hello-mvc', {
  nickname: '',
  global: {
    body: undefined
  },
  local: {
    body: undefined
  }
})

$.view(() => {
  const { nickname, global, local } = $.model()
  return `
    <h1>${escapeHyperText(nickname)}</h1>
    <input data-bind name="nickname" value="${escapeHyperText(nickname)}" type="text" />
    <h2>Online</h2>
    <textarea
      name="body"
      data-bind="global"
      placeholder=""
      value="${escapeHyperText(global.body)}"
    ></textarea>
    <h3>Offline</h3>
    <textarea
      name="body"
      data-bind="local"
      placeholder="Say it, don't spray it."
      value="${escapeHyperText(local.body)}"
    ></textarea>
  `
})

$.when('input', '[data-bind]', (event) => {
  const { bind } = event.target.dataset

  if(!bind) {
    const { name, value } = event.target;
    $.whisper({ [name]: value })
  }

  const STORAGE_GOOBER = bind === 'global' ? $.controller : $.whisper

  STORAGE_GOOBER({
    bind: bind,
    name: event.target.name,
    value: event.target.value
  }, (state, payload) => {
    return {
      ...state,
      [payload.bind]: {
        ...state[payload.bind],
        [payload.name]: payload.value
      }
    }
  })
})

function escapeHyperText(text = '') {
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
