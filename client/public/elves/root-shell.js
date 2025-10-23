import elf from '@silly/elf'

const $ = elf('root-shell')

$.draw(() => {
  return `<ur-shell src="/app/hello-elvish?elf=door-man"></ur-shell>`
})
