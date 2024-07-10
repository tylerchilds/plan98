import module from '@silly/tag'

const PANEL_WELCOME = 'welcome'
const PANEL_LIST = 'list'
const PANEL_CREATE = 'create'
const PANEL_IMMERSIVE = 'immersive'

const cards = {
  [PANEL_WELCOME]: {
    tag: 'multiplayer-welcome'
  },
  [PANEL_LIST]: {
    tag: 'multiplayer-list'
  },
  [PANEL_CREATE]: {
    tag: 'multiplayer-create'
  },
  [PANEL_IMMERSIVE]: {
    tag: 'multiplayer-immersive'
  }
}

const $ = module('progress-carousel', {
  activePanel: PANEL_WELCOME,
  nextPanel: PANEL_WELCOME,
  instances: {}
})

$.draw((target) => {
  const { instances } = $.learn()
  mount(target)
  if(!instances[target.id]) return
  const { nextPanel } = instances[target.id]

  const { tag } = (cards[nextPanel] || cards[PANEL_WELCOME])
  return `
    <div class="theater">
      <${tag}></${tag}>
    </div>
  `
})

function mount(target) {
  if(target.mounted) return
  target.mounted = true
  const { activePanel, nextPanel } = $.learn() || {}
  schedule(() => {
    const id = target.id
    updateInstance(id, { id, activePanel, nextPanel })
  })
}

$.style(`
  & {
    display: block;
    background: rgba(0,0,0,.85);
    height: 100vh;
    place-content: center;
    position: relative;
  }
  & .theater {
    position: absolute;
    aspect-ratio: 16 / 9;
    max-height: 100vh;
    margin: auto;
    inset: 0;
    width: auto;
    max-width: 100%;
  }
`)

function schedule(x, delay=1) { setTimeout(x, delay) }

function instance(target) {
  const root = target.closest($.link)
  return $.learn().instances[root.id]
}

setInterval(() => {
  const { tick, instances } = $.learn()

  $.teach({ tick: tick+1 })

  Object.keys(instances).map(id => {
    const { activePanel } = instances[id]
    const keys = Object.keys(cards).filter(key => {
      return key !== activePanel
    })
    const nextPanel = keys[Math.floor(Math.random()*keys.length)]
    updateInstance(id, { nextPanel })
  })

}, 5000)

function updateInstance(id, payload) {
  $.teach({...payload}, (s, p) => {
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          ...p
        }
      }
    }
  })
}


