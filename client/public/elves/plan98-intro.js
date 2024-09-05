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
})

$.draw((target) => {
  const { menu, started, accents, query, suggestIndex, focused, suggestions } = $.learn()
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
      <div class="nav">
        <form class="search" method="get">
          <div class="input-grid">
            <input placeholder="Imagine..." type="text" value="${query}" name="search" autocomplete="off" />
            <button type="submit">
              <sl-icon name="search"></sl-icon>
            </button>
          </div>
          <div class="suggestions ${focused ? 'focused' : ''}">
            <div class="suggestion-box">
              ${suggestions.map((x, i) => {
                const item = documents.find(y => {
                  return x.ref === y.path
                })

                return `
                  <button class="${suggestIndex === i ? 'active': ''}" data-name="${item.name}" data-path="${item.path}" data-tooltip="${item.path}">
                    <div class="name">
                      ${item.name}
                    </div>
                  </button>
                `
              }).join('')}
            </div>
          </div>
        </form>

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
      <iframe src="${src || '/app/plan98-dashboard'}" name="plan98-window"></iframe>
    </div>
  `
}, {
  afterUpdate: ensureActiveIsCentered
})

function ensureActiveIsCentered(target) {
  const activeItem = target.querySelector('.suggestion-box .active')
  if(activeItem) {
    activeItem.scrollIntoView({block: "nearest", inline: "nearest"})
  }

  // don't do this
  // unrelated, just keep the search icon there ok
  //
  const ogIcon = target.querySelector('sl-icon')
  const iconParent = ogIcon.parentNode

  const icon = document.createElement('sl-icon')
  icon.name = ogIcon.name
  ogIcon.remove()
  iconParent.appendChild(icon)
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
      node.style.setProperty('--color', currentC);
      return currentC
    })
    $.teach({accents})
  })
}, 2500)


const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', '[name="search"]', event => {
  if(event.keyCode === down) {
    event.preventDefault()
    $.teach({ suggestIndex: $.learn().suggestIndex + 1 })
    return
  }

  if(event.keyCode === up) {
    event.preventDefault()
    $.teach({ suggestIndex: $.learn().suggestIndex - 1 })
    return
  }

  if(event.keyCode === enter) {
    event.preventDefault()
    const { suggestions, suggestIndex } = $.learn()
    const item = documents.find(y => {
      return suggestions[suggestIndex].ref === y.path
    })

    if(item) {
      window.location.href = '/app/media-plexer?src=' +item.path
      return
    }
  }
})

$.when('click', '[data-path]', event => {
  event.preventDefault()
  const { path } = event.target.dataset
  window.location.href = '/app/media-plexer?src=' +path
})

$.when('input', '[name="search"]', (event) => {
  const { value } = event.target;
  const suggestions = idx.search(value)
  $.teach({ suggestions,  query: event.target.value  })
})

$.when('focus', '[name="search"]', event => {
  $.teach({ focused: true })
})

$.when('blur', '[name="search"]', event => {
  $.teach({ focused: false, suggestIndex: 0 })
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
      handleMetaKey()
    }
  }
  self.addEventListener('keydown', handleEvent);

  self.addEventListener('message', function handleMessage(event) {
  if(event.data.whisper === 'metaKey') {
    handleMetaKey()
  } else { console.log(event) }

  });
}

function handleMetaKey() {
  if(document.querySelector('plan98-intro')) {
    const { menu } = $.learn()
    $.teach({ menu: !menu })
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
    pointer-events: all;
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
    transform: skew(-25deg) translateX(-1rem);
    opacity: .75;
  }

  & .slant-1 {
    background: var(--color, var(--red));
  }
  & .slant-2 {
    background: var(--color, var(--orange));
  }
  & .slant-3 {
    background: var(--color, var(--yellow));
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

  & .search button {
    display: inline-block;
  }

  & .search button {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: var(--button-color, dodgerblue);
    border: none;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
  }

  & .search button:focus,
  & .search button:hover {
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
    max-height: 80vh;
    overflow: auto;
    z-index: 10;
    
  }

  & .suggestion-box button {
    background: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85));
    color: var(--button-color, dodgerblue);
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
  }

  & .suggestion-box button:focus,
  & .suggestion-box button:hover {
    background-color: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    color: white;
  }

  & .suggestion-box button.active {
    color: white;
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    background-color: var(--button-color, dodgerblue);
  }


  & [data-suggestion] {
    display: block;
  }

  & .input-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    max-width: 480px;
    margin: auto;
    text-align: left;
  }

  & .input-grid button {
    font-size: 1.2rem;
    padding: .5rem 1rem;
    margin: 0 auto;
    width: 100%;
    max-width: 480px;
  }

  & [data-suggestion] {
    position: relative;
  }

  & .name {
    position: relative;
    z-index: 2;
  }

`)
