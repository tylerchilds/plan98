import elf from '@silly/elf'
import $paperPocket, { afterUpdateTheme } from './paper-pocket.js'

const $ = elf('e-mail', {
  sidebar: true
})

$.draw(render, {
  beforeUpdate(target) {
    { // convert a query string to new post
      const q = target.getAttribute('q')
      if(!target.initialized) {
        target.initialized = true

        if(q) {
          const message = decodeURIComponent(q)
          $.teach({ messageText: message })
        }
      }
    }
  },
  afterUpdate(target) {
    {
      afterUpdateTheme($paperPocket, target)
    }

    {
      const { emailId='none' } = $.learn()
      if(emailId !== target.emailId) {
        target.emailId = emailId
        const q = target.getAttribute('q')
        const preview = target.querySelector('.preview')
        if(emailId === 'none') {
          preview.innerHTML = `
            <email-new ${q?`q="${q}"`:''}></email-new>
          `
        } else {
          preview.innerHTML = `
            <div style="display: flex">
              <button data-draft>
                <span><sl-icon name="pencil"></sl-icon></span>
                New Draft
              </button>
            </div>
            <email-view id="${emailId}"></email-view>
          `
        }
      }
    }

    {
      const { sidebar } = $.learn()
      const panes = target.querySelector('.panes')

      if(panes && sidebar !== target.lastSidebar) {
        if(sidebar) {
          panes.classList.add('show-sidebar')
        } else {
          panes.classList.remove('show-sidebar')
        }
      }
    }
  }
})

function render(target) {
  if(target.innerHTML) return
  const { sidebar } = $.learn()
  return `
    <div class="hero-bar">
      <button class="sidebar-toggle">
        <sl-icon name="layout-sidebar-inset"></sl-icon>
      </button>
    </div>
    <div class="panes ${sidebar?'show-sidebar':''} ">
      <div class="sidebar">
        <div data-resize-sidebar></div>
        <div class="list">
          <div class="list-wrapper">
            <email-all target="email-pain"></email-all>
          </div>
        </div>
      </div>
      <div class="content-area">
        <div class="invis-area"></div>
        <div class="preview"></div>
      </div>
    </div>
  `
}

$.when('click', '[data-draft]', (event) => {
  $.teach({ emailId: 'none' })
})

$.when('picked', 'email-all', (event) => {
  const { emailId } = event.detail
  $.teach({ emailId, sidebar: false })
})

$.style(`
  & {
    height: 100%;
    display: grid;
    position: relative;
    overflow: hidden;
    grid-template-rows: auto 1fr;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 10000;
    background: var(--root-theme, transparent);
    mix-blend-mode: soft-light;
    opacity: .5;
  }

  & .hero-bar {
    padding: .5rem;
    color: rgba(255,255,255,.85);
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: rgba(0,0,0,.85);
  }

  & [data-src] {
    padding: 0;
    line-height: 1;
    font-size: 1rem;
    line-height: 2rem;
    display: grid;
    grid-template-columns: auto 1fr;
    color: lemonchiffon;
    gap: .5rem;
    margin: 0;
    transition: background 100ms;
    border: none;
    background: transparent;
    text-align: left;
    font-weight: bold;
  }

  & [data-draft] {
    background: dodgerblue;
    background: linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.65)), var(--root-theme, dodgerblue);
    color: white;
    font-weight: bold;
    border: none;
    padding: 0 .5rem;
    line-height: 2rem;
    font-size: 1rem;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: .5rem;
    margin: 0 0 0 auto;
    transition: background 100ms;
  }

  & [data-draft]:hover,
  & [data-draft]:focus {
    background: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85)), var(--root-theme, dodgerblue);
  }

  & .sidebar-toggle {
    padding: 0;
    border-radius: 100%;
    display: grid;
    place-items: center;
    background: white;
    width: 34px;
    height: 34px;
    color: rgba(255,255,255,.65);
    border: 1px solid rgba(255,255,255,.35);
    background: black;
    z-index: 20;
    font-size: 16px;
  }

  & .panes {
    height: 100%;
    display: grid;
    overflow: hidden;
    position: relative;
  }

  & .sidebar {
    display: none;
  }
  & .panes.show-sidebar .sidebar {
    position; absolute;
    left: 0;
    display: block;
    width: clamp(240px, var(--sidebar-width, 320px), 100%);
    max-width: 100vw;
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 25;
    display: grid;
    grid-template-rows: 1fr auto;
  }

  & .list {
    position: relative;
    height: 100%;
  }

  & .invis-area {
    display: none;
  }

  & .show-sidebar .invis-area {
    position: absolute;
    inset: 0;
    display: block;
    z-index: 20;
  }

  @media (min-width: 48rem) {
    & {
    grid-template-rows: 1fr;
    }
    & .hero-bar {
      display: none;
    }

    & .panes {
      grid-template-columns: clamp(240px, var(--sidebar-width, 320px), 100%) 1fr;
    }

    & .sidebar {
      position: relative !important;
      display: block;
    }

    & .show-sidebar .invis-area {
      display: none;
    }
  }


  & .list-wrapper {
    position: absolute;
    inset: 0;
  }

  & .content-area {
    position: relative;
    overflow: hidden;
    background: white;
  }

  & .preview {
    height: 100%;
    overflow: auto;
  }

  & [data-resize-sidebar] {
		user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    position: absolute;
    top: 0;
    bottom: 0;
    left: clamp(240px, var(--sidebar-width, 320px), 100%);
    transform: translateX(-10px);
    width: 10px;
    background: rgba(0,0,0,.05);
    z-index: 10;
    cursor: col-resize;
  }
`)

$.when('click', '.invis-area', () => {
  $.teach({ sidebar: false })
})


$.when('click', '.sidebar-toggle', () => {
  $.teach({ sidebar: !$.learn().sidebar })
})

$.when('pointerdown', '[data-resize-sidebar]', event => {
  document.addEventListener("pointermove", resizeSidebar, false);
  document.addEventListener("pointerup", () => {
    document.removeEventListener("pointermove", resizeSidebar, false);
  }, false);
})

function resizeSidebar(event) {
  let width
  if (event.touches && event.touches[0] && typeof event.touches[0]["force"] !== "undefined") {
    width = event.touches[0].clientX
  } else {
    width = event.clientX
  }

  const size = `${width}px`;
  const root = event.target.closest($.link)
  root.style.setProperty("--sidebar-width", size);
}

