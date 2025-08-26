// The reason this application is important
//
// WE DO NOT KNOW WHERE HATE COMES FROM
//
// There are graves with no names as the people that did it were paid and paid and paid and on and on and no one takes the blame
//
// Hundred million dollars
// what's it gonna cost
// bodies on my mind
// bodies on my mind
// bodies on my mind
//
// Forget Forgetting
// Agency Over Memory
//
// Restoring Silicon Valley to the Time Prior to Forgetfulness As A Service
//
// What?
//
// Saving literature.
//
// With literature, you can find the missing books. The ones that burned. Read enough, and perhaps discover clues to where authors hide their libraries with scripts that haven't been performed in centuries.
//
// Recover the books. Become the one to restore the narrative.
//
// Save the libraries, save reality.

import app from '@plan98/app'
import equal from 'fast-deep-equal'

import { updateDraft } from './time-machine.js'
import { get, put } from './plan98-wallet.js'

const cache = {}

const library = {
  [self.crypto.randomUUID()]: {
    title: "Hello World",
    transclusion: {
      tag: 'hello-world'
    }
  },

  [self.crypto.randomUUID()]: {
    title: "Upload Drop",
    transclusion: {
      tag: 'upload-drop'
    }
  },
  [self.crypto.randomUUID()]: {
    title: "Alph",
    transclusion: {
      tag: 'p',
      properties: {
        html: `
          Plan98<br>
<br>
          In Xanadu, did Kubla Khan and Kubla Khan found Alph.<br>
          Now Alph is a river that slips and it slithers,<br>
          while time is adjacent to space ever so nascent,<br>
          That water flows upwards and downwards at once.<br>
<br>
          A story unfolded as it was tolded, a bardly dulcimer,<br>
          Beginning unkindly, the realms sent war to her,<br>
          becoming the jester for heightened bemusement, she rang<br>
          whole kingdoms now circused in total amusement, she sang<br>
<br>
          Time and again she keeps thwarting their effort,<br>
          How? Space is a construct, she's throwing a concert,<br>
          that fits in her pocket, on paper as finite as self,<br>
          it sounds somewhat silly, in that it was made by an elf.<br>
<br>
          In Xanadu, did Kubla Khan and Kubla Khan found Alph.<br>
<br>
- A person on business from Porlock
        `
      }
    }
  },
  [self.crypto.randomUUID()]: {
    title: "Sillyz.Computer",
    transclusion: {
      tag: 'joke-book'
    }
  },
  [self.crypto.randomUUID()]: {
    title: "Plan98.org",
    transclusion: {
      tag: 'iframe',
      properties: {
        src: 'https://plan98.org',
        title: 'coopetitor to kernel.org'
      },
    }
  },
  [self.crypto.randomUUID()]: {
    title: "Childhood",
    transclusion: {
      tag: 'sonic-knuckles'
    }
  },
}

function archive() {
  return Object.keys(library).map((key) => {
    const book = library[key]
    return snippet(book.transclusion, {
      backlink: key
    })
  }).join('')
}

const robot = app('trans-clusions', {
  libraryIndex: null,
  transclusions: []
})

robot.draw((target) => {
  if(!target.innerHTML) {
    target.innerHTML = `
      <div class="viewport">
        <div class="library">
          <button data-cancel class="standard-button -round bias-generic">
            <sl-icon name="x-lg"></sl-icon>
          </button>
          <div class="surface">
            <div class="kind-of-paper">
              ${archive()}
            </div>
          </div>
        </div>
        <div class="definitely-not-paper">
          <div class="transclusions"></div>
          <div class="last-button"></div>
        </div>
      </div>
    `
  }
}, {
  beforeUpdate(target) {
    {
      const { libraryIndex } =  robot.learn()
      target.dataset.libraryIndex = libraryIndex
    }

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
      node.innerHTML = transclusions.map(transclude).join('')
    }

    {
      const { transclusions } =  robot.learn()
      if(transclusions.length !== target.count) {
        const butt = target.querySelector('.last-button')
        butt.innerHTML = portal()
      }
    }
  }
})

robot.when('click', '.portal', (event) => {
  const { index } = event.target.dataset
  robot.teach({ libraryIndex: index })
})

robot.when('click', '[data-cancel]', (event) => {
  robot.teach({ libraryIndex: null })
})

robot.when('click', '[data-backlink]', (event) => {
  const src = event.target.closest(robot.link).getAttribute('src')
  const { libraryIndex } = robot.learn()
  const { backlink } = event.target.dataset
  const { transclusion } = library[backlink]
  robot.teach({
    index: libraryIndex,
    transclusion
  }, splice)
  robot.teach({ libraryIndex: null })
  if(src) {
    persist(src)
  }
})

async function persist(src) {
  const { transclusions } = robot.learn()
  const xdoc = { transclusions }

  // Attempt to upload to server
  await put(src, JSON.stringify(xdoc), { type: 'application/json' }).then(response => {
  }).catch(error => {
    console.warn(error);
  });
}

function splice(state, payload) {
  const transclusions = [...state.transclusions]
  transclusions.splice(payload.index, 0, payload.transclusion)
  return {
    ...state,
    transclusions
  }
}

function transclude(transclusion, index) {
  return `
    <div class="context">
      ${portal(index)}
      ${snippet(transclusion, { index })}
    </div>
  `
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
    max-height: 11in;
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
