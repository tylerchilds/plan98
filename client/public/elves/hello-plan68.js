import app from '@plan68/app'

const $ = app('hello-plan68', {
  count: 0
})

$.draw(() => {
  const { count } = $.learn()

  return `
    <button>
      ${count}
    </button>
  `
})

$.when('click', 'button', (event) => {
  const { count } = $.learn()
  $.teach({ count: count+1 })
})
