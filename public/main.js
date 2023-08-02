import './packages/smugoogle.js'
import './packages/console-module.js'
import './packages/code-module.js'
import './packages/card-list.js'
import './packages/tree-view.js'
import './packages/modal-module.js'
import './packages/synth-module.js'
import './packages/design-system.js'
import './packages/smug-mug.js'
import './packages/google-maps.js'
import './packages/script-type.js'
import './packages/field-text.js'
import './packages/field-select.js'
import './packages/connected-service.js'

function modulate(config) {
  [...document.querySelectorAll(':not(:defined)')].forEach(async (target) => {
    class WebComponent extends HTMLElement {
      constructor() {
        super();
      }
    }

    const module = target.nodeName.toLowerCase()
    await import(`${config.moduleProxy || '.'}/${module}.js`).catch(() => null)
    if(target.matches(':not(:defined)')) {
      customElements.define(
        module,
        WebComponent
      );
    }
  })
}

(function(config) {
  modulate(config)
  new MutationObserver((mutationsList) => {
    modulate(config)
  }).observe(document.body, { childList: true, subtree: true });
})({ moduleProxy: './cool-modules' })
