import elf from '@silly/elf'
import { render } from '@sillonious/saga'
import { checkButton, checkAxis } from './debug-gamepads.js'
import { consoleShow, consoleHide } from './plan98-console.js'

const elfSagas = {
  '0:0': {
    url: '/public/cdn/sagas/elf/en-us/0:0.saga'
  },
  '0:-1': {
    url: '/public/cdn/sagas/elf/en-us/0:-1.saga'
  },
  '0:1': {
    url: '/public/cdn/sagas/elf/en-us/0:1.saga'
  },
  '1:0': {
    url: '/public/cdn/sagas/elf/en-us/1:0.saga'
  },
  '-1:0': {
    url: '/public/cdn/sagas/elf/en-us/-1:0.saga'
  },
}

const $ = elf('elf-sagas', {
  instances: {},
})

$.draw((target) => {
  const { instances } = $.learn()
  load(target)
  if(!instances[target.id]) return

  const instance = instances[target.id]
  const { x, y, sagas } = instance

  function createRow(row, yIndex) {
    if(!sagas) return 'no sagas'

    return [x-1,x,x+1].map(createCell(row, yIndex)).join('')
  }

  function createCell(row, yIndex) {
    return (column, xIndex) => {
      const topLeft = (xIndex===0&&yIndex===0)
      const bottomRight = (xIndex===2&&yIndex===2)
      const bottomLeft = (xIndex===0&&yIndex===2)
      const topRight = (xIndex===2&&yIndex===0)

      if(topLeft || bottomRight || bottomLeft || topRight) {
        return ''
      }

      const saga = sagas[`${row}:${column}`] || {}
      return `
        <div class="tile ${tilePosition(xIndex,yIndex)}" data-id="${target.id}">
          ${saga.content || ''}
        </div>
      `
    }
  }

  const grid = [y-1,y,y+1].map(createRow).join('')

  return `
    <div class="game">
      <div class="grid">
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
        const { x, y, sagas } = instance
        if(!sagas[`${y}:${x}`]) {
          updateSaga({ x, y, id: target.id }, { content: `${x}, ${y}` })
        }
      }
    }
  },
  afterUpdate: (target) => {
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
  }
})

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
  const { x, y, sagas } = instances[id]

  const nextX = x - 1

  if(!sagas[`${nextX}:${y}`]) return

  updateInstance({ id }, { x: nextX })
}

function slideRight(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { x, y, sagas } = instances[id]

  const nextX = x + 1

  if(!sagas[`${nextX}:${y}`]) return

  updateInstance({ id }, { x: nextX })
}

function slideUp(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { x, y, sagas } = instances[id]

  const nextY = y - 1

  if(!sagas[`${x}:${nextY}`]) return

  updateInstance({ id }, { y: nextY })
}

function slideDown(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { x, y, sagas } = instances[id]

  const nextY = y + 1

  if(!sagas[`${x}:${nextY}`]) return

  updateInstance({ id }, { y: nextY })
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

$.style(`
  & {
    background: black;
    color: white;
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

  & .game {
    height: 100%;
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

  & .tile.incoming,
  & .tile.center {
    display: grid;
  }

  & .tile {
    grid-area: tile;
    display: grid;
    place-content: center;
    --tile-x: 0;
    --tile-y: 0;
    transform: translate(var(--tile-x), var(--tile-y));
    position: relative;
    display: none;
    height: 100%;
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

async function load(target) {
  if(target.load) return
  target.load = true

  const keys = Object.keys(elfSagas)

  const responses = await new Promise((resolve, reject) => {
    const responses = []
    keys.forEach((index) => {
      const { url } = elfSagas[index]

      fetch(url).then(response => {
        if(response.status !== 404) {
          return response.text()
        }
      }).then(saga => {
        return responses.push({
          index,
          saga
        })

      }).catch((e) => {
        responses.push({
          index,
          saga: 'Failed to load' + saga
        })
      })
    })

    const errorTimeout = setTimeout(reject, 60 * 1000)

    function check() {
      if(keys.length === responses.length) {
        clearTimeout(errorTimeout)
        resolve(responses)
      } else {
        requestAnimationFrame(check)
      }
    }

    check()
  })

  const sagas = responses.reduce((sagas, data) => {
    sagas[data.index] = {
      ...elfSagas[data.index],
      content: render(data.saga)
    }
    return sagas
  }, {})

  const id = target.id
  schedule(() => {
    updateInstance({ id }, {
      x: 0,
      y: 0,
      id,
      sagas,
    })
  })

  requestAnimationFrame(gameLoop.bind({ id }))
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

function updateSaga({ x, y, id }, payload) {
  $.teach({...payload}, (s, p) => {
    const key = `${y}:${x}`
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          sagas: {
            ...s.instances[id].sagas,
            [key]: {
              ...s.instances[id].sagas[key],
              ...p
            }
          }
        }
      }
    }
  })
}

function schedule(x, delay=1) { setTimeout(x, delay) }

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
