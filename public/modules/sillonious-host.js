import module from '@sillonious/module'

import party, {
  hostPressesStartStop,
  hostPressesReset,
  hostPressesLight,
  hostPressesMode,
  anybodyPressesStartStop,
  anybodyPressesReset,
  anybodyPressesLight,
  anybodyPressesMode,
} from '@sillonious/party'

const $ = module('sillonious-host')

$.draw(target => {
  const { compass } = $.learn()
  if(!compass) return

  const timeControls = compass.map((button) => {
      return `<button ${button.actuated ? 'data-actuated="true"' : ''} data-key="${button.key}">${button.value}</button>`
    })
    .join('')
  return `
    ${timeControls}
  `
})
function loop() {
  const player1 = party()[0]
  if(!player1) return
  const { gamepad, osc } = player1
  const compass = gamepad.buttons
    .sort((a, b) => a.index - b.index)
    .slice(0, 4)

  $.teach({ compass })
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)

$.style(`
  & {
    display: grid;
    grid-template-areas:
      "play play play"
      "reset light mode";
    grid-template-colums: 1fr 1fr 1fr;
  }

  & > :first-child {
    grid-area: play;
  }
`)
