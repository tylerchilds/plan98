import elf from '@silly/elf'

const link = elf('same-page', {
  uuid: self.crypto.randomUUID()
})

link.draw(() => {
  const { uuid } = link.learn()
  return `
    <a href="/?world=sillyz.computer" class="nonce word-mark">
      <span class="word">Same</span><strong class="word"><em>Same</em></strong><span class="word">.Page</span>
    </a>
    <form class="search minimizable" action="/app/bulletin-board" method="get">
      <div class="input-grid">
        <input placeholder="netdir://" value="${uuid}" autocomplete="off" name="src" />

        <button tab-index="1" type="submit">
          <sl-icon name="circle"></sl-icon>
        </button>
      </div>
    </form>
  `
})

link.style(`
  & {
    display: grid;
    width: 100%;
    height: 100%;
    place-content: center;
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
    background: saddlebrown;
    color: lemonchiffon;
    border: 1px solid saddlebrown;
    padding: 1rem;
    aspect-ratio: 1;
  }
`)
