import module from '@silly/tag'
import { render } from '@sillonious/saga'

const raw = '/public'
const currentWorkingDirectory = '/sagas/'

const $ = module('parental-controls', {
  content: '<plan98-welcome></plan98-welcome>',
  activeDialect: '/en-us/',
  activeWorld: 'sillyz.computer'
})

const lolol = [
  {
    label: 'Office',
    lol: [
      {
        label: 'Notes',
        laugh: 'notes.saga'
      },
      {
        label: 'Boards',
        laugh: 'boards.saga'
      },
    ]
  },
  {
    label: 'Sports',
    lol: [
      {
        label: 'Football',
        laugh: 'football.saga'
      },
      {
        label: 'Baseball',
        laugh: 'baseball.saga'
      },
    ]
  },
  {
    label: 'Toys',
    lol: [
      {
        label: 'Minesweeper',
        laugh: 'mine-sweeper.saga'
      },
      {
        label: 'Paint App',
        laugh: 'paint.saga'
      },
      {
        label: 'F-DOS',
        laugh: 'fdos.saga'
      },
    ]
  },
  {
    label: 'Chats',
    lol: [
      {
        label: 'General',
        laugh: 'general.saga'
      },
      {
        label: 'Random',
        laugh: 'random.saga'
      },
    ]
  },
  {
    label: 'Insights',
    lol: [
      {
        label: 'Inbound',
        laugh: 'inbound.saga'
      },
      {
        label: 'Outbound',
        laugh: 'outbound.saga'
      },
    ]
  },
  {
    label: 'Hard Mode',
    lol: [
      {
        label: 'Code',
        laugh: 'code.saga'
      },
    ]
  },
]

$.draw((target) => {
  const { content } = $.learn()
  target.beforeUpdate = scrollSave
  target.afterUpdate = scrollSidebar
  if(!content) {
    target.innerHTML = ''
  }

  return `
    <data-tooltip class="control" aria-live="assertive">
      <div class="control-tab-list">
        ${lolol.map((x, index) => {
          return `
            <div class="heading-label">${x.label}</div>
            ${lol(x.lol)}
          `
        }).join('')}
      </div>
      <div class="control-view">
        ${content}
      </div>
    </data-tooltip>
  `
})

function scrollSave() {
  const list = this.querySelector('.control-tab-list')
  this.dataset.top = list.scrollTop
}

function scrollSidebar() {
  const list = this.querySelector('.control-tab-list')
  list.scrollTop = this.dataset.top
}

function lol(laughs) {
  return laughs.map((y, index) => `
    <button class="control-tab" data-laugh="${y.laugh}">
      ${y.label}
    </button>
  `).join('')
}

$.when('click', '[data-laugh]', async (event) => {
  const { laugh } = event.target.dataset
  outLoud(laugh)
})

function outLoud(laugh) {
  const { activeDialect, activeWorld } = $.learn()
  const key = currentWorkingDirectory + activeWorld + activeDialect + laugh
  $.teach({ content: null })

  fetch(raw+key)
    .then(async response => {
      if(response.status === 404) {
        $.teach({ content: '404' })
        return
      }
      const saga = await response.text()
      const content = render(saga)

      $.teach({ content })
    })
    .catch(e => {

      $.teach({ content: `Error... ${e}` })
      console.error(e)
    })
}

$.style(`
  & {
    display: block;
    height: 100%;
    background: linear-gradient(165deg, rgba(255,255,255,.85) 60%, dodgerblue);
    color: white;
    overflow: hidden;
  }

  & .control {
    display: grid;
    grid-template-columns: 320px auto;
  }

  & .control-tab-list {
    gap: .5rem;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    padding: 1rem;
    overflow: auto;
    background: rgba(255,255,255,.65);
  }
  & .control-tab {
    padding: 0;
    display: block;
    border: 0;
    border-radius: 1rem;
    line-height: 1;
    width: 4rem;
    color: white;
    display: block;
    width: 100%;
    text-align: left;
    padding: 1rem;
    color: dodgerblue;
    background: rgba(255,255,255,.85);
    transition: background 200ms ease-in-out;
    flex: none;
  }

  & .control-tab.-active,
  & .control-tab:hover,
  & .control-tab:focus {
    background: dodgerblue;
    color: white;
  }

  & .control-view {
    overflow: auto;
    position: relative;
  }

  & data-tooltip,
  & xml-html,
  & data-tooltip .control {
    height: 100%;
  }
  & plan98-filesystem,
  & code-module {
    color: black;
  }

  & .heading-label {
    margin-top: 2rem;
    color: rgba(0,0,0,.5);
    text-align: right;
    font-weight: 600;
  }
`)
