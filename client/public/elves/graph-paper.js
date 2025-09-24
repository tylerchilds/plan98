import elf from '@silly/elf'

let lineWidth = 0
let isMousedown = false
let points = []
let strokeHistory = []
const strokeRevisory = []

const $ = elf('graph-paper', {
})

function engine(target) {
  const canvas = target.closest($.link).querySelector('.canvas.stack')
  const rectangle = canvas.getBoundingClientRect()

  return { canvas, rectangle }
}

$.draw(target => {
  if(target.innerHTML) return update(target)
  mount(target)
}, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
  {
    const { beltGrabbed } = $.learn()
    target.dataset.belt = beltGrabbed ? 'true' : 'false'
  }
}

function afterUpdate(target) {
}

function update(target) {
  {
    const { panX, panY, panXmod, panYmod, zoom } = $.learn()
    const workspace = target.querySelector('.workspace')
    const stars = target.querySelector('.stars')
    workspace.style.setProperty("--pan-x", panX + 'px');
    workspace.style.setProperty("--pan-y", panY + 'px');
    workspace.style.setProperty("--zoom", zoom);
    stars.style.setProperty("--pan-x-mod", panXmod + 'px');
    stars.style.setProperty("--pan-y-mod", panYmod + 'px');
  }
  return null // don't send anything back
}

function mount(target) {
  const { panX, panY, panXmod, panYmod, zoom } = $.learn()

  const stars = getStars(target)

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.classList.add('stack')
  canvas.classList.add('canvas')
  canvas.classList.add('bulletin-canvas')
  canvas.classList.add('stars')

  canvas.width = 5000;
  canvas.height = 5000;
  canvas.style=`background-image: ${stars};`

  target.innerHTML = '<div class="workspace"></div>'

  target.querySelector('.workspace').appendChild(canvas)
}

$.style(`
  & {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: block;
    background: black;
  }

  & .workspace {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    grid-template-areas: "root-of-${$.link}";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    transform: translate(var(--pan-x, 0), var(--pan-y, 0)) scale(var(--zoom, 1));
    position: relative;
    z-index: 2;
  }

  & .stars {
    background-color: white;
  }

  & canvas {
    touch-action: manipulation;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
  }
`)

$.when('focus', '[data-share]', (event) => {
  event.target.select()
})

function getStars(target) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(document.documentElement).fontSize);

  canvas.height = rhythm;
  canvas.width = rhythm;

  let color = 'rgba(255,255,255,.85)';
  ctx.fillStyle = color;
  ctx.fillRect(rhythm / 2, rhythm / 2, 1, 1);

  color = 'rgba(0,0,0,.85)';
  ctx.fillStyle = color;
  ctx.fillRect(rhythm / 2 + 1, rhythm / 2 + 1, 1, 1);

  return `url(${canvas.toDataURL()})`;
}

$.when('click', '*', (event) => {
  if(event.target.closest('.menu-item')) {
    // child of a menu item
    return
  }
  $.teach({ activeMenu: null })
})

$.when('click', '[data-menu-target]', (event) => {
  const { activeMenu } = $.learn()
  const { menuTarget } = event.target.dataset
  $.teach({ activeMenu: activeMenu === menuTarget ? null : menuTarget })
  event.stopImmediatePropagation()
})

self.addEventListener("resize", function () {
  $.teach({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  }, (s,p) => {
    return {
      ...s,
      'display-self': {
        ...s['display-self'],
        ...p
      }
    }
  })
});
