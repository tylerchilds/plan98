import module from '../module.js'

const $ = module('card-list')

$.draw(target => {
  infiniteObservation(target)
  const key = target.getAttribute('key')
  const list = state[key] || []

  const cards = list.map((item, index) => {
    const { touchInformation={} } = item
    let c = touchInformation.active ? 'active' : ''
    c += touchInformation.leaving
      ? ` remove ${touchInformation.leaving}`
      : ``
    return `
      <div class="card ${c}" data-index="${index}" data-key="${key}" style="${touchInformation.styles}">
        ${drawCard(item)}
      </div>
    `
  }).join('')

  return `
    <div role="infinite">
      ${cards}
    </div>
    <button role="observable">More</button>
  `
})

function drawCard(data) {
  const renderers = {
    'email': (data) => `
      ${drawMeta(data.meta)}
      <div>
        ${data.subject}
      </div>
    `,
    'default': (data) => `
      ${JSON.stringify(data)}
    `
  }

  return (renderers[data.post_hint] || renderers['default'])(data)
}

function drawMeta({author, authorPhotoUrl, timestamp }) {
  return `
    <div class="meta">
      <img
        class="meta-photo"
        src="${authorPhotoUrl}"
        alt="Photo of ${author}"
      />
      <div class="meta-name">${author}</div>
      <div class="meta-date">${format(timestamp)}</div>
    </div>
  `
}

$.when('touchstart', '.card', event => {
  const { key, index } = event.target.dataset
  const data = state[key][index]
  data.touchInformation = {
    startTime: event.timeStamp,
    firstTouch: {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    }
  }
})

$.when('touchmove', '.card', event => {
  const { key, index } = event.target.dataset
  const data = state[key][index]
  const endTime = event.timeStamp;

  let { startTime, firstTouch, gesture, active } = data.touchInformation
  const duration = endTime - startTime;
  const lastTouch = {
    x: event.touches[0].clientX,
    y: event.touches[0].clientY
  }

  const distance = {
    x: lastTouch.x - firstTouch.x,
    y: lastTouch.y - firstTouch.y
  }
  let styles = ''
  switch(gesture){
    case 'scroll': return;
    case 'swipe':
      active = true
      const left = distance.x + 'px';
      const opacity = 1 - (Math.abs(distance.x) / window.innerWidth);
      styles += `--left: ${left};`;
      styles += `--opacity: ${opacity};`;
      break;
    default:
      if(Math.abs(distance.y) > Math.abs(distance.x)){
        gesture = 'scroll';
      } else {
        gesture = 'swipe';
      }
  }

  data.touchInformation = {
    ...bus.cache[key].val[index].touchInformation,
    duration,
    endTime,
    lastTouch,
    distance,
    active,
    gesture,
    styles
  }
})

$.when('touchend', '.card', event => {
  const { key, index } = event.target.dataset
  const data = state[key][index]
  const { distance } = data.touchInformation
  let leaving

  if(thresholdMet(data)){
    const direction = distance.x > 0 ? 'right' : 'left';
    leaving = direction
  }

  data.touchInformation = {
    ...bus.cache[key].val[index].touchInformation,
    gesture: null,
    active: false,
    leaving,
    styles:[]
  }
})
function thresholdMet(data){
  const { touchInformation } = data
  const distance = Math.abs(touchInformation.distance.x);
  const velocity = distance / touchInformation.duration;
  const x = touchInformation.lastTouch.x;

  // close to the left edge
  if(x < 30 && distance > 20) return true;
  // close to the right edge
  if(x > window.innerWidth - 30 && distance > 20) return true;

  if(velocity > .5) return true;

  return false;
}

$.when('click', '.card', event => {
  const { key, index } = event.target.dataset
  const data = state[key][index]

  showModal(`
    <div>
      ${drawMeta(data.meta)}
      <div>
        ${data.subject}
      </div>
      <div>
        ${data.textBody}
      </div>
    </div>
  `)
})

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// timestamp helper
function format(timestamp){
  const date = new Date(timestamp);
  return MONTHS[date.getMonth()] +' '+ date.getDate() +', '+ date.getFullYear();
}

$.style(`
  & .card{
    background-color: #fff;
    border-radius: 1px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.27);
    margin-bottom: 8px;
    max-height: 400px;
    padding: 16px;
    position: relative;
    transition: all 225ms ease-in;
    opacity: var(--opacity, 1);
    transform: translateX(var(--left));
    overflow: hidden;
    max-height: 100%;
    max-width: 100%;
  }

  & .card * {
    pointer-events: none;
  }

  & .card.active{
    box-shadow: 0 6px 12px rgba(0,0,0,0.27);
    transition: box-shadow 225ms ease-out;
    z-index: 10;
  }
u
  & .card.remove{
    margin-bottom: 0;
    max-height: 0;
    padding: 0;
    opacity: var(--opacity, 0);
    transition: transform 195ms ease-in 0ms,
      opacity 195ms ease-in 0ms,
      max-height 195ms ease-out 195ms,
      padding 195ms ease-out 195ms,
      margin 195ms ease-out 195ms;
  }

  & .card.left{
    --left: -110%;
  }

  & .card.right{
    --left: 110%;
  }

  & .card.recover{
    transition: opacity 195ms ease-out 195ms,
      max-height 195ms ease-in,
      padding 195ms ease-in,
      margin 195ms ease-in;
  }

  .meta{
    clear: both;
    margin-bottom: 16px;
  }

  .meta-photo{
    border-radius: 40px;
    float: left;
    margin-right: 16px;
    width: 40px;
    height: 40px;
  }

  .meta-name{
    font-weight: 500;
    line-height: 22px;
  }

  .meta-date{
    color: rgba(0,0,0,.54);
    font-size: 12px;
    line-height: 18px;
  }
`)

function infiniteObservation(target) {
  if(target.dataset.observed) return

  const intersectionObserver = new IntersectionObserver(function (entries) {
    // If intersectionRatio is 0, the target is out of view
    // and we do not need to do anything.
    console.log(entries);
    if (entries[0].isIntersecting) {
      loadItems(20);
      console.log("Loaded new items");
    }
  });

  new MutationObserver(function infiniteMutationCallback(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        intersectionObserver.observe(
          target.querySelector("[role='observable']")
        );
      }
    }
  }).observe(target, { childList: true });

  // Simulate a request to load data and render it to the list element;
  function loadItems(number) {
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(Array(number).fill("A List Item"));
      }, 500);
    }).then((data) => {
      console.log(data)
    });
  }

  target.dataset.observed = true
}
