import elf from '@silly/elf'
import supabase from '@sillonious/database'
import { checkButton, checkAxis } from './debug-gamepads.js'
import { consoleShow, consoleHide } from './plan98-console.js'

const modes = {
  game: 'game',
  settings: 'settings',
  offline: 'offline',
  overlay: 'overlay',
}


const $ = elf('slide-os', {
  rows: 1,
  columns: 1,
  instances: {},
  mode: modes.game,
  session: { user: {} },
  app: {},
  upload: {},
  message: ''
})

supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    $.teach({ session, mode: modes.game })
  } else {
    $.teach({ session: null, mode: modes.offline })
  }
});


$.draw((target) => {
  seed(target)
  query(target)
  const { session, mode, player, instances, debuggerVisible } = $.learn()

  if(target.dataset.mode === modes.offline) return
  if(!session && mode === modes.offline){
    target.innerHTML = `
      <div class="full-bleed">
        <supabase-account></supabase-account>
      </div>
    `
    return
  }

  if(!instances[target.id]) return

  if(target.dataset.mode === modes.settings) return
  if(mode === modes.settings) {
    return `
      <button data-close key="close">
        <sl-icon name="x-lg"></sl-icon>
      </button>
      <div class="settings">
        <div class="title">Settings</div>

        <div>
          <supabase-account></supabase-account>
        </div>

        <hr>

        <div class="controller"></div>

        <hr>

        <button class="toolbelt-debugger">
          ${ debuggerVisible ? 'Hide Debugger' : 'Show Debugger' }
        </button>
      </div>
      <div class=""></div>
    `
  }

  if(target.dataset.mode === modes.overlay) return
  if(mode === modes.overlay) {
    return renderOverlay(target)
  }

  const instance = instances[target.id]
  const { finished, x, y, won, boxes, rows, columns, maxFlags, totalFlags } = instance

  function createRow(row, yIndex) {
    if(!boxes) return 'no boxes'

    return [x-1,x,x+1].map((column, xIndex) => {
      if((xIndex===0&&yIndex===0)||(xIndex===2&&yIndex===2)||(xIndex===0&&yIndex===2)||(xIndex===2&&yIndex===0)) return ''
      const box = boxes[`${row}:${column}`] || {}
      return `
        <div class="tile ${tilePosition(xIndex,yIndex)} ${ box.alive ? 'alive' : '' }" data-id="${target.id}">
          ${box.content}
        </div>
      `
    }).join('')
  }

  const grid = [y-1,y,y+1].map(createRow).join('')

  return `
    <button data-open key="open">
      <sl-icon name="gear-wide-connected"></sl-icon>
    </button>
    <div class="game">
      <div class="grid ${finished ? (won?'won':'lost') : ''}">
        ${grid}
      </div>
    </div>
  `
}, {
  beforeUpdate: (target) => {
    {
      const { instances } = $.learn()
      const instance = instances[target.id]
      if(instance) {
        const { x, y, boxes } = instance
        const key = `${y}:${x}`
        if(!boxes[key]) {
          updateBox({ x, y, id: target.id }, {
            content: zero(key)
          })
        }
      }
    }
  },
  afterUpdate: (target) => {
    { // recover icons from the virtual dom
      recoverElves(target, 'sl-icon')
    }

    {
      const { mode } = $.learn()
      if(target.dataset.mode !== mode) {
        target.dataset.mode = mode
      }
    }

    {
      const { tileGesture, tileDistance } = $.learn()

      if(tileGesture === 'swipe') {
        target.style.setProperty("--pan-x", `${tileDistance.x}px`);
      } else if(tileGesture === 'scroll') {
        target.style.setProperty("--pan-y", `${tileDistance.y}px`);
      } else {
        target.style.setProperty("--pan-x", `0`);
        target.style.setProperty("--pan-y", `0`);
      }
    }

    {
      const { mode, player } = $.learn()
      const controller = target.querySelector('.controller')
      if(mode === 'settings' && controller) {
        controller.innerHTML = Object.keys(player).map(key => {
          return `
            <div>
              ${key}: ${player[key]}
            </div>
          `
        }).join('')
      }
    }

  }
})

function recoverElves(target, tag) {
  [...target.querySelectorAll(tag)].map(node => {
    const nodeParent = node.parentNode
    const newNode = document.createElement(tag)
    for (const attr of node.attributes) {
      newNode.setAttribute(attr.name, attr.value)
    }
    node.remove()
    nodeParent.appendChild(newNode)
  })
}


function tilePosition(xIndex, yIndex) {
  const { tileGesture, tileDistance } = $.learn()
  const classes = []

  if(yIndex === 0) {
    classes.push('top')

    if(tileGesture === 'scroll' && Math.sign(tileDistance.y)===1) {
      classes.push('incoming')
    }
  } else if(yIndex === 2) {
    classes.push('bottom')
    if(tileGesture === 'scroll' && Math.sign(tileDistance.y)!==1) {
      classes.push('incoming')
    }
  }

  if(xIndex === 0) {
    classes.push('left')
    if(tileGesture === 'swipe' && Math.sign(tileDistance.x)===1) {
      classes.push('incoming')
    }
  } else if(xIndex === 2) {
    classes.push('right')
    if(tileGesture === 'swipe' && Math.sign(tileDistance.x)!==1) {
      classes.push('incoming')
    }
  }

  if(classes.length === 0) {
    classes.push('center')
  }

  return classes.join(' ')
}

function renderOverlay(target) {
  const { activeKey, instances, message } = $.learn()
  const { boxes } = instances[target.id]
  const app = boxes[activeKey]
  return `
    <div key="overlay">
      <div class="title">Overlay</div>
      <form class="profile" method="POST" action="edit-app">
        <input type="hidden" name="key" value="${activeKey}" />
        <label class="field">
          <span class="label">Name</span>
          <input type="text" name="title" value="${escapeHyperText(app.title || '')}"/>
        </label>

        <label class="field">
          <span class="label">Description</span>
          <textarea name="saga">${escapeHyperText(app.saga || '')}</textarea>
        </label>
        <label class="field">
          <span class="label">Boxart</span>
          <img  src="${app.boxart || '/public/cdn/sillyz.computer/default-picture.png' }" />
          <input type="file" name="boxart" accept="image/*">
        </label>
        <label class="field">
          <span class="label">Hypertext</span>
          <textarea name="elf">${escapeHyperText(app.elf || '')}</textarea>
        </label>

        <div style="display: grid; grid-template-columns: 1fr 1fr;">
          <div>Attribute</div>
          <div>Value</div>
          <input>
          <input>
        </div>

        <div class="message">${message ? message : ''}</div>

        <div style="text-align: center">
          <button type="submit">
            Save
          </button>
        </div>
      </form>

      <button data-close>
        <sl-icon name="x-lg"></sl-icon>
      </button>
    </div>
  `
}

$.when('submit', '[action="edit-app"]', async event => {
  event.preventDefault()

  $.teach({
    message: null
  })

  const { title, saga, elf, key } = event.target
  const { boxart } = $.learn().upload

  const values = {
    user_id: JSON.parse(state['ls/supabase.auth.token']).user.id,
    key: key.value,
    title: title.value,
    saga: saga.value,
    elf: elf.value,
  }

  if(boxart) {
    values.boxart = boxart
  }

  try {
    const { data, error } = await supabase
      .from('slide_os')
      .upsert([values], { onConflict: ['user_id', 'key'] })
      .select()

    const response = error
      ? { error: true, message: error.message  }
      : { success: true, message: 'Profile updated successfully', profile: data[0] }
debugger
    $.teach(response)
  } catch(e) {
    $.teach({ error: e })
  }
})



$.when('click', '[data-close]', (event) => {
  $.teach({ mode: modes.game })
})

$.when('click', '[data-pick]', (event) => {
  const { pick } = event.target.dataset
  $.teach({ mode: modes.overlay, activeKey: pick })
})


$.when('click', '[data-open]', () => {
  $.teach({ mode: modes.settings })
})

$.when('click', '[data-close]', () => {
  $.teach({ mode: modes.game })
})


$.when('pointerdown', '.tile', function(e) {
  event.preventDefault()
  $.teach({ tileStartTime: e.timeStamp })
  let startX, startY;
  const rectangle = event.target.getBoundingClientRect()
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    startX = e.touches[0].clientX - rectangle.left
    startY = e.touches[0].clientY - rectangle.top
  } else {
    startX = e.clientX - rectangle.left
    startY = e.clientY - rectangle.top
  }


  $.teach({
    tileFirstTouch: {
      x: startX,
      y: startY
    }
  })
})

$.when('pointermove', '.tile', function(e){
  event.preventDefault()
  const { tileStartTime, tileFirstTouch, tileGesture } = $.learn()
  if(!tileFirstTouch) return
  const tileEndTime = e.timeStamp;
  const tileDuration = tileEndTime - tileStartTime;
  let lastX, lastY;
  const rectangle = event.target.closest($.link).getBoundingClientRect()
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    lastX = e.touches[0].clientX - rectangle.left
    lastY = e.touches[0].clientY - rectangle.top
  } else {
    lastX = e.clientX - rectangle.left
    lastY = e.clientY -rectangle.top
  }

  const tileLastTouch = {
    x: lastX,
    y: lastY
  }


  const tileDistance = {
    x: tileLastTouch.x - tileFirstTouch.x,
    y: tileLastTouch.y - tileFirstTouch.y
  }

  $.teach({
    tileEndTime,
    tileDuration,
    tileLastTouch,
    tileDistance
  })

  if(!tileGesture) {
    setGesture();
  }
})

$.when('pointerup', '.tile', function(event){
  const { id } = event.target.dataset
  const { instances, tileDistance, tileGesture, tileLastTouch, tileDuration } = $.learn()

  if(!tileDistance) {
    clearPointer()
    return
  }

  if(tileGesture === 'scroll') {
    const distance = Math.abs(tileDistance.y);

    if(distance < 20) {
      clearPointer()
      return
    }

    if(Math.sign(tileDistance.y)===1) {
      slideUp(id)
    } else {
      slideDown(id)
    }

  } else if(tileGesture === 'swipe') {
    const distance = Math.abs(tileDistance.x);

    if(distance < 20) {
      clearPointer()
      return
    }

    if(Math.sign(tileDistance.x)===1) {
      slideLeft(id)
    } else {
      slideRight(id)
    }
  }

  clearPointer()
})

function clearPointer() {
  $.teach({ 
    tileGesture: null,
    tileDistance: null,
    tileLastTouch: null,
    tileFirstTouch: null
  })
}

self.addEventListener('keydown', (event) => {
  const node = document.querySelector($.link)

  if(!node) return
  const id = node.id

  if (event.keyCode==37) {
    slideLeft(id)
  }
  if (event.keyCode==38) {
    slideUp(id)
  }
  if (event.keyCode==39) {
    slideRight(id)
  }
  if (event.keyCode==40) {
    slideDown(id)
  }
})

function slideLeft(id) {
  const { instances } = $.learn()

  if(!instances[id]) return
  const { x } = instances[id]

  updateInstance({ id }, { x: x - 1 })
}

function slideRight(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { x } = instances[id]

  updateInstance({ id }, { x: x + 1 })
}

function slideUp(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { y } = instances[id]

  updateInstance({ id }, { y: y - 1 })
}

function slideDown(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { y } = instances[id]

  updateInstance({ id }, { y: y + 1 })
}

function setGesture(){
  const { tileDistance } = $.learn()
  const y = Math.abs(tileDistance.y)
  const x = Math.abs(tileDistance.x)
  if(x < 5 && y < 5) return
  if(y > x){
    $.teach({ tileGesture: 'scroll' })
  } else {
    $.teach({ tileGesture: 'swipe' })
  }
}

function escapeHyperText(text = '') {
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

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
    perspective-origin: center;
    perspective: 1000px;
    position: relative;
    overflow: hidden;
    transform-style: preserve-3d;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    touch-action: none;
  }

  & [key="overlay"] {
    overflow: auto;
    height: 100%;
    padding: 2rem 1rem;
  }

  & .field img {
    max-height: 64px;
  }

  & .form {
    max-width: 320px;
    margin: auto;
  }

  & .app {
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100%;
    pointer-events: none;
  }

  & .app-title {
    text-align: left;
    padding: 8px;
  }

  & .app-art {
  }

  & .app-actions {
    display: flex;
    justify-content: end;
    gap: 1rem;
    padding: 8px;
  }

  & .app-actions :first-child {
    text-align: left;
  }

  & .app-actions :last-child {
    text-align: right;
  }

  & .app-actions button {
    pointer-events: all;
    height: 100%;
  }

  & .title {
    font-size: 2rem;
    font-weight: bold;
  }

  & [data-close],
  & [data-open] {
    border: none;
    background: white;
    color: dodgerblue;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    padding: 4px 8px;
  }

  & [data-close]:hover,
  & [data-close]:focus,
  & [data-open]:hover,
  & [data-open]:focus {
    background: dodgerblue;
    color: white;
  }

  & .game,
  & .settings {
    display: none;
    height: 100%;
  }

  &[data-mode="settings"] .settings {
    display: block;
    overflow-y: auto;
    overflow-x: hidden;
  }

  &[data-mode="game"] .game {
    display: block;
  }

  & .settings {
    padding: 2rem 1rem;
    background: white;
    color: rgba(0,0,0,.85);
  }

  & select {
    background: #54796d;
    border: 1px solid rgba(255,255,255,.65);
    border-radius: 0;
    color: rgba(255,255,255,.65);
    padding: .5rem;
  }

  & .won {
    opacity: .85;
    pointer-events: none;
  }

  & .lost {
    opacity: 0;
    pointer-events: none;
  }

  & .grid {
    display: grid;
    grid-template-areas: 'tile';
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    height: 100%;
    transform-origin: bottom;
    transform: translate(var(--pan-x, 0), var(--pan-y, 0))
  }

  & .tile {
    grid-area: tile;
    display: grid;
    place-content: center;
    --tile-x: 0;
    --tile-y: 0;
    transform: translate(var(--tile-x), var(--tile-y));
    position: relative;
    display: block;
  }

  & .tile.left {
    --tile-x: -100%;
  }

  & .tile.right {
    --tile-x: 100%;
  }

  & .tile.top {
    --tile-y: -100%;
  }

  & .tile.bottom {
    --tile-y: 100%;
  }


  & .tile.center {
    z-index: 2;
  }

  & .information {
    pointer-events: none;
    position: absolute;
    inset: 3px;
    display: grid;
    place-items: end center;
    z-index: 9001;
  }

  & .mini-overlay {
    pointer-events: all;
    background: rgba(0,0,0,.85);
    border: 1px solid rgba(255,255,255,.5);
    color: rgba(255,255,255,.85);
    border-radius: 2px;
    width: 100%;
    max-width: 55ch;
    display: grid;
    grid-template-rows: 1fr auto;
  }

  & .game-dialog {
    padding: 1rem 1rem 0;
  }

  & .game-actions {
    padding: .5rem 0;
  }
  & .game-actions button {
    border: none;
    border-radius: none;
    background: transparent;
    color: dodgerblue;
    padding: .5rem 1rem;
  }

  & .flagged::before {
    content: '%';
  }

  & .alive::before {
    content: '';
    background: rgba(255,255,255,.15);
    pointer-events: none;
    inset: 0;
    position: absolute;
    mix-blend-mode: soft-light;
  }

`)

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

function gameLoop(time) {
  const { id } = this
  const { instances } = $.learn()
  if(instances[id]) {
    const { x, y } = instances[id]
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

    if(player.a) {
    } else {
    }

    if(player.b) {
    } else {
    }

    if(player.x) {
    } else {
    }

    if(player.y) {
    } else {
    }

    if(player.lb) {
    } else {
    }

    if(player.rb) {
    } else {
    }

    if(player.lt) {
    } else {
    }

    if(player.rt) {
    } else {
    }

    if(player.up) {
      if(!lastFrame.up) {
        lastFrame.up = true
        slideUp(id)
      }
    } else {
      lastFrame.up = false
    }

    if(player.down) {
      if(!lastFrame.down) {
        lastFrame.down = true
        slideDown(id)
      }
    } else {
      lastFrame.down = false
    }

    if(player.left) {
      if(!lastFrame.left) {
        lastFrame.left = true
        slideLeft(id)
      }
    } else {
      lastFrame.left = false
    }

    if(player.right) {
      if(!lastFrame.right) {
        lastFrame.right = true
        slideRight(id)
      }
    } else {
      lastFrame.right = false
    }

    if(player.os) {
      if(!lastFrame.os) {
        lastFrame.os = true
        toggleMode()
        //document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
      }
    } else {
      lastFrame.os = false
    }

    $.teach({ player })
  }

  requestAnimationFrame(gameLoop.bind(this))
}

function seed(target) {
  if(target.seeded) return
  target.seeded = true
  const { rows, columns } = $.learn() || {}

  const boxes = {}
  for(let y = 0; y < rows; y++) {
    for(let x = 0; x < columns; x++) {
      const key = `${y}:${x}`
      boxes[key] = {
        content: zero(key),
        x,
        y
      }
    }
  }

  const id = target.id
  schedule(() => {
    updateInstance({ id }, {
      x: Math.floor(columns/2),
      y: Math.floor(rows/2),
      id,
      rows,
      columns,
      boxes,
    })
  })

  requestAnimationFrame(gameLoop.bind({ id }))
}

async function query(target) {
  const { session } = $.learn()

  if(target.queried) return

  if(session.user.id) {
    target.queried = true
    const { data, error } = await supabase
      .from('slide_os')
      .select()
      .eq('user_id', session.user.id); 

    if(error) {
      $.teach({ error })
      return
    }

    if(!data[0]) return

    const boxes = data.reduce((boxes, box) => {
      return {
        ...boxes,
        [box.key]: one(box)
      }
    }, {})

    updateBoxes({ id: target.id }, boxes)
  }
}

function one(box) {
  box.content = `
    <div class="app" key="${box.key}">
      <div class="app-title">${box.title}</div>
      <div class="app-art">
      </div>
      <div class="app-actions">
        <div>
          <button data-code="${box.key}">
            Code
          </button>
        </div>
        <div>
          <button data-pick="${box.key}">
            Pick
          </button>
        </div>
      </div>
    </div>
  `

  return box
}


function zero(key) {
  return `
    <div class="app" key="${key}">
      <div class="app-title">No App</div>
      <div class="app-art">
      </div>
      <div class="app-actions">
        <div>
          <button data-code="${key}">
            Code
          </button>
        </div>
        <div>
          <button data-pick="${key}">
            Pick
          </button>
        </div>
      </div>
    </div>
  `
}

function updateInstance({ id }, payload) {
  $.teach({...payload}, (s, p) => {
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          ...p
        }
      }
    }
  })
}

function updateBoxes({ id }, payload) {
  $.teach({...payload}, (s, p) => {
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          boxes: {
            ...s.instances[id].boxes,
            ...payload
          }
        }
      }
    }
  })
}


function updateBox({ x, y, id }, payload) {
  $.teach({...payload}, (s, p) => {
    const key = `${y}:${x}`
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          boxes: {
            ...s.instances[id].boxes,
            [key]: {
              ...s.instances[id].boxes[key],
              ...p
            }
          }
        }
      }
    }
  })
}

function schedule(x, delay=1) { setTimeout(x, delay) }

function mod(x, n) {
  return ((x % n) + n) % n;
}

$.when('click', '.toolbelt-debugger', debugToolbelt)

function debugToolbelt(event) {
  let console = document.body.querySelector('plan98-console')
  if(!console) {
    document.body.insertAdjacentHTML('beforeend', '<plan98-console></plan98-console>')
    console = document.body.querySelector('plan98-console')
  } else {
    console.classList.toggle('hidden')
  }

  if(console.matches('.hidden')) {
    consoleHide()
    $.teach({ debuggerVisible: false })
  } else {
    consoleShow()
    $.teach({ debuggerVisible: true })
  }

  event.target.classList.toggle('enabled')
}
