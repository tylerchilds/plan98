import elf from '@silly/elf'

const $ = elf('secure-mail')

$.draw(render)

function render(target) {
  const src = target.getAttribute('src') || '/app/email-none?src=/app/draw-term?src=/app/party-chat'

  return `
    <div class="hero-bar">
      <button data-src="${src}">
        <div style="height: 2rem; width: 2rem;" class="nonce"></div>
        Secure Mail
      </button>
      <div>
        <button data-draft>
          <span><sl-icon name="pencil"></sl-icon></span>
          Craft
        </button>
      </div>
    </div>
    <div class="panes">
      <div class="list">
        <div class="list-wrapper">
          <email-all target="email-pain"></email-all>
        </div>
      </div>
      <div class="preview">
        <iframe name="email-pain" src="${src}">
      </div>
    </div>
  `
}

$.when('click', '[data-draft]', (event) => {
  const iframe = event.target.closest($.link).querySelector('[name="email-pain"]')

  iframe.src = '/app/email-new'
})

$.when('click', '[data-src]', (event) => {
  const { src } = event.target.dataset
  const iframe = event.target.closest($.link).querySelector('[name="email-pain"]')

  iframe.src = src
})



$.style(`
  & {
    height: 100%;
    display: block;
    position: relative;
  }

  & .hero-bar {
    height: 2rem;
    line-height: 2rem;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    color: rgba(255,255,255,.85);
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: rgba(0,0,0,.85);
  }

  & [data-src] {
    padding: 0;
    line-height: 1;
    font-size: 1rem;
    line-height: 2rem;
    display: grid;
    grid-template-columns: auto 1fr;
    color: lemonchiffon;
    gap: .5rem;
    margin: 0;
    transition: background 100ms;
    border: none;
    background: transparent;
    text-align: left;
    font-weight: bold;
  }

  & [data-draft] {
    float: right;
    background: lemonchiffon;
    color: #E83FB8;
    border: none;
    padding: 0 .5rem;
    line-height: 2rem;
    font-size: 1rem;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: .5rem;
    margin: 0;
    transition: background 100ms;
  }

  & [data-draft]:hover,
  & [data-draft]:focus {
    color: lemonchiffon;
    background: #E83FB8;
  }

  & .panes {
    padding-top: 2rem;
    height: 100%;
    grid-template-rows: minmax(180px, 1fr) 1.618fr;
    display: grid;
  }

  & .list {
    border-right: 1px solid #54976d;
    position: relative;
  }

  & .list-wrapper {
    position: absolute;
    inset: 0;
  }

  @media screen and (min-width: 768px) {
    & .panes {
      display: grid;
      grid-template-columns: 1fr 1.618fr;
      grid-template-rows: auto;
    }

    & .list {
      border-right: none;
      border-bottom: 1px solid #54976d;
    }
  }
`)
