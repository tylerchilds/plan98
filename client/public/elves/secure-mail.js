import module from '@silly/tag'

const $ = module('secure-mail')

$.draw(render)

function render(_target) {
  return `
    <div class="hero-bar">
      Secure Mail
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

$.style(`
  & {
    height: 100%;
    display: block;
    position: relative;
  }

  & .hero-bar {
    height: 2rem;
    line-height: 2rem;
    padding: 0 1rem;
    position: absolute;
    background: #54796d;
    top: 0;
    left: 0;
    right: 0;
    color: rgba(255,255,255,.85);
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
