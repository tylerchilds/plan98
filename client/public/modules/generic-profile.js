import tag from '@silly/tag'
import { getSession, clearSession } from './comedy-notebook.js'
import { social } from './chat-room.js'

const $ = tag('generic-profile')

$.draw((target) => {
  const user = hotAccount(target)
  return user ? `
    <div class="header">
      <div class="photo">
        <quick-media edit="true" key="${user.avatar}"></quick-media>
      </div>
    </div>
    <div class="nickname">
      <input class="hot-input" name="nickname" value="${user.nickname || ''}" />
    </div>
    <div class="grid">
      <div class="sidebar">
        <label>tagline</label>
        <textarea name="tagline" class="hot-input">${user.tagline || ''}</textarea>
      </div>
      <div class="body">
      </div>
    </div>
  ` : ''
})

function schedule(x, delay=1) { setTimeout(x, delay) }

function hotAccount(target) {
  const { companyName, companyEmployeeId } = getSession()
  const company = target.closest($.link).getAttribute('company') || companyName || 'sillyz.computer'
  const unix = target.closest($.link).getAttribute('unix') || companyEmployeeId || 'tychi'
  return social(company, unix)
}

$.when('input', '.hot-input', (event) => {
  const node = event.target
  const user = hotAccount(node)
  user[node.name] = node.value
})

$.style(`
  & {
    padding: 0 1rem;
    display: block;
  }
  @media (min-width: 768px) {
    & .grid {
      display: grid;
      grid-template-columns: 200px 1fr;
    }
  }
  & .sidebar {
    padding: 3rem 0 1rem;
    max-width: 320px;
    margin: auto;
  }
  & .header {
    height: 300px;
    background: dodgerblue;
    position: relative;
    margin: 0 -1rem 4rem -1rem;
  }

  & .photo {
    background-color: orange;
    width: 180px;
    height: 180px;
    padding: 4px;
    border-radius: 100%;
    position: absolute;
    bottom: -40px;
    left: 0;
    right: 0;
    margin: auto;
    overflow: hidden;
  }

  & quick-media {
    height: 100%;
    border-radius: 100%;
    overflow: hidden;
  }


  & quick-media img {
    object-fit: cover;
    width: 172px;
    height: 172px;
  }
  & .company {
    font-size: 2rem;
    font-weight: 600;
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


  & .index-card {
    width: 5in;
    height: 3in;
    position: relative;
    margin: 2rem auto;
    z-index: 2;
    display: grid;
    grid-template-rows: auto 1fr;
    box-shadow:
      0px 0px 4px 4px rgba(0,0,0,.10),
      0px 0px 12px 12px rgba(0,0,0,.05);
    max-width: 100%;
  }

  & textarea {
    resize: none;
    width: 100%;
    display: block;
  }
`)

