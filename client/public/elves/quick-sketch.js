import Self from '@plan98/elf'
import { toast } from './plan98-toast.js'
import Cache from '@silly/cache'

let lineWidth = 0
let isMousedown = false
let points = []
const thicknoids = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 9001, 9002, 9004, 9008]
const overlays = {
  tutorial: 'tutorial',
  preview: 'preview',
  chat: 'chat',
  color: 'color',
  share: 'share',
  friends: 'friends',
  publish: 'publish',
  music: 'music',
}

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

const realityCounterWeights = {
  alpha: 90,
  beta: 90,
  gamma: 0,
}

const elf = 'quick-sketch'

const initialState = {
  preview: {
    alpha: -1 * realityCounterWeights.alpha+'deg',
    beta: 1 * realityCounterWeights.beta+'deg',
    gamma: 1 * realityCounterWeights.gamma+'deg',
  },
  activeMenu: null,
  overlay: overlays.tutorial,
  mode: modes.welcome,
  strokeHistory: [],
  strokeRevisory: [],
  background: 'lemonchiffon',
  color: 'dodgerblue',
  drawers: ['size', 'commands'],
  thickness: 4,
  attachments: []
}

const $ = Self(elf, initialState)

export default $

export function resetSketchPad(target) {
  $.mouth(initialState)
  redraw(target)
}

function engine(target) {
  const root = target.closest($.link)
  const canvas = root.querySelector('canvas')
  const rectangle = canvas.getBoundingClientRect()

  return {
    root,
    canvas,
    rectangle,
    src: root.getAttribute('src')
  }
}

$.head(target => {
  if(target.mounted) {
    if(!target.innerHTML) return
    requestAnimationFrame(() => update(target))
    return null
  }
  target.mounted = true
  mount(target)
})

function update(target) {
  const { strokeHistory, strokeRevisory } = $.ear()
  {
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
    const { drawers } = $.ear()
    target.dataset.drawers = drawers.join('+')
  }

  {
    const { overlay, preview, image } = $.ear()
    if(target.dataset.overlay !== overlay) {
      target.dataset.overlay = overlay

      if(overlay === overlays.publish) {
        const node = target.querySelector('.overlay-publish')
        node.innerHTML = publish(target)
      }
    }

    if(overlay === overlays.publish) {
      const node = target.querySelector('.overlay-publish')
      const fileListNode = target.querySelector('.file-list')

      const { title, attachments, messageText, messageHeight } = $.ear()

      const titleNode = node.querySelector('[name="title"]')
      const messageNode = node.querySelector('[name="messageText"]')

      if(messageHeight) {
        messageNode.style.height = messageHeight + 'px'
      } else {
        delete messageNode.style.height
      }

      updateField(titleNode, escapeHyperText(title))
      updateField(messageNode, escapeHyperText(messageText))

      if(attachments.length > 0) {
        fileListNode.innerHTML = attachments.map(x => {
          return `
            <div class="table">
              <div class="table-row">
                <div class="table-cell">
                  ${x.name}
                </div>
                <div class="table-cell">
                  ${formatBytes(x.size)}
                </div>
              </div>
            </div>
          `
        }).join('') 
      } else {
        fileListNode.innerHTML = `Select or drop files to upload`
      }
    }

    if(overlay === overlays.preview) {
      const node = target.querySelector('.overlay-preview')
      if(image !== target.image) {
        target.image = image
        node.innerHTML = `
          <div class="background">
            <div class="action-wrapper">
              <button data-close class="standard-button bias-generic -small -round" type="reset">
                <sl-icon name="x-lg"></sl-icon>
              </button>
            </div>
            <button data-journal class="foreground" style="transform-style: preserve-3d; height: 50vmin; aspect-ratio: 1; transform: rotateX(var(--rotation-of-x-axis, 30deg)) rotateY(var(--rotation-of-y-axis, 30deg)) rotateZ(var(--rotation-of-z-axis, 30deg)); overflow: hidden;">
              <cached-image key="${target.id}" src="${image}" style="transform: rotateZ(-45deg)"></cached-image>
            </button>
          </div>
        `
      } else {
        node.innerHTML = `
          <div class="action-wrapper">
            <button data-close class="standard-button bias-generic -small -round" type="reset">
              <sl-icon name="x-lg"></sl-icon>
            </button>
          </div>
          <div style="height: 100%;">
            Error:
            Experiencing connectivity issues with your storage.
            <a href="/app/time-machine">Try to recalibrate your memex in the time machine.</a>
          </div>
        `
      }

      const scene = node.querySelector('.background')
      if(scene) {
        scene.style = `height: 100%; --rotation-of-x-axis: ${preview.beta};--rotation-of-y-axis: ${preview.gamma};--rotation-of-z-axis: ${preview.alpha};`
      }
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
          <button data-drawer="commands">
            Commands
            <span data-tooltip="Things you can just *do*">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <div>
            <div data-pocket="commands">
              <button data-undo data-tooltip="backstep reality by a single step">
                Undo
              </button>
              <button data-redo data-tooltip="tock the reality clock by a tick">
                Redo
              </button>
            </div>
          </div>
          <button data-share>
            Share
            <span data-tooltip="Collaborate across the planet!">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-enable-publish>
            Metadata
            <span data-tooltip="Publish this so that your friends can see it">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <button data-new>
            Clear
            <span data-tooltip="Wipe the board clean">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <button data-shell>
            Quit
            <span data-tooltip="Don't ask where your mind exists">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <button data-plan98>
            Escape
            <span data-tooltip="Consider changing our current reality">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <button data-help>
            Help
            <span data-tooltip="Seek help from chat">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <button data-enable-tutorial>
            Restart Tutorial
            <span data-tooltip="Start from the starting point">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>

          <button data-prequel>
            Reboot the Prequel
            <span data-tooltip="Consider rebooting reality from scratch">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <button data-enable-preview>
            VFX Preview
            <span data-tooltip="See how a hand actually works">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <hr>
          <button data-crichton>
            Mike Backes Edition
            <span data-tooltip="If you know any unix systems at all, be amused; the elves are in the computer-- in the computer!!!">
              <sl-icon name="info-circle"></sl-icon>
            </span>
          </button>
          <hr>
          <img src="/public/cdn/sillyz.computer/self-portrait.jpeg">
        </div>
      </div>
    </div>
    <div class="overlays">
      <div class="overlay-drop">
        Drop files here to attach them!
      </div>
      <div class="overlay-music">
        <d-j></d-j>
        <div class="action-wrapper">
          <button data-close class="standard-button bias-generic -small -round" type="reset">
            <sl-icon name="x-lg"></sl-icon>
          </button>
        </div>
      </div>
      <div class="overlay-preview"><!--will be swapped --></div>
      <div class="overlay-color">
        <plan98-palette></plan98-palette>
      </div>
      <div class="overlay-chat">
        <div class="action-wrapper">
          <button data-close class="standard-button bias-generic -small -round" type="reset">
            <sl-icon name="x-lg"></sl-icon>
          </button>
        </div>
      </div>
      <div class="overlay-publish">
        <!--will be swapped -->
      </div>
      <div class="overlay-tutorial">
        ${tutorial(target)}
      </div>
      <div class="overlay-share">
        ${share(target)}
      </div>
    </div>
  `
  target.cache = Cache(target.id)

  const canvas = document.createElement('canvas')
  self.addEventListener('resize', debounce(resizeCanvas, 50), false);

  canvas.classList.add('file-region')

  function clearCanvas() {
    canvas.width = self.innerWidth;
    canvas.height = self.innerHeight;
    const context = canvas.getContext('2d')
    context.fillStyle = $.ear().background
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  function resizeCanvas() {
    clearCanvas()
    redraw(target)
  }

  target.appendChild(canvas)

  resetSketchPad(target)
  update(target)
  resizeCanvas();

  if(src) {
    target.cache.get(src).then(record => {
      if(record) {
        const data = JSON.parse(record.data)
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
      }
    })
  }

  const view = target.getAttribute('view')
  if(overlays[view]) {
    $.teach({ overlay: overlays[view] })
  } else if(view === 'normal') {
    $.teach({ overlay: null })
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

$.hand('click', '[data-root]', (event) => {
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

  const { drawers } = $.ear()

  if(drawers.includes(drawer)) {
    $.mouth(drawer, (state, payload) => {
      return {
        ...state,
        drawers: [...state.drawers.filter(x => x !== payload)]
      }
    })
  } else {
    $.mouth(drawer, (state, payload) => {
      return {
        ...state,
        drawers: [...state.drawers, payload]
      }
    })
  }
})

$.hand('click', '[data-thickness]', function  (event) {
  event.preventDefault()
  $.mouth({
    thickness: parseInt(event.target.dataset.thickness) || 1
  })
})


$.hand('click', '[data-journal]', function  (event) {
  event.preventDefault()
  window.location.href = '/app/cultural-preservation'
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
  window.location.href = '/app/plan98-boxart'
})

function friends(target) {
  return `
    <div class="overlay-background">
      <div class="form-card">
        <div class="draft-template">
          <div class="frame-header">
            <div style="display: grid; place-content: start">
            </div>
            <div style="display: grid; place-content: end">
              <button data-root class="standard-button bias-generic -small -round" type="reset">
                <sl-icon name="x-lg"></sl-icon>
              </button>
            </div>
          </div>
          <div class="frame-body">
            <div class="wizard">
              <cyber-security></cyber-security>
            </div>
          </div>
          <div class="frame-footer">
            <div style="text-align: right;">
              <button data-share class="standard-button bias-generic -small" type="submit">
                Share
              </button>
              <button data-start class="standard-button bias-positive -small" type="submit">
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `


}

function publish(target) {
  const { image, attachments } = $.ear()
  return `
    <div class="overlay-background">
      <div class="form-card">
        <div class="draft-template">
          <div class="frame-header">
            <div style="display: grid; place-content: start">
            </div>
            <div style="display: grid; place-content: end">
              <button data-root class="standard-button bias-generic -small -round" type="reset">
                <sl-icon name="x-lg"></sl-icon>
              </button>
            </div>
          </div>
          <div class="frame-body">
            <div class="plan98-title">
              <input data-bind name="title" class="transparent-input" placeholder="Article Title" />
            </div>
            <cached-image class="plan98-hero" key="${elf}" src="${image}"></cached-image>
            <div class="plan98-body">
              <textarea
                data-bind
                class="publish-body"
                name="messageText"
                placeholder="Share something helpful to others, maybe something you wished you knew before you knew it."
              ></textarea>

              <div>
                Attachments
              </div>
              <div>
                <button class="click-proxy standard-button bias-generic">Browse Files</button>
                <input type="file" name="files" multiple style="display: none;">
              </div>

              <div class="file-list"></div>
            </div>
            <div class="plan98-signoff">
            </div>
          </div>
          <div class="frame-footer">
            <div style="text-align: right;">
              <button data-cancel class="standard-button bias-generic -small" type="submit">
                Cancel
              </button>
              <button data-start class="standard-button bias-positive -small" type="submit">
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}


function tutorial(target) {
  const label = target.getAttribute('label') || 'Pluto'

  return `
    <div class="overlay-background">
      <div class="form-card">
        <div class="draft-template">
          <div class="frame-header">
            <div style="display: grid; place-content: start">
            </div>
            <div style="display: grid; place-content: end">
              <button data-root class="standard-button bias-generic -small -round" type="reset">
                <sl-icon name="x-lg"></sl-icon>
              </button>
            </div>
          </div>
          <div class="frame-body">
            <div style="padding: 1rem; max-width: 55ch; margin: 0 auto; height: 100%; display: flex; gap: 1rem; flex-direction: column;">
              <div>
                <plan98-icon></plan98-icon>
              </div>
              <p>
                <center>
                  <strong>The imagination:</strong> <strike>Space!</strike> <u>Time!</u> <sup>Sight!</sup> <sub>Sound!</sub> <em>Mind!</em>
                </center>
              </p>
              <qr-code src="${window.location.origin}/app/${$.link}?id=${target.closest($.link).id}&label=${label}" style="width: 50vmin; height: 50vmin;" target="_top"></qr-code>
              <div>
                <strong>${label}</strong><br/>
                <em>Quadrant:</em> ${window.location.origin} <code>/app/</code><br/>
                <em>Sector:</em> ${$.link} <code>?id=</code><br/>
                <em>Planet:</em> ${target.closest($.link).id} <code>&label=${label}</code><br/>
              </div>
              <hr>
              <img src="/public/cdn/sillyz.computer/reality-somehow.jpeg">
              <p>
                A creative suite for kids at heart. Explore and absorb the ability to create art by learning from it.
              </p>

              <ul>
                <li>Art</li>
                <li>Music</li>
                <li>Coding</li>
              </ul>

              <div>
                <plan98-palette style="height: 50vh"></plan98-palette>
              </div>

              <div>
                <div style="display: grid; height: 100vh; place-content: center;">
                  <a href="/app/hello-elvish?elf=js-repl">Tunnel Practice</a>
                </div>
              </div>
            </div>
          </div>
          <div class="frame-footer">
            <div style="text-align: right;">
              <button data-share class="standard-button bias-generic -small" type="submit">
                Share
              </button>
              <button data-start class="standard-button bias-positive -small" type="submit">
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function share(target) {
  const { viewMetadata } = $.ear()
  const shareLink = `${window.location.origin}/app/${$.link}?id=${target.closest($.link).id}`
  const copyId = self.crypto.randomUUID()
  const label = target.getAttribute('label') || 'Pluto'

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
              <div style="padding: 51px; height: 100%; display: flex; flex-direction: column;">
                <qr-code src="${window.location.origin}/app/${$.link}?id=${target.closest($.link).id}&label=${label}" style="width: 50vmin; height: 50vmin;" target="_top"></qr-code>
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
            <p>
              Hey, listen! Copy this link and share it online or let someone in person scan it to link up and <button class="standard-button -smol" data-help>"Sketch"</button> together!
            </p>
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

function cancel(target) {
  $.mouth({ activeMenu: null, overlay: null })
}

$.hand('click', '[data-cancel]', ({ target }) => cancel(target))
$.hand('click', '[data-share]', ({ target }) => share(target))
$.hand('click', '[data-save]', ({ target }) => save(target))

function snapshot(target) {
  const { root, canvas, src } = engine(target)
  const { strokeHistory, strokeRevisory } = $.ear()
  const dataURL = canvas.toDataURL('image/png');
  const byteCharacters = atob(dataURL.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const now = new Date();
  const timestamp = now.toJSON()
  const image = `/private/${$.link}/${timestamp}.png`

  const data = { src: image, strokeHistory, strokeRevisory }

  $.mouth({ image })

  root.cache.put(src, JSON.stringify(data)).then(response => {
  }).catch(error => {
    console.warn(error);
  });

  root.cache.put(image, byteArray, { type: 'image/png' }).then(res => {
    if(res.ok) {
      $.mouth({ image })
    } else {
      throw new Error('Upload failed')
    }
  })

}

function save (target) {
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

  const { src } = engine(event.target)
  if(src) {
    snapshot(event.target)
  }
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

  const { src } = engine(event.target)
  if(src) {
    snapshot(event.target)
  }

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
  snapshot(event.target)
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

  snapshot(event.target)
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
    background: white;
    color: black;
  }

  & canvas {
    height: 100%;
  }

  &[data-touching="true"] .palette {
    pointer-events: none;
    opacity: .15;
    transition: opacity 1000ms ease-in-out;
  }

  & .palette-items hr {
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
    max-height: calc(85vh - 40px);
    max-width: calc(85vw - 40px);
    overflow: auto;
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
    padding: .5rem 1rem .5rem .5rem;
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
  &[data-drawers*="commands"] [data-pocket="commands"],
  &[data-drawers*="size"] [data-pocket="size"] {
    display: flex;
    width: 100%;
    max-width: 320px;
    overflow-x: auto;
  }

  &[data-drawers*="quit"] [data-pocket="quit"] {
    display: flex;
    flex-direction: column;
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

  &[data-hovering="true"] .overlays,
  &[data-hovering="true"] .overlays > * {
    pointer-events: none !important;
  }

  &[data-hovering="true"] .overlays > .overlay-drop,
  &[data-overlay="preview"] .overlays > .overlay-preview,
  &[data-overlay="music"] .overlays > .overlay-music,
  &[data-overlay="chat"] .overlays > .overlay-chat,
  &[data-overlay="tutorial"] .overlays > .overlay-tutorial,
  &[data-overlay="publish"] .overlays > .overlay-publish,
  &[data-overlay="friends"] .overlays > .overlay-friends,
  &[data-overlay="share"] .overlays > .overlay-share,
  &[data-overlay="color"] .overlays > .overlay-color {
    display: block;
    pointer-events: all;
    position: absolute;
    inset: 0;
    z-index: 100;
    background: white;
  }

  & .overlay-music {
    overflow: auto;
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

  & .frame-header,
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

  & .frame-body {
    grid-area: body;
    overflow: auto;
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

  & .frame-footer,
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

  & [data-toggle-metadata] {
    display: none;
  }

  & .action-wrapper {
    position: fixed;
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
    background: var(--active-color, black);
    padding: 1rem 1rem 1rem 10vmin;
    display: grid;
    grid-template-columns: auto 1fr;
    place-content: center;
    min-height: 100vh;
    perspective: 1000px;
  }

  & .foreground {
    background: lemonchiffon;
    border-radius: 0;
    border: 0;
    min-height: 2rem;
    min-width: 2rem;
  }

  & .publish-body {
    width: 100%;
    padding: 0;
    border: 0;
    resize: none;
  }

  & .table {
    display: table;
    width: 100%;
  }

  & .section {
    margin-bottom: 2rem;
  }

  & .table-row {
    display: table-row;
  }

  & .table-row > * {
    display: table-cell;
    padding: 2px;
  }

  & .table-row:nth-child(2n) {
    background: rgba(0,0,0,.1);
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

export function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

$.hand('click', '[data-menu-target]', (event) => {
  event.preventDefault()
  const { activeMenu } = $.ear()
  const { menuTarget } = event.target.dataset
  $.mouth({ activeMenu: activeMenu === menuTarget ? null : menuTarget })
  event.stopImmediatePropagation()
})

$.hand('click', '[data-start]', async function getOrientation(){
  $.mouth({
    overlay: null,
    activeMenu: null,
  })
})

$.hand('click', '[data-enable-tutorial]', async function getOrientation(){
  $.mouth({
    overlay: overlays.tutorial,
    activeMenu: null,
  })
})

$.hand('click', '[data-enable-friends]', async function getOrientation(){
  $.mouth({
    overlay: overlays.friends,
    activeMenu: null,
  })
})

$.hand('click', '[data-enable-publish]', async function getOrientation(){
  $.mouth({
    overlay: overlays.publish,
    activeMenu: null,
  })
})

$.hand('click', '[data-enable-music]', async function getOrientation(){
  $.mouth({
    overlay: overlays.music,
    activeMenu: null,
  })
})

$.hand('click', '[data-enable-preview]', async function getOrientation(){
  if (!window.DeviceOrientationEvent || !window.DeviceOrientationEvent.requestPermission){
    toast("Your current device does not have access to the DeviceOrientation event", { type: 'error' })
  } else {
    let permission = await window.DeviceOrientationEvent.requestPermission();
    if (permission !== "granted"){
      toast("You must grant access to the device's sensor for this demo", { type: 'error' })
    }
  }

  $.mouth({
    overlay: overlays.preview,
    activeMenu: null,
  })
})

window.addEventListener("deviceorientation", function(e){
  const alpha = realityCounterWeights.alpha - e.alpha.toFixed(1)+"deg"; //angle of motion around the Z axis
  const beta = realityCounterWeights.beta - e.beta.toFixed(1)+"deg"; //angle of motion around the X axis
  const gamma = realityCounterWeights.gamma - e.gamma.toFixed(1)+"deg"; //angle of motion around the Y axis
  const orientation = Math.abs(e.beta) > Math.abs(e.gamma) ? "portrait" : "landscape";  

  const preview = {
    alpha,
    beta,
    gamma,
    orientation
  }

  $.mouth({ preview })
});


// thanks Josh, always love your work
// https://www.joshwcomeau.com/snippets/javascript/debounce/
function debounce(callback, wait) {
  let timeoutId = null;

  return (...args) => {
    window.clearTimeout(timeoutId);

    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}

$.hand('input', '[data-bind]', (event) => {
  $.mouth({[event.target.name]: event.target.value })
})

$.hand('focus', '[name="messageText"]', (event) => {
  $.mouth({ messageHeight: event.target.scrollHeight })
});

$.hand('keydown', '[name="messageText"]', (event) => {
  $.mouth({ messageHeight: event.target.scrollHeight })
});

$.hand('input', '[name="messageText"]', (event) => {
  const { value } = event.target;
  $.mouth({ messageDraft: value, messageHeight: event.target.scrollHeight })
});


function updateField(field, value) {
  const start = field.selectionStart;
  const end = field.selectionEnd;
  field.value = value;
  field.setSelectionRange(start, end);
}

let STAGED_FILES = {}

function handleFiles(target, files) {
  STAGED_FILES = {}
  // Convert FileList to Array and add to selectedFiles
  const fileMeta = Array.from(files).map(file => {
    STAGED_FILES[file.name] = file
    return {
      name: file.name,
      url: `/attachments/${self.crypto.randomUUID()}/` + file.name,
      size: file.size,
      type: file.type,
    }
  });

  $.mouth({ attachments: fileMeta, overlay: overlays.publish, activeMenu: null })

  snapshot(target)
  startAttachmentUpload()
}

function startAttachmentUpload() {
  const { attachments } = $.ear()

  if(attachments.length > 0 && keycard) {
    const context = { signer, space }

    $.mouth({
      uploading: true
    })

    const uploads = [...attachments].map(upload)

    Promise.all(uploads)
      .then(() => {
        $.mouth({
          uploading: false
        })
      })
  }
}

function upload(attachment) {
  const file = STAGED_FILES[attachment.name]

  const typedBlob = new Blob([file], { type: file.type })
  return target.cache.put(attachment.url, typedBlob)
    .then(res => {
      console.debug({ res })
      return res
    })
    .catch(e => {
      console.debug(e)
    })
    .finally(() => {
    })
}

$.hand('dragenter', '.file-region', (event) => {
  event.preventDefault()
  event.stopPropagation()
  const root = event.target.closest($.link)
  root.dataset.hovering = true
})

$.hand('dragover', '.file-region', (event) => {
  event.preventDefault()
  event.stopPropagation()
  const root = event.target.closest($.link)
  root.dataset.hovering = true
})

$.hand('dragleave', '.file-region', (event) => {
  event.preventDefault()
  event.stopPropagation()
  const root = event.target.closest($.link)
  root.dataset.hovering = false
})

$.hand('drop', '.file-region', (event) => {
  event.preventDefault()
  event.stopPropagation()
  const root = event.target.closest($.link)
  root.dataset.hovering = false
  if (event.dataTransfer) {
    console.log('- Files count:', event.dataTransfer.files.length);
    handleFiles(event.target, event.dataTransfer.files);
  }
})

$.hand('click', '.click-proxy', (event) => {
  event.target.nextElementSibling.click()
})

$.hand('change', '[name="files"]', (event) => {
  handleFiles(event.target, event.target.files);
});
