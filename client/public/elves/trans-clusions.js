import app from '@plan98/app'

const robot = app('trans-clusions', {
  transclusions: [
    {
      tag: 'p',
      properties: {
        text: 'hi'
      },
    }
  ]
})

robot.draw((target) => {
  const { transclusions } =  robot.learn()
  const objects = transclusions.map(transclude)

  target.innerHTML = `
    <div class="definitely-not-paper">
      ${objects}
    </div>
  `
})

robot.style(`
  & {
    display: block;
    background: dimgray;
    height: 100%;
    padding: .5rem;
    overflow: auto;
  }

  & .definitely-not-paper {
    background: white;
    width: 8.5in;
    height: 11in;
    padding: .5in;
    margin: auto;
  }
`)

function transclude(transclusion) {
  let innerHTML
  let innerText
  const attributes = Object.keys(transclusion.properties)
    .map(x => {
      if(x === 'html') {
        innerHTML = transclusion.properties.html
        return ''
      }
      if(x === 'text') {
        innerText = transclusion.properties.text
        return ''
      }

      return `${x}="${properties[x]}" `
    }).join('')

  return `
    <${transclusion.tag} ${attributes}>${innerHTML || innerText || ''}</${transclusion.tag}>
  `
}
