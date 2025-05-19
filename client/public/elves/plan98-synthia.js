import elf from '@plan98/elf'
const $ = elf('plan98-synthia')

document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (!selectedText || selectedText.length < 2) {
    //$.teach({ selectedText: null })
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  $.teach({ selectedText, rect: { ...rect } })
});

document.addEventListener('pointerdown', function(event) {
  const { rect, activated, selectedText } = $.learn()
  if(!activated && !selectedText) return
  if (!event.target.closest('plan98-synthia .synthia, plan98-synthia .result')) {
    $.teach({ selectedText: null, activated: false })
  }
});

const context = document.createElement('plan98-synthia')
document.body.appendChild(context)

$.draw(() => {
  const { rect, activated, selectedText } = $.learn()
  if(self.self === self.top) {
    return selectedText ? `
      <div class="activator-bar">
        <button class="synthia">
          <plan98-icon></plan98-icon>
        </button>
      </div>
      ${activated ? `
        <div class="result activated">
          <div class="result-card">
            <div class="search-bar">
              <input class="search-input" value="${selectedText}" />
              <button class="standard-button">
                <sl-icon name="search"></sl-icon>
              </button>
            </div>
            <div class="ok">
              manage clipboard
              save to journal
              share to bluesky
            </div>

            <div class="oooo">
              Bounce to search
            </div>

            <div class="ahh">
              Bounce to models
            </div>

            <div class="ahha">
              matching applications
            </div>

            <div class="ED">
              matching files
            </div>

            <div class="av -banner" style="cover">
              <div>
                <div class="av-title">Final Boss</div>
                <div class="av-description">The end has come and it is time to face the music</div>
              </div>
              <div class="av-cta">
                <button data-href="/app/paper-pocket?rom=final-boss">
                  Play
                </button>
              </div>
            </div>
          </div>
        </div>
      ` : `
        <div class="result">
          <div class="result-card">
            <div class="search-bar">
              <input class="search-input" value="${selectedText}" />
              <button>
                <sl-icon name="search"></sl-icon>
              </button>
            </div>
          </div>
        </div>
      `}
    `: '<div></div>'
  }
}, {
  afterUpdate(target) {
    { // recover icons from the virtual dom
      recoverElves(target, 'sl-icon')
      recoverElves(target, 'plan98-icon')
    }
  }
})

$.when('click', '.synthia', (event) => {
  $.teach({ activated: !$.learn().activated })
})

$.style(`
  & {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 900000;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & .result {
    pointer-events: all;
    position: relative;
    z-index: 900000;
    transform: translateY(100%);
    transition: transform 100ms ease-in-out;
    padding: .5rem .5rem 0;
    overflow: hidden;
  }

  & .result-card {
    box-shadow: var(--shadow);
    background: rgba(255,255,255,.65);
    backdrop-filter: blur(3px);
    height: 100%;
    border-radius: .5rem .5rem 0 0;
    position: relative;
    overflow: auto;
  }

  & .result.activated {
    transform: translateY(0);
  }

  & .activator-bar {
    position: relative;
    z-index: 900000;
    display: flex;
    place-content: center;
    pointer-events: all;
    background: linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,0));
  }

  & .synthia {
    border: none;
    padding: 0;
    background: transparent;
  }

  & .search-bar {
    display: grid;
    grid-template-columns: 1fr auto;
    padding: .5rem;
    background: white;
    gap: .5rem;
    position: sticky;
    top: 0;
    box-shadow: 0 1px 1px 1px rgba(0,0,0,.15);
  }

  & .search-input {
    width: 100%;
    padding: .25rem .5rem;
    border-radius: .5rem;
    border: 1px solid rgba(0,0,0,.15);
  }
`)

function recoverElves(target, tag) {
  [...target.querySelectorAll(tag)].map(node => {
    const nodeParent = node.parentNode
    const newNode = document.createElement(tag)
    for (const attr of node.attributes) {
      newNode.setAttribute(attr.name, attr.value)
    }
    node.remove()
    nodeParent.appendChild(newNode)
  })
}

