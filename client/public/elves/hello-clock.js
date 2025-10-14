import elf from '@silly/elf'

const $ = elf("hello-clock", {
  seconds: 0
})

setInterval(() => {
  const { seconds } = $.learn()
  $.teach({ seconds: seconds + 1 })
}, 1000)

$.draw((target) => {
  const { seconds } = $.learn()

  return `
    Seconds elapsed: ${seconds}
  `
})
