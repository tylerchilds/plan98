import elf from '@silly/elf'
import { doingBusinessAs } from '@sillonious/brand'

const { host } = self.plan98 || { host: window.location.host }

const $ = elf('mega-footer')

export function currentBusiness() {
  return doingBusinessAs[host] || doingBusinessAs['sillyz.computer']
}

$.draw((target) => {
  const {
    logo,
    contact,
    latitude,
    longitude,
    color
  } = currentBusiness()

  return `
    <div class="bleed" style="--bg: ${color};">
      <div class="wrapper">
        ${contact}
      </div>
    </div>
  `
})

$.style(`
  & .bleed {
    background: var(--bg, lemonchiffon)
  }
  & .wrapper {
    background: rgba(0,0,0,.85);
    color: white;
    max-width: 55rem;
    padding: 1rem;
    margin: auto;
  }
`)
