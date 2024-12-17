import elf from '@silly/elf'
import Quill from 'quill'
import quillToWord from 'quill-to-word';
import quillToPdf from 'quill-to-pdf';
import 'gun'
import 'gun/open'
const gun = window.Gun(['https://gun.1998.social/gun']);

const linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "https://esm.sh/quill@2.0.3/dist/quill.snow.css";
linkElement.crossOrigin = "";

document.head.appendChild(linkElement);

const emptyEditor = {
  delta: JSON.stringify({}),
  rawHTML: ""
}

const $ = elf('document-editor')

function read($, id) {
  return $.learn()[id] || emptyEditor
}

function write($, id, data, merge = (node, data, key) => {
  node.get(key).put(data[key])
}) {
  Object
    .keys(data)
    .forEach(key => {
      const entry = gun.get($.link).get(id)
      merge(entry, data, key)
    })
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
    const downloadDocx = document.createElement('button')
    downloadDocx.dataset.download = 'docx'
    downloadDocx.innerText = 'Export Docx'
    target.appendChild(downloadDocx)

    const downloadPdf = document.createElement('button')
    downloadPdf.dataset.download = 'pdf'
    downloadPdf.innerText = 'Export PDF'
    target.appendChild(downloadPdf)

    target.appendChild(container)

    target.editor = new Quill(container, { theme: 'snow' })
    target.editor.on('editor-change', update(target))

    const entry = gun.get($.link).get(target.id)
    entry.open((data) => {
      $.teach({[target.id]: data, ready: true })
    });
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

    write($, target.id, { delta: JSON.stringify(delta), rawHTML })
  }
}

export function editorById(id) {
  return read($, id)
}
