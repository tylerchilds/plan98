import module from '@silly/tag'
import { updateInstance, PANEL_IMMERSIVE } from './multiplayer-lobby.js'

const $ = module('multiplayer-create')

$.draw((target) => {
  const { id } = target.dataset
  return `
    <button class="enter" data-id="${id}">
      Enter
    </button>
  `
})

$.when('click', '.enter', ({ target }) => {
  const { id } = target.dataset
  updateInstance(id, { nextPanel: PANEL_IMMERSIVE })
})
