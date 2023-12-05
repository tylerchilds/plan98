function modules({ folder }) {
  const tags = new Set(
    [...document.querySelectorAll(':not(:defined)')]
    .map(({ tagName }) => tagName.toLowerCase())
  )

  tags.forEach(async (tag) => {
    const url = `${folder || '.'}/${tag}.js`
    const exists = (await fetch(url, { method: 'HEAD' })).ok
    if(!exists) return
    let definable = true
    await import(url).catch(() => { definable = false })
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
      console.log('Error caught establishing formula for:', tag, e)
    }
  })
}

(function({ folder }) {
  modules({ folder })
  new MutationObserver((mutationsList) => {
    modules({ folder })
  }).observe(document.body, { childList: true, subtree: true });
})({ folder: '/modules' })

document.body.insertAdjacentHTML('beforeend', `
  <sillonious-brand host="${window.plan98.host}">
    <saga-genesis></saga-genesis>
  </sillonious-brand>
`)
