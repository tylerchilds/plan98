import elf from '@silly/elf'
import { innerHTML } from 'diffhtml'
import natsort from 'natsort'
import { idx, documents } from './giggle-search.js'

import 'gun'
import 'gun/open'
const gun = window.Gun(['https://gun.1998.social/gun']);

const initial = {
  startX: null,
  startY: null,
  x: null,
  y: null,
  invertX: false,
  invertY: false,
  isMouseDown: false,
  suggestions: [],
  trayZ: 3,
  focusedTray: null,
}

function read($) {
  const href = window.location.href
  return $.learn()[href] || {}
}

function write($, data, merge = (node, data, key) => {
  node.get(key).put(data[key])
}) {
  const href = window.location.href
  Object
    .keys(data)
    .forEach(key => {
      const entry = gun.get($.link).get(href)
      merge(entry, data, key)
    })
}

const $ = elf.call({ read, write }, 'crossover-episode')

function engine(target) {
  const canvas = target.closest($.link).querySelector('canvas')
  const rectangle = canvas.getBoundingClientRect()

  return { canvas, rectangle }
}

function render(target) {
  const container = target.querySelector('.trays')
  return (tray) => {
    const data = this.read($)[tray]
    if(!data) return
    const {
      suggestions=[],
      suggestIndex,
      focusedTray
    } = this.read($)
    const {
      maximized,
      minimized,
      grabbed,
      width,
      height,
      x,
      y,
      z,
      url,
      focused
    } = data

    const start = Math.max(suggestIndex - 5, 0)
    const end = Math.min(suggestIndex + 5, suggestions.length - 1)

    let node = container.querySelector(`[data-id="${tray}"]`)
    if(!node) {
      node = document.createElement('div')
      node.classList.add('tray');
      node.dataset.id = tray
      node.innerHTML = `
        <button class="tray-wake" data-tray="${tray}"></button>
        <div class="tray-title-bar" data-tray="${tray}" data-url="${url}">
          <button class="tray-action tray-close" data-tray="${tray}" data-tooltip="close">
            <sl-icon name="x-lg"></sl-icon>
          </button>
          <div class="grabber minimizable" data-tooltip="grab and drag"></div>
          <form class="search minimizable" method="get">
            <div class="input-grid">
              <input placeholder="netdir://" value="${url}" autocomplete="off" name="browser-${self.crypto.randomUUID()}" class="browser" data-tray="${tray}"/>

              <button class="tray-action tray-sync" data-tooltip="call link" data-tray="${tray}" tab-index="1" type="submit">
                <sl-icon name="telephone"></sl-icon>
              </button>
            </div>
          </form>
          <div class="grabber minimizable" data-tooltip="grab and drag"></div>
          <button class="tray-action tray-launch" data-tray="${tray}" data-tooltip="launch">
            <sl-icon name="box-arrow-up-right"></sl-icon>
          </button>
        </div>
        <div class="suggestions" data-tray="${tray}"></div>
        <div class="tray-body">
          ${drawTray(tray, url)}
        </div>
        <div class="resize-actions">
          <button aria-label="resize" data-tooltip="resize" data-direction="sw" class="tray-resize minimizable resize-left-bottom" data-tray="${tray}">
          </button>
          <button aria-label="resize" data-tooltip="resize" data-direction="se" class="tray-resize minimizable resize-right-bottom" data-tray="${tray}">
          </button>

          <button aria-label="resize" data-tooltip="resize" data-direction="nw" class="tray-resize minimizable resize-left-top" data-tray="${tray}">
          </button>
          <button aria-label="resize" data-tooltip="resize" data-direction="ne" class="tray-resize minimizable resize-right-top" data-tray="${tray}">
          </button>
        </div>
      `
      container.appendChild(node)
    }

    node.style = `--width: ${width}px; --height: ${height}px;--x: ${x}px; --y: ${y}px; --z: ${z}; transform: translate(var(--x), var(--y)); z-index: var(--z);`

    if(focusedTray === tray) {
      node.dataset.focused = true
    } else {
      node.dataset.focused = false
    }

    if(maximized) {
      node.setAttribute('class', 'tray maximized')
    } else {
      node.setAttribute('class', 'tray')
    }
    if(minimized) {
      node.classList.add('minimized')
    } else {
    }

    const maybies = node.querySelector('.suggestions')
    if(focused) {
      innerHTML(maybies, `
        <div class="suggestion-box">${suggestions.slice(start, end).map((x, i) => {
            const item = documents.find(y => {
              return x.ref === y.path
            })

            return `
              <button type="button" class="auto-item ${suggestIndex === i + start ? 'active': ''}" data-name="${item.name}" data-path="${item.path}" data-index="${i}">
                <div class="hyper-name">
                  <span class="file-name">
                    ${item.name}
                  </span>
                  <span class="hyper-sentence">
                    ${item.path.split('/').reverse().slice(1,-1).join(' ')}
                  </span>
                </div>
              </button>
            `
          }).join('')}</div>
      `)
    } else {
      maybies.innerHTML = null
    }

    if(node.dataset.url !== url) {
      node.dataset.url = url
      const trayBody = node.querySelector('.tray-body')
      const irix = node.querySelector('.irix-launcher')

      const iframe = node.querySelector('iframe')
      if(url !== 'about:blank' && !iframe) {
        if(irix) {
          irix.remove()
        }
        trayBody.insertAdjacentHTML('beforeend', `
          <iframe src="${url}" title="${url}"></iframe>
        `)
      } else if(url === 'about:blank') {
        if(iframe) {
          iframe.remove()
        }

        if(!irix) {
          trayBody.insertAdjacentHTML('beforeend', drawIrix(tray))
        }
      }

      if(iframe) {
        iframe.src = url
      }

      const browser = node.querySelector('.browser')
      if(browser) {
        browser.value = url
      }
    }

    node.dataset.grabbed = grabbed
    node.persist = true
  }
}

function drawTray(tray, url) {
  return url === 'about:blank' ? drawIrix(tray) : `
    <iframe src="${url}" title="${url}"></iframe>
  `
}

function drawIrix(tray) {
  return `
    <div class="irix-launcher">
      <button class="application" data-tray="${tray}" data-href="/app/file-system">
        <span><sl-icon name="archive"></sl-icon></span>
        <input disabled value="Files" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/secure-mail">
        <span><sl-icon name="envelope-paper-heart"></sl-icon></span>

        <input disabled value="Mail" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/party-chat">
        <span><sl-icon name="chat"></sl-icon></span>

        <input disabled value="Chat" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/hello-bluesky">
        <span><sl-icon name="at"></sl-icon></span>

        <input disabled value="Blue Sky" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/owncast-broadcast">
        <span><sl-icon name="camera-reels"></sl-icon></span>

        <input disabled value="Owncast" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/solid-todolist">
        <span><sl-icon name="check"></sl-icon></span>
        <input disabled value="Tim's List" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/e2ee-todolist">
        <span><sl-icon name="check2-all"></sl-icon></span>
        <input disabled value="Ty's List" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/draw-term?src=/app/play-wheel?src=/app/hyper-script?src=/public/sagas/sillyz.computer/ethnography.saga">
        <span class="nonce-icon nonce"></span>
        <input disabled value="Synthia" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/impromptu-stagehand">
        <span><sl-icon name="person-raised-hand"></sl-icon></span>

        <input disabled value="Impromptu Stagehand" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/?world=ncity.executiontime.pub">
        <span><sl-icon name="egg-fried"></sl-icon></span>

        <input disabled value="Cyberpunk 2077" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/interdimensional-cable">
        <span><sl-icon name="tv"></sl-icon></span>

        <input disabled value="Interdimensional Cable" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/giggle-search">
        <span><sl-icon name="search"></sl-icon></span>

        <input disabled value="Giggle Search" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/middle-earth">
        <span><sl-icon name="globe2"></sl-icon></span>

        <input disabled value="Planet Earth" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/startup-wizard">
        <span><sl-icon name="shop"></sl-icon></span>

        <input disabled value="Story Mode" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/my-journal">
        <span><sl-icon name="journal"></sl-icon></span>

        <input disabled value="My Journal" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/hyper-browser">
        <span><sl-icon name="controller"></sl-icon></span>

        <input disabled value="Hyper Browser" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/simpleton-client?src=/private/${$.link}/${new Date().toISOString()}/${self.crypto.randomUUID()}.saga">
        <span><sl-icon name="people"></sl-icon></span>

        <input disabled value="Collaborative Text" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/bulletin-board?src=/private/${$.link}/${self.crypto.randomUUID()}.json&group=${self.crypto.randomUUID()}">
        <span><sl-icon name="window-stack"></sl-icon></span>

        <input disabled value="Bulletin Board" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/dial-tone">
        <span><sl-icon name="music-note"></<span>sl-icon></span>

        <input disabled value="Amateur Synth" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/sillyz-ocarina">
        <span><sl-icon name="music-note-beamed"></sl-icon></span>

        <input disabled value="Professional Synth" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/video-feed/">
        <span><sl-icon name="camera-reels"></sl-icon></span>

        <input disabled value="Video Feed" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/sillyz-piano">
        <span><sl-icon name="keyboard"></sl-icon></span>

        <input disabled value="Silly Piano" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/story-board">
        <span><sl-icon name="brush"></sl-icon></span>

        <input disabled value="Chalk Board" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/paint-app">
        <span><sl-icon name="paint-bucket"></sl-icon></span>

        <input disabled value="Old Paint" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/mine-sweeper/">
        <span><sl-icon name="minecart"></sl-icon></span>

        <input disabled value="Mine Sweeper" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/generic-park/">
        <span><sl-icon name="joystick"></sl-icon></span>

        <input disabled value="Generic Park" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/hyper-script">
        <span><sl-icon name="code-slash"></sl-icon></span>

        <input disabled value="Script Editor" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/code-module">
        <span><sl-icon name="braces"></sl-icon></span>

        <input disabled value="Code Editor" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/9/">
        <span><sl-icon name="music-player"></sl-icon></span>

        <input disabled value="Plan9 Zune" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/main-quest/">
        <span><sl-icon name="balloon"></sl-icon></span>

        <input disabled value="Havok Physics" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/wallet-1998/">
        <span><sl-icon name="wallet"></sl-icon></span>

        <input disabled value="Wallet" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/wallet-metamask/">
        <span><sl-icon name="wallet2"></sl-icon></span>

        <input disabled value="Meta Mask" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/sonic-knuckles/">
        <span><sl-icon name="browser-firefox"></sl-icon></span>

        <input disabled value="Sonic and Knuckles" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/draw-term/">
        <span><sl-icon name="terminal"></sl-icon></span>

        <input disabled value="Draw Term 98" class="app-name">
      </button>
    </div>
  `
}


const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', '.browser', event => {
  const { suggestionsLength=0, suggestIndex } = $.learn()
  if(event.keyCode === down) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? 0 : suggestIndex + 1
    if(nextIndex >= suggestionsLength -1) return
    write($, { suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === up) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? suggestionsLength - 2 : suggestIndex - 1
    if(nextIndex < 0) return
    write($, { suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === enter && suggestIndex !== null) {
    event.preventDefault()
    const { suggestions=[], suggestIndex } = $.learn($)
    const item = documents.find(y => {
      if(!suggestions[suggestIndex]) return false
      return suggestions[suggestIndex].ref === y.path
    })

    if(item) {
      const { tray } = event.target.dataset
      const url = '/app/media-plexer?src=' +item.path
      document.activeElement.blur()
      setState(tray, { url, focused: false })
      return
    }
  }
})

$.when('click', '.auto-item', event => {
  event.preventDefault()
  const { tray } = event.target.closest('[data-tray]').dataset
  const { path } = event.target.dataset

  const url = '/app/media-plexer?src=' + path
  document.activeElement.blur()
  setState(tray, { url, focused: true })
  write($, {
    suggestIndex: parseInt(event.target.dataset.index)
  })
})

$.when('click', '.application', event => {
  event.preventDefault()
  const { tray } = event.target.closest('[data-tray]').dataset
  const { href } = event.target.dataset

  document.activeElement.blur()
  setState(tray, { url: href, focused: true })
  write($, {
    suggestIndex: parseInt(event.target.dataset.index)
  })

  const path = 'about:blank'
  self.history.pushState({ type: `${$.link}-navigation`, tray, path }, "");
})

addEventListener("popstate", async (event) => {
  const { type, path, tray } = event.state || {}
  console.log(tray, path, type)
  if(type === `${$.link}-navigation`) {
    setState(tray, { url: path })
  }
});

$.when('input', '.browser', (event) => {
  const { value } = event.target;
  const { tray } = event.target.dataset
  setState(tray, { buffer: value })

  const sort = natsort();
  const suggestions = idx.search(value).sort((a,b) => sort(a.ref, b.ref))
  write($, {
    suggestions,
    suggestIndex: null,
  })
})

$.when('submit', '.search', (event) => {
  event.preventDefault()
  const { tray } = event.target.dataset
  const { buffer } = this.read($)[tray]
  const url = buffer.indexOf('://') ? buffer : '/app/giggle-search?query=' + buffer
  setState(tray, { url, focused: false })
})

$.when('focus', '.browser', event => {
  const { tray } = event.target.dataset
  setState(tray, { focused: true })
})

$.when('blur', '.browser', event => {
  setTimeout(() => {
    const { tray } = event.target.dataset
    setState(tray, { focused: false })
  }, 250)
})


$.draw(function boop(target) {
  if(!target.subscribed) subscribe(target)
  if(target.innerHTML) return
  const src = target.getAttribute('src')

  if(src) {
    requestIdleCallback(() => {
      const tray = self.crypto.randomUUID()

      let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
      let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

      const { trayZ=1 } = this.read($)
      setState(tray, {
        width: vw,
        height: vh,
        x: 2500 - (vw / 2),
        y: 2500 - (vh / 2),
        z: trayZ+1,
        url: src,
        maximized: true,
        focused: true
      })

      write($, {
        focusedTray: tray,
        trayZ: trayZ + 1
      })
      write($, {
        trays: tray
      }, function mergeTrays(node, data, key) {
        const edge = node.get(key)
        edge.get(data[key]).put(true)
      })
    })
  }
  return `
    <div class="trays"></div>
    <div class="cursor"></div>
    <canvas></canvas>
  `
}, {
  beforeUpdate,
  afterUpdate
})

function beforeUpdate(target) {
  saveCursor(target) // first things first

  { // save suggestion box scroll top
    const list = target.querySelector('.suggestion-box')
    if(list) {
      target.dataset.scrollpos = list.scrollTop
    }
  }

  {
    const { startX, startY, x, y, invertX, invertY } = this.read($)
    const background = target.getAttribute('background')
    const color = target.getAttribute('color')
    
    target.style = `--start-x: ${startX}px; --start-y: ${startY}px; --x: ${Math.abs(x)}px; --y: ${Math.abs(y)}px; --transform: translate(${invertX ? '-100' : '0' }%, ${invertY ? '-100' : '0'}%); ${background ? `--background: ${background};` : ``} ${color ? `--color: ${color}` : ``}`
  }

  {
    [...(target.querySelectorAll('.tray') || [])].map(x => {
      x.persist = false
    })
  }

  {
    const { isMouseDown } = this.read($)
    target.dataset.mouse = isMouseDown
  }
}

function afterUpdate(target) {
  {
    const { grabbing } = this.read($)
    const trays = target.querySelector('.trays')
    trays.dataset.grabbing = !!grabbing
  }

  {
    const { resizing } = this.read($)
    const trays = target.querySelector('.trays')
    trays.dataset.resizing = !!resizing
  }

  { // scroll suggestions
    const list = target.querySelector('.suggestion-box')
    if(list) {
      list.scrollTop = target.dataset.scrollpos
    }
  }

  { // scroll item into view
    const activeItem = target.querySelector('.suggestion-box .active')
    if(activeItem) {
      activeItem.scrollIntoView({block: "nearest", inline: "nearest"})
    }
  }

  {
    const { isMouseDown } = this.read($)
    const cursor = target.querySelector('.cursor')
    cursor.style = `${isMouseDown ? 'display: block;' : 'display: none;'};`
  }

  {
    const { trays } = this.read($)
    if(trays) { 
      Object.keys(trays).map(render.call(this, target))
    }
  }

  {
    const { trays } = this.read($)
    if(target.matches('.inline') && trays) {
      const somethingMaxed = trays.some(x => {
        const tray = this.read($)[x]
        return tray.maximized
      })

      if(somethingMaxed) { 
        target.classList.remove('inline'); 
        target.classList.add('online')
      }
    }
  }

  {
    [...(target.querySelectorAll('.tray') || [])].filter(x => {
      return !x.persist
    }).map(x => x.remove())
  }

  replaceCursor(target) // first things first
}

function subscribe(target) {
  target.subscribed = true
  const href = window.location.href
  const entry = gun.get($.link).get(href)
  /*
  entry.once(data => {
    if(!data) {
      entry.put(initial)
    }
  })
  */
  entry.open((data) => {
    $.teach({[href]: data})
  });
}

function syncTray(event) {
  event.preventDefault()
  const { tray } = event.target.dataset
  let { buffer, url } = this.read($)[tray]
  buffer ||= url
  url = buffer.startsWith('/')
    ? buffer
    : buffer.indexOf('://')
      ? buffer
      : '/app/giggle-search?query=' + buffer

  const irix = event.target.closest('.tray').querySelector('.irix-launcher')
  const iframe = event.target.closest('.tray').querySelector('iframe')
  if(url !== 'about:blank' && !iframe) {
    if(irix) {
      irix.remove()
    }
    trayBody.insertAdjacentHTML('beforeend', `
      <iframe src="${url}" title="${url}"></iframe>
    `)
  } else if(url === 'about:blank') {
    if(iframe) {
      iframe.remove()
    }

    if(!irix) {
      trayBody.insertAdjacentHTML('beforeend', drawIrix(tray))
    }
  }

  if(iframe) {
    iframe.src = url
  }

  setState(tray, { url, focused: false, minimized: false })
}

function toggleMax(event) {
  const tray = event.target.closest('.tray').dataset.id
  const { maximized } = this.read($)[tray]
  maximized ? restoreMax(tray) : maximize(tray)
}

function maximize(tray) {
  setState(tray, {
    maximized: true,
    minimized: false
  })
}

// restore a pane
function restoreMax(tray) {
  setState(tray, {
    maximized: false,
  })
}

function toggleMin(event) {
  const tray = event.target.closest('.tray').dataset.id
  const { minimized } = this.read($)[tray]
  minimized ? restoreMin(tray) : minimize(tray)
}

function minimize(tray) {
  setState(tray, {
    minimized: true,
    maximized: false
  })
}

// restore a pane
function restoreMin(tray) {
  setState(tray, {
    minimized: false,
  })
}

function closeTray(event) {
  const { tray } = event.target.dataset

  write($, {
    trays: tray
  }, function mergeTrays(node, data, key) {
    const edge = node.get(key)
    edge.get(data[key]).put(null)
  })

  write($, tray, function merge(node, tray) {
    node.get(tray).put(null)
  })
}

// grab a pane
let grabTimeout
let grabOffsetX, grabOffsetY
function grab(event) {
  event.preventDefault()
  const { offsetX, offsetY } = event
  const { tray } = event.target.dataset
  const { trayZ=1 } = this.read($)
  const newZ = trayZ + 1
  write($, { trayZ: newZ, focusedTray: tray })
  setState(tray, { z: newZ, grabbed: true })
  write($, { grabbing: tray })
  grabOffsetX = offsetX
  grabOffsetY = offsetY
}

// drag a pane
let lastX, lastY;
function drag(event) {
  event.preventDefault()
  let { target, clientX, clientY } = event
  const { grabbing, resizing } = read($)
  const tray = grabbing || resizing
  if(!tray) return
  const { grabbed, resize, x, y, width, height } = this.read($)[tray]

  const panX = getComputedStyle(event.target).getPropertyValue("--pan-x") || 0;
  const panY = getComputedStyle(event.target).getPropertyValue("--pan-y") || 0;

  if (lastX !== undefined && lastY !== undefined) {
    const movementX = clientX - lastX;
    const movementY = clientY - lastY;
    // Use movementX and movementY here
    if(grabbed) {
      setState(tray, {
        x: x + movementX,
        y: y + movementY
      })
    }
    if(resize) {
      if(resize === 'sw') {
        setState(tray, {
          x: x + movementX,
          height: height + movementY,
          width: width - movementX
        })
      }
      if(resize === 'se') {
        setState(tray, {
          height: height + movementY,
          width: width + movementX
        })
      }
      if(resize === 'ne') {
        setState(tray, {
          y: y + movementY,
          height: height - movementY,
          width: width + movementX
        })
      }
      if(resize === 'nw') {
        setState(tray, {
          x: x + movementX,
          y: y + movementY,
          height: height - movementY,
          width: width - movementX
        })
      }
    }
  } else {
    if(grabbed) {
      setState(tray, {
        x: clientX - grabOffsetX - parseInt(panX, 10),
        y: clientY - grabOffsetY - parseInt(panY, 10)
      })
    }

  }

  lastX = clientX;
  lastY = clientY;
}

// release a pane
function ungrab(event) {
  event.preventDefault()
  clearTimeout(grabTimeout)
  const tray = this.read($).grabbing
  if(!tray) return
  setState(tray, { grabbed: false })
  write($, { grabbing: null })
  lastX = undefined;
  lastY = undefined;
  grabOffsetX = undefined
  grabOffsetY = undefined
}

// grab a pane
function resize(event) {
  event.preventDefault()
  const { offsetX, offsetY } = event
  const { tray } = event.target.dataset
  const { trayZ=1 } = this.read($)
  const newZ = trayZ + 1
  write($, { resizing: tray, trayZ: newZ, focusedTray: tray })
  setState(tray, { resize: event.target.dataset.direction, z: newZ })
  grabOffsetX = offsetX
  grabOffsetY = offsetY
}
function unresize({ target }) {
  const tray = this.read($).resizing
  if(!tray) return
  setState(tray, { resize: null })
  write($, { resizing: null })
  lastX = undefined;
  lastY = undefined;
  grabOffsetX = undefined
  grabOffsetY = undefined
}


function setState(tray, payload) {
  write($, payload, function merge(node, data, key) {
    node.get(tray).get(key).put(data[key])
  })
}

$.style(`
  & {
    position: relative;
    touch-action: none;
    overflow: hidden;
    -webkit-touch-callout: none;
    -webkit-user-select: none; 
     -khtml-user-select: none;
       -moz-user-select: none;
        -ms-user-select: none;
            user-select: none;
  }

  &.cinema {
    --draw-term-bg: #54796d;
    --draw-term-fg: #54796d;
  }

  & .resize-right-bottom,
  & .resize-left-bottom {
    position: absolute;
    bottom: -1rem;
    width: 1rem;
    height: 1rem;
    border: none;
    padding: 0;
    background-color: #E83FB8;
    border-radius: 100%;
    cursor: resize;
  }

  & .resize-left-bottom {
    left: -1rem;
    cursor: sw-resize;
  }

  & .resize-right-bottom {
    right: -1rem;
    cursor: se-resize;
  }

  & .resize-right-top,
  & .resize-left-top {
    position: absolute;
    padding: 0;
    top: -1rem;
    width: 1rem;
    height: 1rem;
    border: none;
    background-color: #E83FB8;
    border-radius: 100%;
    cursor: resize;
  }

  & .resize-left-top {
    left: -1rem;
    cursor: nw-resize;
  }

  & .resize-right-top {
    right: -1rem;
    cursor: ne-resize;
  }

  & .resize-right-bottom,
  & .resize-left-bottom,
  & .resize-right-top,
  & .resize-left-top {
    opacity: .5;
    aspect-ratio: 1;
  }

  & .resize-right-bottom:hover,
  & .resize-left-bottom:hover,
  & .resize-right-top:hover,
  & .resize-left-top:hover {
    opacity: 1;
  }

  & .resize-right-bottom:before,
  & .resize-left-bottom:before,
  & .resize-right-top:before,
  & .resize-left-top:before {
    content: '';
    width: 1rem;
    height: 1rem;
    border-radius: 100%;
    display: block;
  }



  &.inline {
    display: inline-block;
    height: 2.2rem;
  }

  &.inline .tray:not(.minimized) {
    transform: translate(0, 0) !important;
    position: absolute;
    inset: 0;
    width: 100% !important;
    height: 100% !important;
  }

  &.online {
    display: block;
    position: absolute;
    inset: 0;
    z-index: 100;
  }

  & .grabber {
    display: block;
    width: 100%;
    padding: 0 .25rem;
  }

  & .grabber::before {
    content: '';
    box-shadow:
      0px .2rem 0 .5px var(--red),
      0px .7rem 0 .5px var(--orange),
      0px 1.2rem 0 .5px var(--yellow);
    display: block;
    margin: 0;
    opacity: .4;
    transform: opacity 100ms ease-in-out;
  }

  &,
  & canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  & canvas {
    background: var(--draw-term-bg, var(--background, lemonchiffon));
    touch-action: manipulation;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
  }

  & .cursor {
    position: absolute;
    left: var(--start-x);
    top: var(--start-y);
    width: var(--x);
    height: var(--y);
    background: var(--draw-term-bg, var(--color, dodgerblue));
    transform: var(--transform);
    pointer-events: none;
    z-index: 9001;
    opacity: .65;
  }

  & .trays[data-resizing="true"],
  & .trays[data-grabbing="true"] {
    pointer-events: none !important;
  }

  & .tray {
    pointer-events: none;
    filter: grayscale(1);
  }

  &[data-mouse="true"] .tray {
    pointer-events: none !important;
  }

  & .tray[data-focused="true"] {
    pointer-events: all;
    filter: grayscale(0);
  }

  & .tray-wake {
    background: none;
    position: absolute;
    inset: 0;
    background: 0;
    border: 0;
    padding: 0;
    pointer-events: all;
  }

  & .tray-wake:hover,
  & .tray-wake:focus {
    background: rgba(0,0,0,.85);
    outline: 2px solid mediumseagreen;
    outline-offset: 2px;
  }

  & .tray[data-focused="true"] .tray-wake {
    display: none;
  }

  & [data-resizing="true"] .tray[data-focused="true"],
  & [data-grabbing="true"] .tray[data-focused="true"],
  &[data-mouse="true"] .tray[data-focused="true"],
  & [data-resizing="true"] .tray-wake,
  & [data-grabbing="true"] .tray-wake,
  &[data-mouse="true"] .tray-wake {
    pointer-events: none !important;
  }


  & [data-grabbing="true"] iframe {
    display: none !important;
  }

  & .grabber {
    pointer-events: none;
  }

  & [data-grabbed="true"] {
    transform: scale(1.1);
    outline: 2px solid var(--green);
    outline-offset: 2px;
  }
  & [data-grabbed="true"] .grabber::before {
    box-shadow:
      0px .2rem 0 .5px var(--purple),
      0px .7rem 0 .5px var(--blue),
      0px 1.2rem 0 .5px var(--green);
  }

  & .trays[data-mousedown="true"] {
    pointer-events: none;
  }

  & .trays:empty::before {
    content: 'Draw a rectangle that is not tiny."
    position: absolute;
    inset: 0;
    margin: auto;
  }

  & .tray {
    position: absolute;
    width: var(--width, 160px);
    height: var(--height, 90px);
    background: linear-gradient(25deg, rgba(0,0,0,.65), rgba(0,0,0,.85));
    padding: 2px;
    display: grid;
    grid-template-rows: 2rem 0 1fr;
    max-width: 100vw;
    max-height: 100vh;
  }

  & .tray iframe {
    position: absolute;
    inset: 0;
  }

  & .tray-title-bar {
    padding: 5px 4px;
    font-size: 1rem;
    line-height: 1;
    color: white;
    position: relative;
    display: grid;
    grid-template-columns: auto 2rem minmax(100px, 1.618fr) 1fr auto;
    gap: 5px;
    touch-action: manipulation;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    overflow-x: auto;
    overflow-y: hidden;
  }


  & [data-resizing="true"] .tray-title-bar,
  & [data-grabbing="true"] .tray-title-bar {
    overflow-x: hidden;
  }

  & .tray-title-bar input {
    border: none;
    border-radius: 0;
    background: transparent;
    color: rgba(255,255,255,.65);
    width: 100%;
    padding: 0 4px 0;
    height: 100%;
  }

  & .tray-title-bar input:focus {
    color: rgba(255,255,255,.85);
    column-span: 2;
  }

  & .tray-body {
    background: white;
    color: black;
    height: 100%;
    position: relative;
    overflow: auto;
  }

  & .tray-resize {
    pointer-events: all;
  }

  &:not(.infinite) .tray.maximized {
    transform: translate(0, 0) !important;
  }

  & .tray.minimized:not(.maximized) {
    width: auto;
    height: auto;
    grid-template-rows: auto auto 0 0;
    border-radius: 1rem;
  }

  & .tray.minimized:not(.maximized) .tray-title-bar {
    grid-template-columns: auto 2rem auto auto 2rem;
  }

  & .tray.minimized:not(.maximized) .minimizable {
    display: none;
  }

  & .tray [type="color"] {
    border: none;
    width: 100%;
    height: 100%;
    padding: 0;
  }

  & .tray-action {
    background: transparent;
    border: none;
    border-radius: 0;
    color: white;
    padding: 3px 5px;
    opacity: .65;
    transition: opacity 100ms;
    border-radius: 100%;
    display: grid;
    place-items: center;
  }

  & .tray-action:hover,
  & .tray-action:focus {
    opacity: 1;
  }

  & .tray-toggle {
  }

  & .tray-close {
    margin-left: auto;
  }

  & .input-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    text-align: left;
  }

  & *:focus {
    outline: 3px solid var(--underline-color, mediumseagreen);
  }

  & .suggestions .auto-item {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: var(--button-color, dodgerblue);
    border: none;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    display: block;
  }

  & .suggestions:not(:empty) {
    display: block;
    position: relative;
    background: var(--green, mediumseagreen);
    text-align: left;
  }

  & .suggestion-box:empty {
    pointer-events: none;
  }
  & .suggestion-box {
    position: absolute;
    inset: 0;
    height: 300px;
    overflow: auto;
    z-index: 10;
    max-height: calc(100vh - 3rem);
    display: flex;
    flex-direction: column;
  }

  & .suggestion-box .auto-item {
    background: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85));
    color: var(--button-color, dodgerblue);
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
  }

  & .suggestion-box .auto-item:focus,
  & .suggestion-box .auto-item:hover {
    background-color: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    color: white;
  }

  & .suggestion-box .auto-item.active {
    color: white;
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    background-color: var(--button-color, dodgerblue);
  }

  & .hyper-name {
    display: flex;
    overflow: hidden;
  }

  & .file-name {
    white-space: nowrap;
    padding-right: 2rem;
  }

  & .hyper-sentence {
    white-space: nowrap;
    margin-left: auto;
    overflow: hidden;
    color: rgba(255,255,255,.65);
  }

  & .application {
    border: none;
    border-radius: 0;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px;
    border-radius: 0;
    background: transparent;
    padding: 0;
  }

  & .application .nonce-icon {
    width: calc(2rem + 3px);
    height: calc(2rem + 3px);
  }

  & .application > span {
    display: flex;
  }
  & .application sl-icon {
    background: lemonchiffon;
    color: saddlebrown;
    padding: 8px;
  }

  & .app-name {
    border-radius: 0;
    font-size: .8rem;
    line-height: 1;
    border: none;
    width: auto;
    display: inline-block;
    max-width: 100%;
    width: 100%;
    color: saddlebrown;
    background: transparent;
  }

  & .app-name[disabled] {
    opacity: 1;
  }

  & .irix-launcher {
    display: flex;
    flex-direction: column;
    padding: 4px;
    gap: 4px;
    justify-items: center;
  }
`)

$.when('pointerdown', 'canvas', start)

function start(e) {
  e.preventDefault()
  const { grabbing } = this.read($)
  if(grabbing) return
  const { canvas, rectangle } = engine(e.target)
  const context = canvas.getContext('2d')
  let startX, startY, x, y;
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    startX = e.touches[0].clientX - rectangle.left
    startY = e.touches[0].clientY - rectangle.top
  } else {
    startX = e.clientX - rectangle.left
    startY = e.clientY -rectangle.top
  }

  x = 0
  y = 0

  write($, { startX, startY, isMouseDown: true, x, y })
}

$.when('pointermove', 'canvas', move)

function move (e) {
  e.preventDefault()
  const { startX, isMouseDown, startY, grabbing } = this.read($)
  if(grabbing) return
  const { canvas, rectangle } = engine(e.target)
  const context = canvas.getContext('2d')
  if (!isMouseDown) return

  let x, y
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    x = e.touches[0].clientX - startX - rectangle.left
    y = e.touches[0].clientY - startY - rectangle.top
  } else {
    x = e.clientX - startX - rectangle.left
    y = e.clientY - startY - rectangle.top
  }
  write($, { x, y, invertX: x < 0, invertY: y < 0 })
}

$.when('click', '.tray-wake', wake)
function wake (event) {
  event.preventDefault()
  const { trayZ=1 } = this.read($)
  const newZ = trayZ + 1
  const { tray } = event.target.dataset
  write($, { trayZ: newZ, focusedTray: tray })
  setState(tray, { z: newZ })
}
$.when('pointerup', 'canvas', end)
function end (e) {
  e.preventDefault()
  const { grabbing } = this.read($)
  if(grabbing) return
  const { focusedTray, trayZ=1, startX, x, y, invertX, invertY, startY } = this.read($)
  const { canvas, rectangle } = engine(e.target)
  const context = canvas.getContext('2d')

  const tray = self.crypto.randomUUID()
  write($, {
    focusedTray: tray
  })

  write($, {
    trays: tray
  }, function mergeTrays(node, data, key) {
    const edge = node.get(key)
    edge.get(data[key]).put(true)
  })

  const width = Math.max(300, Math.abs(x))
  const height = Math.max(150, Math.abs(y))
  setState(tray, {
    width,
    height,
    x: invertX ? startX + x : startX,
    y: invertY ? startY + y : startY,
    z: trayZ + 1,
    url: `about:blank`
  })

  write($, { startX: null, startY: null, isMouseDown: false, x: 0, y: 0 })
};

const tags = ['TEXTAREA', 'INPUT']
let sel = []
function saveCursor(target) {
  if(target.contains(document.activeElement)) {
    target.dataset.paused = document.activeElement.name
    if(tags.includes(document.activeElement.tagName)) {
      const textarea = document.activeElement
      sel = [textarea.selectionStart, textarea.selectionEnd];
    }
  } else {
    target.dataset.paused = null
  }
}

function replaceCursor(target) {
  const paused = target.querySelector(`[name="${target.dataset.paused}"]`)
  
  if(paused) {
    paused.focus()

    if(tags.includes(paused.tagName)) {
      paused.selectionStart = sel[0];
      paused.selectionEnd = sel[1];
    }
  }
}

function launchTray(event) {
  event.preventDefault()
  const { tray } = event.target.dataset
  let { buffer, url } = this.read($)[tray]
  buffer ||= url
  url = buffer.startsWith('/')
    ? buffer
    : buffer.indexOf('://')
      ? buffer
      : '/app/giggle-search?query=' + buffer


  if(url === 'about:blank') {
    window.top.location.href = window.location.href 
  } else {
    window.top.location.href = url 
  }
}

function preventDefault(e) { e.preventDefault() }
$.when('contextmenu', '.tray-title-bar', preventDefault)
$.when('pointerdown', '.tray-title-bar', grab)
$.when('pointerdown', '.tray-resize', resize)

$.when('pointermove', 'canvas', drag)
$.when('pointermove', '.tray-title-bar', drag)
$.when('pointermove', '.tray-resize', drag)

$.when('dblclick', '.tray-title-bar', toggleMax)
$.when('click', '.tray-maxer', toggleMax)
$.when('pointerup', 'canvas', ungrab)
$.when('pointerup', 'canvas', unresize)
$.when('pointerup', '.tray-title-bar', ungrab)
$.when('pointerup', '.tray-resize', unresize)
$.when('click', '.tray-close', closeTray)
$.when('click', '.tray-sync', syncTray)
$.when('click', '.tray-launch', launchTray)
$.when('click', '.tray-toggle', toggleMin)


