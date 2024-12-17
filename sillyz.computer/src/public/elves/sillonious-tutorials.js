import module from '@silly/tag'

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
    Hey--<br><br>
    Thanks for checking out Sillyz.Computer, an interactive, immersive tech demo that's part portfolio, part edutainment and part personal saga.<br><br>
    If you find things a little confusing, that's okay. Nothing is self explanatory, but hopefully self-exploratory.<br/><br/>
    If you're not feeling that way yet either, that's okay. Feel free to click around.<br/><br/>

    Sample Customer Journey:
    <div>
      <a href="/sagas/thelanding.page/en-us/000-000.saga?world=thelanding.page">Tutorial</a>
    </div>


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

    <div>
      <a href="/sagas/sillyz.computer/en-us/000-000.saga">Tutorial</a>
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
