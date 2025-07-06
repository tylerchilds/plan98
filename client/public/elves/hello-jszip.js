import elf from '@silly/elf'
import JSZip from 'jszip'

const $ = elf('hello-jszip')


var zip = new JSZip();
zip.file("Hello.txt", "Hello World\n");
var img = zip.folder("images");
//img.file("smile.gif", imgData, {base64: true});
zip.generateAsync({type:"blob"})
.then(function(content) {
  const name = "example.zip"
  const downloadURL = (data) => {
    const a = document.createElement('a')
    a.href = data
    document.body.appendChild(a)
    a.style.display = 'none'
    a.download = name
    a.click()
    a.remove()
  }

  const blob = new Blob([content])

  const url = window.URL.createObjectURL(blob)

  downloadURL(url)
});

