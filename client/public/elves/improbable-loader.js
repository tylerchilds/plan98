import elf from '@silly/elf'

const flip = () => Math.floor(Math.random() * 2)

const flop = ['.', '^']

const $ = elf('improbable-loader', { hand: [] })

function load() {
  $.teach({
    hand: [flop[flip()], flop[flip()], flop[flip()], flop[flip()], flop[flip()]]
  })

  requestAnimationFrame(load)
}

$.draw(() => `[${$.learn().hand.map((x) => x).join('')}]`)

requestAnimationFrame(load)

$.style(`& { font-family: monospace }`)
