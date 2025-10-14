import elf from '@silly/elf'

const $ = elf("hello-counter", {
  count: 0
})

$.draw((target) => {
  const { count } = $.learn()

  let string = '0 times'

  if(count === 1) {
    string = '1 time'
  } else if(count > 0) {
    string = count + ' times'
  }

  return `
    <button>
      I have been clicked ${string}!
    </button>
  `
})

$.when('click', 'button', (event) => {
  $.teach({
    count: $.learn().count + 1
  })
})
