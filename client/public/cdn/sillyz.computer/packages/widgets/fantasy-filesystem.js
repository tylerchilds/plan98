import { tag, signal, read } from "/deps.js"

const flags = {
  fid: 'https://1998.social/ffs' + window.location.pathname
}

const $ = tag('fantasy-filesystem')

$.render(target => {
  const { secret } = $.read()

  return `
    <h2>Publish</h2>
    <br/>
    <p>Overwrite the contents at this address on the Fantasy File System?</p>
    <highlighter color="lime">
      <variable-text monospace=".5" casual="0" cursive="0">
        ${flags.fid}
      </variable-text>
    </highlighter>
    <form>
      <button type="submit">Publish</button>
    </form>
  `
})

$.on('change', '[type="text"]', (event) => {
  const { name, value } = event.target
  $.write({ [name]: value })
})

$.on('submit', 'form', (event) => {
  event.preventDefault()
  const { secret } = $.read()
  const content = getContents(event.target)

  upload(content)
})

function getContents(target) {
  const resource = target.closest($.selector);
  const model = resource.getAttribute('model')

  const data = read(model)[flags.fid] || {}

  return contentsByType(model, data)
}

const contentsLookup = {
  hypertext: (x) => x.rawHTML
}

function contentsByType(model, data) {
  const lookup = contentsLookup[model] || (() => null)
  return lookup(data)
}

function upload(value) {
  if(value) {
    bus.state[flags.fid] = value
  }
}
