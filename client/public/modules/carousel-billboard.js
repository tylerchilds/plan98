import module from '@sillonious/module'

const $ = module('carousel-billboard', { activePanel: 0, nextPanel: 0 })

$.draw((target) => {
  const { id } = target
  const views = slots(target)
  const { activePanel, nextPanel } = $.learn()

  const view = (views[activePanel] || views[0]).innerHTML
  const fadeOut = activePanel !== nextPanel

  return `
    <transition class="${fadeOut ? 'out' : ''}" data-id="${id}">
      ${view}
    </transition>
  `
})

function slots(target) {
  const root = target.closest($.link)
  if(root.slots) return root.slots
  root.slots = root.querySelectorAll('slot')
  setInterval(() => increment(root.slots.length), 5000)
  return root.slots
}

function increment(max) {
  const { activePanel } = $.learn()
  const nextPanel = (activePanel + 1) % max
  $.teach({ nextPanel })
}

$.when('animationend', 'transition', function transition({target}) {
  const { activePanel, nextPanel, backPanel } = $.learn()
  const current = nextPanel !== activePanel ? nextPanel : activePanel
  const previous = activePanel !== backPanel ? backPanel : activePanel
  $.teach({ activePanel: current, backPanel: previous })
  target.scrollTop = '0'
  document.activeElement.blur()
})

$.style(`
  & transition {
    animation: &-fade-in ease-in-out 200ms;
    display: grid;
    height: 100%;
    place-items: center;
    width: 100%;
  }


  & transition > * {
    width: 100%;
    height: 100%;
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
