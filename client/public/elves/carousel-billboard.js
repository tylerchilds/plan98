import module from '@silly/tag'

const $ = module('carousel-billboard', {
  activePanel: -1,
  nextPanel: 0,
  instances: {}
})


$.draw((target) => {
  const { id } = target
  const { instances } = $.learn()
  mount(target)
  if(!instances[target.id]) return
  const { activePanel, nextPanel } = instances[target.id]

  const view = (target.views[activePanel] || target.views[0])
  const fadeOut = activePanel !== nextPanel

  return `
    <transition class="${fadeOut ? 'out' : ''}" data-id="${id}">
      ${view}
    </transition>
  `
})

function mount(target) {
  if(target.views) return
  target.views = [...target.querySelectorAll('slot')].map(x => x.innerHTML)
  const { activePanel, nextPanel } = $.learn() || {}
  schedule(() => {
    const id = target.id
    updateInstance(id, { id, activePanel, nextPanel, max: target.views.length })
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
    pointer-events: none;
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
    const { activePanel, max } = instances[id]
    const nextPanel = (activePanel + 1) % max
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


