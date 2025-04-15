import elf from '@silly/elf'
import { systemMenu, getTheme } from './paper-pocket.js'

const models = {
  'watch': 'Watch',
  'phone': 'Phone',
  'tablet': 'Tablet',
  'tv': 'TV',
}

function renderModels(model) {
  const keys = Object.keys(models)
  return keys.map((key) => `
    <option value="${key}" ${model === key?'selected':''}>${models[key]}</option>
  `).join('')
}


const $ = elf('mobile-device', {
  model: 'phone',
  studio: false,
  home: false,
  src: '/app/file-surf'
})

$.when('change', 'select', (event) => {
  const model = event.target.value
  $.teach({ model })
})

function mount(target) {
  if(target.mounted) return
  target.mounted = true

  const model = target.getAttribute('model')
  if(model) {
    $.teach({ model })
  }

  const studio = target.getAttribute('studio')
  if(studio === "true") {
    $.teach({ studio })
  }

  const src = target.getAttribute('src')
  if(src) {
    $.teach({ src })
  }

}

$.draw((target) => {
  mount(target)
  const { home, studio, model, src } = $.learn()

  return studio ? `
    <div class="studio">
      <div class="header">
        <div class="model-selector">
          <div class="model-view">
            ${models[model] || 'No model'}
          </div>
          <select>
            <option disabled selected>Select a model</option>
            ${renderModels(model)}
          </select>
        </div>
      </div>
      <div class="body">
        <div class="space ${model}">
          <div class="device">
            <div class="screen">
              <div class="home-menu">${home?homeMenu():''}</div>
              <iframe src="${src}"></iframe>
            </div>
            <div class="chin">
              <button class="home"></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ` : `
    <div class="device">
      <div class="screen">
        <div class="home-menu">${home?homeMenu():''}</div>
        <iframe src="${src}"></iframe>
      </div>
      <div class="chin">
        <button class="home"></button>
      </div>
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

function homeMenu() {
  const { systemPane } = $.learn()

  if(systemPane) {
    return renderApplications(systemPane)
  } else {
    return renderGroups(systemPane)
  }
}

function renderGroups(systemPane) {
  const groups = Object.keys(systemMenu).map(key => ({ key, ...systemMenu[key] }))

  return `
    <groups class="groups-list">
      ${groups.map((x) => {
        return `
          <div>
            <button class="pane-select ${systemPane === x.key?'active':''}" data-pane="${x.key}">
              ${systemMenu[x.key].label}
            </button>
          </div>
        `
      }).join('')}

      <button class="to-settings">
        Settings
      </button>
    </groups>
  `
}

function renderApplications(pane) {
  return `
    <apps class="application-list">
      <div>
        <button class="to-groups">
          Back
        </button>
      </div>

      ${systemMenu[pane].list.filter(x => x.url).map(({ label, url }) => {
        return `
          <div>
            <button class="app-select" data-url="${url}" data-title="${label}">
              <div class="iconography">
              </div>
              <span class="app-label">
                ${label}
              </span>
            </button>
          </div>
        `
      }).join('')}
    </apps>
  `
}

$.when('click', '.app-select', selectApp)
$.when('click', '.pane-select', selectPane)
$.when('click', '.to-groups', back)

function back() {
  $.teach({ systemPane: null })
}

function selectPane(event) {
  const { pane } = event.target.dataset
  $.teach({ systemPane: pane })
}

function selectApp(event) {
  const { url } = event.target.dataset

  $.teach({ src: url, home: false })
}

$.when('click', '.home', (event) => {
  $.teach({ home: !$.learn().home })
})

$.style(`
  & {
    display: block;
    height: 100%;
  }

  & .screen {
    position: relative;
    overflow: hidden;
  }

  & .home-menu:empty {
    display: none;
  }

  & .home-menu {
    position: absolute;
    inset: 0;
    background: black;
    overflow: auto;
  }

  & .studio {
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
    position: relative;
    background:
      linear-gradient(-35deg, rgba(0,0,0,.65), rgba(0,0,0,.85)),
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      var(--root-theme, mediumseagreen);
    height: 100%;
  }

  & .space {
    margin: auto;
  }

  & .header {
    padding: 2px;
  }
  & .body {
    padding: 1rem;
    overflow: auto;
    height: 100%;
    position: relative;
    display: grid;
    place-items: center;
  }

  & .device {
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-sizing: content-box;
    margin: auto;
    display: grid;
    grid-template-rows: 1fr auto;
  }

  & .chin {
    background: black;
    text-align: center;
    padding: .5rem;
  }

  & .home {
    border-radius: 100%;
    padding: .5rem;
    border: none;
    background: linear-gradient(rgba(255,255,255,.5), rgba(0,0,0,.5))var(--root-theme, mediumseagreen);
  }

  & .home::before {
    content: '';
    display: block;
    width: 1rem;
    height: 1rem;
    border: 3px solid var(--root-theme, mediumseagreen);
  }

  & .watch.space {
    width: calc(40mm + 4rem);
  }

  & .tablet.space {
    width: calc(1024px + 4rem);
  }

  & .phone.space {
    width: calc(320px + 4rem);
  }

  & .tv.space {
    width: calc(1920px + 4rem);
  }

  & .space .device {
    border-radius: 5px;
    border: 5px solid rgba(0,0,0,.65);
  }


  & .watch .device {
    width: 40mm;
    height: 42mm;
  }

  & .tablet .device {
    width: 1024px;
    height: 768px;
  }

  & .phone .device {
    width: 320px;
    height: 480px;
  }

  & .tv .device {
    width: 1920px;
    height: 1080px;
  }

  & .model-selector {
    position: relative;
    display: inline-block;
    background: black;
    border: 1px solid rgba(255,255,255,.65);
    color: rgba(255,255,255,.85);
    border-radius: 3px;
    position: sticky;
    top: 0;
    left: 0;
  }

  & .model-view {
    position: absolute;
    inset: 0;
    pointer-events: none;
    padding: .5rem;
  }

  & select {
    opacity: 0;
    padding: .5rem;
  }

  & select option {
  }

  & .to-settings,
  & .to-groups,
  & .pane-select,
  & .app-select {
    font-weight: 100;
    color: rgba(255,255,255,.65);
    font-size: 2rem;
    line-height: 1;
    background: transparent;
    border: none;
    border-radius: none;
    display: inline-block;
    text-align: left;
    padding: .5rem 0;
  }

  & .to-settings:hover,
  & .to-settings:focus,
  & .to-groups:hover,
  & .to-groups:focus,
  & .pane-select:hover,
  & .app-select:hover,
  & .pane-select:focus,
  & .app-select:focus {
    color: rgba(255,255,255,1);
  }

  & .groups-list,
  & .application-list {
    display: flex;
    flex-direction: column;
    padding: .5rem;
  }

  & .to-settings,
  & .to-groups {
    font-weight: bold;
    background: linear-gradient(155deg, rgba(255,255,255,0), rgba(255,255,255,.15)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 1.5rem;
  }

  & .to-settings:hover,
  & .to-settings:focus,
  & .to-groups:hover,
  & .to-groups:focus {
    font-weight: bold;
    background: linear-gradient(155deg, rgba(255,255,255,.15), rgba(255,255,255,.35)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 1.5rem;
  }

`)
