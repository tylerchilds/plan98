import elf from '@silly/elf'

const getPost = (id) => {
  return new Promise(resolve => {
    resolve({
      id,
      icon: '/public/cdn/sillyz.computer/default-picture.png',
      name: 'Silly Elf',
      content: 'Hello World',
      published: new Date().toJSON()
    })
  })
}

const $ = elf('datapub-post')

$.draw((target) => {
  query(target)
  const { icon, name, content, published } = $.learn()

  const date = new Date(published)
  return `
    <div class="picture">
      <img src="${icon}" alt="Profile picture for ${name}" />
    </div>
    <div class="post">
      <div class="post-username">
        ${name}
      </div>
      <div class="post-message">
        ${content}
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
