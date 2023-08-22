import './packages/smugoogle.js'
import './packages/console-module.js'
import './packages/code-module.js'
import './packages/card-list.js'
import './packages/modal-module.js'
import './packages/tree-view.js'
import './packages/file-system.js'
import './packages/synth-module.js'
import './packages/design-system.js'
import './packages/smug-mug.js'
import './packages/google-maps.js'
import './packages/script-type.js'
import './packages/field-text.js'
import './packages/field-select.js'
import './packages/connected-service.js'

function tag(config) {
  [...document.querySelectorAll(':not(:defined)')].forEach(async (target) => {
    class WebComponent extends HTMLElement {
      constructor() {
        super();
      }
    }

    const customElement = target.tagName.toLowerCase()
    const url = `${config.proxy || '.'}/${customElement}.js`
    const exists = (await fetch(url, {method: 'HEAD'})).ok
    if(!exists) return
    await import(url).catch(() => null)
    if(target.matches(':not(:defined)')) {
      customElements.define(
        customElement,
        WebComponent
      );
    }
  })
}

(function(config) {
  tag(config)
  new MutationObserver((mutationsList) => {
    console.log(mutationsList)
    tag(config)
  }).observe(document.body, { childList: true, subtree: true });
})({ proxy: './tag' })
