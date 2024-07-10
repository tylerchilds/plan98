import module from '@silly/tag'

const $ = module('plan98-toast')

export default $

function flash(target, timeout) {
  target.classList.add('flashed')
  setTimeout(() => {
    target.classList.remove('flashed')
    $.teach({ body: '' })
  }, timeout)
}

$.draw((target) => {
  const { body } = $.learn()
  flash(target, 3000)
  return body ? `
    <div class="label">
      ${body}
    </div>
  ` : ''
})

const context = `<plan98-toast></plan98-toast>`
document.body.insertAdjacentHTML("beforeend", context)

export function toast(body) {
  $.teach({ body })
}

$.style(`
  & {
    pointer-events: none;
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    place-content: center;
    z-index: 9000
  }

  & .label {
    background: lemonchiffon;
    padding: 1rem;
    box-shadow: 0 0 2px 2px rgba(0,0,0,.85);
    pointer-events: all;
  }

  &.flashed {
    opacity: 1;
  }
`)
