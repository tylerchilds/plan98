import module from '@silly/tag'

const $ = module('dadmin-dashboard', { activeTabIndex: 0 })

const language = "en-us"

$.draw((target) => {
  const { activeTabIndex } = $.learn()

  const modes = [
    {
      icon: '<span>A</span>',
      label: 'Home',
      content: `
        <img src="/public/cdn/fantasysports.social/logo.png" alt="Shawn Childs CC's Desperados, a man throwing a football to a baseball player with a glove" style="position: absolute; bottom: 1rem; left: 1rem; max-width: 500px;" />
      `
    },
    {
      icon: '<span>B</span>',
      label: 'Football Defensive Logs',
      content: `
        <football-defensivelogs></football-defensivelogs>
      `
    },
    {
      icon: '<span>C</span>',
      label: 'Football Catches',
      content: `
        <football-catches></football-catches>
      `
    },
    {
      icon: '<span>D</span>',
      label: 'Baseball Players',
      content: `
        <baseball-players></baseball-players>
      `
    },
    {
      icon: '<span>E</span>',
      label: 'NFL Teams Defensive Stats',
      content: `
        <football-defensivestats data-year="2023"></football-defensivestats>
      `
    },
    {
      icon: '<span>F</span>',
      label: 'NFL Teams Offensive Stats',
      content: `
        <football-offensivestats data-year="2023"></football-defensivestats>
      `
    },
    {
      icon: '<span>!</span>',
      label: 'Map',
      content: `
        <site-map></site-map>
      `
    },
    {
      icon: '<span>^</span>',
      label: 'Hyper Browser',
      content: `<hyper-browser></hyper-browser>`
    },
    {
      icon: '<span>*</span>',
      label: 'Devices',
      content: `<plan98-devices></plan98-devices>`
    },
    {
      icon: '<span>$</span>',
      label: 'Pay to Win',
      content: `<iframe src="/sagas/thelanding.page/${language}/000-000.saga?world=thelanding.page" style="background: white;"></iframe>`
    },
    {
      icon: '<span>=</span>',
      label: 'Chat',
      content: `<story-chat></story-chat>`
    },
    {
      icon: '<span>+</span>',
      label: 'Chat',
      content: `<infinite-canvas></infinite-canvas>`
    },
  ]

  target.innerHTML = `
    <data-tooltip class="example" aria-live="assertive">
      <div class="example-view">
        ${modes[activeTabIndex].content}
      </div>
      <div class="example-tab-list">
        ${modes.map((tab, index) => {
          return `
            <button data-tooltip="${tab.label}" data-index="${index}" class="example-tab ${index === activeTabIndex ? '-active': ''}">
              ${tab.icon}
            </button>
          `
        }).join('')}
      </div>
    </data-tooltip>
  `
})

$.when('click', '.example-tab', (event) => {
  const { index } = event.target.dataset
  $.teach({ activeTabIndex: parseInt(index, 10) })
})

$.style(`
  & {
    display: block;
    height: 100%;
    background: rgba(0,0,0,.85);
    color: white;
    overflow: hidden;
  }

  & .example {
    display: grid;
    grid-template-rows: 1fr 5rem;
  }

  & .example-tab-list {
    display: flex;
    gap: .5rem;
    padding: .5rem .5rem 1rem;
    overflow-x: auto;
    overflow-y: hidden;
  }
  & .example-tab {
    padding: 0;
    display: block;
    border: 0;
    border-radius: 1rem;
    aspect-ratio: 1;
    width: 4rem;
    color: white;
    background: rgba(0,0,0,.85);
    transition: background 200ms ease-in-out;
    flex: none;
  }

  & .example-tab.-active,
  & .example-tab:hover,
  & .example-tab:focus {
    background: dodgerblue;
  }

  & .example-view {
    overflow: hidden;
    position: relative;
    padding: 2rem 0 0;
  }

  & data-tooltip,
  & data-tooltip .example {
    height: 100%;
  }
  & plan98-filesystem,
  & code-module {
    color: black;
  }
`)
