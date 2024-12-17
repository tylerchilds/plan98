import "@shoelace-style/shoelace/icon"
import elf from '@silly/tag'

const $ = elf('plan98-icon')

$.draw((target) => {
  return `
    <sl-icon name="${target.getAttribute('name')}"></sl-icon>
  `
})
