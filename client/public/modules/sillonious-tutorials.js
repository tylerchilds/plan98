import module from '@sillonious/module'

const currentWorkingDirectory = '/cdn/'

const $ = module('sillonious-tutorials', {
  activeWorld: plan98.host || 'actuality.network',
  activeDialect: '/en-us/',
})

const tutorials = [
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
    ${
      tutorials.map(x => `
        <div>
          <a href="${base}${x.content}?world=sillyz.computer">${x.name}</a>
        </div>
      `).join('')
    }
  `
})
