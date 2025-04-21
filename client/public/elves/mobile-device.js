import elf from '@plan98/elf'
import $paperPocket, { sideEffects, systemMenu, getTheme, afterUpdateTheme } from './paper-pocket.js'

// helper for system settings
console.log(Object.keys(sideEffects).map((key) => {
  return [key, sideEffects[key], $paperPocket.learn().settings[key]]
}))

const defaultPath = {}
const settingsMenuTypeSchema = () => Object.keys(sideEffects)
  .filter(key => {
    return $paperPocket.learn().settings[key]
  }).reduce((path, key) => {
    path[key] = {
      ...sideEffects[key]
    }
    path[key] = sideEffects[key]
    return path
  }, defaultPath)

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
  showHome: true,
  showSettings: false,
  src: '/app/file-surf'
})

$.when('change', '[data-bind]', (event) => {
  const { name, value } = event.target
  if(settingsMenuTypeSchema()[name]) {
    settingsMenuTypeSchema()[name](value)
  }
  $.teach({ [name]: value })
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

  const settings = target.getAttribute('settings')
  if(settings === "true") {
    $.teach({ showSettings: true })
  }



  const src = target.getAttribute('src')
  if(src) {
    $.teach({ src })
  }

}

$.draw((target) => {
  mount(target)
  const { showHome, showSettings, studio, model, src } = $.learn()

  return studio ? `
    <div class="studio">
      <div class="header">
        <div class="selectbox-selector">
          <div class="selectbox-view">
            ${models[model] || 'No model'}
          </div>
          <select data-bind name="model">
            <option disabled selected>Select a model</option>
            ${renderModels(model)}
          </select>
        </div>
      </div>
      <div class="body">
        <div class="space ${model}">
          <div class="device">
            <div class="screen">
              <div class="home-menu">${showHome?homeMenu():''}</div>
              <div class="mobile-settings-menu">${showSettings?settingsMenu():''}</div>
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
        <div class="home-menu">${showHome?homeMenu():''}</div>
        <div class="mobile-settings-menu">${showSettings?settingsMenu():''}</div>
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
      afterUpdateTheme($paperPocket, target)
    }
  }
})

function settingsMenu() {
  const cardOptions = Object
      .keys(settingsMenuTypeSchema()).map(key => {
    const { label, description, options } = $paperPocket.learn().settings[key]
    const value = $paperPocket.learn()[key]
    return `
      <div class="settings-card">
        <div class="selectbox-label">
          ${label}
        </div>
        <div class="selectbox-description">
          ${description}
        </div>
        <div class="selectbox-selector">
          <div class="selectbox-view">
            ${value}
          </div>
          <select data-bind name="${key}">
            <option disabled selected>${label}</option>
            ${options.map(option => {
              return `
                <option ${option === value?'selected':''}>${option}</option>
              `
            }).join('')}
          </select>
        </div>
    </div>
    `
  }).join('')

  return `
    ${cardOptions}
  `
}

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
    <groups class="mobile-groups-list">
      ${groups.map((x) => {
        return `
          <div>
            <button class="mobile-pane-select ${systemPane === x.key?'active':''}" data-pane="${x.key}">
              ${systemMenu[x.key].label}
            </button>
          </div>
        `
      }).join('')}

      <button class="mobile-to-settings">
        Settings
      </button>
    </groups>
  `
}

function renderApplications(pane) {
  return `
    <apps class="mobile-application-list">
      <div>
        <button class="mobile-to-groups">
          Back
        </button>
      </div>

      ${systemMenu[pane].list.filter(x => x.url).map(({ label, url }) => {
        return `
          <div>
            <button class="mobile-app-select" data-url="${url}" data-title="${label}">
              <span class="mobile-app-label">
                ${label}
              </span>
            </button>
          </div>
        `
      }).join('')}
    </apps>
  `
}

$.when('click', '.mobile-app-select', selectApp)
$.when('click', '.mobile-pane-select', selectPane)
$.when('click', '.mobile-to-groups', back)
$.when('click', '.mobile-to-settings', toSettings)

function toSettings() {
  $.teach({ showSettings: true })
}

function back() {
  $.teach({ systemPane: null })
}

function selectPane(event) {
  const { pane } = event.target.dataset
  $.teach({ systemPane: pane })
}

function selectApp(event) {
  const { url } = event.target.dataset

  $.teach({ src: url, showHome: false })
}

$.when('click', '.home', (event) => {
  $.teach({ showHome: !$.learn().showHome, showSettings: false })
})

$.style(`
  & {
    display: block;
    height: 100%;
    width: 100%;
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

  & .mobile-settings-menu:empty {
    display: none;
  }

  & .mobile-settings-menu {
    position: absolute;
    inset: 0;
    background: black;
    overflow: auto;
    display: flex;
    flex-direction: column;
    padding: .5rem;
    gap: .5rem;
    z-index: 200;
  }

  & .settings-card {
    backdrop-filter: blur(10px);
    background:
      linear-gradient(335deg, var(--root-theme, lightgray), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-35deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      linear-gradient(-65deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      var(--root-theme, lightgray);
    padding: .5rem;
    color: rgba(255,255,255,.85);
  }

  & .selectbox-label {
    color: rgba(255,255,255,.65);
    font-weight: bold;
  }

  & .selectbox-description {
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
    background: linear-gradient(rgba(255,255,255,.5), rgba(0,0,0,.5)), var(--root-theme, mediumseagreen);
  }

  & .home::before {
    content: '';
    display: block;
    width: 1rem;
    height: 1rem;
    border: 3px solid var(--root-theme, mediumseagreen);
    background: lemonchiffon;
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

  & .selectbox-selector {
    position: relative;
    display: inline-block;
    color: rgba(255,255,255,.85);

    background:
      linear-gradient(335deg, var(--root-theme, lightgray), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-35deg, rgba(0,0,0,.85), rgba(0,0,0,.5)),
      linear-gradient(-65deg, rgba(0,0,0,.85), rgba(0,0,0,.5)),
      var(--root-theme, lightgray);
    float: right;
    max-width: 100%;
  }

  & .selectbox-view {
    pointer-events: none;
    padding: .5rem;
  }

  & select {
    opacity: 0;
    padding: .5rem;
    position: absolute;
    inset: 0;
  }

  & select:focus {
    position: absolute;
  }

  & select option {
  }

  & .mobile-to-settings,
  & .mobile-to-groups,
  & .mobile-pane-select,
  & .mobile-app-select {
    font-weight: 100;
    background: linear-gradient(135deg, rgba(255,255,255,.05), rgba(255,255,255,.25)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 2rem;
    line-height: 1;
    border: none;
    border-radius: none;
    display: inline-block;
    text-align: left;
    padding: .5rem 0;
  }

  & .mobile-to-settings:hover,
  & .mobile-to-settings:focus,
  & .mobile-to-groups:hover,
  & .mobile-to-groups:focus,
  & .mobile-pane-select:hover,
  & .mobile-app-select:hover,
  & .mobile-pane-select:focus,
  & .mobile-app-select:focus {
    background: transparent;
    -webkit-background-clip: initial;
    -webkit-text-fill-color: initial;
    color: rgba(255,255,255,1);
  }

  & .mobile-groups-list,
  & .mobile-application-list {
    display: flex;
    flex-direction: column;
    padding: .5rem;
  }

  & .mobile-to-settings,
  & .mobile-to-groups {
    font-weight: bold;
    background: linear-gradient(155deg, rgba(255,255,255,0), rgba(255,255,255,.15)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 1.5rem;
  }

  & .mobile-to-settings:hover,
  & .mobile-to-settings:focus,
  & .mobile-to-groups:hover,
  & .mobile-to-groups:focus {
    font-weight: bold;
    background: linear-gradient(155deg, rgba(255,255,255,.15), rgba(255,255,255,.35)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 1.5rem;
  }

`)

$.when('json-rpc', (event) => {
  const { method, params } = event.detail

  if(method === 'pushState') {
    $.teach({ ...params })
  }
})

