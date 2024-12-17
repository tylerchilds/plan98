import elf from '@silly/elf'

const link = elf('same-page', {
  uuid: self.crypto.randomUUID()
})

function locate(uuid) {
 return `${window.location.origin}/app/virtual-machine?src=${`/private/${link.link}/${uuid}`}.saga`

}

link.draw(() => {
  const { uuid } = link.learn()
  const blueprint = locate(uuid)
  return `
    <form class="search minimizable" method="post">
      <div class="input-grid">
        <input placeholder="netdir://" value="${uuid}" autocomplete="off" name="src" />

        <button tab-index="1" type="submit">
          <sl-icon name="circle"></sl-icon>
        </button>
      </div>
    </form>
    <div class="slogan">
      Pick a Card. Any. Card.
    </div>
    <div class="bloop-grid">
      <button class="card spin" data-blueprint="${blueprint}">
        <div class="frontside">
          <div class="nonce word-mark">
            <span class="word">Same</span><strong class="word"><em>Same</em></strong><span class="word">.Page</span>
          </div>
        </div>
        <div class="backside">
          <qr-code text="${blueprint}" data-fg="saddlebrown" data-bg="lemonchiffon"></qr-code>
        </div>
      </button>
    </div>
  `
})

link.when('click', '.card', (event) => {
  const { blueprint } = event.target.dataset
  window.location.href = blueprint
})

link.when('submit', 'form', (event) => {
  event.preventDefault()
  const { value } = event.target.src
  const blueprint = locate(value)
  window.location.href = blueprint
})


link.style(`
  & {
    display: grid;
    width: 100%;
    height: 100%;
    place-content: center;
  }

  & .bloop-grid {
    display: grid;
    place-items: center;
  }

  & .slogan {
    font-size: 1.5rem;
    text-align: center;
    color: rgba(0,0,0,.65);
    margin: 2rem;
  }

  & .word-mark {
    text-align: center;
    font-size: 2.5rem;
    margin: 2rem;
    display: grid;
    place-content: center;
    line-height: 1;
    text-decoration: none;
    color: saddlebrown;
  }

  & .word-mark .word {
    position: relative;
    z-index: 2;
  }

  & .nonce {
    margin: 2rem auto;
  }

  & form {
    max-width: 100%;
  }

  & .input-grid {
    display: flex;
    text-align: left;
    max-width: 100%;
  }

  & button,
  & input {
    border-radius: 0;
    padding: .5rem 1rem;
    max-width: 100%;
  }

  & input {
    width: 100%;
    border: 1px solid lemonchiffon;
    background: lemonchiffon;
    color: saddlebrown;
  }

  & button {
    background: #E83FB8;
    color: lemonchiffon;
    border: 1px solid #E83FB8;
    padding: 1rem;
    aspect-ratio: 1;
  }

  & button:hover,
  & button:focus {
    background: lemonchiffon;
    color: #E83FB8;
  }
`)
