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

const $ = module('plan98-chat', { virtual: true })

const logs = {}
$.draw(target => {
  const { file } = sourceFile(target)
  logs[target.id] = render(file) || ''

  if(target.mounted) return
  target.mounted = true

  const view = `
    <div name="transport">
      <div name="actions">
        <button data-zero>Clear</button>
        <button data-party>Invite</button>
        <button data-logout>Disconnect</button>
      </div>
    </div>
    <div class="log"></div>
    <form class="send-form" data-command="enter">
      <button data-tooltip="send" class="send" type="submit" data-command="enter">
        <sl-icon name="arrow-up-circle"></sl-icon>
      </button>
      <div class="text-well">
        <textarea name="message" placeholder="Today..."></textarea>
      </div>
    </form>
  `

  return view
}, { afterUpdate })

function afterUpdate(target) {
  { // recover icons from the virtual dom
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('sl-icon')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
  }

  {
    const log = target.querySelector('.log')
    log.innerHTML = logs[target.id]
  }
}

function source(target) {
  const src = target.closest($.link).getAttribute('src')
  const today = new Date().toJSON().slice(0, 10)
  const dynamic = `${today}.saga`
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

$.when('submit', 'form', (event) => {
  event.preventDefault()
  send(event)
  event.target.querySelector('[name="message"]').focus()
})
function send(event) {
  let { file } = sourceFile(event.target)
  const message = event.target.closest($.link).querySelector('[name="message"]')
  const path = source(event.target)
  file = file+'\n'+message.value
  message.value = ''
  gun.get($.link).get(path).put({ file }, () => {
    console.log('saved')
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
    display: grid;
    grid-template-rows: 1fr auto;
  }

  & button {
    position: relative;
    z-index: 2;
    background: rgba(0,0,0,.85);
    border: none;
    color: rgba(255,255,255,.85);
    cursor: pointer;
    height: 2rem;
    border-radius: 0;
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

  & textarea {
    width: 100%;
    display: block;
    resize: none;
    border: none;
    background: rgba(0,0,0,.85);
    color: white;
    border-radius: 0;
    padding: 8px;
    max-height: 25vh;
  }

  & .text-well {
    background: rgba(0,0,0,.25);
    padding: 4px;
  }

  & .send {
    position: absolute;
    bottom: 0;
    right: 0;
    color: rgba(255,255,255,.85);
    background: dodgerblue;
    padding: .3rem .3rem 0;
    border-radius: 100%;
    font-weight: 800;
    border: 1px solid dodgerblue;
    transition: all 100ms ease-in-out;
  }


  & .send-form button {
    position: absolute;;
    right: 0;
    bottom: 0;
    z-index: 2;
    margin: .5rem;
  }

  & .send-form button[disabled] {
    opacity: .5;
    background: rgba(255,255,255,.5);
  }

  & .send-form button:hover,
  & .send-form button:focus {
    background: rgba(0,0,0,.85);
    border: 1px solid dodgerblue;
    color: dodgerblue;
  }

  & .log {
    overflow: auto;
    display: flex;
    flex-direction: column-reverse;
    overflow-anchor: auto !important;
    padding: 6rem 0 1rem;
  }

  & .log xml-html {
    display: flex;
    gap: 4px;
    flex-direction: column;
  }


  @media print {
    & button {
      display: none;

    }
    & .log {
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

$.when('input', 'textarea', (event) => {
  event.target.style.height = "auto";
  event.target.style.height = (event.target.scrollHeight) + "px";
});

const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', 'textarea', event => {
  if(event.keyCode === enter && !event.shiftKey) {
    event.preventDefault()
    const form = event.target.closest($.link).querySelector('form')

    form.requestSubmit()
  }
})

