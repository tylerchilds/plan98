import elf from '@silly/tag'
import { render } from "@sillonious/saga"
import { idx, documents } from './giggle-search.js'
import { actionScript } from './action-script.js'
import { showModal, hideModal } from '@plan98/modal'
import { requestThirdPartyRules, requestFullZune } from './plan9-zune.js'
import natsort from 'natsort'

requestThirdPartyRules(function ruleFilter(anchor) {
  const actions = []
  if(!anchor.matches('[href^="steam://"]')) {
    actions.push(createWorkspaceAction(anchor.href, 'first'));
    actions.push(createWorkspaceAction(anchor.href, 'second'));
    actions.push(createWorkspaceAction(anchor.href, 'third'));
    actions.push(createWorkspaceAction(anchor.href, 'fourth'));
    actions.push(createPreviewAction(anchor.href, 'fourth'));
  }
  return actions
}, {})

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
  query: "",
  suggestIndex: null,
  suggestions: [],
  suggestionsLength: 0,
  menu: true,
  now: new Date().toLocaleString(),
  activeWorkspace: 'first',
  first: null,
  second: null,
  third: null,
  fourth: null,
  allActive: false,
  broken: false
})

export default $

function init(target) {
  if(target.supercalifragilisticexpialidocious) return
  target.supercalifragilisticexpialidocious = true
  const src = target.getAttribute('src')
  if(src) {
    schedule(() => $.teach({ first: src, activeWorkspace: 'first' }))
  }
}

$.draw((target) => {
  init(target)
  const { suggestions, allActive, broken, query, suggestIndex, focused, now } = $.learn()

  randomTheme(target)
  const start = Math.max(suggestIndex - 5, 0)
  const end = Math.min(suggestIndex + 5, suggestions.length - 1)
  return `
    <div class="fourth ${broken ? 'broken' : ''} ${allActive ? 'show-all' : ''}">
      ${renderWorkspaceView('first')}
      ${renderWorkspaceView('second')}
      ${renderWorkspaceView('third')}
      ${renderWorkspaceView('fourth')}
    </div>
    <div class="suggestions ${focused ? 'focused' : ''}">
      <div class="suggestion-box">
        ${suggestions.slice(start, end).map((x, i) => {
          const item = documents.find(y => {
            return x.ref === y.path
          })

          return `
            <button type="button" class="auto-item ${suggestIndex === i + start ? 'active': ''}" data-name="${item.name}" data-path="${item.path}" data-index="${i}">
              <div class="name">
                ${item.name}
                <span class="sentence-path">
                  ${item.path.split('/').reverse().slice(1,-1).join(' ')}
                </span>
              </div>
            </button>
          `
        }).join('')}
      </div>
    </div>

    <div class="nav-wrapper">
      <div class="nav">
        <form class="search" method="get">
          <div class="input-grid">
            <div class="logo-wrapper">
              <plan98-logo></plan98-logo>
            </div>
            <input placeholder="Imagine..." type="text" value="${query}" name="search" autocomplete="off" />
            <button tab-index="1" type="submit">
              <sl-icon name="search"></sl-icon>
            </button>
          </div>
        </form>
        <div class="workspaces">
          ${renderWorkspaceToggle('first', '1')}
          ${renderWorkspaceToggle('second', '2')}
          ${renderWorkspaceToggle('third', '3')}
          ${renderWorkspaceToggle('fourth', '4')}
          <button class="now">
            ${now}
          </button>
          <button data-all-workspaces ${allActive ? 'class="active"' : ''}>
            <sl-icon name="grid"></sl-icon>
          </button>
        </div>
      </div>
    </div>
  `
}, {
  beforeUpdate,
  afterUpdate
})

function renderWorkspaceView(key) {
  const data = $.learn()
  if(!data[key]) return `<div class="empty-pane ${data.activeWorkspace === key ? 'active' :''}"><iframe src="/app/sillyz-computer"></iframe></div>`

  return `
    <iframe src="${data[key]}" class="empty-pane ${data.activeWorkspace === key ? 'active' :''} "name="${key}"></iframe>
  `
}

$.when('click', '[data-create]', (event) => {
  const { create } = event.target.dataset
  $.teach({ activeWorkspace: create, [create]: '/app/story-board' })
})

function renderWorkspaceToggle(key, label) {
  const data = $.learn()

  return `
    <button class="show-workspace ${data.activeWorkspace === key ? 'active' :''} " data-workspace="${key}">
      ${label}
    </button>
  `
}


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
    if(!list) return
    list.scrollTop = target.dataset.scrollpos
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

  { // recover logo from the virtual dom
    const ogLogo = target.querySelector('plan98-logo')
    const logoParent = ogLogo.parentNode

    const logo = document.createElement('plan98-logo')
    logo.name = ogLogo.name
    ogLogo.remove()
    logoParent.appendChild(logo)
  }
}

$.when('click','.now', (event) => {
  requestFullZune()
  return
  showModal(`
    <div class="card">
      <calendar-range months="2">
        <div class="grid">
          <calendar-month></calendar-month>
          <calendar-month offset="1"></calendar-month>
        </div>
      </calendar-range>
    </div>
  `)
})

$.when('click','.show-workspace', (event) => {
  event.preventDefault()
  $.teach({ allActive: false, broken: false, activeWorkspace: event.target.dataset.workspace })
  requestFullZune()
})

$.when('contextmenu','.show-workspace', promptWorkspaceClear)

function promptWorkspaceClear(event) {
  event.preventDefault()
  const { workspace } = event.target.dataset
  $.teach({
    contextActions: [
      {
        text: 'clear workspace',
        action: 'clearWorkspace',
        script: import.meta.url,
        workspace
      }
    ]
  })
}

export function clearWorkspace(event) {
  const { workspace } = event.target.dataset
  $.teach({  [workspace]: null, contextActions: null })
}

let clearWorkspaceTimer
$.when('touchstart', '.show-workspace', startClearWatch)
$.when('touchend', '.show-workspace', endClearWatch)

$.when('mousedown', '.show-workspace', startClearWatch)
$.when('mouseup', '.show-workspace', endClearWatch)

function startClearWatch(event) {
  if(clearWorkspaceTimer) {
    clearTimeout(clearWorkspaceTimer)
  }
  clearWorkspaceTimer = setTimeout(() => {
    promptWorkspaceClear(event)
  }, 1000)
}

function endClearWatch(_event) {
  if(clearWorkspaceTimer) {
    clearTimeout(clearWorkspaceTimer)
  }
}


$.when('click','[data-all-workspaces]', (event) => {
  event.preventDefault()
  $.teach({ menu: false, allActive: !$.learn().allActive })
  requestFullZune()
})

$.when('submit', '.search', (event) => {
  event.preventDefault()
  const search = event.target.closest($.link).querySelector('[name="search"]')
  const url = '/app/giggle-search?query=' +search.value
  updateActiveWorkspace(url)
})

function updateActiveWorkspace(url) {
  const { activeWorkspace } = $.learn()
  const workspace = activeWorkspace || 'first'
  $.teach({ menu: false, [activeWorkspace]: url, activeWorkspace: workspace  })
}

function randomTheme(target) {
  const index = Math.floor(Math.random() * palette.length)
  const color = palette[index];
  target.style.setProperty('--color', color);
  target.style.setProperty('--button-color', buttons[color]);
  target.style.setProperty('--underline-color', underlines[color]);
  target.style.setProperty('--accent-color-1', friends[color][0]);
  target.style.setProperty('--accent-color-2', friends[color][1]);
  target.style.setProperty('--accent-color-3', friends[color][2]);
}

const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', '[name="search"]', event => {
  const { suggestionsLength, suggestIndex } = $.learn()
  if(event.keyCode === up) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? 0 : suggestIndex + 1
    if(nextIndex >= suggestionsLength -1) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === down) {
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
      const iframe = event.target.closest($.link).querySelector('[name="plan98-window"]')
      const url = '/app/media-plexer?src=' +item.path
      updateActiveWorkspace(url)
      document.activeElement.blur()
      return
    }
  }
})

$.when('click', '.auto-item', event => {
  event.preventDefault()

  const target = document.createElement('a')
  target.href = event.target.dataset.path
  const contextActions = rules(target)
  //updateActiveWorkspace(url)
  $.teach({ contextActions, suggestIndex: parseInt(event.target.dataset.index) })
})


$.when('input', '[name="search"]', (event) => {
  const { value } = event.target;
  const sort = natsort();
  const suggestions = idx.search(value).sort((a,b) => sort(a.ref, b.ref))
  $.teach({ suggestions, suggestIndex: null, suggestionsLength: suggestions.length, query: event.target.value  })
})

$.when('focus', '[name="search"]', event => {
  $.teach({ focused: true })
})

$.when('blur', '[name="search"]', event => {
  setTimeout(() => {
    $.teach({ focused: false })
    document.activeElement.blur()
  }, 250)
})

function createWorkspaceAction(href, workspace) {
  return {
    text: workspace + ' pane',
    action: 'setWorkspace',
    script: import.meta.url,
    href,
    workspace
  }
}

export function setWorkspace(event) {
  if(!event.target.dataset) return
  const { workspace, href } = event.target.dataset
  const customApp = href.endsWith('.saga') ? `/app/hyper-script?src=${href}`: href
  $.teach({ broken: false, activeWorkspace: workspace, [workspace]: customApp, contextActions: null })
  requestFullZune()
}

function createPreviewAction(href) {
  return {
    text: 'preview',
    action: 'preview',
    script: import.meta.url,
    href
  }
}

export function preview(event) {
  const { href } = event.target.dataset

  const url = '/app/media-plexer?src=' + href

  hideModal() // todo: find root cause for this work around...
  showModal(`
    <iframe src="${url}" style="width: 100%;border: none; height: 100%;"></iframe>
  `)
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
    overflow-x: hidden;
    background: var(--color, mediumpurple);
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
  & .wall {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    z-index: 2;
    pointer-events: all;
  }

  & .break-fourth-wall {
    background-color: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0, .25), rgba(0,0,0,.5));
    color: white;
    border: none;
    padding: 1rem;
    max-width: 320px;;
    margin: auto;
    display: block;
  }

  & .break-fourth-wall:hover,
  & .break-fourth-wall:focus {
    background-image: linear-gradient(rgba(0,0,0, .15), rgba(0,0,0,.4));
  }

  & .fourth .empty-pane.active {
    display: block;
    grid-area: main;
  }
  
  & .fourth.show-all .active {
    position: relative;
    grid-area: initial;
  }

  & .fourth {
    height: 100%;
    opacity: 1;
    overflow: auto;
    position: absolute;
    inset: 0;
    z-index: 2;
    padding: 0 0 3rem;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "main main" "main main";
  }

  & .fourth.broken {
    display: none;
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
    border-radius: 0;
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
    display: none;
    position: absolute;
    max-height: 300px;
    text-align: left;
    bottom: 3rem;
    left: 0;
    right: 0;
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
    display: flex;
    flex-direction: column-reverse;
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
    display: flex;
    white-space: nowrap;
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

  & .zune a:link,
  & .zune a:visited {
    color: rgba(255,255,255,.65);
    text-decoration: none;
    white-space: nowrap;
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
  }
  & .zune-bar {
    background: black;
    border-bottom: 1px solid rgba(255,255,255,.25);
    position: absolute;
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

  & .category {
    margin: 1rem 1rem 0 0;
    display: inline-block;
    padding: 1rem 1rem 0 .25rem;
    border: 1px solid rgba(255,255,255,.65);
    line-height: 1;
    aspect-ratio: 1;
    opacity: .65;
  }

  & .category:hover,
  & .category:focus {
    opacity: 1;
  }

  & .system-button {
    font-weight: 400;
    border: none;
    font-size: 1rem;
    background: transparent;
    color: rgba(255,255,255,.85);
    padding: 0 9px;
  }

  & .system-button.-large {
    font-size: 2rem;
    padding: 1rem;
  }

  & .system-button.-nested {
    position: absolute;
    right: 0;
    height: 2rem;
    line-height: 2rem;
    padding: 0 .5rem;
    background: black;
  }

  & .system-button:hover,
  & .system-button:focus {
    color: rgba(255,255,255,1);
  }

  & [data-system] {
    font-weight: 1000;
    margin-right: 1rem;
  }

  & [data-playlist] {
    margin-left: auto;
    position: relative;
    background: black;
    border: none;
    overflow: hidden;
    max-width: 220px;
    color: rgba(255,255,255,.65);
    display: grid;
    grid-template-columns: 1fr 2rem;
  }

  & .marquee {
    pointer-events: none;
    animation: &-marquee-track 15000ms linear infinite alternate;
    white-space: nowrap;
    display: inline-block;
    line-height: 2rem;
  }

  @keyframes &-marquee-track {
    0% {
      transform: translateX(20px);
    }

    100% {
      transform: translateX(calc(-100% + 200px));
    }
  }

  & .cortana {
    position: absolute;
    top: 2rem;
    right: 0;
    bottom: 3rem;
    max-width: 320px;
    width: 100%;
    z-index: 8999;
    transform: translateX(100%);
    transition: transform 100ms ease-out;
    background-image: linear-gradient(-25deg, rgba(0,0,0,1), rgba(0,0,0,.85));
    backdrop-filter: blur(150px);
  }


  & .cortana.active {
    transform: translateX(0);
  }
  & .siri {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 1);
    backdrop-filter: blur(150px);
    z-index: 9000;
  }

  & .siri:not(:empty) {
    display: flex;
    flex-direction: column;
    padding: 3rem 1rem;
    overflow: auto;
  }

  & [data-create] {
    background: lemonchiffon;
    border: none;
    border-radius: none;
    box-shadow: var(--shadow);
    padding: 2rem;
  }

  & [data-create]::before{
    content: '';
    display: block;
    width: 6rem;
    height: 6rem;
    background-color: #E83FB8;
    border-radius: 100%;
  }

  & .empty-pane {
    place-items: center;
    display: none;
  }

  & .show-all > .empty-pane {
    display: grid;
  }

  & .show-all > iframe {
    display: block;
  }

  & [data-back-track] {
  }

  & .transport {
    font-size: 2rem;
    text-align: center;
  }

  & .sentence-path {
    white-space: nowrap;
    margin-left: auto;
    overflow: hidden;
    color: rgba(255,255,255,.65);
  }
`)

function schedule(x) { setTimeout(x, 1) }
