import tag from '@silly/tag'
import { getSession, clearSession } from './comedy-notebook.js'
import { social } from './chat-room.js'

const $ = tag('generic-profile')

function unmemo(target, user, names) {
  names.map(name => {
   if(!target.dataset[name] || target.dataset[name] !== user[name]) {
     target.dataset[name] = user[name]
     const node = target.querySelector(`[name="${name}"]`)
     if(node) node.value = user[name]
    }
  })
}

$.draw((target) => {
  const user = hotAccount(target)

  if(target.user) {
    unmemo(target, user, ['nickname', 'tagline'])
    return
  }

  target.user = user
  return user ? `
    <div class="hero">
      <quick-media edit="true" key="${user.hero}"></quick-media>
    </div>
    <div class="photo">
      <quick-media edit="true" key="${user.avatar}"></quick-media>
    </div>
    <div class="nickname">
      <simpleton-client tag="input" path="${user.nickname}"></simpleton-client>
    </div>
    <div class="grid">
      <div class="sidebar">
        <label>tagline</label>
        <simpleton-client tag="input" path="${user.tagline}"></simpleton-client>

        <label>likes</label>
        <simpleton-client path="${user.likes}"></simpleton-client>

        <label>dislikes</label>
        <simpleton-client path="${user.dislikes}"></simpleton-client>
      </div>
      <div class="mainbar">
        <simpleton-client path="/profile"></simpleton-client>
      </div>
    </div>
  ` : ''
})

function hotAccount(target) {
  const { companyName, companyEmployeeId } = getSession()
  const company = target.closest($.link).getAttribute('company') || companyName || 'sillyz.computer'
  const unix = target.closest($.link).getAttribute('unix') || companyEmployeeId || 'tychi'
  return social(company, unix)
}

$.when('input', '.hot-input', (event) => {
  const root = event.target.closest($.link)
  const node = event.target
  root.user[node.name] = node.value
})

$.style(`
  & {
    padding: 0 1rem;
    display: block;
  }
  @media (min-width: 768px) {
    & .grid {
      display: grid;
      grid-template-columns: 1fr 1.618fr;
    }
  }
  & .sidebar {
    padding: 0 1rem;
    max-width: 320px;
  }
  & .hero {
    height: 300px;
    background: dodgerblue;
    position: relative;
    margin: 0 -1rem 100px -1rem;
  }

  & .hero img {
    object-fit: cover;
    aspect-ratio: 16/9;
  }

  & .photo {
    width: 180px;
    height: 180px;
    border-radius: 100%;
    position: relative;
    left: 0;
    right: 0;
    margin: -200px auto 1rem;
    overflow: hidden;
    z-index: 2;
  }

  & quick-media {
    height: 100%;
    overflow: hidden;
  }


  & .photo img {
    object-fit: cover;
    width: 172px;
    height: 172px;
    border-radius: 100%;
    aspect-ratio: 1;
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

  & .nickname {
    margin: 0 auto 1rem;
    font-size: 1.5rem;
    font-weight: 600;
  }

  & .nickname input {
    margin: auto;
    width: 220px;
    display: block; 
    text-align: center;
    background: lemonchiffon;
    border: none;
    padding: 13px;
  }
`)

