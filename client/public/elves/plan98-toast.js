import elf from '@silly/elf'

const $ = elf('plan98-toast')

export default $

let toastTimeout
function cleanup(target) {
  clearTimeout(toastTimeout)
  target.classList.remove('flashed')
  $.teach({ body: '' })
}

function flash(target, timeout) {
  clearTimeout(toastTimeout)
  target.classList.add('flashed')
  toastTimeout = setTimeout(() => {
    cleanup(target)
  }, timeout)
}

$.draw((target) => {
  const { body } = $.learn()

  if(body) {
    flash(target, 10000)
    return `
      <div class="label">
        ${body}
        <button class="toast-close">
          <sl-icon name="x-circle"></sl-icon>
        </button>
      </div>
    `
  }
}, {afterUpdate})

function afterUpdate(target) {
  { // recover icons from the virtual dom
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('sl-icon')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
  }
}

$.when('click', '.toast-close', (event) => {
  cleanup(event.target.closest($.link))
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
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    place-content: center;
    z-index: 9000
  }

  & .label {
    background: linear-gradient(25deg, rgba(0,0,0,.65), rgba(0,0,0,.85));
    padding: 1rem;
    pointer-events: all;
    font-size: 1.2rem;
    line-height: 1;
    color: white;
    position: relative;
  }

  & .toast-close {
    background: transparent;
    border: none;
    border-radius: 0;
    color: white;
    padding: 3px 5px 0;
    opacity: .65;
    transition: opacity 100ms;
    margin-left: .5rem;
  }

  & .toast-close:hover,
  & .toast-close:focus {
    opacity: 1;
  }

  &.flashed {
    opacity: 1;
  }
`)
