import module from '@silly/tag'
import eruda from 'eruda'

const $ = module('plan98-console')

$.draw(container => {
  eruda.init({ container });

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
})

$.style(`
  @media print {
    #eruda {
      display: none;
    }
  }
`)
