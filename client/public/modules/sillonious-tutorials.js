import module from '@sillonious/module'

const currentWorkingDirectory = '/cdn/'

const $ = module('sillonious-tutorials', {
  activeWorld: plan98.host || 'actuality.network',
  activeDialect: '/en-us/',
})

const tutorials = [
  {
    name: 'Hello World',
    content: 'ARCHITECTURE.saga'
  },
  {
    name: 'Hello Reality',
    content: 'README.md'
  },
  {
    name: 'Hello Technology',
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
