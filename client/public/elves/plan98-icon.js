const symbols = `
    <svg>
      <defs>

</defs>
    </svg>
  `;

/* initialize */
const icons = new DOMParser()
  .parseFromString(symbols, "text/xml")
  .querySelectorAll('g[id]');
const ids = [...icons].map(node => node.id);
const selectors = ids.map(id => `icon-${id}`);

const $ = module('plan98-icon')

initializeIconTags();
initializeIcons();

$.draw((target) => {
  const { icon } = target.dataset
  return `
    <svg viewBox="0 0 16 16" class="${$.link}">
      <use xlink:href="#${icon}"></use>
    </svg>
  `
})

function initializeIconTags() {
  ids.map(bind);

  function bind(id) {
    const selector = `icon-${id}`;
    on('render', selector, function renderWrapper(event) {
      render(event, id)
    });
  }

  function render(event, id) {
    event.target.innerHTML = `
    `;
  }
}

function initializeIcons() {
  const iconHTML = `
    <style type="text/css">
      .${$.link} {
        width: 1em;
        height: 1em;
      }

      ${selectors.join(',')} {
        pointer-events: none;
      }
    </style>
    ${symbols}
  `;

  document
    .body
      .insertAdjacentHTML("beforeend", iconHTML);
}
