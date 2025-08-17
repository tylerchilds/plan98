import app from '@plan98/app'

const padding = 4

const initial = {
  startX: null,
  startY: null,
  x: null,
  y: null,
  invertX: false,
  invertY: false,
}

const computer = app('mem-ex', {
  ...initial
})

computer.draw((target) => {
  if(!target.innerHTML) {
    target.innerHTML = `
      <canvas></canvas>
      <div class="cursor"></div>
    `

    const { canvas } = graphics(target)
    const context = canvas.getContext('2d')

    canvas.width = self.innerWidth;
    canvas.height = self.innerHeight;
    canvas.style=`background-image: ${getStars(target)};`

    context.textRenderingOptimization = 'optimizeSpeed'
    context.font = '32px Recursive' // or your preferred size/font
    context.fillStyle = '#000' // solid color
    context.imageSmoothingEnabled = false
  }
}, {
  beforeUpdate(target) {
    {
      const { startX, startY, x, y, invertX, invertY } = computer.learn()
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
      const { isMouseDown } = computer.learn()
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
      const { x, y } = computer.learn()
      const context = canvas.getContext('2d')
      context.clearRect(0, 0, canvas.width, canvas.height)

      context.textAlign = 'left'
      context.textBaseline = 'top'
      context.fillText(`${x}, ${y}`, padding, padding);

      context.textAlign = 'right'
      context.textBaseline = 'top'
      context.fillText(`${x}, ${y}`, canvas.width - padding, padding);

      context.textAlign = 'left'
      context.textBaseline = 'bottom'
      context.fillText(`${x}, ${y}`, padding, canvas.height - padding);

      context.textAlign = 'right'
      context.textBaseline = 'bottom'
      context.fillText(`${x}, ${y}`, canvas.width - padding, canvas.height - padding);

      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(`${x}, ${y}`, canvas.width / 2, canvas.height / 2)
    }

    {
      const cursor = target.querySelector('.cursor')

      const { x, y, width, height, top, right, bottom, left } = cursor.getBoundingClientRect()
      cursor.innerHTML = `
      <div class="prose">
        This cursor is ${width} pixels wide and ${height} high. By multiplying them together, we know the area is ${width * height}px. By adding them together, twice, we can calculate the perimeter as ${ width + height + width + height}px.<br><br>Do you think you can calculate the negative space outside the cursor but still on the screen?<br><br>The additional information we have are the inset coordinates.<br><br>top: ${top}<br>left: ${left}<br>right: ${right}<br>bottom: ${bottom}<br><br>The canvas area is ${rectangle.width * rectangle.height}px.
      </div>
      `
    }
  }
})

computer.when('pointerdown', 'canvas', start)

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

  computer.teach({ startX, startY, isMouseDown: true, x, y })
}

computer.when('pointermove', 'canvas', move)

function move (e) {
  e.preventDefault()
  const { startX, isMouseDown, startY } = computer.learn()
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
  computer.teach({ x, y, invertX: x < 0, invertY: y < 0 })
}

computer.when('pointerup', 'canvas', end)

function end (e) {
  e.preventDefault()
  computer.teach({ startX: null, startY: null, isMouseDown: false, x: 0, y: 0 })
};

function graphics(target) {
  const canvas = target.closest(computer.link).querySelector('canvas')
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


computer.style(`
  & { display: block; height: 100%; overflow: hidden; }

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
    opacity: 1;
  }

  & .prose {
    font-style: italic;
    max-width: 40ch;
    margin: auto;
  }
`)
