import module from '@silly/tag'
import { updateInstance, PANEL_LIST, PANEL_CREATE } from './multiplayer-lobby.js'

const $ = module('multiplayer-welcome')

$.draw((target) => {
  const { id } = target.dataset
  return `
    <button class="new" data-id="${id}">
      New Game
    </button>
    <button class="join" data-id="${id}">
      Join Game
    </button>
  `
})

$.when('click', '.new', ({ target }) => {
  const { id } = target.dataset
  updateInstance(id, { nextPanel: PANEL_CREATE })
})

$.when('click', '.join', ({ target }) => {
  const { id } = target.dataset
  updateInstance(id, { nextPanel: PANEL_LIST })
})
