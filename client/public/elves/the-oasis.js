import app from '@plan98/app'
import 'aframe'

const GRAVITY = 0.00001;
let lastTime

const orientation = {
	x: '0', y: '0', z: '0', roll: '0', pitch: '0', yaw: '0'
}

const padding = 4

const oasis = {
	celestials: ['water','dark', 'island-1', 'sky'],
	'island-1': aBox({z: '0', y: -1, yaw: '-90'}, { material: 'emissive:#111; metalness:0.5', color: 'darkgray',  depth: '1', width: '100', height: '100' }),
	'sky': aBox({z: '-4', y: 115, yaw: '-90'}, { wireframe: true, color: 'firebrick',  depth: '100', width: '100', height: '100' }),
	water: aPlane({z: '-4', y: -2, yaw: '-90'}, { color: 'lightgray',  width: '5000', height: '5000' }),
	dark: aSky({}, { color: 'white' }),
  peers: []
}

const initial = {
  startX: null,
  startY: null,
  x: null,
  y: null,
  invertX: false,
  invertY: false,
  ...oasis
}

const robot = app('the-oasis', {
  ...initial,
  oasis
})

function celestials(name) {
	return name ? robot.learn()[name] : robot.learn().celestials
}

robot.draw((target) => {
  if(!target.innerHTML) {
    const scene = celestials().map(component)

    target.innerHTML = `
      <a-scene keyboard-shortcuts="enterVR: false; exitVR: false;" device-orientation-permission-ui="enabled: false">
        <a-camera rotation="0 0 0" position="0 30 100">
          <a-cursor geometry="primitive: circle; radius: .005"
  material="color: white; opacity: 1; shader: flat"></a-cursor>
        </a-camera>
        ${scene.join('')}
        <a-entity class="irix"></a-entity>
      </a-scene>
      <canvas class="paper"></canvas>
      <div class="cursor"></div>
    `

    const { canvas } = graphics(target)
    const context = canvas.getContext('2d')

    canvas.width = self.innerWidth;
    canvas.height = self.innerHeight;
    canvas.style=`background-image: ${getStars(target)};`

    context.textRenderingOptimization = 'optimizeSpeed'
    context.font = '16px Recursive' // or your preferred size/font
    context.fillStyle = '#000' // solid color
    context.imageSmoothingEnabled = false

    setInterval(() => {
      {
        increment(target)
      }
    }, 100)
  }
}, {
  beforeUpdate(target) {
    {
      const { startX, startY, x, y, invertX, invertY } = robot.learn()
      const background = target.getAttribute('background')
      const color = target.getAttribute('color')

      target.style = `


--start-x: ${startX}px;
--start-y: ${startY}px;
--x: ${Math.abs(x)}px;
--y: ${Math.abs(y)}px;
--transform: translate(${invertX ? '-100' : '0' }%, ${invertY ? '-100' : '0'}%);
${background ? `--background: ${background};` : ``} ${color ? `--color: ${color}` : ``}


      `
    }

    {
      const { isMouseDown } = robot.learn()
      if (isMouseDown) {
        target.dataset.touching = true
      } else {
        target.dataset.touching = false
      }
    }
  },
  afterUpdate(target) {
    const { canvas, rectangle } = graphics(target)

    {
      const { x, y } = robot.learn()
      const context = canvas.getContext('2d')
      context.clearRect(0, 0, canvas.width, canvas.height)

      context.fillStyle = 'black'
      context.textAlign = 'left'
      context.textBaseline = 'top'
      context.fillText(`TOP LEFT`, padding, padding);

      context.textAlign = 'right'
      context.textBaseline = 'top'
      context.fillText(`TOP RIGHT`, canvas.width - padding, padding);

      context.textAlign = 'left'
      context.textBaseline = 'bottom'
      context.fillText(`BOTTOM LEFT`, padding, canvas.height - padding);

      context.textAlign = 'right'
      context.textBaseline = 'bottom'
      context.fillText(`BOTTOM RIGHT`, canvas.width - padding, canvas.height - padding);

      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(`CENTER`, canvas.width / 2, canvas.height / 2)
    }

    {
      const cursor = target.querySelector('.cursor')

      const { x, y, width, height, top, right, bottom, left } = cursor.getBoundingClientRect()
      cursor.innerHTML = `
      <div class="prose"></div>
      `
    }
  }
})

function component(name) {
  return draw3d(celestials(name))
}

function draw3d(data) {
	const {
		avatar,
		x, y, z,
		yaw, pitch, roll,
		args
	} = data
	return `
		<${avatar}
			id="${name}"
			position="${x} ${y} ${z}"
			rotation="${yaw} ${pitch} ${roll}"
			${args}
		></${avatar}>
	`
}

function increment(target) {
  const currentTime = new Date()
  const dt = (currentTime - lastTime) / 16.67;
  lastTime = currentTime;

  const irix = target.querySelector('.irix')
  const { peers } = robot.learn()
	celestials().map(name => {
    const node = target.querySelector(`[id="${name}"]`)
    if(node) {
      node.outerHTML = component(name)
    }
	})

  if(peers) {
    const models = peers.map((peer, i) => {
      if(peer) {
        return draw3d(
          aBox({...peer.position}, {...peer.properties})
        )
      }
    }).join('')
    irix.innerHTML = models
  }
 
  {
    requestIdleCallback(() => {
      robot.teach(null, (state) => {
        const newPeers = state.peers.map(peer => {
          const { position, properties } = peer
          properties.vy += GRAVITY * dt;
          properties.y += properties.vy * dt;
          // Reset acceleration each frame
          let ax = 0, ay = 0;

          // Add gravity
          ay += GRAVITY;

          // Add other forces (wind, thrust, etc.)
          // ax += windForceX;
          // ay += windForceY;

          // Apply acceleration to velocity
          //properties.vx += ax * dt;
          properties.vy += ay * dt;

          // Apply velocity to position
          //position.x += properties.vx * dt;
          position.y += properties.vy * dt;

          return { position, properties }
        })
        return {
          ...state,
          peers: newPeers
        }
      })
    })
  }
}

robot.when('pointerdown', '.paper', start)

function start (e) {
  e.preventDefault()
  const { rectangle } = graphics(e.target)
  let startX, startY, x, y;
  if (e.touches && e.touches[0]) {
    startX = e.touches[0].clientX - rectangle.left
    startY = e.touches[0].clientY - rectangle.top
  } else {
    startX = e.clientX - rectangle.left
    startY = e.clientY -rectangle.top
  }

  x = 0
  y = 0

  robot.teach({ startX, startY, isMouseDown: true, x, y })
}

robot.when('pointermove', '.paper', move)

function move (e) {
  e.preventDefault()
  const { startX, isMouseDown, startY } = robot.learn()
  const { rectangle } = graphics(e.target)
  if (!isMouseDown) return

  let x, y
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    x = e.touches[0].clientX - startX - rectangle.left
    y = e.touches[0].clientY - startY - rectangle.top
  } else {
    x = e.clientX - startX - rectangle.left
    y = e.clientY - startY - rectangle.top
  }
  robot.teach({ x, y, invertX: x < 0, invertY: y < 0 })
}

robot.when('pointerup', '.paper', end)

function end (e) {
  e.preventDefault()
  const { startX, startY, x, y } = robot.learn()
  const { canvas } = graphics(e.target)

  const width = Math.abs(x) / canvas.width * 100
  const depth = Math.abs(y) / canvas.height * 100

  const height = 4

  console.log(`
    startX: ${startX}
    startY: ${startY}
    x: ${x}
    y: ${y}
    height: ${height}
    width: ${width}
    depth: ${depth}
    node1: (${startX}, ${startY})
    node2: (${startX + x}, ${startY + y})
  `)
  const peer = {
    position: {
      x: (((startX+x+startX)/2) / canvas.width) * 100 - 50,
      z: (((startY+y+startY)/2) / canvas.height) * 100 - 50,
      y: 100,
    },
    properties: {
      width,
      height,
      depth,
      color: 'gold',
    }
  }

  appendPeer(peer)
  robot.teach({ startX: null, startY: null, isMouseDown: false, x: 0, y: 0 })
};

function appendPeer(x) {
  robot.teach(x, (state, payload) => {
    return {
      ...state,
      peers: [
        ...state.peers,
        payload
      ]
    }
  })
}

function graphics(target) {
  const canvas = target.closest(robot.link).querySelector('.paper')
  const rectangle = canvas.getBoundingClientRect()

  return { canvas, rectangle }
}

function getStars(target) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(document.documentElement).fontSize);

  canvas.height = rhythm;
  canvas.width = rhythm;

  let color = 'rgba(255,255,255,.85)';
  context.fillStyle = color;
  context.fillRect(rhythm / 2, rhythm / 2, 1, 1);

  color = 'rgba(0,0,0,.85)';
  context.fillStyle = color;
  context.fillRect(rhythm / 2 + 1, rhythm / 2 + 1, 1, 1);

  return `url(${canvas.toDataURL()})`;
}

robot.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden; 
    position: relative;
  }

  & > * {
    position: absolute;
    inset: 0;
  }

  & canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
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
    background: var(--draw-term-bg, var(--color, lemonchiffon));
    transform: var(--transform);
    pointer-events: none;
    z-index: 9001;
    display: grid;
    place-items: center;
    overflow: hidden;
    padding: 1rem;;
    opacity: 0;
    transition: opacity 100ms ease-out;
  }

  &[data-touching="true"] .cursor {
    opacity: .5;
  }

  & .prose {
    font-style: italic;
    max-width: 40ch;
    margin: auto;
  }

  & .a-enter-vr {
    display: none !important;
  }

`)

function position(priority) {
	return Object.keys(orientation).reduce((clean, key) => {
		if(priority[key]) {
			clean[key] = priority[key]
		}
		return clean
	}, {})
}

function reduceConflicts(conflicts) {
	return Object.keys(conflicts)
		.reduce((str, key) => {
			return `${str} ${key}="${conflicts[key]}"`
		}, '')
}

function aBox(priority, conflicts) {
	return {
		avatar: 'a-box',
		...orientation,
		...position(priority),
		args: reduceConflicts(conflicts)
	}
}

function aSphere(priority, conflicts) {
	return {
		avatar: 'a-sphere',
		...orientation,
		...position(priority),
		args: reduceConflicts(conflicts)
	}
}

function aCylinder(priority, conflicts) {
	return {
		avatar: 'a-cylinder',
		...orientation,
		...position(priority),
		args: reduceConflicts(conflicts)
	}
}

function aPlane(priority, conflicts) {
	return {
		avatar: 'a-plane',
		...orientation,
		...position(priority),
		args: reduceConflicts(conflicts)
	}
}

function aSky(priority, conflicts) {
	return {
		avatar: 'a-sky',
		...orientation,
		...position(priority),
		args: reduceConflicts(conflicts)
	}
}

