import elf from '@silly/elf'
import { systemMenu, getTheme } from './paper-pocket.js'

import 'gun'
import 'gun/open'
const gun = window.Gun(['https://gun.1998.social/gun']);

const emptyConsole = {}

const $ = elf('remote-control')

function mount(target) {
  if(target.mounted) return
  target.mounted = true

  if(target.getAttribute('controller') === 'true') {
    $.teach({
      controller: true,
      localMode: true
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
  $.teach(data, (state, payload) => {
    return {
      ...state,
      [id]: {
        ...state[id],
        ...payload
      }
    }
  })
  const record = gun.get($.link).get(id)
  Object
    .keys(data)
    .forEach(key => {
      merge(record, data, key)
    })
}

function renderGroups(target) {
  const groups = Object.keys(systemMenu).map(key => ({ key, ...systemMenu[key] }))

  const data = get(target.id)

  return groups.map((x) => {
    return `
      <button class="pane-select ${data[x.key]?'hidden':''}" data-pane="${x.key}">
        ${systemMenu[x.key].label}
      </button>
      <div class="applications">
        ${renderApplications(x.key)}
      </div>
    `
  }).join('')
}

function renderApplications(pane) {
  return `
    <div class="application-list">
      ${systemMenu[pane].list.filter(x => x.url).map(({ label, url }) => {
        return `
          <button class="app-select" data-url="${url}">
            <div class="iconography">
              <span class="app-label">
                ${label}
              </span>
            </div>
          </button>
        `
      }).join('')}
    </div>
  `
}

export function renderSystemMenu(target) {
  return `
    <div class="system">
      ${renderGroups(target)}
    </div>
  `
}

function selectPane(event) {
  const { pane } = event.target.dataset
  const root = event.target.closest($.link)
  const data = get(root.id)
  set(root.id, { [pane]: !data[pane] })
}

function selectApp(event) {
  const { localMode } = $.learn()
  const { url } = event.target.dataset
  const root = event.target.closest($.link)

  set(root.id, { src: url })

  if(localMode) {
    $.teach({ controller: false })
    const homeUndo = { controller: true, id: root.id }
    sessionStorage.setItem('lastState', JSON.stringify({ homeUndo }));
    self.history.pushState({ homeUndo }, "");
  }
}

addEventListener("popstate", async (event) => {
  if(event.state) {
    const { homeUndo } = event.state
    if(homeUndo) {
      $.teach(homeUndo)
      set(homeUndo.id, { src: null })
    }
  } else {
    const { homeUndo } = JSON.parse(sessionStorage.getItem('lastState') || '{}');
    if(homeUndo) {
      $.teach(homeUndo)
      set(homeUndo.id, { src: null })
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
  const { src } = get(target.id)

  if(controller) {
    return renderSystemMenu(target)
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
      <qr-code no-link="true" data-fg="rgba(0,0,0,.85)" data-bg="transparent" src="${plan98.env.PLAN98_PEER?`http://${plan98.env.PLAN98_PEER}`:window.location.origin}/app/remote-control?id=${target.id}&controller=true" ></qr-code>
      <span>
        Otherwise
        <button data-controller>Click to Control</button>
      </span>
    </div>
  `
}, {
  beforeUpdate(target) {
    {
      const { src } = get(target.id)

      if(!src && target.src) {
        target.src = null
      }
    }
  },
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
    background:
      linear-gradient(155deg, rgba(255,255,255,.5), rgba(255,255,255,.85), rgba(255,255,255,.25)),
      var(--root-theme, mediumseagreen);
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
    display: flex;
    flex-direction: column;
    max-height: 100%;
    overflow-y: auto;
    background: rgba(0,0,0,.65);
  }

  & .pane-select {
    background:
      linear-gradient(rgba(255,255,255,.25), rgba(255,255,255,.25)),
      linear-gradient(rgba(0,0,0,.15) 1%, rgba(255,255,255,.25) 10%, rgba(255,255,255,0) 50%, rgba(0,0,0,0) 70%, rgba(0,0,0,.15)),
      var(--root-theme, mediumseagreen);
    color: rgba(0,0,0,.65);
    font-size: 1.2rem;
    font-weight: bold;
    border: 0;
    padding: .5rem;
    text-align: left;
  }

  & .pane-select.hidden + .applications {
    display: none;
  }

  & .pane-select.active {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
  }


  & .applications {
    height: auto;
  }

  & .application-list {
    background:
      linear-gradient(155deg, rgba(255,255,255,.75), rgba(255,255,255,.5)),
      var(--root-theme, mediumseagreen);
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
  }

  & .iconography {
    background: lemonchiffon;
    aspect-ratio: 1;
    transform: rotateZ(15deg);
    margin: 16px;
    display: grid;
    place-content: center;
  }

  & .app-select {
    border: none;
    display: inline-block;
    background: transparent;
    border-radius: 0;
    padding: .5rem;
    width: 180px;
    flex: 0 0 auto;
  }

  & .app-label {
    background: rgba(0,0,0,.25);
    transform: rotateZ(-15deg);
    color: rgba(0,0,0,.85);
    white-space: normal;
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
    background: linear-gradient(135deg, rgba(0,0,0,.1), rgba(0,0,0,.5)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 600;
  }

  & [data-controller] {
    border: none;
    background: linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
    color: white;
    padding: .5rem 1rem;
    margin: 0 .5rem;
    border-radius: 1rem;
  }

  & [data-controller]:focus,
  & [data-controller]:hover{
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
  }

`)
