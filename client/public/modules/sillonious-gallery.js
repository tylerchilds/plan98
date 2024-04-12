import module from '@sillonious/module'
import { currentSave } from '../cdn/thelanding.page/game-state.js'

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
      >Take the Violet One</action-script>
    `
  }
  const superSonic = chaosEmerald.every(x => x) && chaosEmerald.length > 6
  return superSonic ? `
    <hypertext-action>
      You win!
    </hypertext-action>
    <go-to link="/?world=sillyz.computer">Go Home</go-to>
    <go-to link="/?world=thelanding.page">Go To Work</go-to>
    <action-script data-action="blankSave" data-script="/public/cdn/thelanding.page/game-state.js">
      Go to Bed
    </action-script>
  ` : `
    <hypertext-action>
      You're not strong enough yet...
    </hypertext-action>
    <sillonious-action saga="000-000.saga" label="Rewind Time"></sillonious-action>
  `

})
