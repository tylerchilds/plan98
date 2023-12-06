import module from '@sillonious/module'

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

    eruda.show()
  }

  requestAnimationFrame(loop)
})
