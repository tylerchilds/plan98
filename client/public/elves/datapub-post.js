import elf from '@silly/elf'

const getPost = (id) => {
  return new Promise(resolve => {
    resolve({
      id,
      img: '/public/cdn/sillyz.computer/default-picture.png',
      username: 'Silly Elf',
      message: 'Hello World',
      timestamp: new Date().toJSON()
    })
  })
}

const $ = elf('datapub-post')

$.draw((target) => {
  query(target)
  const { img, username, message, timestamp } = $.learn()

  const date = new Date(timestamp)
  return `
    <div class="picture">
      <img src="${img}" alt="Profile picture for ${username}" />
    </div>
    <div class="post">
      <div class="post-username">
        ${username}
      </div>
      <div class="post-message">
        ${message}
      </div>
      <div class="post-date" data-tooltip="${date}">
        ${date.toLocaleString('en-US')}
      </div>
    </div>
  `
})

async function query(target) {
  if(target.queried) return
  target.queried = true
  const post = await getPost(target.id)
  $.teach(post)
}

$.style(`
  & {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: .5rem;
    padding: .5rem;
  }

  & .post {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  & .post-username {
    font-weight: bold;
    color: rgba(0,0,0,.65);
  }

  & .post-message {
    color: rgba(0,0,0,.85);
  }

  & .post-date {
    color: rgba(0,0,0,.35);
    font-size: 12px;
  }
`)
