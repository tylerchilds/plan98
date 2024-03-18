import module from '@sillonious/module'
import { render } from '@sillonious/saga'
import 'gun'
const Gun = window.Gun
const gun = Gun(['https://gun.1998.social/gun']);

/*
   ^
  <@>
  !&{
   #
*/

const $ = module('story-chat', {script: 'hi'})

const commands = {
  comment: '!',
  address: '#',
  puppet: '@',
  parenthetical: '&',
  quote: '>',
  module: '<',
  donottouch: '{',
  effect: '^',
  enter: ' ',
}

$.draw(target => {
  const { input='' } = $.learn()
  const { file } = sourceFile(target)
  const log = render(file) || ''
  return `
    <button data-restart>Restart</button>
    <button data-logout>Logout</button>
    <div class="captains-log">
      ${log}
      <div class="communicator">
        <div class="story-chat-row">
          <button data-command="comment">
            !
          </button>
          <button data-command="address">
            #
          </button>
          <button data-command="puppet">
            @
          </button>
          <button data-command="parenthetical">
            &
          </button>
          <button data-command="quote">
            &gt;
          </button>
          <button data-command="module">
            &lt;
          </button>
          <button disabled data-command="donottouch">
            {
          </button>
          <button data-command="effect">
            ^
          </button>
        </div>
        <form class="story-chat-form" data-command="enter">
          <input value=${input}>
          <button type="submit" data-command="enter">
            :)
          </button>
        </form>
      </div>
    </div>
  `
})

function source(target) {
  const hardcoded = target.closest($.link).getAttribute('src')
  const queried = plan98.parameters.get($.link)
  const today = new Date().toJSON().slice(0, 10)
  const dynamic = `/public/journal/${today}.saga`
  return hardcoded || queried || dynamic
}

function sourceFile(target) {
  const path = source(target)
  const entry = gun.get($.link).get(path)
  if(!target.subscribed) {
    entry.on((data) => {
      $.teach({[path]: data})
    });
    target.subscribed = true
  }

  const data = $.learn()[path] || { file: '' }

  return data
    ? data
    : (function initialize() {
      let file = ''
      fetch(path).then(async (res) => {
        if(res.status === 200) {
          file = await res.text()
        }
      }).catch(e => {
        console.error(e)
      }).finally(() => {
        entry.put({ file })
      })

      return data
    })()
}

$.when('click', 'button[data-command]', send)
$.when('submit', 'form', (event) => {
  event.preventDefault()
  const { command } = event.target.dataset
  send(event)
})
function send(event) {
  let { file } = sourceFile(event.target)
  const path = source(event.target)
  const { command } = event.target.dataset
  const input = event.target.closest($.link).querySelector('input')
  const symbol = commands[command]
  file = file+'\n'+symbol+input.value
  gun.get($.link).get(path).put({ file }, () => {
    $.teach({ input: '' })
  })
}

$.when('click', '[data-restart]', () => {
  const path = source(event.target)
  gun.get($.link).get(path).put({file: ''})
})

$.when('click', '[data-logout]', () => {
  window.location.href = '/404'
})

$.when('change', 'input', (event) => {
  const { value } = event.target
  $.teach({ input: value })
})


$.style(`
  & {
    display: block;
    height: 100%;
  }

  & button {
    border: 1px solid dodgerblue;
    border-radius: .5rem;
    background: rgba(0,0,0,.85);
    color: white;
    padding: .25rem;
  }

  & button[disabled] {
    opacity: .5;
    background: rgba(255,255,255,.5);
  }

  & button:hover,
  & button:focus {
    background: dodgerblue;
  }

  & .story-chat-form {
    display: grid;
    grid-template-columns: 1fr auto;
  }

  & .captains-log {
    width: 100%;
    max-height: calc(100% - 6rem);
    padding: 2rem 0;
    overflow: auto;
  }

  & .communicator {
    position: absolute;
    height: 6rem;
    bottom: 0;
    width: 100%;
    padding: .5rem;
    border-radius: .25rem;
    background: rgba(0,0,0,.85);
    z-index: 2;
  }
  & .story-chat-form,
  & .story-chat-row {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: .5rem;
    width: 100%;
  }

  & .story-chat-row {
    margin-bottom: .5rem;
  }

  & .story-chat-form input {
    grid-column: 1/8;
  }

  & .story-chat-row > * {
    flex: 1;
  }
  
  & .communicator input {
    width: 100%;
  }

  @media print {
    & button, & .communicator {
      display: none;

    }
    & .captains-log {
      max-height: initial;
    }
    body {
      overflow: visible !important;
    }
  }
`)
