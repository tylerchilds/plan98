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
  model: 'phone'
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
}

$.draw((target) => {
  mount(target)
  const { model } = $.learn()

  const src = target.getAttribute('src') || '/app/file-surf'

  return `
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
          <iframe src="${src}"></iframe>
          <div class="chin">
            <button class="home"></button>
          </div>
        </div>
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

$.style(`
  & {
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
    width: 320px;
    height: 480px;
    border-radius: 5px;
    overflow: hidden;
    border: 5px solid rgba(0,0,0,.65);
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
`)
