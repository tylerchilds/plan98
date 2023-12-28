import module from "@sillonious/module"

function ready(plan98) {
  console.log(plan98, ' is ready')
}

function upsell(plan98) {
  const isFirst = self.self === self.top
  const notPrime = window.location.host !== plan98.provider
  if(isFirst && notPrime) {
    document.body.insertAdjacentHTML('beforeend', `
      <sillonious-upsell host="${plan98.provider}"></sillonious-upsell>
    `)
  }
}

export default class SillyzComputer {
  constructor(plan98, x) {
    modules({ registry: x.registry })
    new MutationObserver(() => {
      modules({ registry: x.registry })
    }).observe(document.body, { childList: true, subtree: true });
    ready(plan98)
    //upsell(plan98)
  }
}

function modules({ registry }) {
  const tags = new Set(
    [...document.querySelectorAll(':not(:defined)')]
    .map(({ tagName }) => tagName.toLowerCase())
  )

  tags.forEach(async (tag) => {
    const url = `${registry || '.'}/${tag}.js`
    const exists = (await fetch(url, { method: 'HEAD' })).ok
    if(!exists) return
    let definable = true
    await import(url).catch((e) => {
      definable = false
      console.error(e)
    })
    try {
      definable = definable && document.querySelector(tag).matches(':not(:defined)')
      if(definable) {
        customElements.define(tag, class WebComponent extends HTMLElement {
          constructor() {
            super();
          }
        });
      }
    } catch(e) {
      console.log('Error defining module:', tag, e)
    }
  })
}
