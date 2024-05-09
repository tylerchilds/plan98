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
  const { id } = target
  const { instances } = $.learn()
  mount(target)
  if(!instances[target.id]) return
  const { activePanel, nextPanel } = instances[target.id]

  const { tag } = (cards[nextPanel] || cards[PANEL_WELCOME])
  const fadeOut = activePanel !== nextPanel
  console.log(tag)
  return `
    <div class="canvas">
      <transition class="${fadeOut ? 'out' : ''}" data-id="${id}">
        <${tag}>
        </${tag}>
      </transition>
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

$.when('animationend', 'transition', function transition({target}) {
  const { id, activePanel, nextPanel, backPanel } = instance(target)
  const current = nextPanel !== activePanel ? nextPanel : activePanel
  const previous = activePanel !== backPanel ? backPanel : activePanel

  if(current !== activePanel) {
    target.innerHTML = ''
  }
  updateInstance(id, { id, activePanel: current, backPanel: previous })
})

$.style(`
  & {
    display: block;
    background: rgba(0,0,0,.85);
    height: 100vh;
  }
  & .canvas {
    aspect-ratio: 16 / 9;
    max-height: 100vh;
    margin: 0 auto;
    width: auto;
}
  }
  & transition {
    animation: &-fade-in ease-in-out 200ms;
    display: grid;
    height: 100%;
    place-items: end;
    text-align: right;
    width: 100%;
    pointer-events: none;
  }


  & transition > * {
    width: 100%;
    height: 100%;
    pointer-events: all;
  }

  & transition.out {
    animation: &-fade-out ease-in-out 1ms;
  }

  @keyframes &-fade-in {
    0% {
      opacity: .5;
      filter: blur(10px);
    }
    100% {
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes &-fade-out {
    0% {
      opacity: 1;
      filter: blur(0px);
    }
    100% {
      opacity: .5;
      filter: blur(10px);
    }
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


