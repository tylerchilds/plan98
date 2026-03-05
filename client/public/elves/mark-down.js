import elf from '@silly/elf'
import { marked } from 'marked'

function decodeHtmlEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

const renderer = new marked.Renderer();

renderer.codespan = (code) => {
  return `<code>${escapeHyperText(decodeHtmlEntities(code))}</code>`;
};

// Override code block rendering
renderer.code = (code, language) => {
  const decodedCode = decodeHtmlEntities(code); // First decode pass
  //decodedCode = decodeHtmlEntities(decodedCode); // Second decode to fix double encoding

  const langClass = language ? ` class="language-${language}"` : "";
  return `<pre><code${langClass}>${escapeHyperText(decodedCode)}</code></pre>`;
};

marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
  smartypants: false,
  headerIds: false,
  mangle: false
});


const $ = elf('mark-down', { view: '' })

$.draw((target) => {
  const { view } = $.learn()
  if(target.initialized) return view
  target.initialized = true
  $.teach({ view: marked(target.innerText) })

  const src = target.getAttribute('src')
  if(src) {
    requestIdleCallback(() => {
      let file = ''
      fetch(src).then(async res => {
        if(res.status !== 404) {
          file = await res.text()
        }
      }).catch((error) => {
        file = 'issue'
        console.error(error)
      }).finally(() => {
        $.teach({ view: marked(file) })
      })
    })
  }

  target.innerHTML = view
})

function escapeHyperText(text = '') {
  return text.replace(/[&<>'"]/g, 
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}

$.style(`
  & {
    padding: 1rem;
    display: block;
  }
`)
