import tag from '@silly/tag'

const $ = tag('camp-thread')

$.draw((target) => {
  const src = target.getAttribute('src')
  return `
    <div class="remix">
      <a href="/app/simpleton-client?path=${src}">
        Goto:Editor
      </a>
    </div>
    <div class="grid">
      <simpleton-client path="${src}" mime="text/saga"></simpleton-client>
    </div>
  `
})

$.when('click', '[href^="/app/simpleton-client"]', (event) => {
  event.preventDefault()
  if(event.target.closest($.link).querySelector('.editor')) return
  const div = document.createElement('div')
  div.innerHTML = `
    <button data-close-editor>Close</button>
    <iframe src="${event.target.href}"></iframe>
  `
  div.classList.add('editor')
  event.target.closest($.link).querySelector('.grid').appendChild(div)
})

$.when('click', '[data-close-editor]', (event) => {
  event.target.closest('.editor').remove()
})

$.style(`
  & {
    position: relative;
    height: 100%;
    width: 100%;
    display: block;
  }

  & .grid {
    display: grid;
    height: 100%;
    grid-template-rows: 1fr 1fr;
    grid-template-areas: "all" "all";
  }

  & simpleton-client:last-child {
    grid-area: all
  }

  & .grid > * {
    width: 100%;
    height: 100%;
  }

  & .remix {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 3;
  }
  
  & .editor {
    height: 100%;
    border-top: 5px solid orange;
  }

  & .editor button {
    position: absolute;
    right: 0;
    border: none;
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.75)), dodgerblue;
    padding: .25rem .5rem;
    color: white;
  }

  & iframe {
    height: 100%;
  }
  & [href^="/app/simpleton-client"] {
    display: block;
    transform: translate(-0%, 150%) rotateZ(45deg);
  }
  & simpleton-client textarea {

    background: transparent;
  }

`)
