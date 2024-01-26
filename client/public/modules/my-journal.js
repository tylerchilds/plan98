import module from '@sillonious/module'
import Gun from 'gun'
import 'gun/sea'

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
  $.teach({
    authenticated: true
  })
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

  const nonMemberExperience = `
    <form id="sign">
      <input class="keyable" name="alias" value="${alias}" placeholder="username">
      <input class="keyable" name="pass" value="${pass}" type="password" placeholder="passphrase">
      <input id="signup" type="button" value="sign up">
      <input id="signin" type="button" value="sign in">
    </form>
  `

  const memberExperience = `
    <ul id="list">${posts.map(x => `<li>${data[x]}</li>`).join('')}</ul>
    <form id="post">
      <input class="keyable" name="post" value="${post}">
      <input type="submit" value="post">
    </form>
  `
  return authenticated ? memberExperience : nonMemberExperience
})

$.when('change', '.keyable', (event) => {
  const { name, value } = event.target
  $.teach({[name]: value})
})

$.when('click', '#signup', () => {
  const { alias, pass } = $.learn()
  user.create(alias, pass)
  user.auth(alias, pass)
})

$.when('click', '#signin', () => {
  const { alias, pass } = $.learn()
  user.auth(alias, pass)
})

$.when('submit', '#post', (e) => {
  e.preventDefault()
  const { post } = $.learn()
  user.get('journal').set(post, (a, b,c) => {
    $.teach({ post: '' })
  })
})
