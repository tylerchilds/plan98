import module from '@sillonious/module'

const $ = module('integrated-development', { activeTabIndex: 1 })

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
      icon: '<span>$</span>',
      label: 'Pay to Win',
      content: `<iframe src="https://thelanding.page/sagas/thelanding.page/en-us/billing.saga?world=thelanding.page" style="background: white;"></iframe>`
    },
    {
      icon: '<span>#</span>',
      label: 'Easy',
      content: `
        <media-plexer src="${quest}"></media-plexer>
      `
    },
    {
      icon: '<span>@</span>',
      label: 'Medium',
      content: `
        <code-module src="${quest}" stack="${quest},${[...new Set(nautiloids)]}"></code-module>
      `
    },
    {
      icon: '<span>&lt;</span>',
      label: 'Hard',
      content: `
        <plan98-filesystem data-cwc="ls/plan98"></plan98-filesystem>
      `
    },
    {
      icon: '<span>&gt;</span>',
      label: 'Pretend',
      content: `
        <video-feed></video-feed>
      `
    },
    {
      icon: '<span>&</span>',
      label: 'Dashboard',
      content: `
        <module-dashboard></module-dashboard>
      `
    },
  ]

  target.innerHTML = `
    <data-tooltip class="example" aria-live="assertive">
      <div class="example-tab-list">
        ${modes.map((tab, index) => {
          return `
            <button data-tooltip="${tab.label}" data-index="${index}" class="example-tab ${index === activeTabIndex ? '-active': ''}">
              ${tab.icon}
            </button>
          `
        }).join('')}
      </div>
      <div class="example-view">
        ${modes[activeTabIndex].content}
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
    grid-template-columns: 40px 1fr;
  }

  & .example-tab {
    padding: 0;
    display: block;
    border: 0;
    border-radius: 1rem;
    aspect-ratio: 1;
    width: 100%;
    color: white;
    background: rgba(0,0,0,.85);
  }

  & .example-tab.-active,
  & .example-tab:hover,
  & .example-tab:focus {
    background: dodgerblue;
  }

  & .example-view {
    overflow: auto;
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
