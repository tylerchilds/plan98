import Self from '@plan98/elf'
import { showModal } from './plan98-modal.js'
import { toast } from './plan98-toast.js'
import $paperPocket, { getTheme, afterUpdateTheme } from './paper-pocket.js'
import { updateDraft } from './time-machine.js'

import { get, put } from './plan98-wallet.js'

let lineWidth = 0
let isMousedown = false
let points = []
const thicknoids = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 9001, 9002, 9004, 9008]
const overlays = { color: 'color', share: 'share' }

const $ = Self('sketch-pad', {
  strokeHistory: [],
  strokeRevisory: [],
  background: '#54796d',
  color: 'white',
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
    const { overlay } = $.ear()
    if(target.overlay !== overlay) {
      target.dataset.overlay = overlay
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
  target.innerHTML = `
    <div class="palette">
      <div class="menu-item">
        <button data-menu-target="edit">
          <plan98-icon></plan98-icon>
        </button>
        <div class="palette-items" data-menu="edit">
          <button data-tooltip="Change the stroke color" data-stroke-color><span class="color-sample"></span>Color</button>
          <button data-tooltip="Toggle thicknoid options" data-drawer="size">Size</button>
          <div>
            <div data-pocket="size">
              ${thicknoids.map(x => `
                <button data-tooltip="Set thicknoid to ${x}" data-thickness="${x}">${x}</button>
              `).join('')}
            </div>
          </div>
          <hr>
          <button data-tooltip="backstep reality by a single step" data-undo>Undo</button>
          <button data-tooltip="tock the reality clock by a tick"  data-redo>Redo</button>
          <hr>
          <button data-tooltip="Collaborate across the planet!"  data-share>Share</button>
          <button data-tooltip="Save this sketck to your most recent memex" data-save>Save</button>
          <button data-tooltip="Seek help from the premium gods" data-help>
            Help
          </button>
          <button data-tooltip="Don't ask where your mind exists" data-journal>Quit</button>
          <hr>
          <button data-tooltip="Where's ur stuff at and in" data-wallet>Quit to Wallet</button>
          <button data-tooltip="Always question everything" data-shell>Quit to Shell</button>
          <button data-tooltip="Surf the files in the system" data-files>Quit to Files</button>
          <button data-tooltip="What is a mobile device by a pocket sized imagination" data-mobile>Quit to Mobile</button>
          <button data-tooltip="A metaphor as timeless as the desk itself" data-desktop>Quit to Desktop</button>
          <button data-tooltip="For the gamers on the go with all the buttons broke" data-handheld>Quit to Handheld</button>
          <button data-tooltip="For when you're not alone and want t/o jam through phones" data-console>Quit to Console</button>
          <hr>
          <button data-tooltip="Consider changing your current reality" data-escape>Escape to Local Context</button>
          <button data-tooltip="Consider changing our current reality" data-plan98>Escape to Global Context</button>
          <button data-tooltip="Consider saving all forms of reality" data-violin>Escape to Violin</button>
          <button data-tooltip="Consider rebooting reality from scratch" data-prequel>Escape to Prequels</button>
          <hr>
          <button data-tooltip="Securely Enter Admin Area" data-admin>Admin</button>
          <hr>
          <button data-tooltip="If you know any unix systems at all, be amused; the elves are in the computer-- in the computer!!!" data-crichton>Mike Backes Edition (Zoolander, click here!)</button>
          <hr>
          <img src="/public/cdn/sillyz.computer/self-portrait.jpeg">
          <hr>
          <button data-new data-tooltip="Wipe the board clean">New</button>
        </div>
      </div>
    </div>
    <div class="overlays">
      <div class="overlay-color">
        <plan98-palette></plan98-palette>
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

  const src = target.getAttribute('src')
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
          $.teach({ strokeHistory, strokeRevisory })
          redraw(target)
        })
      }
    })
  }
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
  $.teach({
    overlay: null,
    viewMetadata: false,
    activeMenu: null
  })
})

$.hand('input', 'plan98-palette', (event) => {
  const { color } = event.detail
  $.mouth({ color, overlay: 'none' })
})

$.hand('click', '[data-help]', function  (event) {
  event.preventDefault()
  window.location.href = "/?world=thelanding.page"
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
    display: block;
    background: rgba(255,255,255,.1);
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
`)

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
