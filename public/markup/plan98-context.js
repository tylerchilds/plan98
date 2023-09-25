const $ = module('plan98-context')

$.draw((target) => {
  if(target.dataset.drawn) return
  target.dataset.drawn = true
  const label = target.dataset.label || '...'
  return `
    <div>
      ${target.innerHTML}
    </div>
    <button data-context>${label}</button>
  `
})

$.when('click', '[data-context]', (event) => {
  const closestMenu = event.target.closest($.link).dataset.menu
  tooltip(event, closestMenu);
});

document.body.addEventListener('click', (event) => {
  const tooltipChild = !!event.target.closest('.tooltip')
  const contextChild = !!event.target.closest($.link)
  const allowed = tooltipChild || contextChild
  console.log(tooltipChild, contextChild)
  if(!allowed) {
    tooltip()
  }
})

$.style(`
  & {
    display: grid;
    grid-template-columns: 1fr auto;
    pointer-events: none;
  }

  &[data-inline] {
    display: inline-grid;
  }

  & button,
  & a {
    pointer-events: auto;
  }

  & [data-context] {
    pointer-events: auto;
  }
`)

// initialize tooltip
const node = document.createElement('div');
node.classList.add('tooltip')
document.body.appendChild(node);

function tooltip(event, content) {
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
    .tooltip {
      background: white;
      border-radius: 2px;
      display: none;
      left: 0;
      padding: .5rem;
      position: fixed;
      opacity: 0;
      border: 1px solid rgba(0,0,0,.85);
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
    }

    .tooltip.active {
      display: block;
      opacity: 1;
      z-index: 10;
    }

    .tooltip button {
      display: block;
      border: none;
      background: transparent;
    }
  </style>
`;

document.body.insertAdjacentHTML("beforeend", tooltipStyles);
