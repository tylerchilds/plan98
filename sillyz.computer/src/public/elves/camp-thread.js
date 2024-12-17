import tag from '@silly/tag'

const $ = tag('camp-thread')

$.draw((target) => {
  const src = target.getAttribute('src') || window.location.pathname
  return `
    <div class="remix">
      <a href="/app/camp-code?path=${src}">
        Goto:Editor
      </a>
    </div>
    <div class="grid">
      <simpleton-client path="${src}" mime="text/saga"></simpleton-client>
    </div>
  `
})

$.when('click', '[href^="/app/"]', (event) => {
  event.preventDefault()
  if(event.target.closest($.link).querySelector('.editor')) return
  const div = document.createElement('div')
  div.innerHTML = `
    <iframe src="${event.target.href}"></iframe>
    <div class="action-wrapper">
      <button data-close-editor>Close</button>
    </div>
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
    border: none;
    background: rgba(0,0,0,.85);
    padding: .25rem .5rem;
    color: white;
  }

  & .action-wrapper {
    pointer-events: none;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 1101;
    padding: 1rem;
  }
  & [data-close-editor] {
    pointer-events: all;
    background: black;
    border: none;
    border-radius: 1rem;
    color: white;
    padding: .5rem 1rem;
    opacity: .8;
    transition: opacity: 200ms;
  }

  & [data-close-editor]:hover,
  & [data-close-editor]:focus {
    cursor: pointer;
    opacity: 1;
  }

  & [data-close-editor] * {
    pointer-events: none;
  }


  & iframe {
    height: 100%;
  }
  & [href^="/app/"] {
    display: block;
    transform: translate(-0%, 150%) rotateZ(45deg);
  }
  & simpleton-client textarea {

    background: transparent;
  }

`)
