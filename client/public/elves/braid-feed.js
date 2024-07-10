import tag from '@silly/tag'
import * as client from '@braid/mail'

const host = 'https://mail.braid.org'

const $ = tag('braid-feed', { feed: [] })

client.subscribe_to_feed(host+'/feed', feed => {
  $.teach({ feed })
})

$.draw(() => {
  const { feed } = $.learn()
  const form = `
      <form id="new-post">
      <textarea name=subject placeholder=subject></textarea>
      <textarea name=body placeholder=body></textarea>
      <button type=submit>new post</button>
      </form>
    `
  const thread = feed.map(post => `
      <p><a href='${post.url}'><code style='font-size:10'>${post.url}</code></a><br><b>${post.subject || ''}</b><br>${post.body}</p>
    `).join('\n')

  return `
      ${thread}
      ${form}
    `
})

$.when('submit', '#new-post', (event) => {
  event.preventDefault()
  const { subject, body } = event.target

  client.make_new_post(host, {
    subject: subject.value,
    body: body.value
  })

  subject.value = ''
  body.value = ''
})

