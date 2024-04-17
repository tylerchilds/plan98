import module from '@sillonious/module'
import { showModal, types as modalTypes } from './plan98-modal.js'
import { showPanel } from './plan98-panel.js'

import { doingBusinessAs } from './sillonious-brand.js'

const $ = module('saga-genesis')

const emeraldOfTime = { saga: '/public/sagas/time.saga' }

let quest = emeraldOfTime.saga

function useMacGuffin(macGuffin) {
  $.teach({ quest: macGuffin })
  const {
    previousReality,
    reality
  } = $.learn()

  if(previousReality === macGuffin) {
    return reality
  }

  fetch(macGuffin)
    .then(origin => origin.text())
    .then(async present => {
      const { hyperSanitizer } = await import('./hyper-script.js')
      const supervisedReality = hyperSanitizer(present)
      $.teach({
        previousReality: macGuffin,
        reality: supervisedReality
      })
    })

  return previousReality
}

function getHost(target) {
  return (target.closest('[host]') && target.closest('[host]').getAttribute('host')) || plan98.host
}

$.draw((target) => {
  const host = getHost(target)
  const route = window.location.pathname
  const macGuffin = route === '/' ? (doingBusinessAs[host] || emeraldOfTime).saga : '/public' + route
  const quest = useMacGuffin(macGuffin) || ''

  const escapeButton = `
    <button data-escape>Esc</button>
  `

  const helpButton = `
    <button data-aid data-tooltip="Ask a question or answer one...">
      Help
    </button>
  `

  target.innerHTML = ''

  return `
    ${escapeButton}
    ${helpButton}
    ${quest}
  `
})

$.when('click', '[data-escape]', revealTruth)

$.when('click', '[data-aid]', (event) => {
  showPanel(`
    <information-station></information-station>
    <gun-clipboard id="demo" safeword="demo"></gun-clipboard>
  `)
})

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    revealTruth()
  }
});

function revealTruth(event) {
  const { quest } = $.learn()

  showModal(`
    <div style="width: 100%; height: 100%; max-width: 100vw; max-height: 100vh;">
      <div style="overflow: auto; height: 100%; padding: 2rem 0 0;">
        <sillonious-brand>
          <integrated-development src="${quest}"></integrated-development>
        </sillonious-brand>
      </div>
    </div>
  `, { centered: true })
}

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    position: fixed;
    inset: 0;
    overflow: auto;
  }

  & [data-escape],
  & [data-aid] {
    background: black;
    border: none;
    border-radius: 0 0 1rem 0;
    color: white;
    padding: 0 1rem 0 .5rem;
    line-height: 1;
    height: 2rem;
    opacity: .8;
    transition: opacity: 200ms;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1101;
  }

  & [data-aid] {
    border-radius: 0 0 0 1rem;
    top: 0;
    left: auto;
    right: 0;
  }

  & [data-escape]:hover,
  & [data-escape]:focus {
    cursor: pointer;
    opacity: 1;
  }

  & [data-escape] * {
    pointer-events: none;
  }
`)

