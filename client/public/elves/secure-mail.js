import module from '@silly/tag'

const $ = module('secure-mail')

$.draw(render)

function render(_target) {
  return `
    <div class="hero-bar">
      <div>
        Secure Mail
      </div>
      <div>
        <button data-draft>
          <span><sl-icon name="pencil"></sl-icon></span>
          Drafts
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
        <iframe name="email-pain" src="/app/email-none">
      </div>
    </div>
  `
}

$.when('click', '[data-draft]', (event) => {
  const iframe = event.target.closest($.link).querySelector('[name="email-pain"]')

  iframe.src = '/app/email-new'
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
    padding: 0 0 0 1rem;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    color: rgba(255,255,255,.85);
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: rgba(0,0,0,.85);
  }

  & [data-draft] {
    float: right;
    background: dodgerblue;
    color: rgba(255,255,255,.85);
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
    background: dodgerblue;
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
