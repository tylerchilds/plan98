import { Self } from '@plan98/types'
import { toast } from './plan98-toast.js'
import Cache from '@silly/cache'

import $vlog, { resetSketchPad } from './v-log.js'

const elf = 'video-journal'

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
        <div class="app">
          <div class="gallery"></div>
        </div>
        <div class="status-bar"></div>
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
        if(!src) {
          target.setAttribute('src', '/'+$.link)
        }
        $.teach({ gallery: [] })

        target.cache.get(src).then(record => {
          if(record) {
            $.mouth(JSON.parse(record.data))
          }
        })
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

    {
      const node = target.querySelector('.status-bar')

      if(target.status !== target.id) {
        target.status = target.id

        const shareLink = `${window.location.origin}/app/${$.link}?id=${target.id}&src=/${$.link}`
        const copyId = self.crypto.randomUUID()
        const label = target.getAttribute('label') || 'Pluto'
        node.innerHTML = `
          <div id="${copyId}" class="share-link-copyable-url standard-input -small">${shareLink}</div>
          <button data-copy="${copyId}" class="standard-input -small bias-positive">Copy</button>
        `
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
  const { videoSrc } = $vlog.ear()
  $.teach({
    index: libraryIndex,
    videoSrc
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
    <button class="portal standard-button" data-index="${index}">
      <sl-icon name="plus-lg"></sl-icon>
    </button>
  `
}

$.hand('click', '[data-copy]', async (event) => {
  const { copy } = event.target.dataset
  const target = event.target.closest($.link).querySelector(`[id="${copy}"]`)

  try {
    // Modern approach using Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(target.textContent)
      toast("Copied to clipboard")
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = target.textContent
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
        toast("Copied to clipboard")
      } catch (err) {
        console.error('Fallback: Failed to copy', err)
        toast("Failed to copy")
      }

      document.body.removeChild(textArea)
    }
  } catch (err) {
    console.error('Failed to copy text: ', err)
    toast("Failed to copy")
  }
})

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
    display: grid;
    grid-template-rows: 1fr auto;
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
    transition: all ease-in-out 100ms;
    transform: scale(1);
    display: block;
    width: 100%;
    text-align: center;
    margin: 0;
    height: 100%;
  }

  & .portal:hover {
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

  & .app {
    overflow: auto;
    padding: .5rem;
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

  & .status-bar {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4px;
    padding: 4px;
  }

  & .share-link-copyable-url {
    white-space: nowrap;
    overflow-x: auto;
    margin: 0 auto;
    display: block;
  }

`)
