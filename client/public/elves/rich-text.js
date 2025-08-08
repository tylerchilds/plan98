import elf from '@plan98/elf'
import Quill from 'quill'
import quillToWord from 'quill-to-word';
import quillToPdf from 'quill-to-pdf';
import { updateDraft } from './time-machine.js'

const linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "https://esm.sh/quill@2.0.3/dist/quill.snow.css";
linkElement.crossOrigin = "";

document.head.appendChild(linkElement);

const emptyEditor = {
  delta: JSON.stringify({}),
  rawHTML: ""
}

const $ = elf('rich-text')

function read($, id) {
  return $.learn()[id] || emptyEditor
}

$.when('click', '[data-download]', async (event) => {
  const quill = event.target.closest($.link).editor
  const delta = quill.getContents();

  const type = event.target.dataset.download

  if(type === 'docx') {
    const quillToWordConfig = {
        exportAs: 'blob'
    };
    const docAsBlob = await quillToWord.generateWord(delta, quillToWordConfig);
    const url = URL.createObjectURL(docAsBlob);

    const link = document.createElement("a"); // Or maybe get it from the current document
    link.href = url;
    link.download = "word-export.docx";
    link.click()
  }

  if(type === 'pdf') {
    const docAsBlob = await quillToPdf.pdfExporter.generatePdf(delta);
    const url = URL.createObjectURL(docAsBlob);

    const link = document.createElement("a"); // Or maybe get it from the current document
    link.href = url;
    link.download = "word-export.pdf";
    link.click()
  }
})

$.draw(target => {
  const { ready } = $.learn()
  if(! target.editor) {
    const container = document.createElement('div')
    target.appendChild(container)

    target.editor = new Quill(container, { theme: 'snow' })
    target.editor.on('editor-change', update(target))
  }

  if(ready && !target.started) {
    target.started = true
    requestIdleCallback(() => {
      const data = $.learn()[target.id]
      if(!data) return
      target.editor.setContents(JSON.parse(data.delta))
    })
  }
})

function update(target) {

  return function updateEditor() {
    const delta = target.editor.getContents()
    const rawHTML = target.editor.root.innerHTML

    $.teach({ delta: JSON.stringify(delta), rawHTML })
    updateDraft({ rawHTML, delta })
  }
}

export function editorById(id) {
  return read($, id)
}

$.style(`
  & {
    background: white;
    display: block;
    height: 100%;
  }
`)
