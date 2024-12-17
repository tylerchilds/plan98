import module from '@silly/tag'

const $ = module('feedback-channel', { feedback: [] })

export const link = $.link

$.draw(() => {
  const { feedback }  = $.learn()
  return feedback.map(({ message, type }) => {
    return `
      <div class="feedback ${type}">
        ${message}
      </div>
    `
  }).join('<br>')
})

$.style(`
  & .feedback {
    border: 1px solid dodgerblue;
  }

  & .error {
    border-color: orange;
  }
`)
