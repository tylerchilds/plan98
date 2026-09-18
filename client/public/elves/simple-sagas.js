import { Self, Saga } from '@plan98/types'

const $ = Self('simple-sagas', {
  saga: "Here's a little story, I got to tell...",
  orientation: screen.orientation.type,
})

const isPortrait = () => $.model().orientation.startsWith('portrait');
const isLandscape = () => $.model().orientation.startsWith('landscape');

$.draw(() => {
  const { saga } = $.model()

  if(isPortrait()) {
    const escapedSaga = escapeHyperText(saga)
    return `
      <div>
        <textarea name="typewriter">${escapedSaga}</textarea>
      </div>
    `
  }

  if(isLandscape()) {
    return `
      <div>
        ${Saga(saga)}
      </div>
    `
  }
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

$.when('input', '[name="typewriter"]', (event) => {
  const saga = event.target.value
  $.controller({ saga })
})

screen.orientation.addEventListener('change', (event) => {
  const orientation = screen.orientation.type
  $.controller({ orientation })
});

$.style(`
  & {
    padding: 2rem 1rem;
    display: block;
    height: 100%;
    font-family: 'courier';
  }

  & [name="typewriter"] {
    width: 100%;
    height: 100%;
    border: none;
    resize: none;
    padding: 1rem;
  }
`)
