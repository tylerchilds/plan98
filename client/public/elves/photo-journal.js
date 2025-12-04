import { Self } from '@plan98/types'
import Cache from '@silly/cache'

import $sketchPad, { resetSketchPad } from './quick-sketch.js'

const elf = 'photo-journal'

const $ = Self(elf, {
  libraryIndex: null,
  gallery: []
})

$.draw((target) => {
  if(!target.innerHTML) {
    target.innerHTML = `
      <div class="viewport">
        <div class="library">
          <div class="library-actions">
            <button data-cancel class="standard-button -round bias-generic">
              <sl-icon name="x-lg"></sl-icon>
            </button>
            <button data-save class="standard-button -round bias-positive">
              <sl-icon name="check-lg"></sl-icon>
            </button>
          </div>
          <div class="surface"></div>
        </div>
          <div class="gallery"></div>
      </div>
    `
  }
}, {
  beforeUpdate(target) {
    const src = target.getAttribute('src')

    {
      const { libraryIndex } =  $.learn()
      target.dataset.libraryIndex = libraryIndex
    }

    {
      if(!target.mounted) {
        target.mounted = true
        target.cache = Cache(target.id)
        if(src) {
          $.teach({ gallery: [] })

          target.cache.get(src).then(data => {
            if(data) {
              $.mouth(JSON.parse(data))
            }
          })
        }
      }
    }
  },
  afterUpdate(target) {
    const src = target.getAttribute('src')

    {
      const { libraryIndex } =  $.learn()

      if(target.index !== libraryIndex) {
        target.dataset.libraryIndex = libraryIndex
        const surface = target.querySelector('.surface')
        const sketchSrc = src + '/' + libraryIndex

        surface.innerHTML = `
          <quick-sketch id="/${$.link}/${target.id}" view="normal" src="${sketchSrc}"></quick-sketch>
        `
      }
    }

    {
      const { gallery } =  $.learn()
      const node = target.querySelector('.gallery')

      if(gallery.length !== target.galleryLength) {
        target.galleryLength = gallery.length
        node.innerHTML = `
          <div class="first-button context"></div>
          ${gallery.map(embed(target)).join('')}
        `
      }
    }

    {
      const { gallery } =  $.learn()
      if(gallery.length !== target.count) {
        const butt = target.querySelector('.first-button')
        butt.innerHTML = portal()
      }
    }
  }
})

$.when('click', '.portal', (event) => {
  const { index } = event.target.dataset
  //resetSketchPad()
  $.teach({ libraryIndex: index })
})

$.when('click', '[data-cancel]', (event) => {
  $.teach({ libraryIndex: null })
})

$.when('click', '[data-save]', (event) => {
  const root = event.target.closest($.link)
  const src = root.getAttribute('src') || '/'
  const { libraryIndex } = $.learn()
  const { image } = $sketchPad.ear()
  $.teach({
    index: libraryIndex,
    image
  }, splice)
  $.teach({ libraryIndex: null })
  persist(root, src)
})

async function persist(target, src) {
  const { gallery } = $.learn()
  const data = { gallery }

  // Attempt to upload to server
  await target.cache.put(src, JSON.stringify(data), { type: 'application/json' })
    .catch(error => { console.warn(error) });
}

function splice(state, payload) {
  const gallery = [...state.gallery]
  gallery.splice(payload.index, 0, payload.image)
  return {
    ...state,
    gallery
  }
}

function embed(target) {
  return function (image, index) {
    return `
      <div class="context">
        <button
          class="snippet"
          data-index="${index}"
        >
          <cached-image key="/${$.link}/${target.id}" src="${image}"></cached-image>
        </button>
      </div>
    `
  }
}

$.when('click', '[data-index]', (event) => {
  const { index } = event.target.dataset
  resetSketchPad(event.target.closest($.link).querySelector('quick-sketch'))
  $.teach({ libraryIndex: parseInt(index) })
})

function portal(index=$.learn().gallery.length) {
  return `
    <button class="portal" data-index="${index}">
      <sl-icon name="plus-lg"></sl-icon>
    </button>
  `
}

$.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  & .library-actions {
    position: absolute;
    right: 4px;
    top: 4px;
    z-index: 10;
  }

  & .viewport {
    background: rgba(0,0,0,.1);
    overflow: auto;
    height: 100%;
    padding: .5rem;
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
    background: black;
    box-shadow: 0px 1px 2px 0px rgba(0,0,0,.85);
    padding: .5rem;
    transition: transform ease-in-out 100ms;
    transform: scale(1);
    display: block;
    border: none;
    width: 100%;
    text-align: left;
    margin: 0;
    height: 100%;
  }

  & .snippet:hover {
    box-shadow: 0px 2px 4px 0px rgba(0,0,0,.5);
    transform: scale(1.1);
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
    margin: 0;
    height: 100%;
  }

  & .portal:hover {
    background: rgba(255,255,255,.1);
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

  & .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
    gap: .5rem;
  }

  & .context {
    aspect-ratio: 16/9;
    height: 100%;
  }
`)
