import module from '@silly/tag'

const s = document.createElement("script");
s.type = "text/javascript";
s.src = "//cdn.jsdelivr.net/npm/eruda";
document.body.appendChild(s)

const $ = module('plan98-console')

$.draw(container => {
  function loop() {
    if(! window.eruda) {
      requestAnimationFrame(loop)
      return
    }
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
  }

  requestAnimationFrame(loop)
})

$.style(`
  @media print {
    #eruda {
      display: none;
    }
  }
`)
