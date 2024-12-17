import module, { state } from '@silly/tag'
import { bayunCore } from '@sillonious/vault'
import supabase from '@sillonious/database'
import { render } from '@sillonious/saga'
import { showModal } from '@plan98/modal'
import { getSession, setSession, clearSession } from './bayun-wizard.js'

/*
  Data Structures--

  notes: [uuid,uuid,uuid,uuid,uuid]
  note: { path, text }

  gun.(cyrb53(${member}@${organization})).get($.link)
*/

function notebook() {
  const { sessionId, companyEmployeeId, companyName } = getSession()
  if(!sessionId) {
    return null
  }

  state[`ls/${companyName}@${companyEmployeeId}/${$.link}`] ||=  {
    index: null,
    notes: {}
  }
  return state[`ls/${companyName}@${companyEmployeeId}/${$.link}`]
}

const $ = module('camp-notebook', {
  notes: [],
  note: {},
  activeId: 0
})

$.draw((target) => {
  const { notes, activeId } = $.learn()
  const { sessionId } = getSession()
  if(!sessionId && !target.popped) {
    target.popped = true
    showModal(`
      <iframe style="width: 100%; height: 100%; border: none;" src="/app/bayun-wizard"></iframe>
    `)
    return
  }
  subscribe(target)
  target.innerHTML = `
    <div class="sidebar control-tab-list">
      <button data-new class="control-tab action">
        New Joke
      </button>

      ${Object.keys(notes).map((id) => {
        return `
          <button data-activate="${id}" class="control-tab ${activeId === id ? '-active': ''}">
            ${notes[id].path || 'unorganized'}
          </button>
        `
      }).join('')}

    </div>
    <div class="main">
      ${notes[activeId] ? `
        <div class="note">
          <input placeholder="unorganized" data-bind="${activeId}" name="path" type="text" data-id="${activeId}" value="${notes[activeId].path}" />
          <textarea data-bind="${activeId}" name="note" data-id="${activeId}" placeholder="todo...">${notes[activeId].note}</textarea>
        </div>
      `: ''}
    </div>
  `
}, {
  beforeUpdate: saveCursor,
  afterUpdate: replaceCursor
})

$.when('click', '[data-activate]', async (event) => {
  const { activate } = event.target.dataset
  $.teach({ activeId: activate })
})
$.when('click', '[data-new]', async (event) => {
  const {
    sessionId,
    companyName,
    companyEmployeeId
  } = getSession()

  const noteId = self.crypto.randomUUID()

  const note = {
    noteId,
    path: '',
    note: ''
  }
  $.teach(note, function merge(state, payload) {
    return {
      ...state,
      index: [...state.index, payload.noteId],
      notes: {
        ...state.notes,
        [payload.noteId]: {
          ...payload
        }
      }
    }
  })

  const { index } = $.learn()
  const encryptedIndex = await bayunCore.lockText(sessionId, JSON.stringify(index));
  const encryptedNote = await bayunCore.lockText(sessionId, JSON.stringify(note));

  notebook(event.target).index = encryptedIndex
  notebook(event.target).notes[noteId] = encryptedNote
})

$.when('click', '[data-preview]', async (event) => {
  const { id } = event.target.dataset
  const punchline = event.target.closest($.link).querySelector(`[data-id="${id}"][name="punchline"]`).value

  showModal(`
    <div style="background: rgba(200,200,200,.65); width: 100%; height: 100%;">
    <div style="overflow: auto; background: rgba(255,255,255,.85); margin: 0 auto; width: 8.5in; padding: 1in 1in 1in 1.5in; height: 100%; font-size: 1.5rem; line-height: 2rem;">
      ${render(punchline)}
    </div>
  `)
})

$.when('input', '[data-bind]', async event => {
  const { name, value } = event.target;
  const { bind } = event.target.dataset
  const { sessionId } = getSession()
  $.teach({[name]: value}, function merge(state, payload) {
    return {
      ...state,
      notes: {
        ...state.notes,
        [bind]: {
          ...state.notes[bind],
          ...payload
        }
      }
    }
  })

  const { notes } = $.learn()
  const encryptedNote = await bayunCore.lockText(sessionId, JSON.stringify(notes[bind]));

  notebook(event.target).notes[bind] = encryptedNote
})

function deleteNote(state, payload) {
  const newState = {
    ...state,
  }

  delete newState.notes[payload.id]

  return newState
}

$.style(`
  & {
    overflow: auto;
    min-height: 480px;
    display: block;
    height: 100%;
    width: 100%;
    line-height: 2rem;
    position: relative;
  }

  & .sidebar {
    padding: 1rem;
    overflow: auto;
  }

  @media screen and (max-width: 768px) {
    .sidebar {
      max-height: 25vh;
    }
  }

  .main {
    padding: 1rem;
    background: white;
  }

  .note {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
  }

  @media screen and (min-width: 768px) {
    & {
      display: grid;
      grid-template-columns: 1fr 1.618fr;
    }
  }

  & *:focus {
    border-color: dodgerblue;
    outline-color: dodgerblue
  }

  & [name="path"] {
    font-size: 2rem;
    border: none;
    padding: .5rem 1rem;
    width: 100%;
  }

  & [name="note"] {
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    padding: 0rem 1rem;
    line-height: 2rem;
    background-color: white;
    position: relative;
    z-index: 3;
    background-position-y: -1px;
  }

  & .note {
    display: grid;
    grid-area: active;
    gap: 1rem;
  }

  & .paper {
    margin: 0 auto;
    max-width: 55ch;
    background: rgba(255,255,255,1);
    height: 100%;
    overflow: auto;
    resize: none;
    width: 100%;
    border: none;
    margin: auto;
  }

  & [name="login"] {
    background: lemonchiffon;
    max-width: 320px;
    margin: auto;
    inset: 0;
    padding: 1rem;
    position: absolute;
    aspect-ratio: 1;
    box-shadow:
      0px 0px 4px 4px rgba(0,0,0,.10),
      0px 0px 12px 12px rgba(0,0,0,.05);
  }

  & .label {
    color: saddlebrown;
  }
  & .title {
    margin-bottom: 1rem;
    display: block;
    color: saddlebrown;
  }

  & [type="submit"] {
    width: 100%;
  }
  & .sidebar .control-tab-list {
    gap: .5rem;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    padding: 1rem;
    overflow: auto;
    background: rgba(255,255,255,.65);
    position: relative;
    z-index: 3;
    overflow-x: hidden;
  }
  & .control-tab {
    display: block;
    border: 0;
    border-radius: 1rem;
    line-height: 1;
    width: 4rem;
    color: white;
    display: block;
    width: 100%;
    margin: .5rem 0;
    text-align: left;
    padding: 1rem;
    color: dodgerblue;
    background: rgba(255,255,255,.85);
    transition: background 200ms ease-in-out;
    flex: none;
    
  }

  & .control-tab.-active,
  & .control-tab:hover,
  & .control-tab:focus {
    background: dodgerblue;
    color: white;
  }


  & .control-tab.action {
    background-color: dodgerblue;
    background-image: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    color: white;
  }

  & .control-tab.action:hover,
  & .control-tab.action:focus {
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
  }
`)

function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};


function subscribe(target) {
  if(!notebook()?.index || target.subscribed) return
  target.subscribed = true
  const { sessionId, companyName, companyEmployeeId } = getSession()

  setTimeout(async () => {
    const index = JSON.parse(await bayunCore.unlockText(sessionId, notebook().index))
    $.teach({ index })
    let count = index.length
    const cache = {}
    index.map(async uuid => {
      cache[uuid] = JSON.parse(await bayunCore.unlockText(sessionId, notebook().notes[uuid]))
      count -= 1

      if(count === 0) {
        $.teach(cache, function merge(state, payload) {
          return {
            ...state,
            notes: payload
          }
        })
      }
    })
  }, 1)
}

const tags = ['TEXTAREA', 'INPUT']
let sel = []
function saveCursor(target) {
  if(target.contains(document.activeElement)) {
    target.dataset.paused = document.activeElement.name
    if(tags.includes(document.activeElement.tagName)) {
      const textarea = document.activeElement
      sel = [textarea.selectionStart, textarea.selectionEnd];
    }
  }
}

function replaceCursor(target) {
  const paused = target.querySelector(`[name="${target.dataset.paused}"]`)
  
  if(paused) {
    paused.focus()

    if(tags.includes(paused.tagName)) {
      paused.selectionStart = sel[0];
      paused.selectionEnd = sel[1];
    }
  }
}
