import module from '@silly/tag'

const $ = module('integrated-development', { activeTabIndex: 0 })

const language = "en-us"

$.draw((target) => {
  const { activeTabIndex } = $.learn()
  const quest = target.getAttribute('src')
  const entries = performance.getEntriesByType('resource');

  const nautiloids = entries.map((entry) => {
    const local = entry.name.includes(window.location.origin)
    return local ? entry.name.split(window.location.origin)[1] : entry.name;
  });

  const modes = [
    {
      icon: '<span>A</span>',
      label: 'Editor',
      content: `
        <media-plexer src="${quest}"></media-plexer>
      `
    },
    {
      icon: '<span>B</span>',
      label: 'Tracer',
      content: `
        <code-module src="${quest}" stack="${quest},${[...new Set(nautiloids)]}"></code-module>
      `
    },
    {
      icon: '<span>C</span>',
      label: 'System',
      content: `
        <plan98-filesystem data-cwc="ls/plan98"></plan98-filesystem>
      `
    },
    {
      icon: '<span>D</span>',
      label: 'CCTV',
      content: `
        <video-feed></video-feed>
      `
    },
    {
      icon: '<span>E</span>',
      label: 'Dashboard',
      content: `
        <module-dashboard></module-dashboard>
      `
    },
    {
      icon: '<span>F</span>',
      label: 'Signatures',
      content: `
        <iframe src="https://app.radicle.xyz/nodes/seed.radicle.garden/rad:z3PV9XW6J3uursLmrfWtu4XMUApQi" title="argonauts"></iframe>
      `
    },
    {
      icon: '<span>G</span>',
      label: 'Map',
      content: `
        <site-map></site-map>
      `
    },
    {
      icon: '<span>H</span>',
      label: 'Hyper Browser',
      content: `<hyper-browser></hyper-browser>`
    },
    {
      icon: '<span>I</span>',
      label: 'Devices',
      content: `<plan98-devices></plan98-devices>`
    },
    {
      icon: '<span>J</span>',
      label: 'Pay to Win',
      content: `<iframe src="/sagas/thelanding.page/${language}/000-000.saga?world=thelanding.page" style="background: white;"></iframe>`
    },
    {
      icon: '<span>K</span>',
      label: 'Chat',
      content: `<story-chat></story-chat>`
    },
    {
      icon: '<span>L</span>',
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
