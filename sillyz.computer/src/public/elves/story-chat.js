import module from '@silly/tag'
import { doingBusinessAs } from "@sillonious/brand"
import { showModal } from './plan98-modal.js'
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

const $ = module('story-chat', { virtual: true })

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
  const { file } = sourceFile(target)
  const log = render(file) || ''

  const view = `
    <div name="transport">
      <div name="actions">
        <button data-zero>Clear</button>
        <button data-party>Invite</button>
        <button data-logout>Disconnect</button>
      </div>
    </div>
    <div class="captains-log">
      ${log}
      <div class="communicator">
        <form class="story-chat-form" data-command="enter">
          <input type="text" name="message">
          <button type="submit" data-command="enter">
            add
          </button>
        </form>
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
      </div>
    </div>
  `

  return view
})

function source(target) {
  const src = target.getAttribute('src')
  const today = new Date().toJSON().slice(0, 10)
  const dynamic = `saga://${today}.saga`
  return src || dynamic
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

  let file = `You're first. Here's a game to pass the time.

<mine-sweeper

Invite someone above.
`
  const data = $.learn()[path] || { file }

  return data
    ? data
    : (function initialize() {
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
  const message = event.target.closest($.link).querySelector('[name="message"]')
  const path = source(event.target)
  const { command } = event.target.dataset
  if(!commands[command]) return
  const symbol = commands[command]
  file = file+'\n'+symbol+message.value
  gun.get($.link).get(path).put({ file }, () => {
    message.value = ''
  })
}

$.when('click', '[data-zero]', () => {
  const path = source(event.target)
  gun.get($.link).get(path).put({file: ''})
})

$.when('click', '[data-party]', () => {
  showModal(`
    <sticky-note>
      <qr-code text="${window.location.href}"></qr-code>
    </sticky-note>
  `)
})
$.when('click', '[data-logout]', () => {
  window.location.href = '/'
})

$.style(`
  & {
    display: block;
    position: relative;
    height: 100%;
    background: rgba(0,0,0,.85);
    color: white;
  }

  & button {
    position: relative;
    z-index: 2;
    background: rgba(0,0,0,.85);
    border: none;
    color: dodgerblue;
    cursor: pointer;
    height: 2rem;
    border-radius: 1rem;
    transition: all 100ms;
    padding: .25rem 1rem;
  }

  & button[disabled] {
    opacity: .5;
    background: rgba(255,255,255,.5);
  }

  & button:hover,
  & button:focus {
    background: linear-gradient(rgba(0,0,0,.85) 80%, dodgerblue);
    color: white;
  }

  & .story-chat-form {
    display: grid;
    grid-template-columns: 1fr auto;
    margin-bottom: .5rem;
  }

  & .captains-log {
    width: 100%;
    height: 100%;
    max-height: calc(100% - 6rem);
    padding: 6rem 1rem;
    overflow: auto;
  }

  & .communicator {
    position: absolute;
    height: 6rem;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    padding: .5rem;
    border-radius: 1rem;
    background: rgba(0,0,0,.85);
    z-index: 2;
  }
  & .story-chat-form,
  & .story-chat-row {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: .5rem;
    width: 100%;
    overflow: auto;
  }

  & .story-chat-row {
  }

  & .story-chat-form [type="text"] {
    grid-column: 1/8;
  }

  & .story-chat-row > * {
    flex: 1;
  }

  & .communicator input {
    border: 1px solid orange;
    background: rgba(255,255,255,.15);
    padding: 0 1rem;
    color: white;
    border-radius: 1rem;
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

  & [name="transport"] {
    overflow-x: auto;
    max-width: calc(100vw - 1.5rem - 1px);
    position: absolute;
    right: 0;
    top: 2rem;
    z-index: 2;
    overflow: auto;
  }

  & [name="actions"] {
    display: inline-flex;
    justify-content: end;
    border: 1px solid rgba(255,255,255,.15);
    gap: .25rem;
		padding-right: 1rem;
    border-radius: 1.5rem 0 0 1.5rem;
  }

`)
