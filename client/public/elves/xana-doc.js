import app from '@plan98/app'

import { get } from './plan98-wallet.js'

const robot = app('xana-doc', {
  transclusions: []
})

robot.draw((target) => {
  if(!target.innerHTML) {
    target.innerHTML = `
      <div class="viewport">
        <div class="definitely-not-paper">
          <div class="transclusions"></div>
        </div>
      </div>
    `
  }
}, {
  beforeUpdate(target) {
    {
      if(!target.mounted) {
        target.mounted = true
        const src = target.getAttribute('src')
        if(src) {
          robot.teach({ transclusions: [] })
          get(src).then(blob => {
            if(blob) {
              blob.text().then(str => JSON.parse(str)).then(data => {
                if(data.transclusions) {
                  robot.teach({ transclusions: data.transclusions })
                }
              })
            }
          })
        }
      }
    }
  },
  afterUpdate(target) {
    {
      const { transclusions } =  robot.learn()
      const node = target.querySelector('.transclusions')
      transclusions.map(transclude(node))
    }
  }
})

function transclude(node) {
  return function include(transclusion, index) {
    while(!node.children[index]) {
      node.appendChild(document.createElement('context'))
    }

    const context = node.children[index]
    context.innerHTML = `
      ${snippet(transclusion, { index })}
    `
  }
}

function snippet(transclusion, options={}) {
  let innerHTML
  let innerText
  let attributes
  if(transclusion.properties) {
    attributes = Object.keys(transclusion.properties)
      .map(x => {
        if(x === 'html') {
          innerHTML = transclusion.properties.html
          return ''
        }
        if(x === 'text') {
          innerText = transclusion.properties.text
          return ''
        }

        return `${x}="${transclusion.properties[x]}" `
      }).join('')
  }

  return `
    <button
      class="snippet"
      ${options.backlink
        ?`data-backlink="${options.backlink}"`
        :''
      }

      ${options.index
        ?`data-goto="${options.index}"`
        :''
      }
    >
      <${transclusion.tag} ${attributes}>${innerHTML || innerText || ''}</${transclusion.tag}>
    </button>
  `
}

function portal(index=robot.learn().transclusions.length) {
  return `
    <button class="portal" data-index="${index}">
      <sl-icon name="plus-lg"></sl-icon>
    </button>
  `
}

robot.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  & [data-cancel] {
    position: absolute;
    right: 4px;
    top: 4px;
    z-index: 10;
  }

  & .viewport {
    background: rgba(0,0,0,.2);
    padding: .5rem;
    overflow: auto;
    height: 100%;
  }

  &:not([data-library-index="null"]) .viewport {
    overflow: hidden;
  }

  &[data-library-index="null"] .library {
    display: none;
  }

  & .library {
    display: block;
    position: absolute;
    inset: 0;
    z-index: 2;
    background: white;
  }

  & .surface {
    height: 100%;
    background: rgba(0,0,0,.4);
    padding: .5rem;
  }

  & .kind-of-paper {
    background: white;
    max-width: 8.5in;
    height: 100%;
    padding: 1rem;
    margin: auto;
    box-shadow: 0px 1px 2px 0px black;
    overflow: auto;
  }


  & .definitely-not-paper {
    background: white;
    width: 100%;
    max-width: 8.5in;
    height: 100%;
    padding: .5in;
    margin: auto;
    box-shadow: 0px 1px 2px 0px black;
    overflow: auto;
  }

  & .snippet {
    background: lemonchiffon;
    box-shadow: 0px 1px 2px 0px rgba(0,0,0,.85);
    padding: .5rem;
    transition: transform ease-in-out 100ms;
    transform: scale(1);
    display: block;
    border: none;
    width: 100%;
    text-align: left;
    margin: .5rem 0;
  }

  & .snippet:hover {
    box-shadow: 0px 2px 4px 0px rgba(0,0,0,.5);
    transform: scale(1.01);
  }

  & .snippet > * {
    pointer-events: none;
  }

  & .portal {
    background: rgba(0,0,0,.1);
    box-shadow: 0px 1px 2px 0px rgba(0,0,0,.85) inset;
    padding: .5rem;
    transition: all ease-in-out 100ms;
    opacity: .5;
    transform: scale(1);
    display: block;
    border: none;
    width: 100%;
    text-align: center;
    margin: .5rem 0;
  }

  & .portal:hover {
    background: lemonchiffon;
    box-shadow: 0px 2px 4px 0px rgba(0,0,0,.5);
    transform: scale(1.01);
    opacity: 1;
  }

  & .portal > * {
    pointer-events: none;
  }

  & .portal plan98-icon {
    width: 1rem;
    height: 1rem;
  }
`)
