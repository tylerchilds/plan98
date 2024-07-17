import module from '@silly/tag'
import { currentSave } from '../cdn/thelanding.page/game-state.js'
import { showModal } from './plan98-modal.js'

const $ = module('sillonious-gallery')

$.draw(() => {
  const {chaosEmerald} = currentSave()
  if(chaosEmerald.filter(x => x).length === 6) {
    return `
      <hypertext-action>
        You approach a tome. A tomb? A pile of papers. In a graveyard.
      </hypertext-action>
      <action-script
        data-saga="006-001.saga"
        data-action="takeEmerald"
        data-script="/public/cdn/thelanding.page/game-state.js"
        data-emerald="6"
      >Violet Journal</action-script>
    `
  }
  const superSonic = chaosEmerald.every(x => x) && chaosEmerald.length > 6
  return superSonic ? `
    <hypertext-action>
      You win!
    </hypertext-action>
    <action-script data-win data-action="ok" data-script="/public/cdn/thelanding.page/game-state.js">
      Hyper Space
    </action-script>
    <action-script data-saga="000-000.saga" data-action="blankSave" data-script="/public/cdn/thelanding.page/game-state.js">
      Reset
    </action-script>
  ` : `
    <hypertext-action>
      You're not strong enough yet...
    </hypertext-action>
    <action-script data-saga="000-000.saga">Rewind Time</action-script>
  `

})

$.when('click', '[data-win] button', () => {
  showModal(`
    <sillyz-ocarina mystery="true"></sillyz-ocarina>
  `)
})