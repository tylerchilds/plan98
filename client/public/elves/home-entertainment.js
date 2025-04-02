import elf from '@silly/elf'
import { systemMenu, getTheme } from './paper-pocket.js'

import 'gun'
import 'gun/open'
const gun = window.Gun(['https://gun.1998.social/gun']);

const emptyConsole = {
  systemPane: Object.keys(systemMenu)[0],
}

const $ = elf('home-entertainment')

function mount(target) {
  if(target.mounted) return
  target.mounted = true

  if(target.getAttribute('controller')) {
    $.teach({
      controller: target.getAttribute('controller') === 'true'
    })
  }

  const record = gun.get($.link).get(target.id)

  record.once((data) => {
    if (!data) {
      record.put(emptyConsole);
    }
  });

  record.open((data) => {
    $.teach({[target.id]: data})
  });

  $.teach({ booting: false })
}

function get(id) {
  return $.learn()[id] || emptyConsole
}

function defaultMerge(node, data, key) {
  node.get(key).put(data[key])
}

function set(id, data, merge = defaultMerge) {
  const record = gun.get($.link).get(id)
  Object
    .keys(data)
    .forEach(key => {
      merge(record, data, key)
    })
}

function renderGroups(systemPane) {
  const groups = Object.keys(systemMenu).map(key => ({ key, ...systemMenu[key] }))

  return groups.map((x) => {
    return `
      <button class="pane-select ${systemPane === x.key?'active':''}" data-pane="${x.key}">
        ${systemMenu[x.key].label}
      </button>
    `
  }).join('')
}

function renderApplications(systemPane) {
  return systemPane ? `
    <div class="application-list">
      ${systemMenu[systemPane].list.filter(x => x.url).map(({ label, url }) => {
        return `
          <button class="app-select" data-url="${url}">
            <div class="iconography">
            </div>
            <span class="app-label">
              ${label}
            </span>
          </button>
        `
      }).join('')}
    </div>
  ` : `Select pane...`
}

export function renderSystemMenu(systemPane) {
  return `
    <div class="system">
      <div class="groups">
        ${renderGroups(systemPane)}
      </div>
      <div class="applications">
        ${renderApplications(systemPane)}
      </div>
    </div>
  `
}

function selectPane(event) {
  const { pane } = event.target.dataset
  const root = event.target.closest($.link)
  set(root.id, { systemPane: pane })
}

function selectApp(event) {
  const { localMode } = $.learn()
  const { url } = event.target.dataset
  const root = event.target.closest($.link)

  if(localMode) {
    $.teach({ controller: false })
    sessionStorage.setItem('lastState', JSON.stringify({ clearSrc: true }));
    self.history.pushState({ clearSrc: true }, "");
  }

  set(root.id, { src: url })
}

addEventListener("popstate", async (event) => {
  if(event.state) {
    const { clearSrc } = event.state
    if(clearSrc) {
      $.teach({ src: null, controller: true })
    }
  } else {
    const { clearSrc } = JSON.parse(sessionStorage.getItem('lastState') || '{}');
    if(clearSrc) {
      $.teach({ src: null, controller: true })
    }
  }
});


$.when('click', '[data-controller]', () => {
  $.teach({ controller: true, localMode: true })
})
$.when('click', '.pane-select', selectPane)
$.when('click', '.app-select', selectApp)

$.draw((target) => {
  mount(target)
  const { controller, booting } = $.learn()
  const { src, systemPane } = get(target.id)

  if(controller) {
    return renderSystemMenu(systemPane)
  }

  if(booting) {
    return `
      <boot>
        <flying-disk></flying-disk>
      </boot>
    `
  }

  if(src) {
    if(target.src !== src) {
      target.src = src
      target.innerHTML = `
        <iframe src="${src}" title="${src}"></iframe>
      `
    }
    return
  }

  target.innerHTML = `
    <div class="zero-state">
      <span>
        Scan to surf from another device
      </span>
      <qr-code no-link="true" data-fg="saddlebrown" data-bg="lemonchiffon" src="${plan98.env.PLAN98_PEER?`http://${plan98.env.PLAN98_PEER}`:window.location.origin}/app/home-entertainment?id=${target.id}&controller=true" ></qr-code>
      <span>
        Otherwise
        <button data-controller>Click to Control</button>
      </span>
    </div>
  `
}, {
  afterUpdate(target) {
    {
      const theme = getTheme()
      if(target.theme !== theme) {
        target.theme = theme
        document.body.style.setProperty('--root-theme', theme)
      }
    }
  }
})

$.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
  }

  & boot {
    height: 100%;
    overflow: hidden;
  }

  & flying-disk {
    height: 100%;
    overflow: hidden;
    display: grid;
    place-items: center;
  }

  & .track {
    margin: auto;
  }

  & .zero-state {
    height: 100%;
    background: lemonchiffon;
    display: flex;
    flex-direction: column;
    place-content: center;
    gap: 2rem;
    padding: 40px;
    text-align: center;
  }

  & qr-code {
    margin: 0 auto;
    width: 45vh;
    max-width: 100%;
  }

  & .system {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & .groups {
    display: flex;
    overflow: auto;
    background: linear-gradient(rgba(0,0,0,.05), rgba(0,0,0,.05)), var(--root-theme, mediumseagreen);
    gap: .5rem;
    padding: .5rem;
    max-height: 100%;
  }

  & .pane-select {
    background: rgba(0,0,0,.25);
    color: rgba(0,0,0,.85);
    border: 0;
    padding: .5rem 1rem;
    text-align: left;
    border-radius: 1rem;
  }

  & .pane-select.active {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
  }


  & .applications {
    overflow: auto;
  }

  & .application-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
    gap: 8px;
  }

  & .iconography {
    background: lemonchiffon;
    aspect-ratio: 1;
    transform: rotateZ(15deg);
    margin: 16px;
  }

  & .app-select {
    border: none;
    background: transparent;
    display: grid;
    grid-template-rows: 1fr auto;
    border-radius: 0;
    padding: .5rem;
  }

  & .app-label {
    background: rgba(0,0,0,.25);
    color: rgba(0,0,0,.85);
    border: 0;
    padding: .5rem 1rem;
    text-align: center;
    border-radius: 1rem;
    position: relative;
    z-index: 2;
    max-height: 3.5rem;
    overflow: hidden;
  }

  & .app-label {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
  }




  @media (min-width: 36rem) {
    & .system {
      grid-template-rows: auto;
      grid-template-columns: auto 1fr;
    }

    & .groups {
      flex-direction: column;
    }


  }

  & .pane-select {
    
  }


`)
