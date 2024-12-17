import module from '@silly/tag'
import { fetch as braid_fetch } from 'braid-http'

const defaultHost = 'https://mail.braid.org'

const $ = module('braid-forum', {
  posts: []
})

async function initialize(target) {
  if(target.initialized) return
  target.initialized = true
  const host = target.getAttribute('host') || defaultHost

  (await braid_fetch(host + '/feed', { subscribe: true }))
  .subscribe((update) => {
  })
}

async function download({link}) {
  return await fetch(host + link).then(res => res.json())
}

$.draw(target => {
  initialize(target)
  const { posts, error } = $.learn()
  const view = posts.map(post => {
    return `
      <h1>${post.title}</h1>
      <p>${post.body}</p>
    `
  }).join('')

  return `
    ${error ? `<div class="error">${error}</div>`: ''}
    <form name="new-post">
      <label>Title</label>
      <input type="text" name="title">

      <label>Body</label>
      <input type="text" name="body">
      <button type="Submit">Post</button>
    </form>
    ${view}
  `
})

$.when('submit', '[name="new-post"]', async (event) => {
  event.preventDefault()
  const { title, body } = event.target

  $.teach({ error: null })

  await fetch(host + '/post/'+title.value, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: ['rjaycarpenter@gmail.com', 'email@tychi.me'],
      cc: ['toomim@gmail.com'],
      from: ['email@tychi.me'],
      date: Date.now(),
      'replying-to': 'https://example.com/test',
      subject: title.value,
      body: body.value

    }),
  })
  .then(res => res.status === 200)
  .then(good => {
    if(good) {
      title.value = ''
      body.value = ''
    } else {
      $.teach({ error: "not 200" })
    }
  }).catch(e => {
    console.error(e)
    $.teach({ error: "bad put" })
  })
})

$.style(`
  & .error {
    background: red;
  }
`)
