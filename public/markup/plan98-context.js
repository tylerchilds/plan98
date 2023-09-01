const $ = module('plan98-context')

$.draw((target) => {
  return `
    <div>
      ${target.innerHTML}
    </div>
    <button data-context>...</button>
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
    display: inline-grid;
    grid-template-columns: 1fr auto;
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
      color: rgba(0, 0, 0, .9);
      border-radius: 2px;
      box-shadow:
        0 1px 2px 0 rgba(0, 0 , 0, .1),
        0 2px 4px 0 rgba(0, 0 , 0, .1);
      display: none;
      font-size: 13px;
      left: 0;
      line-height: 1.25;
      padding: 8px;
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
    }

    .tooltip.active {
      display: block;
      opacity: 1;
      z-index: 3;
    }

    .tooltip button {
      display: block;
      border: none;
      background: transparent;
      border-bottom: 1px solid rgba(0,0,0,.25);
    }
  </style>
`;

document.body.insertAdjacentHTML("beforeend", tooltipStyles);
