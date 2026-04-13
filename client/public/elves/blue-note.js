import { Activities, Text } from '@plan98/types'
import MVCES from '@plan98/elf'
import { escapeHyperText, mod } from '@silly/helpers'
import { BUTTON_CODES, overrideButton, checkButton, checkAxis } from './debug-gamepads.js'

const schemas = {
  'org.plan98.blue-note': {
    moniker: '',
    loading: false,
    activities: [],
    index: 0,
    saga: ''
  }
}

const schema = 'org.plan98.blue-note'

const { m, v, c, e, s, link } = MVCES('blue-note', schemas[schema])

const slideBack = (event) => {
  const { index, activities } = m()
  c({ index: mod(index - 1, activities.length) })
}

const slideNext = (event) => {
  const { index, activities } = m()

  c({ index: mod(index + 1, activities.length) })
}

e('click', 'button[data-back]', slideBack)
e('click', 'button[data-next]', slideNext)

function sillySky(moniker) {
  const address = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${moniker}`

  fetch(address)
    .then(res => res.json())
    .then(data => {
      const activities = (data.feed || [])
        .map(item => item.post?.record?.text || '')
        .flatMap(Activities)
        .map(x => x?.object?.content || '')
        .reverse()

      c({
        loading: false,
        activities,
        saga: data
          .feed
          .flatMap(item => item
            .post
            ?.record
            ?.text || ''
          ).reverse().join('\n')
      })
    })

  c({ loading: true, activities: [] })
}

v((target) => {
  const {
    moniker,
    loading,
    activities,
    index
  } = m()

  if (loading) {
    return `<c><flying-disk></flying-disk></c>`
  }

  const leftMost = `
    <button data-back class="minimal-button">&lt;</button>
  `
  const rightMost = `
    <button data-next class="minimal-button">&gt;</button>
  `

  target.innerHTML = `
    <div class="tim-cookin">
      <div class="action-bar">
        <div>
          <button data-crawl class="minimal-button">Q</button>
        </div>
        <div class="url-grid">
          ${leftMost}
          <span class="protocol">NETDIR://</span>
          <input value="${escapeHyperText(moniker)}" name="moniker"/>
          ${rightMost}
        </div>
        <div style="text-align: right;">
          <button data-load class="minimal-button">R</button>
        </div>
      </div>
      <div class="arena" key="${index}">
        ${activities[index] || ''}
      </div>
    </div>
  `
}, {
  beforeUpdate(target) {
    if (!target.mounted) {
      target.mounted = true
      const moniker = target.getAttribute('moniker') || 'sillyz.computer'
      c({ moniker })
      sillySky(moniker)
    }
  },
  afterUpdate(target) {}
})

e('click', 'button[data-load]', ({ target }) => {
  const { moniker } = m()
  sillySky(moniker)
})

e('click', 'button[data-crawl]', ({ target }) => {
  self.location.href = `/app/saga-crawler?data=${encodeURIComponent(btoa(Text(m().saga)))}`
})

e('input', '[name="moniker"]', ({ target }) => c({ moniker: target.value }))

s(`
  & {
    display: block;
    height: 100%;
    overflow; hidden;
    font: 'Courier' 12pt;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    touch-action: none;
  }

  & .action-bar {
    background: rgba(0,0,0,.85);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    padding: 2px;
  }

  & .arena {
    height: 100%;
    overflow: auto;
    display: grid;
    place-items: center;
  }

  & .tim-cookin {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
  }

  & input {
    color: #d79921;          /* neutral_yellow, was #ebb22e */
    display: block;
    width: 100%;
    margin: auto;
    text-align: left;
    background: transparent;
    font-size: .9rem;
    padding: 4px;
    margin: 0 auto;
    border-radius: 0;
    border: none;
  }

  & .url-grid {
    grid-template-columns: auto auto 1fr auto;
    display: grid;
    gap: 4px;
    place-content: center;
  }

  & .protocol {
    color: #8ec07c;
    display: grid;
    place-content: center;
  }

`)

const spamCache = {}

function debounceSpam(code, timeout, callback) {
  if(spamCache[code]) return
  spamCache[code] = true

  callback()

  setTimeout(() => {
    spamCache[code] = false
  }, timeout)
}

const toggleCache = {}
function toggleSpam(code, value, callback) {
  if(!toggleCache[code] && value === 1) {
    callback()
  }

  toggleCache[code] = value
}

const commonActions = {
  'a': (params) => {
    toggleSpam('a', params.value, () => {
    })
  },
  'b': (params) => {
    toggleSpam('b', params.value, () => {
    })
  },
  'x': (params) => {
    toggleSpam('x', params.value, () => {
    })
  },
}

const performRPC = {
  ...commonActions,
  'y': (params) => {
  },
  'up': (params) => {
    if(params.value === 1) {
      debounceSpam('up', 250, () => {
        slideBack()
      })
    }
  },
  'down': (params) => {
    if(params.value === 1) {
      debounceSpam('down', 250, () => {
        slideNext()
      })
    }
  },
  'left': (params) => {
    if(params.value === 1) {
      debounceSpam('left', 250, () => {
        slideBack()
      })
    }
  },
  'right': (params) => {
    if(params.value === 1) {
      debounceSpam('right', 250, () => {
        slideNext()
      })
    }
  },
}


e('json-rpc', (event) => {
  const { method, params } = event.detail

  if(performRPC[method]) {
    performRPC[method](params)
  }
})

function standardAction(code) {
  return (target, params) => {
    notification(target, code, params)
  }
}

const actions = {
  a: standardAction('a'),
  b: standardAction('b'),
  x: standardAction('x'),
  y: standardAction('y'),
  lb: standardAction('lb'),
  rb: standardAction('rb'),
  lt: standardAction('lt'),
  rt: standardAction('rt'),
  ls: standardAction('ls'),
  rs: standardAction('rs'),
  select: standardAction('select'),
  start: standardAction('start'),
  up: standardAction('up'),
  down: standardAction('down'),
  left: standardAction('left'),
  right: standardAction('right'),
}

function notification(node, method, params) {
  if(node) {
    node.dispatchEvent(new CustomEvent('json-rpc', {
      detail: {
        jsonrpc: "2.0",
        method: method,
        params
      }
    }))
  }
}

function standardFire(player, node, code) {
  if(player[code]) {
    actions[code](node, {
      type: 'click',
      value: 1
    })
  } else {
    actions[code](node, {
      type: 'click',
      value: 0
    })
  }
}

const forceCache = {}

// essentially make sure the button was released to ensure the screen
function forceAcknowledge(code, value, callback) {
  if(value === 0 && !forceCache[code]) {
    forceCache[code] = 0
    return
  }
  if(forceCache[code] === 1 || (forceCache[code] === 0 && value === 1)) {
    forceCache[code] = 1
    callback()
  }
}

function clearAcknowledge(code) {
  delete forceCache[code]
}


function player1(code) {
  return checkButton(0, BUTTON_CODES[code])
}

function gameLoop(time) {
  const { paused } = m()

  if(!paused) {
    const node = document.querySelector(link)

    if(node) {
      const player = {
        a: player1('a'),
        b: player1('b'),
        x: player1('x'),
        y: player1('y'),
        lb: player1('lb'),
        rb: player1('rb'),
        lt: player1('lt'),
        rt: player1('rt'),
        select: player1('select'),
        start: player1('start'),
        ls: player1('ls'),
        rs: player1('rs'),
        up: player1('up'),
        down: player1('down'),
        left: player1('left'),
        right: player1('right'),
        os: player1('os'),
      }

      standardFire(player, node, 'a')
      standardFire(player, node, 'b')
      standardFire(player, node, 'x')
      standardFire(player, node, 'y')
      standardFire(player, node, 'lb')
      standardFire(player, node, 'rb')
      standardFire(player, node, 'lt')
      standardFire(player, node, 'rt')
      standardFire(player, node, 'ls')
      standardFire(player, node, 'rs')
      standardFire(player, node, 'up')
      standardFire(player, node, 'down')
      standardFire(player, node, 'left')
      standardFire(player, node, 'right')

      selectFire(player.select)

      startFire(player.start)

      toggleSpam('os', player.os, () => {
        toggleOS()
      })
    }
  }

  requestAnimationFrame(gameLoop)
}

gameLoop()

function selectFire(value) {
  toggleSpam('select', value, () => {
    toggleSettings()
  })
}

function startFire(value) {
  toggleSpam('start', value, () => {
    togglePause()
  })
}

function toggleOS (event) {
  c({ index: 0 })
}

function toggleSettings (event) {
  c({ index: 0 })
}

function togglePause (event) {
  c({ index: 0 })
}
