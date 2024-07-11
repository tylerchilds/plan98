import elves from '@silly/tag'

const $ = elves('landing-publish', {
  lead: '',
  content: '',
  title: ''
})

const tags = ['TEXTAREA', 'INPUT']

$.draw((target) => {
  const { lead, content, title } = $.learn()

  return `
    <form method="post">
      <button type="submit" data-publish>
        Publish
      </button>
      <h2>Create Content</h2>
      <div class="grid">
        <div class="photo">
          <img src="/cdn/thelanding.page/giggle.svg" />
        </div>
        <div class="data">
          <label class="field">
            <span class="label">Title</span>
            <input class="dynamic" name="title" value="${title}">
          </label>
          <label class="field">
            <span class="label">Lead</span>
            <input class="dynamic" name="lead" value="${lead}">
          </label>
        </div>
      </div>
      <label class="field">
        <span class="label">Article</span>
        <textarea class="dynamic" name="content">${content}</textarea>
      </label>
    </form>
  `
}, {
  beforeUpdate: saveCursor,
  afterUpdate: replaceCursor
})

$.when('submit', 'form', (event) => {
  event.preventDefault()
  const { lead, content, title } = $.learn()
  alert(`${lead}\n${content}\n${title}`)
})

$.when('input', '.dynamic', (event) => {
  const {name,value} = event.target
  $.teach({[name]:value})
})

$.style(`
  & form{
    position: relative;
    margin-top: 6rem;
  }
  & textarea {
    resize: none;
    height: 50vh;
    width: 100%;
  }

  & .grid {
    display: grid;
    grid-template-columns: 1fr 1.618fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  & .photo img {
    aspect-ratio: 16 / 9;
  }

  & [data-publish] {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    color: rgba(255,255,255,.85);
    padding: .5rem 1rem;
    border-radius: 1rem;
    border: none;
    position: absolute;
    right: 0;
  }

  & [data-publish]:hover,
  & [data-publish]:focus {
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
  }
`)


let sel = []
function saveCursor(target) {
  if(target.contains(document.activeElement)) {
    target.dataset.paused = document.activeElement.name
    if(tags.includes(document.activeElement.tagName)) {
      const textarea = document.activeElement
      sel = [textarea.selectionStart, textarea.selectionEnd];
    }
  }
}

function replaceCursor(target) {
  const paused = target.querySelector(`[name="${target.dataset.paused}"]`)
  
  if(paused) {
    paused.focus()

    if(tags.includes(paused.tagName)) {
      paused.selectionStart = sel[0];
      paused.selectionEnd = sel[1];
    }
  }
}
