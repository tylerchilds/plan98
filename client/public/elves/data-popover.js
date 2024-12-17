import elf from '@silly/elf'
const $ = elf('data-popover')

$.when('click', '[data-popover]', pop)

$.when('click', '*:not([data-popover])', release)

function pop(event) {
  const { popped }= $.learn()

  if(!popped) {
    attack(event, event.target.dataset.popover)
  } else {
    release()
  }

  $.teach({ popped: !popped })
}

function attack (e, x) {
  popover(e, x)
}


function release () {
  popover()
}

// initialize popover
const node = document.createElement('div');
node.classList.add('data-popover')
document.body.appendChild(node);

export function popover(event, content) {
  switch(arguments.length) {
    case 2:
      show(event, content);
      break;
    default:
      hide();
  }
}

function show(event, content) {
  node.classList.add('active');
  node.innerHTML = content;

  const { x, y } = event;

  node.dataset.x = x;
  node.dataset.y = y;

  node.style.setProperty("--x", x + 'px');
  node.style.setProperty("--y", y + 'px');
}

function hide() {
  node.classList.remove('active');
}

const popoverStyles = `
  <style>
    .data-popover {
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
    }

    .data-popover.active {
      display: block;
      opacity: 1;
      z-index: 10;
    }

    .data-popover button {
      display: block;
      border: none;
      text-align: left;
      transition: all 100ms;
      width: 100%;
      color: rgba(255,255,255,.85);
      padding: .25rem .5rem;
      background: transparent;
    }

    .data-popover button:hover,
    .data-popover button:focus {
    }

  </style>
`;

document.body.insertAdjacentHTML("beforeend", popoverStyles);

$.style(`
  & {
    max-height: 100%;
    height: 100%;
    display: block;
    overflow: auto;
  }
`)

