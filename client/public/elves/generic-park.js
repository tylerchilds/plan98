import elf from '@silly/tag'
import { render } from "@sillonious/saga"
import { innerHTML } from 'diffhtml'
import { actionScript } from './action-script.js'
import { hideModal } from '@plan98/modal'
import natsort from 'natsort'
import lunr from 'lunr'
import 'aframe'

const orientation = {
	x: '0', y: '0', z: '0', roll: '0', pitch: '0', yaw: '0'
}

const Types = {
  File: {
    type: 'File',
  },
  Directory: {
    type: 'Directory',
  },
}


export let idx
export const documents = [];
let p98

async function buildIndex(target) {
  try {
    const { plan98 } = await fetch(`/plan98/about`)
      .then(res => res.json())

    p98 = plan98

    idx = lunr(function () {
      this.ref('path')
      this.field('path')
      this.field('keywords')
      this.field('type')
      this.field('name')
      this.field('extension')
      nest(this, { tree: plan98, pathParts: [], subtree: plan98 })
    })
    $.teach({ ready: true })

  const src = target.getAttribute('src')
  requestIdleCallback(() => {
    const enclosure = jurassicFrom(src)
    const { back } = $.learn()
    $.teach({ enclosure })
  })

  } catch (e) {
    console.info('Build: Failed')
    console.error(e)
    return
  }
}

function nest(idx, { tree = {}, pathParts = [], subtree = {} }) {
  if(!subtree.children) return ''
  return subtree.children.map((child, index) => {
    const { name, type, extension } = child
    const currentPathParts = [...pathParts, name]
    const currentPath = currentPathParts.join('/') || '/'

    if(type === Types.Directory.type) {
      const node = {
        path: currentPath,
        keywords: currentPath.split('/').join(' '),
        name,
        type,
        extension
      }

      idx.add(node)
      documents.push(node)
      nest(idx, { tree, pathParts: currentPathParts, subtree: child })
    }

    return '-'
  }).join('')
}

const $ = elf('generic-park', {
  suggestIndex: null,
  suggestions: [],
  suggesttionsLength: 0,
  filter: '',
	celestials: ['water','dark', 'island-1'],
	'island-1': aPlane({z: '0', y: -1, yaw: '-90'}, { color: 'mediumseagreen',  width: '100', height: '100' }),
	water: aPlane({z: '-4', y: -2, yaw: '-90'}, { color: 'dodgerblue',  width: '5000', height: '5000' }),
	dark: aSky({}, { color: 'black' }),
})

export default $

function celestials(name) {
	return name ? $.learn()[name] : $.learn().celestials
}

function nested(target) {
  return target.parentNode.closest($.link)
}

$.draw((target) => {
  if(nested(target)) return 'paradox averted'
	if(target.mounted) return
	target.mounted = true
  buildIndex(target)

	const scene = celestials().map(component)

	return `
    <div class="heads-up-display">
      <div class="preview"></div>
      <div>
        <div class="library">
          ${library(null)}
        </div>
      </div>
      <div class="movement">
        <sillonious-joypro></sillonious-joypro>
      </div>
    </div>
		<a-scene>
      <a-camera>
        <a-cursor material="color: white;"></a-cursor>
        <!-- Or <a-entity cursor></a-entity> -->
      </a-camera>
			${scene.join('')}
      <a-entity class="irix"></a-entity>
		</a-scene>
	`
}, {
  beforeUpdate,
  afterUpdate
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

state['ls/game'] ||= {
  inventory: {},
  bank: {}
}

function posessed(path) {
  return !!state['ls/game'].inventory[path]
}

function increment(target) {
  const irix = target.querySelector('.irix')
  const { enclosure } = $.learn()
	celestials().map(name => {
    const node = target.querySelector(`[id="${name}"]`)
    if(node) {
      node.outerHTML = component(name)
    }
	})

  if(enclosure && enclosure.children) {
    const dinosaurs = enclosure.children.map((eggs, i) => {
      if(eggs.type === Types.Directory.type) {
        return draw3d(
          aCylinder({
            x: -10 + (-12 * (i % 10)),
            z: -120 + (-12 * (parseInt(i / 10)) - 5),
            y: 4,
          }, {
            wireframe: posessed(eggs.path),
            color: 'firebrick',
            'class': 'interactive-directory',
            radius: 3,
            width: 3,
            height: 9,
            ['data-path']: eggs.path,
            ['data-name']: eggs.name
          })
        )
      }

      if(eggs.type === Types.File.type) {
        return draw3d(
          aBox({
            x: 2 * (i % 10),
            z: -2 * (parseInt(i / 10)) - 5,
            y: 0,
            pitch: 45
          }, {
            wireframe: posessed(eggs.path),
            color: 'gold',
            'class': 'interactive-file',
            ['data-path']: eggs.path,
            ['data-name']: eggs.name
          })
        )
      }
    }).join('')
    irix.innerHTML = dinosaurs
  }
}

$.when('click', '.interactive-file', (event) => {
  const { path } = event.target.dataset
  const taken = state['ls/game'].inventory[path]
  state['ls/game'].inventory[path] = !taken
})

let fuseTimeout
$.when('mouseenter', '.interactive-file', (event) => {
  fuseTimeout = setTimeout(() => {
    event.target.dispatchEvent(new Event('click'))
  }, 1500)
  const preview = '/app/media-plexer?src=' + event.target.dataset.path
  $.teach({ preview })
})

$.when('mouseleave', '.interactive-file', (event) => {
  clearTimeout(fuseTimeout)
  $.teach({ preview: null })
})

$.when('click', '.interactive-directory', (event) => {
  const { path } = event.target.dataset
  const enclosure = jurassicFrom(path)
  $.teach({ enclosure, back: false })
  self.history.pushState({ type: `${$.link}-navigation`, path }, "");
})

addEventListener("popstate", async (event) => {
  const { type, path } = event.state || {}
  if(type === `${$.link}-navigation`) {
    const enclosure = jurassicFrom(path)
    $.teach({ enclosure, back: true })
  }
});

$.when('mouseenter', '.interactive-directory', (event) => {
  console.log(event.target.dataset.path)
  fuseTimeout = setTimeout(() => {
    event.target.dispatchEvent(new Event('click'))
  }, 1500)
})

$.when('mouseleave', '.interactive-directory', (event) => {
  clearTimeout(fuseTimeout)
  console.log(event.target.dataset.path)
})


function beforeUpdate(target) {
  { // save suggestion box scroll top
    const list = target.querySelector('.suggestion-box')
    if(!list) return
    target.dataset.scrollpos = list.scrollTop
  }
}

function afterUpdate(target) {
  { // scroll suggestions
    const list = target.querySelector('.suggestion-box')
    if(list) {
      list.scrollTop = target.dataset.scrollpos
    }
  }

  { // scroll item into view
    const activeItem = target.querySelector('.suggestion-box .active')
    if(activeItem) {
      activeItem.scrollIntoView({block: "nearest", inline: "nearest"})
    }
  }


  { // recover icons from the virtual dom
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('sl-icon')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
  }

  {
    library(target.querySelector('.library'))
  }

  {
    preview(target.querySelector('.preview'))
  }

  {
    increment(target)
  }
}

function library(target) {
  const { filter, suggestIndex, suggestions, showSuggestions } = $.learn()

  const start = Math.max(suggestIndex - 5, 0)
  const end = Math.min(suggestIndex + 5, suggestions.length - 1)
  const search = `
    <div class="search">
      <input placeholder="Search..." type="text" value="${filter}" name="search" autocomplete="off" />
      <div class="suggestions">
        ${showSuggestions ? suggestions.slice(start, end).map((x, i) => {
          const item = documents.find(y => {
            return x.ref === y.path
          })

          return `
            <button type="button" class="auto-item ${suggestIndex === i + start ? 'active': ''}" data-name="${item.name}" data-path="${item.path}" data-index="${i}">
              <div class="name">
                ${item.name}
              </div>
            </button>
          `
        }).join('') : ''}
      </div>
    </div>
  `

  if(target) {
    innerHTML(target, search)
    return
  } else {
    return search
  }
}

function preview(target) {
  const { preview } = $.learn()

  if(target.dataset.last !== preview) {
    target.dataset.last = preview
    target.innerHTML = `
      <button data-goto="${preview}">
        <iframe src="${preview}"></iframe>
      </button>
    `
  }
}

function map(target) {
  const { fullMap } = $.learn()

  if(fullMap) {
    target.classList.add('full')
    target.querySelector('middle-earth').map.invalidateSize()
  } else {
    target.classList.remove('full')
  }
}


const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', '[name="search"]', event => {
  const { suggestionsLength, suggestIndex } = $.learn()
  if(event.keyCode === down) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? 0 : suggestIndex + 1
    if(nextIndex >= suggestionsLength -1) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === up) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? suggestionsLength - 2 : suggestIndex - 1
    if(nextIndex < 0) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === enter && suggestIndex !== null) {
    event.preventDefault()
    const { suggestions, suggestIndex } = $.learn()
    const item = documents.find(y => {
      return suggestions[suggestIndex].ref === y.path
    })

    if(item) {
      const target = document.createElement('a')
      target.href = item.path

      const enclosure = jurassicFrom(item.path)
      $.teach({ enclosure, back: false })

      self.history.pushState({ type: `${$.link}-navigation`, path: item.path }, "");
      document.activeElement.blur()
      return
    }
  }
})

$.when('click', '.auto-item', event => {
  event.preventDefault()
  const { path } = event.target.dataset

  const enclosure = jurassicFrom(path)
  let { suggestIndex } = $.learn()
  const index = parseInt(event.target.dataset.index)
  const start = Math.max(suggestIndex - 5, 0)
  suggestIndex = start + index
  $.teach({ suggestIndex, enclosure, back: false })
  self.history.pushState({ type: `${$.link}-navigation`, path }, "");
})


function jurassicFrom(path) {
  // the root node edge case
  if(!path || path === '/') {
    return p98.children[0]
  }

  const files = path.split('/').reduce((directory, current) => {
    const next = directory.children.find(x => x.name === current)
    return next
  }, p98)

  return files
}

$.when('input', '[name="search"]', (event) => {
  const { value } = event.target;
  const sort = natsort();
  const suggestions = idx.search(value).sort((a,b) => sort(a.ref, b.ref))
  $.teach({ suggestions, suggestIndex: null, suggestionsLength: suggestions.length, musicFilter: event.target.value  })
})

$.when('focus', '[name="search"]', event => {
  $.teach({ showSuggestions: true })
})

$.when('blur', '[name="search"]', event => {
  setTimeout(() => {
    $.teach({ showSuggestions: false })
    document.activeElement.blur()
  }, 250)
})

$.when('click', 'a[href^="#"]', (event) => {
  event.preventDefault()
  const [_,name] = event.target.href.split('#')
  const tile = event.target.closest($.link).querySelector(`[name="${name}"]`)
  tile.scrollIntoView({block: "end", inline: "end", behavior: 'smooth'})
})

$.when('click', '[data-close-context]', (event) => {
  $.teach({ contextActions: null })
})

$.when('click', '[data-goto]', (event) => {
  const { goto } = event.target.dataset
  window.location.href = goto
})

export function identity(event) {
  const { contextActions } = $.learn()
  hideModal() // todo: find the root cause of this
  showModal(`
    <plan98-wallet></plan98-wallet>
  `, { onHide: restoreContext(contextActions) })
}

function restoreContext(contextActions) {
  return function thunk() {
    const wallet = document.querySelector('plan98-modal plan98-wallet')

    if(wallet) wallet.remove()
    $.teach({ contextActions })
  }
}

export function escape() {
  $.teach({ contextActions: null })
  window.dispatchEvent(new KeyboardEvent("keydown",{'key': 'Escape'}));
}


$.when('click','[data-playlist]', (event) => {
  $.teach({ playlistVisible: !$.learn().playlistVisible, contextActions: null })
})


function createExternalLinkAction(href) {
  return {
    text: 'launch externally',
    action: 'openExternal',
    script: import.meta.url,
    href
  }
}

export function openExternal(event) {
  const { href } = event.target.dataset
  self.open(href, '_blank')
  $.teach({ contextActions: null })
}

function createPlayAction(href) {
  return {
    text: 'play now',
    action: 'playNow',
    script: import.meta.url,
    href
  }
}

export function playNow(event) {
  const { href } = event.target.dataset

  const walkman = event.target.closest($.link).querySelector('[name="walkman"]')
  walkman.src = href
  walkman.play()
  $.teach({ audioPlaying: true, currentTrack: href, contextActions: null })
}

function createPlaylistAction(href) {
  return {
    text: 'to playlist',
    action: 'toPlaylist',
    script: import.meta.url,
    href
  }
}

export function toPlaylist(event) {
  const { href } = event.target.dataset
  state['ls/mp3'].length += 1
  state['ls/mp3'].list.push(href)
  $.teach({ contextActions: null })
}

const thirdPartyRules = []

export function requestThirdPartyRules(filter, options) {
  thirdPartyRules.push(filter)
}


export function requestActionMenu(actions) {
  $.teach({ contextActions: actions })
}


function thirdPartyActions(anchor) {
  return thirdPartyRules.flatMap(filter => filter(anchor))
}

function rules(anchor) {
  const actions = []

  if(anchor.matches('[href$=".mp3"], [href$=".wav"]')) {
    actions.push(createPlayAction(anchor.href));
    actions.push(createPlaylistAction(anchor.href));
  }
  // window manager related
  if(anchor.matches('[href^="steam://"]')) {
    actions.push(createExternalLinkAction(anchor.href));
  }

  return [...actions, ...thirdPartyActions(anchor)]
}

$.when('click', '[data-toggle]', async (event) => {
  const { menu } = $.learn()
  $.teach({ menu: !menu })
})

$.style(`
  & {
    position: relative;
    width: 100%;
    max-height: 100%;
    display: block;
    height: 100%;
    overflow: hidden;
  }

  & .a-enter-vr, .a-enter-ar {
    display: none;
  }

  & .movement {
    grid-column: -1 / 1;
    place-content: end;
    padding: 1rem;
  }

  & .heads-up-display {
    grid-template-columns: 1fr 1.618fr;
    grid-template-rows: 1fr 1.618fr;
    width: 100%;
    height: 100%;
    inset: 0;
    position: absolute;
    display: grid;
    z-index: 100;
    pointer-events: none;
  }


  & .preview:not(:empty) {
    opacity: .85;
  }
  & .preview {
    width: 100%;
    opacity: 0;
    aspect-ratio: 16 / 9;
    pointer-events: all;
  }

  & .preview iframe {
    display: block;
    border: 0;
    width: 100%;
    height: 100%;
  }

  & .preview button {
    pointer-events: all;
    padding: 0;
    border: none;
    border-radius: 0;
    display: block;
    width: 100%;
    height: 100%;
    background: transparent;
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
  & .wall {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    z-index: 2;
    pointer-events: all;
    background: white;
  }

  & .wall.broken {
    z-index: 1;
    pointer-events: none;
    opacity: 0;
  }

  & .break-fourth-wall:hover,
  & .break-fourth-wall:focus {
    background-image: linear-gradient(rgba(0,0,0, .15), rgba(0,0,0,.4));
  }

  & .fourth {
    opacity: 0;
    transition: opacity 250ms ease-in-out;
    height: 0;
    background: var(--color, mediumpurple);
  }

  & .fourth > * {
    display: none;
  }
  & .fourth .active {
    display: block;
    grid-area: all;
  }

  & .broken + .show-all > * {
    grid-area: initial;
  }

  & .hidden + .fourth {
    display: none;
  }
  & .broken + .fourth {
    height: 100%;
    opacity: 1;
    overflow: auto;
    position: absolute;
    inset: 0;
    z-index: 2;
    padding: 2rem 0 3rem;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "all all" "all all";
  }

  & .menu {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 3;
  }

  & .search {
    pointer-events: all;
    position: relative;
  }

  & .search img {
    display: block;
  }
  & .search input {
    display: block;
    margin: auto;
    text-align: left;
    background: transparent;
    font-size: 1.2rem;
    padding: .5rem 1rem;
    margin: 0 auto;
    width: 100%;
    border-radius: 0;
    border: none;
  }

  & .search input:focus {
  }

  & .suggestions .auto-item,
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
    display: flex;
    text-align: left;
    overflow: hidden;
    flex-direction: column;
    position: absolute;
    left: 0;
    right: 0;
    z-index: 500;
  }

  & sillonious-joypro {
    position: relative;
    z-index: 500;
  }

  & .suggestions .auto-item {
    background: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85));
    color: var(--button-color, dodgerblue);
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
  }

  & .suggestions .auto-item:focus,
  & .suggestions .auto-item:hover {
    background-color: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    color: white;
  }

  & .suggestions .auto-item.active {
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
    min-width: 320px;
    text-align: left;
  }

  & .input-grid *:focus {
    outline: 3px solid var(--underline-color, mediumseagreen);
  }

  & .input-grid .logo-wrapper {
    aspect-ratio: 1;
    position: sticky;
    left: 0;
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

  & .nav-wrapper {
    transform: rotateX(180deg);
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 4;
    z-index: 2;
    overflow: auto;
    height: calc(3rem+10px);
    padding-bottom: 10px;
  }
  & .nav {
    transform: rotateX(-180deg);
    background: var(--color);
    background-image: linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.5));
    display: flex;
    height: 3rem;
  }

  & .workspaces {
    display: flex;
    width: 100%;
  }

  & [data-all-workspaces],
  & .show-workspace {
    border: 1px solid var(--button-color, dodgerblue);
    background: var(--color, mediumpurple);
    background-image: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85));
    color: var(--button-color, dodgerblue);
    aspect-ratio: 1;
    padding: 0;
    height: 100%;
    opacity: .25;
  }

  & [data-all-workspaces]:hover,
  & .show-workspace:hover,
  & [data-all-workspaces]:focus,
  & .show-workspace:focus,
  & [data-all-workspaces].active,
  & .show-workspace.active {
    opacity: 1;
  }

  & .now {
    white-space: nowrap;
    background: var(--color, transparent);
    background-image: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85));
    color: white;
    height: 100%;
    font-size: 12px;
    border-color: transparent;
    padding: 0 12px;
    margin-left: auto;
  }

  & .siri button {
    font-weight: 100;
    color: rgba(255,255,255,.65);
    font-size: 2rem;
    background: transparent;
    border: none;
    border-radius: none;
    display: inline-block;
    margin: 1rem 0;
    text-align: left;
  }

  & .siri button:hover,
  & .siri button:focus {
    color: rgba(255,255,255,1);
  }
  & .zune {
    font-weight: 100;
    font-size: 2rem;
    line-height: 1;
    background: black;
    background-image: linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.95)), linear-gradient(var(--color), var(--accent-color-0));
    color: rgba(255,255,255,.65);
    height: 100%;
    overflow-y: auto;
    display: block;
    padding: 2rem 0 3rem;
    gap: 2rem;
  }

  & .zune xml-html {
    overflow: hidden auto;
    padding: 1rem;
  }

  & .zune .tile {
    page-break-inside: avoid;
    page-break-after: avoid;
  }

  & .app-action {
    margin: 1rem 0;
    display: block;
  }

  & .app-action {
    text-decoration: none;
    white-space: pre-wrap;
    line-height: 1.1;
  }

  & .zune a:link,
  & .zune a:visited {
    color: rgba(255,255,255,.65);
  }

  & .zune a:hover,
  & .zune a:focus {
    color: rgba(255,255,255,1);
  }

  & .zune a:active {
  }

  & .categories {
    padding: 1rem;
    border-bottom: 1px solid rgba(255,255,255,.25);
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
  }
  & .zune-bar {
    background: black;
    border-bottom: 1px solid rgba(255,255,255,.25);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    height: 2rem;
    z-index: 9001;
  }

  & .zune xml-html {
    columns: 320px;
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

