import elf from '@silly/elf'

const $ = elf('email-none')

$.draw((target) => {
  return `
    <iframe src="/app/sillyz-computer?src=${target.getAttribute('src') || '/app/draw-term' }"></iframe>
  `
})
