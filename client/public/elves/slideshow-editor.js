import elf from '@silly/elf'
import Reveal from 'reveal.js';
import Markdown from 'reveal.js/markdown';

const linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "https://esm.sh/reveal.js@5.1.0/dist/reveal.css";
linkElement.crossOrigin = "";

const linkElement2 = document.createElement("link");
linkElement2.rel = "stylesheet";
linkElement2.href = "https://esm.sh/reveal.js@5.1.0/dist/theme/black.css";
linkElement2.crossOrigin = "";

document.head.appendChild(linkElement);

const emptyEditor = {
  delta: {},
  rawHTML: ""
}

const $ = elf('slideshow-editor')

$.draw(target => {

  if(! target.deck) {
    target.innerHTML = '<div class="reveal"></div>'
    target.deck = new Reveal({
      plugins: [Markdown],
    });
    target.deck.initialize({
      embedded: true
    });

    Reveal.getRevealElement = () => target;
    debugger
  }
})

export function editorByKey(key) {
  return $.learn()[key] || emptyEditor
}
