import elf from '@silly/tag'
import { render } from "@sillonious/saga"
import { idx, documents } from './giggle-search.js'

const palette = [
  'firebrick', // accent 1
  'darkorange', // accent 2
  'gold', // accent 3
  'mediumseagreen', // underline
  'dodgerblue', // action
  'mediumpurple' // background
]

const buttons = {
  firebrick: ['mediumpurple'],
  darkorange: ['firebrick'],
  gold: ['darkorange'],
  mediumseagreen: ['gold'],
  dodgerblue: ['mediumseagreen'],
  mediumpurple: ['dodgerblue'],
}

const underlines = {
  firebrick: ['dodgerblue'],
  darkorange: ['mediumpurple'],
  gold: ['firebrick'],
  mediumseagreen: ['darkorange'],
  dodgerblue: ['gold'],
  mediumpurple: ['mediumseagreen'],
}

const friends = {
  firebrick: ['darkorange', 'gold', 'mediumseagreen'],
  darkorange: ['gold', 'mediumseagreen', 'dodgerblue'],
  gold: ['mediumseagreen', 'dodgerblue', 'mediumpurple'],
  mediumseagreen: ['dodgerblue', 'mediumpurple', 'firebrick'],
  dodgerblue: ['mediumpurple', 'firebrick', 'darkorange'],
  mediumpurple: ['firebrick', 'darkorange', 'gold'],
}

const $ = elf('plan98-intro', {
  accents: ['firebrick', 'darkorange', 'gold'],
  query: "",
  suggestIndex: 0,
  suggestions: [],
  suggestionsLength: 0,
  menu: true
})

$.draw((target) => {
  const { url, menu, started, accents, query, suggestIndex, focused, suggestions } = $.learn()
  const src = target.getAttribute('src')
  return `
    <div class="wall ${started && !menu ? 'broken':''}">
      <div class="hero">
        <div class="frame">
          <div style="text-align: center">
            <div class="logo-mark">
              <div class="plan98-letters">
                Plan98
              </div>
              <div class="plan98-slants">
                <div class="slant-1" style="--color: ${accents[0]}"></div>
                <div class="slant-2" style="--color: ${accents[1]}"></div>
                <div class="slant-3" style="--color: ${accents[2]}"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      ${started ?render(`
<a
href: /app/hello-bluesky
target: plan98-window
text: Hello Bluesky

<a
href: /app/owncast-surfer
target: plan98-window
text: Owncast Surfer

<a
href: steam://rungameid/413150
text: Stardew Valley

<a
href: /app/sonic-knuckles
text: Sonic and Knuckles

<a
href: steam://rungameid/584400
text: Sonic Mania
`): `
        <div class="body">

          <div class="screenplay">
            ${render(`# about

@ synthia
> Plan98 is an operating system of the historical fiction variety. It did not release in the year 1998. Or did it? If it did, connect. If not, you will be unable to take part in the spoils after ending the time loop of 2038.

<button
class: break-fourth-wall
text: Connect
`)}
          </div>
        </div>
      `}
    </div>
    <div class="fourth">
      <iframe src="${url || src || '/app/plan98-dashboard'}" name="plan98-window"></iframe>
    </div>
    <div class="nav">
      <form class="search" method="get">
        <div class="suggestions ${focused ? 'focused' : ''}">
          <div class="suggestion-box">
            ${suggestions.map((x, i) => {
              const item = documents.find(y => {
                return x.ref === y.path
              })

              return `
                <button class="auto-item ${suggestIndex === i ? 'active': ''}" data-name="${item.name}" data-path="${item.path}">
                  <div class="name">
                    ${item.name}
                  </div>
                </button>
              `
            }).join('')}
          </div>
        </div>
        <div class="input-grid">
          <div class="logo-wrapper">
          <plan98-logo></plan98-logo>
          </div>
          <input placeholder="Imagine..." type="text" value="${query}" name="search" autocomplete="off" />
          <button type="submit">
            <sl-icon name="search"></sl-icon>
          </button>
        </div>
      </form>
    </div>
  `
}, {
  beforeUpdate,
  afterUpdate
})

function beforeUpdate(target) {
  { // save suggestion box scroll top
    const list = target.querySelector('.suggestion-box')
    if(!list) return
    console.log(list.scrollTop)
    target.dataset.scrollpos = list.scrollTop
  }
}

function afterUpdate(target) {
  { // scroll suggestions
    const list = target.querySelector('.suggestion-box')
    if(!list) return
    console.log(target.dataset.scrollpos)
    list.scrollTop = target.dataset.scrollpos
  }

  { // scroll item into view
    const activeItem = target.querySelector('.suggestion-box .active')
    if(activeItem) {
      activeItem.scrollIntoView({block: "nearest", inline: "nearest"})
    }
  }

  { // recover icons from the virtual dom
    const ogIcon = target.querySelector('sl-icon')
    const iconParent = ogIcon.parentNode

    const icon = document.createElement('sl-icon')
    icon.name = ogIcon.name
    ogIcon.remove()
    iconParent.appendChild(icon)

    const ogLogo = target.querySelector('plan98-logo')
    const logoParent = ogLogo.parentNode

    const logo = document.createElement('plan98-logo')
    logo.name = ogLogo.name
    ogLogo.remove()
    logoParent.appendChild(logo)
  }

  { // focus cursor, when "focused" but not ~focused~
    const { focused } = $.learn()
    const search = target.querySelector('[name="search"]')

    if(focused && search !== document.activeElement) {
      search.focus()
    }
  }
}

const settingsInterval = setInterval(() => {
  const index = Math.floor(Math.random() * palette.length)
  const color = palette[index];
  [...document.querySelectorAll($.link)].map(target => {
    target.style.setProperty('--color', color);
    target.style.setProperty('--button-color', buttons[color]);
    target.style.setProperty('--underline-color', underlines[color]);
    const accents = [...target.querySelectorAll('[class^="slant-"]')].map((node, i) => {
      const currentC = friends[color][i]
      target.style.setProperty('--accent-color-'+i, currentC);
      return currentC
    })
    $.teach({accents})
  })
}, 2500)


const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', '[name="search"]', event => {
  const { suggestionsLength } = $.learn()
  if(event.keyCode === down) {
    event.preventDefault()
    const nextIndex = $.learn().suggestIndex + 1
    if(nextIndex >= suggestionsLength) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === up) {
    event.preventDefault()
    const nextIndex = $.learn().suggestIndex - 1
    if(nextIndex < 0) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === enter) {
    event.preventDefault()
    const { suggestions, suggestIndex } = $.learn()
    const item = documents.find(y => {
      return suggestions[suggestIndex].ref === y.path
    })

    if(item) {
      const iframe = event.target.closest($.link).querySelector('[name="plan98-window"]')
      const url = '/app/media-plexer?src=' +item.path
      iframe.src = url
      $.teach({ started: true, menu: false, url  })
      return
    }
  }
})

$.when('click', '.auto-item', event => {
  event.preventDefault()
  const url = '/app/media-plexer?src=' +event.target.dataset.path
  const iframe = event.target.closest($.link).querySelector('[name="plan98-window"]')
  iframe.src = url
  $.teach({ started: true, menu: false, url  })
})

$.when('input', '[name="search"]', (event) => {
  const { value } = event.target;
  const suggestions = idx.search(value)
  $.teach({ suggestions, suggestionsLength: suggestions.length, query: event.target.value  })
})

$.when('focus', '[name="search"]', event => {
  $.teach({ focused: true })
})

$.when('blur', '[name="search"]', event => {
  setTimeout(() => {
    $.teach({ focused: false, suggestIndex: 0 })
    document.activeElement.blur()
  }, 250)
})

$.when('click', '[data-toggle]', async (event) => {
  const { menu } = $.learn()
  $.teach({ menu: !menu })
})

$.when('click', '.break-fourth-wall', (event) => {
  $.teach({ started: true })
  clearInterval(settingsInterval)
})

let once = false
export function superKey() {
  if(once) return
  once = true

  function handleEvent (event) {
    if (event.metaKey) {
      handleSuperKey(event)
    }
  }
  self.addEventListener('keydown', handleEvent);

  self.addEventListener('message', function handleMessage(event) {
    if(event.data.whisper === 'metaKey') {
      handleMetaKey()
    } else { console.log(event) }
  });
}

export function handleSuperKey(event) {
  if(document.querySelector('plan98-intro')) {
    const { menu } = $.learn()
    const focused = !menu
    $.teach({ menu: !menu, started: true, focused })

    return
  }

  if(self.self !== self.top) {
    self.parent.postMessage({ whisper: 'metaKey' }, "*");
  } else {
    const node = document.body.querySelector('sillonious-brand')|| document.body
    node.insertAdjacentHTML("beforeend", '<plan98-intro></plan98-intro>')
  }
}

$.style(`
  & {
    --red: firebrick;
    --orange: darkorange;
    --yellow: gold;
    --green: mediumseagreen;
    --blue: dodgerblue;
    --purple: mediumpurple;
    position: relative;
    width: 100%;
    max-height: 100%;
    display: block;
    height: 100%;
  }
  & .menu {
    position: absolute;
    right: 0;
    bottom: 0;
    height: 100%;
    max-width: 100%;
    width: 320px;
    max-height: 480px;
  }

  & .break-fourth-wall {
    width: 100%;
  }
  & .control-toggle {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 4;
  }

  & [data-toggle] {
    background: var(--color);
    background-image: linear-gradient(rgba(0,0,0, .25), rgba(0,0,0,.5));
    border: none;
    color: white;
    width: 50px;
    height: 50px;
    display: grid;
    place-content: center;
    font-weight: 800;
    font-size: 24px;
  }

  & .logo-mark {
    --v-font-mono: 0;
    --v-font-casl: 0;
    --v-font-wght: 800;
    --v-font-slnt: 0;
    --v-font-crsv: 1;
    font-variation-settings:
      "MONO" var(--v-font-mono),
      "CASL" var(--v-font-casl),
      "wght" var(--v-font-wght),
      "slnt" var(--v-font-slnt),
      "CRSV" var(--v-font-crsv);
    font-family: 'Recursive';
    font-size: 72px;
    position: relative;
    display: inline-block;
  }

  & .frame {
    max-width: 100%;
  }

  & .hero {
    background-color: var(--color, mediumpurple);
    background-image: linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.5));
    padding-top: 100px;
    display: grid;
    place-items: end center;
  }

  & .about {
    margin-bottom: 2rem;
  }

  & .plan98-slants {
    display: grid;
    grid-template-columns: 1ch 1ch 1ch;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    transform: skew(-50deg) translateX(-1rem);
    opacity: .75;
  }

  & .slant-1 {
    background: var(--accent-color-0, var(--red));
  }
  & .slant-2 {
    background: var(--accent-color-1, var(--orange));
  }
  & .slant-3 {
    background: var(--accent-color-2, var(--yellow));
  }

  & .plan98-letters {
    position: relative;
    z-index: 2;
    color: rgba(255,255,255,1);
    text-shadow: 1px 1px rgba(0,0,0,1);
    border-bottom: 1rem solid var(--underline-color, mediumseagreen);
    padding: 0 2rem;
  }

  & .wall {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    opacity: .85;
    z-index: 2;
  }

  & .wall button {
    background-color: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0, .25), rgba(0,0,0,.5));
    color: white;
    border: none;
    padding: 1rem;
    max-width: 320px;;
    margin: auto;
    display: block;
  }

  & .wall.broken {
    z-index: 1;
  }

  & .wall button:hover,
  & .wall button:focus {
    background-image: linear-gradient(rgba(0,0,0, .15), rgba(0,0,0,.4));
  }

  & .fourth {
    opacity: 0;
    transition: opacity 250ms ease-in-out;
    height: 0;
  }



  & .broken + .fourth {
    height: 100%;
    opacity: 1;
    overflow: auto;
    position: absolute;
    inset: 0;
    z-index: 2;
  }

  & .menu {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 3;
  }

  & .search {
    text-align: center;
  }

  & .search img {
    display: block;
  }
  & .search input {
    display: block;
    margin: auto;
    text-align: left;
    border: 1px solid var(--button-color, dodgerblue);
    font-size: 1.2rem;
    padding: .5rem 1rem;
    margin: 0 auto;
    width: 100%;
    max-width: 480px;

  }

  & .search .auto-item {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: var(--button-color, dodgerblue);
    border: none;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    display: block;
  }

  & .search .auto-item:focus,
  & .search .auto-item:hover {
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
  }

  & .suggestions {
    display: none;
    position: relative;
    max-height: 300px;
    max-width: 480px;
    margin: auto;
    text-align: left;
  }

  & .suggestions.focused {
    display: block;
  }

  & .suggestion-box {
    position: absolute;
    inset: 0;
    height: 300px;
    overflow: auto;
    z-index: 10;
    transform: translateY(-100%);
    max-height: calc(100vh - 3rem);
  }

  & .suggestion-box .auto-item {
    background: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85));
    color: var(--button-color, dodgerblue);
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
  }

  & .suggestion-box .auto-item:focus,
  & .suggestion-box .auto-item:hover {
    background-color: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    color: white;
  }

  & .suggestion-box .auto-item.active {
    color: white;
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    background-color: var(--button-color, dodgerblue);
  }


  & [data-suggestion] {
    display: block;
  }

  & .input-grid {
    display: grid;
    grid-template-columns: 3rem 1fr auto;
    grid-template-rows: 3rem;
    max-width: 480px;
    margin: auto;
    text-align: left;
  }

  & .input-grid .logo-wrapper {
    aspect-ratio: 1;
  }

  & .input-grid [type="submit"] {
    font-size: 1.2rem;
    padding: .5rem 1rem;
    margin: 0 auto;
    width: 100%;
    max-width: 480px;
  }

  & .input-grid [type="submit"] {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: var(--button-color, dodgerblue);
    border: none;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    display: block;
  }

  & .input-grid [type="submit"]:hover,
  & .input-grid [type="submit"]:focus {
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
  }


  & [data-suggestion] {
    position: relative;
  }

  & .name {
    position: relative;
    z-index: 2;
  }

  & .nav {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }
`)
