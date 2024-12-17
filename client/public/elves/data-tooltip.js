import elf from '@silly/elf'

const $ = elf('data-tooltip')

$.when('mouseenter', '[data-tooltip]', attack)
$.when('mouseleave', '[data-tooltip]', release)

$.when('mousedown', '[data-tooltip]', attack)
$.when('mousemove', '[data-tooltip]', sustain)
$.when('mouseup', '[data-tooltip]', release)

$.when('touchstart', '[data-tooltip]', attack)
$.when('touchend', '[data-tooltip]', release)

function attack(event) {
  tooltip(event, event.target.dataset.tooltip)
}

function sustain(event) {
  tooltip(event)
}

function release () {
  tooltip()
}

// initialize tooltip
const node = document.createElement('div');
node.classList.add('data-tooltip')
document.body.appendChild(node);

export function tooltip(event, content) {
  switch(arguments.length) {
    case 2:
      show(event, content);
      break;
    case 1:
      move(event);
      break;
    default:
      hide();
  }
}

function show(event, content) {
  node.classList.add('active');
  node.innerHTML = content;
  move(event);
}

function move(event) {
  const { x, y } = event;
  node.dataset.x = x;
  node.dataset.y = y;

  animate();
}

function hide() {
  node.classList.remove('active');
}

function animate() {
  requestAnimationFrame(draw)
}

function draw() {
  const { x, y } = node.dataset;

  node.style.setProperty("--x", x + 'px');
  node.style.setProperty("--y", y + 'px');
}

const tooltipStyles = `
  <style>
    .data-tooltip {
      background: rgba(0,0,0,.85);
      color: rgba(255,255,255,.85);
      box-shadow: 0px 0px 4px 4px rgba(0,0,0,.10);
      display: none;
      left: 0;
      padding: .25rem .5rem;
      position: fixed;
      opacity: 0;
      transform-origin: right bottom;
      transform: translate(
        max(0px, calc(-100% + var(--x) - 3px)),
        max(0px, calc(-100% + var(--y) - 3px))
      );
      transition: opacity 100ms ease-in-out;
      top: 0;
      white-space: break-work;
      max-width: 200px;
      z-index: -1;
      pointer-events: none;
    }

    .data-tooltip.active {
      display: block;
      opacity: 1;
      z-index: 10;
    }

    .data-tooltip button {
      display: block;
      border: none;
      background: transparent;
      text-align: left;
      transition: all 100ms;
      border-radius: 2rem;
      padding: .25rem .5rem;
      border: 3px solid transparent;
    }

    .data-tooltip button:hover,
    .data-tooltip button:focus {
      border-color: lime;
    }
  </style>
`;

document.body.insertAdjacentHTML("beforeend", tooltipStyles);

$.style(`
  & {
    max-height: 100%;
    height: 100%;
    display: block;
    overflow: auto;
  }
`)
