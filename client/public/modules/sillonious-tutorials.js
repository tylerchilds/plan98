import module from '@sillonious/module'

const currentWorkingDirectory = '/cdn/'

const $ = module('sillonious-tutorials', {
  activeWorld: plan98.host || 'actuality.network',
  activeDialect: '/en-us/',
})

const examples = [
  {
    name: 'Hello Saga',
    content: 'ARCHITECTURE.saga'
  },
  {
    name: 'Hello Markdown',
    content: 'README.md'
  },
  {
    name: 'Hello Error',
    content: '404.saga'
  },

  {
    name: 'Hello HyperText',
    content: 'index.html'
  },
]

$.draw((target) => {
  const { activeDialect, activeWorld } = $.learn()
  const base = currentWorkingDirectory + activeWorld + activeDialect

  return `
    Experiences:
    <div>
      <a href="/?world=thelanding.page">Browser</a>
    </div>

    <div>
      <a href="/?world=ncity.executiontime.pub">Story Chat</a>
    </div>

    <div>
      <a href="/?world=css.ceo">Music Hall</a>
    </div>

    <div>
      <a href="/404">Playground</a>
    </div>
    Examples:
    ${
      examples.map(x => `
        <div>
          <a href="${base}${x.content}?world=sillyz.computer">${x.name}</a>
        </div>
      `).join('')
    }
  `
})
