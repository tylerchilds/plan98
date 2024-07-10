import module from '@silly/tag'
import { currentBusiness } from './sillonious-brand.js'
import 'gun'
import 'gun/sea'

const Gun = window.Gun

const gun = Gun(['https://gun.1998.social/gun']);
const user = gun.user().recall({ sessionStorage: true })

const $ = module('my-journal', {
  authenticated: false,
  posts: [],
  alias: '',
  pass: '',
  post: ''
})

gun.on('auth', () => {
  $.teach({ authenticated: true })
  user.get('journal').map().on(showPost)
})

function showPost(post, id) {
  $.teach({ [id]: post }, add(id))
}

function add(id) {
  return (state, payload) => {
    return {
      ...state,
      ...payload,
      posts: [...state.posts, id]
    }
  }
}

$.draw(target => {
  const data = $.learn()
  const {posts, authenticated, alias, pass, post} = data

  const fakie = `
    <form>
      <label class="field">
        <span class="label">Player</span>
        <input class="keyable" name="alias" value="${alias}" placeholder="username">
      </label>
      <label class="field">
        <span class="label">Password</span>
        <input class="keyable" name="pass" value="${pass}" type="password" placeholder="passphrase">
      </label>
      <button class="button" id="signup" type="submit">
        Sign Up
      </button>
      <button class="button" id="signin" type="submit">
        Sign In
      </button>
    </form>
  `

  const regular = `
    <button class="button" id="signout" type="submit">
      Sign Out
    </button>
    <ul id="list">${posts.map(x => `<li>${data[x]}</li>`).join('')}</ul>
    <form id="post">
      <input class="keyable" name="post" value="${post}">
      <input type="submit" value="post">
    </form>
  `

  const { image, color } = currentBusiness(plan98.host)
  target.style.setProperty("--image", `url(${image})`);
  target.style.setProperty("--color", color);

  target.innerHTML = `
    <div class="inner">
      ${authenticated ? regular : fakie}
    </div>
  `
})

$.when('change', '.keyable', (event) => {
  event.preventDefault()
  const { name, value } = event.target
  $.teach({[name]: value})
})

$.when('click', '#signout', (event) => {
  event.preventDefault()
  user.leave()
  $.teach({ authenticated: false })
})

$.when('click', '#signup', (event) => {
  event.preventDefault()
  const { alias, pass } = $.learn()
  user.create(alias, pass)
  user.auth(alias, pass)
  $.teach({ pass: '' })
})

$.when('click', '#signin', (event) => {
  event.preventDefault()
  const { alias, pass } = $.learn()
  user.auth(alias, pass)
  $.teach({ pass: '' })
})

$.when('submit', '#post', (event) => {
  event.preventDefault()
  const { post } = $.learn()
  user.get('journal').set(post, (a, b,c) => {
    $.teach({ post: '' }) })
})

$.style(`
  &::before {
    content: '';
    position: absolute;
    background: var(--image), var(--color, transparent);
    background-blend-mode: multiply;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    inset: 0;
    overflow: hidden;
  }

  & {
    display: grid;
    place-items: start;
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  & .inner {
    z-index: 1;
    position: relative;
    overflow: auto;
    width: 100%;
    max-height: 100%;
    padding: 4rem 7px 6rem;
  }

  & form {
    background: rgba(0,0,0,.5);
    backdrop-filter: blur(2px);
    border-radius: 9px;
    padding: 16px 9px;
    display: grid;
    max-width: 320px;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  & .field {
    margin-bottom: .5rem;
  }
`)
