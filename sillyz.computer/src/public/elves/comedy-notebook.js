import module, { state } from '@silly/tag'
import { bayunCore } from '@sillonious/vault'
import supabase from '@sillonious/database'
import { render } from '@sillonious/saga'
import { showModal } from '@plan98/modal'

const $ = module('comedy-notebook', {
  sessionId: '',
  companyName: plan98.host,
  companyEmployeeId: '',
  password: '',
  autoCreateEmployee: true,
  jokes: {}
})

$.draw((target) => {
  const { error, jokes, active } = $.learn()
  const { sessionId } = getSession()

  target.style.backgroundImage = getStars(target)

  if(!sessionId) {
    return `
      <div name="login">
        <hypertext-variable class="title" monospace="0" casual="1" weight="800" slant="0" cursive="1">
          Comedy Notebook
        </hypertext-variable>
        <div class="error">
          ${error ? error : ''}
        </div>
        <form method="POST" action="loginWithPassword">
          <label class="field">
            <span class="label">Identity</span>
            <input data-bind type="text" name="companyEmployeeId" required/>
          </label>
          <label class="field">
            <span class="label">Password</span>
            <input data-bind type="password" name="password" required/>
          </label>
          <rainbow-action>
            <button type="submit">
              Log In
            </button>
          </rainbow-action>
        </form>
      </div>
    `
  }

  const lines = getLines(target)

  const focus = document.activeElement
  target.innerHTML = `
    <div class="page">
      <button class="action-accordion">
        &amp;
      </button>
      <div class="actions">
        <button data-new>
          New Joke
        </button>
        <button data-clear>
          Clear Jokes
        </button>
        <button data-logout>
          Logout
        </button>
      </div>
      <div class="setlist">
        ${Object.keys(jokes).map((id) => {
          return `
            <div name="joke" class="index-card">
              <button class="action-accordion">
                &amp;
              </button>
              <div class="actions">
                <button data-preview data-id="${id}">
                  Preview
                </button>
                <button data-save data-id="${id}">
                  Save
                </button>
              </div>
              <input name="setup" type="text" data-id="${id}" value="${jokes[id].setup}" />
              <textarea name="punchline" data-id="${id}" style="background-image: ${lines}">${jokes[id].punchline}</textarea>
            </div>
          `
        }).join('')}
      </div>
    </div>
  `
})

$.when('click', '.action-accordion', async (event) => {
  event.target.classList.toggle('active')
})
$.when('click', '[data-save]', async (event) => {
  const { id } = event.target.dataset
  const setup = event.target.closest($.link).querySelector(`[data-id="${id}"][name="setup"]`).value
  let punchline = event.target.closest($.link).querySelector(`[data-id="${id}"][name="punchline"]`).value
  const {
    sessionId,
    companyName,
    companyEmployeeId
  } = getSession()

  punchline = await bayunCore.lockText(sessionId, punchline);

  const { data, error } = await supabase
  .from('plan98_solo_text')
  .update(
    { setup, punchline }
  )
  .eq('id', id)

  if(error) {
    $.teach({ error })
    return
  }
})

$.when('click', '[data-back]', () => {
  $.teach({ activeSetup: null })
})

$.when('click', '[data-logout]', async () => {
  clearSession()
  $.teach({ jokes: {} })
})

$.when('click', '[data-new]', async () => {
  const {
    sessionId,
    companyName,
    companyEmployeeId
  } = getSession()
 
  const setup = '';
  const punchline = await bayunCore.lockText(sessionId, '');
  const { data, error } = await supabase
  .from('plan98_solo_text')
  .insert([
    { companyName, companyEmployeeId, setup, punchline },
  ])
  .select()

  if(error) {
    $.teach({ error })
    return
  }
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


$.when('click', '[data-clear]', async () => {
  const {
    companyName,
    companyEmployeeId
  } = getSession()

  const { error } = await supabase
  .from('plan98_solo_text')
  .delete()
  .eq('companyName', companyName)
  .eq('companyEmployeeId', companyEmployeeId)

  if(error) {
    $.teach({ error })
    return
  }
})

$.when('input', '[data-bind]', event => {
  const { name, value } = event.target;
  $.teach({ [name]: value })
})

export function getSession() {
  return state['ls/bayun'] || {}
}

export function clearSession() {
  state['ls/bayun'] = {}
}

function setSession({ sessionId, companyName, companyEmployeeId }) {
  state['ls/bayun'] = {
    sessionId,
    companyName,
    companyEmployeeId
  }
}

async function laugh(premise) {
  const {
    sessionId,
  } = getSession()

  return await bayunCore.unlockText(sessionId, premise);
}

const successCallback = async data => {
  const {
    companyName,
    companyEmployeeId,
  } = $.learn()

  const {
    sessionId,
    authenticationResponse,
    employeeAlreadyExists,
    securityQuestions
  } = data
  var lockedText = await bayunCore.lockText(sessionId, "Hello, Future World.");

  var unlockedText = await bayunCore.unlockText(sessionId, lockedText);
  $.teach({ authenticationResponse, employeeAlreadyExists, securityQuestions, lockedText, unlockedText })

  setSession({ sessionId, companyName, companyEmployeeId })

  connect()
};

connect()

function comedyPath() {
  const {
    companyName,
    companyEmployeeId
  } = getSession()

  return ['', companyName, companyEmployeeId, 'Comedy'].join('/')
}

async function connect() {
  const {
    sessionId,
    companyName,
    companyEmployeeId
  } = getSession()

  if(!sessionId) return
  
  let { data: plan98_solo_text, error } = await supabase
  .from('plan98_solo_text')
  .select("*")
  // Filters
  .eq('companyName', companyName)
  .eq('companyEmployeeId', companyEmployeeId)
  .range(0, 25)

  plan98_solo_text.map(async (row) => {
    const setup = row.setup
    const punchline = await bayunCore.unlockText(sessionId, row.punchline)

    $.teach({ id: row.id, setup, punchline }, mergeJoke)
  })

  supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'plan98_solo_text' },
    async (payload) => {
      if (
        payload.new.companyName === companyName &&
        payload.new.companyEmployeeId === companyEmployeeId
      ) {
        const setup = payload.new.setup
        const punchline = await bayunCore.unlockText(sessionId, payload.new.punchline)

        $.teach({ id: payload.new.id, setup, punchline }, mergeJoke)
      }

      if(payload.eventType === 'DELETE') {
        $.teach({ id: payload.old.id }, deleteJoke)
      }
    }
  )
  .subscribe()
}

function mergeJoke(state, payload) {
  return {
    ...state,
    jokes: {
      ...state.jokes,
      [payload.id]: { 
        punchline: payload.punchline,
        setup: payload.setup
      }
    }
  }
}

function deleteJoke(state, payload) {
  const newState = {
    ...state,
  }

  delete newState.jokes[payload.id]

  return newState
}


const failureCallback = error => {
  $.teach({ error: `${error}` })
};

$.when('submit', 'form', (event) => {
  event.preventDefault()
})
$.when('click', '[type="submit"]', (event) => {
  $.teach({ error: null })

  const {
    sessionId,
    companyName,
    companyEmployeeId,
    password,
    autoCreateEmployee
  } = $.learn()

  bayunCore.loginWithPassword(
      sessionId,
      companyName,
      companyEmployeeId,
      password,
      autoCreateEmployee,
      null, // TODO: @bayun, what is?
      noop.bind('securityQuestionsCallback'),
      noop.bind('passphraseCallback'),
      successCallback,
      failureCallback
  );
})

function noop(){}

function getLines(target) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(target).getPropertyValue('line-height'));
  canvas.height = rhythm;
  canvas.width = rhythm;

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, rhythm, rhythm);

  ctx.fillStyle = 'dodgerblue';
  ctx.fillRect(0, rhythm - (rhythm), rhythm, 1);

  return `url(${canvas.toDataURL()}`;
}

function getStars(target) {
  const color = 'rgba(0,0,0,.85)';
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(document.documentElement).fontSize);

  canvas.height = rhythm;
  canvas.width = rhythm;

  ctx.fillStyle = color;
  ctx.fillRect(rhythm / 2, rhythm / 2, 1, 1);

  return `url(${canvas.toDataURL()})`;
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
    padding: 6rem 0;
  }

  & *:focus {
    border-color: orange;
    outline-color: orange
  }

  & .action-accordion {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 50px;
    height: 50px;
    background: rgba(0,0,0,.65);
    border: 2px solid dodgerblue;
    color: rgba(255,255,255,.85);
    border-radius: 100%;
    opacity: .5;
    transition: all 200ms ease-in-out;
  }
  & .action-accordion:hover {
    background: dodgerblue;
    border: 2px solid rgba(255,255,255,1);
    opacity: 1;
  }
  & .actions {
    margin: 0 1rem;
    position: absolute;
    top: 4rem;
    right: 0;
    text-align: right;
    z-index: 10;
    display: none;
  }

  & .action-accordion.active + .actions {
    display: block;
  }

  & .joke-actions {
    display: flex;
    gap: 1rem;
    padding: 0 1rem;
    position: absolute;
    bottom: 0;
    z-index: 100;
    right: 0;
  }
  & .actions button,
  & .joke-actions button {
    background: lemonchiffon;
    color: saddlebrown;
    border: none;
    line-height: 1rem;
    box-shadow: 0px 0px 4px 4px rgba(0,0,0,.10);
    padding: .5rem;
    font-size: 1rem;
    --v-font-mono: 0;
    --v-font-casl: 1;
    --v-font-wght: 800;
    --v-font-slnt: -15;
    --v-font-crsv: 1;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    transition: background 200ms ease-in-out;
  }

  & .actions button:focus,
  & .joke-actions button:focus,
  & .actions button:hover,
  & .joke-actions button:hover {
    background: saddlebrown;
    color: lemonchiffon;
  }

  & .page {
    height: 100%;
    padding: 0 0 5rem;
  }

  & .setlist {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(5in, 1fr));
    gap: 2rem;
  }

  & .index-card {
    width: 5in;
    height: 3in;
    position: relative;
    margin: 0 auto;
    z-index: 2;
    display: grid;
    grid-template-rows: auto 1fr;
    box-shadow:
      0px 0px 4px 4px rgba(0,0,0,.10),
      0px 0px 12px 12px rgba(0,0,0,.05);
    max-width: 100%;
  }

  & [name="setup"] {
    font-size: 2rem;
    border: none;
    border-bottom: 3px solid orange;
    padding: .5rem 1rem;
    width: 100%;
  }

  & [name="punchline"] {
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

  & .joke {
    display: grid;
    grid-area: active;
    background: rgba(200,200,200,1);
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
`)

$.when('scroll', 'textarea', function({ target }) {
    const scrollTop = target.scrollTop;
    target.style.backgroundPosition = `0px ${-scrollTop}px`;
});
