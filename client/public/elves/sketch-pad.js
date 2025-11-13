import Self from '@plan98/elf'
import diffHTML from 'diffhtml'
import { showModal } from './plan98-modal.js'
import { toast } from './plan98-toast.js'
import $paperPocket, { getTheme, afterUpdateTheme } from './paper-pocket.js'
import { updateDraft } from './time-machine.js'
import { checkButton, checkAxis } from './debug-gamepads.js'

import { get, put } from './plan98-wallet.js'

let lineWidth = 0
let isMousedown = false
let points = []
const thicknoids = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 9001, 9002, 9004, 9008]
const overlays = { preview: 'preview', chat: 'chat', color: 'color', share: 'share' }

const porlock = [
  'In Xanadu did Kubla Khan and Kubla Khan found Alph.',
  'Now, Alph is a river that slips as it slithers,',
  'while time is adjacent to space ever so nascent,',
  'that water flows upwards and downwards at once.',
  'A story unfolded as it was tolded, a bardly dulcimer,',
  'Beginning unkindly, the realms sent war to her,',
  'Assuming the jester for heightened bemusement, she rang',
  'whole kingdoms now circused in total amusement, she sang',
  'Over and over she keeps thwarting their efforts,',
  "How? Space is a construct, she's throwing a concert,",
  'that fits in her pocket, on paper as finite as self,',
  'it sounds somewhat silly: time is a gift of the elves.',
]

const modes = {
  welcome: 'welcome',
}
const $ = Self('sketch-pad', {
  preview: { alpha: null, beta: null, gamma: null },
  activeMenu: null,
  mode: modes.welcome,
  strokeHistory: [],
  strokeRevisory: [],
  background: 'lemonchiffon',
  color: 'dodgerblue',
  drawer: 'size',
  thickness: 4
})

function engine(target) {
  const root = target.closest($.link)
  const canvas = root.querySelector('canvas')
  const rectangle = canvas.getBoundingClientRect()

  return {
    canvas,
    rectangle,
    src: root.getAttribute('src')
  }
}

function audioFactory(url) {
  const audioPool = [];
  const poolSize = 3;
  let poolIndex = 0;

  // Initialize pool
  for (let i = 0; i < poolSize; i++) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.load();
      audioPool.push(audio);
  }

  return function play() {
      const sound = audioPool[poolIndex];
      sound.currentTime = 0; // Reset to start
      sound.play().catch(e => console.log('Play failed:', e));

      // Cycle through pool
      poolIndex = (poolIndex + 1) % poolSize;
  }
}

const playSwipeSound = audioFactory('/public/cdn/sillyz.computer/beat-tape-extractor/output/a.mp3')
const playStuckSound = audioFactory('/public/cdn/sillyz.computer/beat-tape-extractor/output/b.mp3')

$.head(target => {
  if(target.innerHTML) {
    requestAnimationFrame(() => update(target))
    return null
  }
  mount(target)
})

function update(target) {
  const { strokeHistory, strokeRevisory } = $.ear()
  {
    afterUpdateTheme($paperPocket, target)

    if(target.strokeHistoryLength !== strokeHistory.length || target.strokeRevisoryLength !== strokeRevisory.length) {
      target.strokeHistoryLength = strokeHistory.length
      target.strokeRevisoryLength = strokeRevisory.length
      redraw(target)
    }
  }

  {
    const { touching } = $.ear()
    target.dataset.touching = touching
  }

  {
    const { thickness } = $.ear()
    target.dataset.size = thickness
  }

  {
    const { color } = $.ear()
    if(target.color !== color) {
      target.style.setProperty('--active-color', color)
    }
  }

  {
    const { drawer } = $.ear()
    target.dataset.drawer = drawer
  }

  {
    const { overlay, preview, image } = $.ear()
    if(target.overlay !== overlay) {
      target.dataset.overlay = overlay
    }

    if(overlay === overlays.preview) {
      const node = target.querySelector('.overlay-preview')

      console.log({preview})
      diffHTML.innerHTML(node, `
        <div class="background" style="height: 100%; transform-style: preserve-3d; --rotation-of-x-axis: ${preview.beta};--rotation-of-y-axis: ${preview.gamma};--rotation-of-z-axis: ${preview.alpha};">
          <div class="foreground" style="height: 50vmin; aspect-ratio: 1; transform: rotateX(var(--rotate-of-x-axis, 30deg)) rotateY(var(--rotate-of-y-axis, 30deg)) rotateZ(var(--rotate-of-z-axis, 30deg))">
            <was-image src="${image}" style="display: block;"></was-image>
          </div>
        </div>
      `)
    }
  }

  { // menu items
    const { activeMenu } = $.ear()
    const currentlyActive = target.querySelector('[data-menu-target].active')
    if(currentlyActive) {
      currentlyActive.classList.remove('active')
    }
    const activeItem = target.querySelector(`[data-menu-target="${activeMenu}"]`)
    if(activeItem) {
      activeItem.classList.add('active')
    }
  }
}

function mount(target) {
  const src = target.getAttribute('src')
  if(!src) {
    const now = new Date();
    const timestamp = now.toJSON()
    target.setAttribute('src', `/private/${$.link}/${timestamp}.json`)
  }
  target.innerHTML = `
    <div class="palette">
      <div class="menu-item">
        <button data-menu-target="edit">
          <plan98-icon></plan98-icon>
        </button>
        <div class="palette-items" data-menu="edit">
          <button data-stroke-color class="bookended-label">
            <span class="color-sample"></span>
            <span>Color</span>
            <span data-tooltip="Change the stroke color">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-drawer="size">
            Size
            <span data-tooltip="Toggle thicknoid options">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <div>
            <div data-pocket="size">
              ${thicknoids.map(x => `
                <button data-tooltip="Set thicknoid to ${x}" data-thickness="${x}">
                  ${x}
                </button>
              `).join('')}
            </div>
          </div>
          <hr>
          <button data-undo>
            Undo
            <span data-tooltip="backstep reality by a single step">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-redo>
            Redo
            <span data-tooltip="tock the reality clock by a tick">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <button data-share>
            Share
            <span data-tooltip="Collaborate across the planet!">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-save>
            Save
            <span data-tooltip="Save this sketck to your most recent memex">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-buy>
            Purchase
            <span data-tooltip="Seek help from the premium gods">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-help>
            Help
            <span data-tooltip="Seek help from chat">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-journal>
            Quit
            <span data-tooltip="Don't ask where your mind exists">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <button data-wallet>
            Quit to Wallet
            <span data-tooltip="Where's ur stuff at and in">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-shell>
            Quit to Shell
            <span data-tooltip="Always question everything">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-files>
            Quit to Files
            <span data-tooltip="Surf the files in the system">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-mobile>
            Quit to Mobile
            <span data-tooltip="What is a mobile device by a pocket sized imagination">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-desktop>
            Quit to Desktop
            <span data-tooltip="A metaphor as timeless as the desk itself">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-handheld>
            Quit to Handheld
            <span data-tooltip="For the gamers on the go with all the buttons broke">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-console>
            Quit to Console
            <span data-tooltip="For when you're not alone and want t/o jam through phones">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <button data-escape>
            Escape to Local Context
            <span data-tooltip="Consider changing your current reality">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-plan98>
            Escape to Global Context
            <span data-tooltip="Consider changing our current reality">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-violin>
            Escape to Violin
            <span data-tooltip="Consider saving all forms of reality">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <button data-prequel>
            Reboot the Prequel
            <span data-tooltip="Consider rebooting reality from scratch">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <button data-admin>
            Admin
            <span data-tooltip="Securely Enter Admin Area">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <button data-crichton>
            Mike Backes Edition
            <span data-tooltip="If you know any unix systems at all, be amused; the elves are in the computer-- in the computer!!!">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <button data-enable-gyro>
            Enable Gyroscope
            <span data-tooltip="Re-project your hand as a wand like a whizz">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-enable-preview>
            Enable Preview
            <span data-tooltip="See how a hand actually works">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <img src="/public/cdn/sillyz.computer/self-portrait.jpeg">
          <hr>
          <button data-new>
            New
            <span data-tooltip="Wipe the board clean">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
        </div>
      </div>
    </div>
    <div class="overlays">
      <div class="overlay-preview"><!--will be swapped --></div>
      <div class="overlay-color">
        <plan98-palette></plan98-palette>
      </div>
      <div class="overlay-chat">
        <cool-chat></cool-chat>
        <div class="action-wrapper">
          <button data-close class="standard-button bias-generic -small -round" type="reset">
            <sl-icon name="x-lg"></sl-icon>
          </button>
        </div>
      </div>
      <div class="overlay-share">
        ${share(target)}
      </div>
    </div>
  `

  const canvas = document.createElement('canvas')
  self.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    canvas.width = self.innerWidth;
    canvas.height = self.innerHeight;
    const context = canvas.getContext('2d')
    context.fillStyle = $.ear().background
    context.fillRect(0, 0, canvas.width, canvas.height)
    redraw(target)
  }

  target.appendChild(canvas)
  update(target)
  resizeCanvas();

  if(src) {
    get(src).then(blob => {
      if(blob) {
        blob.text().then(str => JSON.parse(str)).then(data => {
          let strokeHistory = []
          if(data.strokeHistory) {
            strokeHistory = data.strokeHistory
          }

          let strokeRevisory = []
          if(data.strokeRevisory) {
            strokeRevisory = data.strokeRevisory
          }
          $.mouth({ strokeHistory, strokeRevisory })
          redraw(target)
        })
      }
    })
  }

  const id = target.id
  requestAnimationFrame(systemLoop.bind({ id }))
}

const requestIdleCallback = window.requestIdleCallback || function (fn) { setTimeout(fn, 1) };

/**
 * This function takes in an array of points and draws them onto the canvas.
 * @param {array} stroke array of points to draw on the canvas
 * @return {void}
 */
function drawOnCanvas (target, stroke) {
  const { canvas } = engine(target)
  const context = canvas.getContext('2d')
  context.strokeStyle = stroke.color
  context.lineCap = 'round'
  context.lineJoin = 'round'

  const l = stroke.length - 1
  if (stroke.length >= 3) {
    const xc = (stroke[l].x + stroke[l - 1].x) / 2
    const yc = (stroke[l].y + stroke[l - 1].y) / 2
    context.lineWidth = stroke[l - 1].lineWidth
    context.quadraticCurveTo(stroke[l - 1].x, stroke[l - 1].y, xc, yc)
    context.stroke()
    context.beginPath()
    context.moveTo(xc, yc)
  } else {
    const point = stroke[l];
    context.lineWidth = point.lineWidth
    context.strokeStyle = point.color
    context.beginPath()
    context.moveTo(point.x, point.y)
    context.stroke()
  }
}

$.when('click', '[data-root]', (event) => {
  $.mouth({
    overlay: null,
    viewMetadata: false,
    activeMenu: null
  })
})

$.hand('input', 'plan98-palette', (event) => {
  const { color } = event.detail
  $.mouth({ color, overlay: 'none' })
})

$.hand('click', '[data-buy]', function  (event) {
  event.preventDefault()
  window.location.href = "/?world=thelanding.page"
})

$.hand('click', '[data-close]', function  (event) {
  event.preventDefault()
  $.mouth({
    overlay: null,
    activeMenu: null,
  })
})

$.hand('click', '[data-help]', function  (event) {
  event.preventDefault()
  $.mouth({
    overlay: overlays.chat,
    activeMenu: null,
  })
})

$.hand('click', '[data-stroke-color]', function  (event) {
  event.preventDefault()
  $.mouth({
    overlay: overlays.color,
    activeMenu: null,
  })
})

$.hand('click', '[data-share]', function  (event) {
  event.preventDefault()
  $.mouth({
    overlay: overlays.share,
    activeMenu: null,
  })
})


$.hand('click', '[data-drawer]', function  (event) {
  event.preventDefault()
  const { drawer } = event.target.dataset
  $.mouth({ drawer: drawer === $.ear().drawer ?null:drawer })
})

$.hand('click', '[data-thickness]', function  (event) {
  event.preventDefault()
  $.mouth({
    thickness: parseInt(event.target.dataset.thickness) || 1
  })
})


$.hand('click', '[data-journal]', function  (event) {
  event.preventDefault()
  window.location.href = '/?world=shirtflicks.app'
})

$.hand('click', '[data-wallet]', function  (event) {
  event.preventDefault()
  window.location.href = `/app/plan98-wallet`
})

$.hand('click', '[data-shell]', function  (event) {
  event.preventDefault()
  const id = event.target.closest($.elf).id
  window.location.href = `/app/ur-shell?id=${id}`
})

$.hand('click', '[data-files]', function  (event) {
  event.preventDefault()
  const id = event.target.closest($.elf).id
  window.location.href = `/app/file-surf?id=${id}`
})


$.hand('click', '[data-mobile]', function  (event) {
  event.preventDefault()
  const id = event.target.closest($.elf).id
  window.location.href = `/app/mobile-device?id=${id}`
})

$.hand('click', '[data-desktop]', function  (event) {
  event.preventDefault()
  const id = event.target.closest($.elf).id
  window.location.href = `/app/door-man?id=${id}`
})

$.hand('click', '[data-handheld]', function  (event) {
  event.preventDefault()
  const id = event.target.closest($.elf).id
  window.location.href = `/app/paper-pocket?id=${id}`
})

$.hand('click', '[data-console]', function  (event) {
  event.preventDefault()
  const id = event.target.closest($.elf).id
  window.location.href = `/app/couch-coop?id=${id}`
})

$.hand('click', '[data-escape]', function  (event) {
  event.preventDefault()
  const id = event.target.closest($.elf).id
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
})

$.hand('click', '[data-plan98]', function  (event) {
  event.preventDefault()
  window.location.href = '/?world=plan98.org'
})

$.hand('click', '[data-admin]', function  (event) {
  event.preventDefault()
  window.location.href = '/admin/'
})

$.hand('click', '[data-crichton]', function  (event) {
  event.preventDefault()
  window.location.href = '/app/generic-park?src=/public/elves'
})



$.hand('click', '[data-violin]', function  (event) {
  event.preventDefault()
  window.location.href = '/app/tiniest-violin'








  // the tanka of the tiniest violin

  // Fixing the tiniest violin is the easiest trick in the book. All you do is delete four forward slashes. That's it.

  ////

})

$.hand('click', '[data-prequel]', function  (event) {
  event.preventDefault()
  window.location.href = '/app/hello-elvish?elf=saga-crawler'
})



function share(target) {
  const { viewMetadata } = $.ear()
  const shareLink = `${window.location.origin}/app/${$.link}?id=${target.closest($.link).id}`
  const copyId = self.crypto.randomUUID()

  const actionArea = `
    <div class="action-area">
      <div class="action-bar">
        <button data-copy="${copyId}" class="standard-button -round -large">
          <sl-icon name="copy"></sl-icon>
        </button>
      </div>
      <div id="${copyId}" class="share-link-copyable-url standard-input -small">${shareLink}</div>
    </div>
  `

  return `
    <div class="overlay-background">
      <div class="form-card">
        <div class="draft-template">
          <div class="draft-header">
            <div style="display: grid; place-content: start">
              <button class="standard-button bias-generic -small -round" data-toggle-metadata="${viewMetadata ? 'on':'off'}">
                <sl-icon name="gear-fill"></sl-icon>
              </button>
            </div>
            ${actionArea}
            <div style="display: grid; place-content: end">
              <button data-root class="standard-button bias-generic -small -round" type="reset">
                <sl-icon name="x-lg"></sl-icon>
              </button>
            </div>
          </div>

          <div class="memex-body draft-body">
            <div class="overlay-background">
              <div style="padding: 51px; height: 100%; display: flex;">
                <qr-code src="${shareLink}" style="width: 75vmin; height: 75vmin;" target="_top"></qr-code>
              </div>
            </div>
          </div>
          <div class="draft-metadata">
            <div class="overlay-background" style="overflow: auto;">
              <div class="wizard">
                <label class="field">
                  <span class="label">Description</span>
                  <textarea data-bind="memex" name="description" style="height: 12rem;" value="${escapeHyperText('ok')}"></textarea>
                </label>
                <label class="field">
                  <span class="label">Host</span>
                  <input data-bind="draft" name="host" value="${escapeHyperText('okay') || ''}" />
                </label>
              </div>
            </div>
          </div>
          <div class="draft-footer">
            <input class="standard-input -small" data-bind="memex"  name="title" value="${escapeHyperText('okay')}" type="text"/>
            <button data-action="memex" class="standard-button bias-positive -small" type="submit">
              <sl-icon name="check-lg"></sl-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

$.hand('click', '[data-copy]', async (event) => {
  const { copy } = event.target.dataset
  const target = event.target.closest($.link).querySelector(`[id="${copy}"]`)

  try {
    // Modern approach using Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(target.textContent)
      toast("Copied to clipboard")
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = target.textContent
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
        toast("Copied to clipboard")
      } catch (err) {
        console.error('Fallback: Failed to copy', err)
        toast("Failed to copy")
      }

      document.body.removeChild(textArea)
    }
  } catch (err) {
    console.error('Failed to copy text: ', err)
    toast("Failed to copy")
  }
})


$.hand('click', '[data-share]', ({ target }) => share(target))
$.hand('click', '[data-save]', ({ target }) => publish(target))

function snapshot(target) {
  const { canvas, src } = engine(target)
  const { strokeHistory, strokeRevisory } = $.ear()
  const dataURL = canvas.toDataURL('image/jpeg');
  const byteCharacters = atob(dataURL.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const now = new Date();
  const timestamp = now.toJSON()
  const image = `/private/${$.link}/${timestamp}.jpg`

  const data = { src: image, strokeHistory, strokeRevisory }

  console.log({ data })

  // Attempt to upload to server
  put(image, byteArray, { type: 'image/jpeg' }).then(res => {
    if(res.ok) {
      updateDraft(data)
      $.mouth({ image })
    } else {
      throw new Error('Upload failed')
    }
  })

}

function publish (target) {
  const { canvas, src } = engine(target)
  // Get current date and time for filename
  const now = new Date();
  const timestamp = now.toJSON()

  // Convert canvas to data URL with JPEG format
  const dataURL = canvas.toDataURL('image/jpeg');
  // Fallback: create a download link
  const link = document.createElement('a');
  link.download = `${timestamp}.jpg`;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  $.mouth({ activeMenu: null })
}

$.hand('click', '[data-new]', function (event) {
  event.preventDefault()
  $.mouth({ activeMenu: null, strokeHistory: [], strokeRevisory: [] })
  redraw(event.target)
})

$.hand('click', '[data-download]', function (event) {
  event.preventDefault()
  const { canvas } = engine(event.target)
  const now = new Date();
  const timestamp = now.toJSON()
  const dataURL = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.download = `${timestamp}.jpg`;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  $.mouth({ activeMenu: null })
})

/**
 * Remove the previous stroke from history and repaint the entire canvas based on history
 * @return {void}
 */
$.hand('click', '[data-undo]', function undoDraw (event) {
  event.preventDefault()
  const { strokeHistory } = $.ear()
  if(strokeHistory.length === 0) {
    return
  }

  $.mouth({}, (state, _payload) => {
    const newState = { ...state }
    const stroke = newState.strokeHistory.pop()
    newState.strokeRevisory.unshift(stroke)
    return {
      ...newState
    }
  })
  redraw(event.target)
})

function redraw(target) {
  const { strokeHistory } = $.ear()
  const { canvas, src } = engine(target)
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = $.ear().background
  context.fillRect(0, 0, canvas.width, canvas.height)

  strokeHistory.map(function (stroke) {
    if (strokeHistory.length === 0) return

    context.beginPath()

    let strokePath = [];
    stroke.map(function (point) {
      strokePath.push(point)
      drawOnCanvas(target, strokePath)
    })
  })

  if(src) {
    snapshot(target)
  }
}

$.hand('click', '[data-redo]', function redoDraw (event) {
  event.preventDefault()
  const { strokeRevisory } = $.ear()
  if(strokeRevisory.length === 0) return


  $.mouth({}, (state, _payload) => {
    const newState = { ...state }
    const stroke = newState.strokeRevisory.shift()
    newState.strokeHistory.push(stroke)
    return {
      ...newState
    }
  })

  redraw(event.target)
})


$.hand('touchstart', 'canvas', start)
$.hand('mousedown', 'canvas', start)

function start(e) {
  const { canvas, rectangle } = engine(e.target)
  $.mouth({ touching: true, activeMenu: null })
  const { thickness } = $.ear()
  const context = canvas.getContext('2d')
  let pressure = 0.1;
  let x, y;
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    if (e.touches[0]["force"] > 0) {
      pressure = e.touches[0]["force"]
    }
    x = e.touches[0].clientX - rectangle.left
    y = e.touches[0].clientY - rectangle.top
  } else {
    pressure = 1.0
    x = e.clientX - rectangle.left
    y = e.clientY - rectangle.top
  }

  isMousedown = true

  lineWidth = Math.log(pressure + 1) * thickness
  context.lineWidth = lineWidth// pressure * 50;

  points.push({ x, y, lineWidth })
  drawOnCanvas(e.target, points)
}

$.hand('touchmove', 'canvas', move)
$.hand('mousemove', 'canvas', move)

function move (e) {
  e.preventDefault()
  const { canvas, rectangle } = engine(e.target)
  const { thickness, color } = $.ear()
  const context = canvas.getContext('2d')
  if (!isMousedown) return

  let pressure = 0.1
  let x, y
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    if (e.touches[0]["force"] > 0) {
      pressure = e.touches[0]["force"]
    }
    x = e.touches[0].clientX - rectangle.left
    y = e.touches[0].clientY - rectangle.top
  } else {
    pressure = 1.0
    x = e.clientX - rectangle.left
    y = e.clientY - rectangle.top
  }

  // smoothen line width
  lineWidth = (Math.log(pressure + 1) * thickness * 4 * 0.2 + lineWidth * 0.8)
  points.push({ x, y, lineWidth, color })

  drawOnCanvas(e.target, points);

  requestIdleCallback(() => {
    $.mouth({ pressure })

    const touch = e.touches ? e.touches[0] : null
    if (touch) {
      $.mouth({
        touchesHTML: `
          touchType = ${touch.touchType} ${touch.touchType === 'direct' ? '👆' : '✍️'} <br/>
          radiusX = ${touch.radiusX} <br/>
          radiusY = ${touch.radiusY} <br/>
          rotationAngle = ${touch.rotationAngle} <br/>
          altitudeAngle = ${touch.altitudeAngle} <br/>
          azimuthAngle = ${touch.azimuthAngle} <br/>
        `
      })
    }
  })
}

$.hand('touchend', 'canvas', end)
$.hand('touchleave', 'canvas', end)
$.hand('mouseup', 'canvas', end)
function end (e) {
  const { src, canvas, rectangle } = engine(e.target)
  $.mouth({ touching: false })
  const context = canvas.getContext('2d')
  let pressure = 0.1;
  let x, y;

  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    if (e.touches[0]["force"] > 0) {
      pressure = e.touches[0]["force"]
    }
    x = e.touches[0].clientX - rectangle.left
    y = e.touches[0].clientY - rectangle.top
  } else {
    pressure = 1.0
    x = e.clientX - rectangle.left
    y = e.clientY - rectangle.top
  }

  isMousedown = false

  $.mouth(points, (state, payload) => {
    const newState = { ...state }
    newState.strokeHistory.push([...payload])
    return {
      ...newState
    }
  })

  points = []

  lineWidth = 0
};

const paneByTarget = (target) => {
  const { id } = target.closest('window-pane')
  return paneById(id)
}


function setState(tray, payload) {
  $.mouth(payload, {
    mergeHandler: mergeByTray,
    parameters: [tray]
  })
}

function mergeByTray(state) {
  return {
    ...state,
    [tray]: {
      ...state[tray],
      ...payload
    }
  }
}

$.hand('mousedown', '.tray-title-bar', grab)
$.hand('mousemove', '.tray-title-bar', drag)
$.hand('mouseup', '.tray-title-bar', ungrab)
$.hand('mouseout', '.tray-title-bar', ungrab)
$.hand('input', '.picker', setColor)
$.hand('click', '.tray-close', closeTray)

function setColor(event) {
  event.preventDefault()
  const { target } = event.target.dataset
  const { value } = event.target

  $.mouth({ [target]: value })
  redraw(event.target)
}

function closeTray(event) {
  event.preventDefault()
  const { tray } = event.target.dataset
  setState(tray, { visible: false })
}

// grab a pane
function grab({ target }) {
  const { tray } = event.target.dataset
  const { z } = $.ear()[tray]
  const { trayZ } = $.ear()
  const newZ = trayZ + 1

  setState(tray, { grabbed: true, z: newZ })
  $.mouth({ trayZ: newZ })
}

// drag a pane
function drag(event) {
  const { target, movementX, movementY } = event

  const { tray } = target.dataset
  const { grabbed, x, y } = $.ear()[tray]

  if(grabbed) {
    setState(tray, {
      x: x + movementX,
      y: y + movementY
    })
  }
}

// release a pane
function ungrab({ target }) {
  const { tray } = target.dataset
  setState(tray, { grabbed: false })
}

$.eye(`
  & {
    display: block;
    height: 100%;
    position: relative;
    z-index: 1;
    overflow: hidden;
    touch-action: manipulation;
    user-select: none; /* supported by Chrome and Opera */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
  }

  & canvas {
    height: 100%;
  }

  &[data-touching="true"] .palette {
    pointer-events: none;
    opacity: .15;
    transition: opacity 1000ms ease-in-out;
  }

  & hr {
    border-top: 1px solid rgba(255,255,255, .15);
    margin: .25rem 0;
  }

  & .palette {
    z-index: 10;
    background: var(--active-color, black);
    position: absolute;
    top: 0;
    left: 0;
    right: auto;
    display: none;
    background: rgab(0,0,0,.85);
    transition: opacity 100ms ease-in-out;
  }

  @media screen {
    & {
      height: 100%;
      width: 100%;
      display: grid;
      grid-template-columns: 2rem 1fr;
    }

    & .palette {
      display: inline-block;
    }
  }

  & .palette button {
    background: transparent;
    color: rgba(255,255,255,.85);
    position: relative;
    z-index: 2;
    border: none;
    padding: 1rem;
    font-size: 1rem;
    --v-font-mono: 1;
    --v-font-casl: 0;
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    transition: background 200ms ease-in-out;
  }

  & .palette button > * {
    pointer-events: none;
  }

  & .palette button:focus,
  & .palette button.active,
  & .palette button:hover {
    background: rgba(255,255,255,.35);
  }

  & .menu-item {
    position: relative;
  }

  & .palette-items {
    display: none;
    background: black;
    z-index: 3;
    position: absolute;
    top: 40px;
    left: 40px;
    max-height: calc(100vh - 40px);
    max-width: calc(100vw - 40px);
    overflow: auto;
    padding-bottom: 80vh;
  }

  & [data-menu-target].active + .palette-items {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  & .palette-items  button {
    width: 100%;
    text-align: left;
    white-space: nowrap;
    font-size: 1rem;
    line-height: 1;
    display: inline-flex;
    padding: .5rem;
    gap: .5rem;
    text-align: left;
    background: rgba(255,255,255,.1);
    display: grid;
    grid-template-columns: 1fr auto;
  }

  & .palette-items  button > [data-tooltip] {
    pointer-events: all;
  }

  & .palette-items button.bookended-label {
    display: grid;
    grid-template-columns: auto 1fr auto;
  }

  & [data-pocket] {
    display: none;
    background: rgba(255,255,255,.25);
  }
  &[data-drawer="size"] [data-pocket="size"] {
    display: flex;
    max-width: 100%;
    overflow-x: auto;
  }

  ${thicknoids.map(x => `
    &[data-size="${x}"] [data-thickness="${x}"] {
      background: rgba(255,255,255,.85) !important;
      color: rgba(0,0,0,.85) !important;
    }
  `).join('')}

  & .overlays {
    display: grid;
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  & .overlays > * {
    display: none;
  }

  &[data-overlay="preview"] .overlays > .overlay-preview,
  &[data-overlay="chat"] .overlays > .overlay-chat,
  &[data-overlay="share"] .overlays > .overlay-share,
  &[data-overlay="color"] .overlays > .overlay-color {
    display: block;
    pointer-events: all;
    position: absolute;
    inset: 0;
    z-index: 100;
    background: white;
  }

  &[data-overlay="color"] .palette {
    display: none;
  }

  & .color-sample {
    width: .85rem;
    height: .85rem;
    background: var(--active-color, saddlebrown);
    border-radius: 100%;
    display: inline-block;
    margin-right: .5rem;
  }

  & .draft-header {
    display: grid;
    grid-template-columns: auto auto;
    grid-area: header;
    border-top: 1px solid rgba(0, 0, 0,.2);
    background: rgba(255,255,255,.85);
    padding: 4px;
    gap: .5rem;
    z-index: 10;
  }

  & .draft-body {
    grid-area: body;
  }

  & .draft-metadata {
    display: none;
    grid-area: body;
    z-index: 5;
    background: white;
    overflow: auto;
  }

  & .view-metadata {
    display: none;
    padding: .5rem;
    height: 100%;
    z-index: 5;
    background: linear-gradient(rgba(0,0,0,.05), rgba(0,0,0,.05)), white;
    grid-area: body;
  }

  &[data-show-metadata="true"] .draft-metadata,
  &[data-show-metadata="true"] .view-metadata {
    display: block;
  }

  &[data-show-metadata="true"] .action-area {
    display: none;
  }

  & .draft-footer {
    display: grid;
    grid-area: footer;
    padding: 4px .5rem;
    background: rgba(255,255,255,.85);
    color: rgba(0,0,0,.65);
    display: grid;
    gap: .5rem;
    z-index: 10;
    grid-template-columns: 1fr auto;
  }

  & .draft-content {
    grid-area: body;
    width: 100%;
    resize: none;
    border: 1px solid rgba(0,0,0,.15);
    padding: .5rem;
  }

  & .draft-title {
    color: rgba(0,0,0,.65);
    padding: .25rem .5rem;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & .time-form {
    display: flex;
    gap: .5rem;
    padding: .5rem;
    flex-wrap: wrap;
    place-content: end;
  }

  & .time-form-section {
    display: flex;
    gap: .25rem;
  }

  & .action-area {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 5;
    padding: .5rem;
    gap: .5rem;
    display: flex;
    flex-direction: column;
  }

  & .share-link-copyable-url {
    white-space: nowrap;
    overflow-x: auto;
    max-width: 320px;
    margin: 0 auto;
    display: block;
  }

  & .action-bar {
    text-align: center;
  }

  & .action-bar > button {
    pointer-events: all;
  }

  & .overlay-background {
    display: block;
    height: 100%;
    background: white;
    backdrop-filter: blur(2px);
    overflow: hidden;
  }

  & .draft-template {
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow: hidden;
    max-height: 100%;
    height: 100%;
    grid-template-areas: "header" "body" "footer";
    grid-template-columns: 1fr auto;
  }

  & .form-card {
    display: grid;
    background: white;
    box-shadow:
      0 0 6px 6px rgba(0,0,0,.05),
      0 0 3px 3px rgba(0,0,0,.10),
      0 0 1px 1px rgba(0,0,0,.15);

    height: 100%;
    overflow: hidden;
  }

  & .draft-footer,
  & [data-toggle-metadata] {
    display: none;
  }

  & .action-wrapper {
    position: absolute;
    top: 0;
    right: 0;
    place-self: start;
    pointer-events: none;
    padding: 4px;
    z-index: 2000;
  }

  & [data-close] * {
    pointer-events: none;
  }

  & .background {
    background: lime;
    padding: 2rem;
    display: grid;
    grid-template-rows: auto 1fr;
    place-content: center;
  }

  & .foreground {
    background: lemonchiffon;
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


$.hand('click', '[data-toggle-metadata]', (event) => {
  {
    const { viewMetadata } = $.ear()
    $.mouth({ viewMetadata: !viewMetadata })
  }
  {
    const { viewMetadata } = $.ear()
    event.target.dataset.toggleMetadata = viewMetadata ? 'on':'off'
    const root = event.target.closest($.link)
    root.dataset.showMetadata = viewMetadata
  }
})


/*
$.hand('pointerdown', '*', (event) => {
  if(event.target.closest('.menu-item')) {
    // child of a menu item
    return
  }
  $.mouth({ activeMenu: null })
})
*/

function escapeHyperText(text = '') {
  if(!text) return ''
  return text.replace(/[&<>'"]/g,
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}



$.hand('click', '[data-menu-target]', (event) => {
  event.preventDefault()
  const { activeMenu } = $.ear()
  const { menuTarget } = event.target.dataset
  $.mouth({ activeMenu: activeMenu === menuTarget ? null : menuTarget })
  event.stopImmediatePropagation()
})

const lastFrame = {
  a: false,
  b: false,
  x: false,
  y: false,
  down: false,
  up: false,
  left: false,
  right: false,
}

function streamFactory(key, handler) {
  return (value, id) => {
    toggleSpam(key, value, () => {
      handler(id)
    })
  }
}

const gamepadPorlockCycle = streamFactory('a', (id) => {
  porlockCycle()
})

function porlockCycle() {
  const { porlockIndex } = $.learn()
  let next = porlockIndex + 1

  if(next >= porlock.length) {
    next = 0
  }

  playSwipeSound()
  $.teach({ porlockIndex: next })
}

$.when('click', '[data-welcome-continue]', (event) => {
  porlockCycle()
})

function porlockSkip() {
  playSwipeSound()
  $.teach({ mode: modes.system })
}

$.when('click', '[data-welcome-skip]', (event) => {
  porlockSkip()
})

const gamepadPorlockSkip = streamFactory('b', (id) => {
  porlockSkip()
})

function systemLoop(time) {
  const { id } = this
  const { activeMenu, overlay, mode, porlockIndex } = $.ear()
  const player = {
    a: checkButton(0, 0),
    b: checkButton(0, 1),
    x: checkButton(0, 3),
    y: checkButton(0, 2),
    lb: checkButton(0, 4),
    rb: checkButton(0, 5),
    lt: checkButton(0, 6),
    rt: checkButton(0, 7),
    select: checkButton(0, 8),
    start: checkButton(0, 9),
    ls: checkButton(0, 10),
    rs: checkButton(0, 11),
    up: checkButton(0, 12),
    down: checkButton(0, 13),
    left: checkButton(0, 14),
    right: checkButton(0, 15),
    os: checkButton(0, 16),
  }

  if(mode === modes.welcome) {
    const streamOs = streamFactory('os', (id) => {

      if(overlay === overlays.color) {
        $.mouth({
          overlay: null,
          activeMenu: null,
        })
      } else {
        $.mouth({
          overlay: overlays.color,
          activeMenu: null,
        })
      }
      playSwipeSound()
    })

    const streamStart = streamFactory('start', (id) => {

      if(overlay === overlays.chat) {
        $.mouth({
          overlay: null,
          activeMenu: null,
        })
      } else {
        $.mouth({
          overlay: overlays.chat,
          activeMenu: null,
        })
      }
      playSwipeSound()
    })


    const streamSelect = streamFactory('select', (id) => {
      if(activeMenu === "edit") {
        $.mouth({
          overlay: null,
          activeMenu: null,
        })
      } else {
        $.mouth({
          overlay: null,
          activeMenu: "edit",
        })
      }
      playSwipeSound()
    })

    const streamUp = streamFactory('up', (id) => {
      playStuckSound()
      $.mouth({ porlockIndex: 0 })
    })
    const streamLeft = streamFactory('left', (id) => {
      let next = porlockIndex - 1

      if(next < 0) {
        next = 0
        playStuckSound()
      } else {
        playSwipeSound()
      }

      $.mouth({ porlockIndex: next })
    })

    const streamRight = streamFactory('right', (id) => {
      let next = porlockIndex + 1

      if(next >= porlock.length) {
        next = porlock.length - 1
        playStuckSound()
      } else {
        playSwipeSound()
      }

      $.mouth({ porlockIndex: next })
    })
    const streamDown = streamFactory('down', (id) => {
      playStuckSound()
      $.mouth({ porlockIndex: porlock.length - 1 })
    })

    gamepadPorlockCycle(player.a, id)
    gamepadPorlockSkip(player.b, id)
    streamOs(player.os, id)
    streamStart(player.start, id)
    streamSelect(player.select, id)
    streamUp(player.up, id)
    streamLeft(player.left, id)
    streamRight(player.right, id)
    streamDown(player.down, id)
  }

  requestAnimationFrame(systemLoop.bind(this))
}

$.when('click', '[data-enable-preview]', async function getOrientation(){
  $.mouth({
    overlay: overlays.preview,
    activeMenu: null,
  })
})

$.when('click', '[data-enable-gyro]', async function getOrientation(){
  if (!window.DeviceOrientationEvent || !window.DeviceOrientationEvent.requestPermission){
    return alert("Your current device does not have access to the DeviceOrientation event");
  }
 
  let permission = await window.DeviceOrientationEvent.requestPermission();
  if (permission !== "granted"){
    return alert("You must grant access to the device's sensor for this demo");
  }
})
 
window.addEventListener("deviceorientation", function(e){
  let requestBtn = document.querySelector("#get-orientation");
  if (requestBtn){requestBtn.remove();}
  
  const alpha = e.alpha.toFixed(1)+"deg"; //angle of motion around the Z axis
  const beta = e.beta.toFixed(1)+"deg"; //angle of motion around the X axis
  const gamma = e.gamma.toFixed(1)+"deg"; //angle of motion around the Y axis
  const orientation = Math.abs(e.beta) > Math.abs(e.gamma) ? "portrait" : "landscape";  

  console.log(e)

  const preview = {
    alpha,
    beta,
    gamma,
    orientation
  }

  $.mouth({ preview })
});
