import elf from '@silly/elf'
import eruda from 'eruda'

const $ = elf('plan98-console')

$.draw(container => {
  if(container.initialized) return
  container.initialized = true
  eruda.init({ container });

  eruda.add({
    name: 'Silly',
    init($el) {
      this._$el = $el;
    },
    show() {
      this._$el.show()
      this._$el.html('<integrated-development></integrated-development');
    },
    hide() {
      this._$el.hide()
      this._$el.html('');
    },
    destroy() {}
  })

  eruda.add({
    name: 'Braid',
    init($el) {
      this._$el = $el;
    },
    show() {
      this._$el.show()
      this._$el.html('<iframe id="braid-panel" title="braid-debugger" src="/cdn/braid.org/braid_panel.html" style="width: 100%; height: 100%; border: none;"></iframe>');
    },
    hide() {
      this._$el.hide()
      this._$el.html('');
    },
    destroy() {}
  })

  requestIdleCallback(() => $.teach({ initialized: true }))
})

let timeout = 10
let retry = 1
export function consoleShow() {
  const { initialized } = $.learn()
  if(!initialized) {
    setTimeout(consoleShow, timeout * retry)
    retry += 1
    timeout *= 2
    return
  }
  eruda.show()
}

export function consoleHide() {
  const { initialized } = $.learn()
  if(!initialized) {
    return
  }
  eruda.hide()
}

$.style(`
  @media print {
    #eruda {
      display: none;
    }
  }

  &.hidden {
    display: none
  }
`)
