import * as braid from 'braid-http'
import module from '@silly/tag'

let feed = []
const $ = module('braid-mail', { posts: [], activeIndex: 0 })

$.draw(render)

function render (target) {
  initialize(target)
  const { posts, activeIndex } = $.learn()
  const list = posts.map((p, index) => {
    return `
      <button data-index="${index}" class="${activeIndex === index ? 'active' : '' }">
        ${p.subject || '(untitled)'}
      </button>
    `
  }).join('\n')

  const form = `
    <form name="new-post">
      <label>Title</label>
      <input type="text" name="title">

      <label>Body</label>
      <input type="text" name="body">
      <button type="Submit">Post</button>
    </form>
  `

  const activePost = posts[activeIndex]

  return `
    ${form}
    <div class="panes">
      <div class="list">
        ${list}
      </div>
      ${activePost ? `
        <div class="preview">
          ${activePost.body}
        </div>
      ` : ''}
    </div>
  `
}

function initialize(target) {
  if(target.initialized) return
  target.initialized = true
  setTimeout(() => {
    fetch_feed(target)
  }, 1)
}

function update_feed(update) {
  console.log('We got a new update!', update)

  if (update.body)
    // Got a whole new snapshot
    feed = JSON.parse(update.body)
  else
    // Got patches to append to the feed
    update.patches.forEach(p => {
      console.assert(p.unit === 'json')
      console.assert(p.range === '[-0:-0]')
      feed.push(JSON.parse(p.content))
    })

  console.log('Now feed is', feed)
  fetch_posts(this)
}

async function fetch_feed (target) {
  const update = update_feed.bind(target)
  const host = target.getAttribute('host') || 'https://mail.braid.org'
  let res
  try {
    // res = await braid.fetch(host + '/feed', {subscribe: true})
    res = await fetch(host + '/feed')
  } catch (e) {
    console.log('try catch error! retrying...')
    setTimeout(() => fetch_feed(target), 3000)
  }
  if (res.headers.has('subscribe')) {
    res.subscribe(update, (e) => {
      console.log('subscribe error!', e, 'retrying...')
      setTimeout(() => fetch_feed(target), 3000)
    })
  } else {
    // Todo: add braid-http client library support to return array
    // of updates, or iterate through sequence of updates, in the
    // various forms that it can be encoded.
    //
    // Form 1:
    //  - Normal GET response with headers and body as update
    //
    // Form 2:
    //  - Get response with set of one or updates in body

    update({
      version: JSON.parse('[' + res.headers.get('version') + ']'),
      body: await res.text()
    })

    // Polling!
    console.log('Polling!  Waiting 30 seconds...')
    setTimeout(() => fetch_feed(target), 30000)
  }
}

async function fetch_post (url) {
  // Todo: subscribe to changes in posts
  const res = await braid.fetch(url)
  if (res.status === 200)
    return await res.text()
  else
    return undefined
}

async function fetch_posts (target) {
  const host = target.getAttribute('host') || 'https://mail.braid.org'
  const result = []
  for (let i=0; i<feed.length; i++) {
    const post = await fetch_post(host + feed[i].link)
    if (post)
      result.push({url: feed[i].link, ...JSON.parse(post)})
  }
  $.teach({ posts: result })
}

$.when('submit', 'form', async function make_new_post (event) {
  event.preventDefault()
  const root = event.target.closest($.link)
  const { title, body } = event.target
  const host = root.getAttribute('host') || 'https://mail.braid.org'
  var id = Math.random().toString(36).substr(6)
  await braid.fetch(host + '/post/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      to:       ["rjaycarpenter@gmail.com","email@tychi.me"],
      cc:       ["toomim@gmail.com"],
      from:     ["email@tychi.me"],
      date:     Date.now(),
      subject: title.value,
      body: body.value
    })
  })

  title.value = ""
  body.value = ""

  fetch_feed(root)
})

$.when('click', '[data-index]', (event) => {
  const { index } = event.target.dataset
  $.teach({ activeIndex: parseInt(index, 10) })
})

$.style(`
  & {
    display: block;
    height: 100%;
  }

  & .list {
    overflow: auto;
  }

  & .list .active {
    background: dodgerblue !important;
    color: rgba(255,255,255,.85);
  }

  & .list button {
    display: block;
    padding: .5rem;
    font-size: 1rem;
    width: 100%;
    text-align: left;
    color: dodgerblue;
    border: none;
    background: white;
  }

  & .list button:hover,
  & .list button:focus {
    background: dodgerblue;
    color: white;
  }

  & .panes {
    height: 100%;
  }

  @media screen and (max-width: 768px) {
    .list {
      max-height: 25vh;
    }
  }

  @media screen and (min-width: 768px) {
    & .panes {
      display: grid;
      grid-template-columns: 1fr 1.618fr;
    }
  }

  .preview {
    padding: 1rem;
  }
`)
