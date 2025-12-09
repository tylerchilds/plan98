import { Self } from '@plan98/types'
import { toast } from './plan98-toast.js'
import Cache from '@silly/cache'

const HOST = 'https://css.ceo'

const elf = 'short-link'

function CopyButton(props) {
  return `
    <div id="${props.id}" style="width: 1px; height: 1px; position; absolute; top: -1px; left: -1px; opacity: 0; position: absolute;" class="share-link-copyable-url standard-input -small">${props.link}</div>
    <button data-copy="${props.id}" class="standard-input -small bias-positive">Copy</button>
  `
}

function push(state, payload) {
  return {
    ...state,
    links: {
      ...state.links,
      [payload.key]: {
        ...payload
      }
    }
  }
}

function seed(x) {
  return {
    [x]: {
      key: x,
      shortUrl: 'https://css.ceo/' + x,
      originalUrl: 'https://plan98.org/app/' + x
    }
  }
}

const $ = Self(elf, {
  links: {
    ...seed('home-page'),
    ...seed('hello-world'),
    ...seed('short-link'),
    ...seed('photo-journal'),
    ...seed('dial-tone'),
    ...seed('plan98-ide'),
    ...seed('cool-chat'),
    ...seed('live-help'),
    ...seed('time-machine'),
    ...seed('multi-task'),
    ...seed('brain-storm'),
  }
})

export function findLongUrl(key) {
  return $.ear().links[key]
}

$.when('submit', 'form', (event) => {
  event.preventDefault()

  const { links } = $.ear()

  const { value } = event.target.link

  if(!value) {
    toast('Link is required', { type: 'error' })
    return
  }


  const vanity = event.target.vanity.value

  const key = vanity || 'a' + self
    .crypto
    .randomUUID()
    .split('-')
    .splice(1,2)
    .join('-') + 'z'

  if(links[key]) {
    toast('Database collision!', { type: 'error' })
    return
  }

  $.mouth({
    key: key,
    shortUrl: HOST + '/' + key,
    originalUrl: value
  }, push)

  event.target.link.value = ''
  event.target.vanity.value = ''
})

$.head(() => {
  const { links } = $.ear()

  return `
    <h1>${elf}</h1>
    <p>Make a link short and sweet.</p>
    <form class="table">
      <button class="standard-button" type="submit">
        Shorten
      </button>
      <div>
        <label class="field">
          <span class="label">Vanity</span>
          <input class="standard-input" name="vanity" placeholder="optional" />
        </label>
      </div>

      <div>
        <label class="field">
          <span class="label">Link <span style="color: var(--firebrick, red);">*</span></span>
          <input class="standard-input" name="link" />
        </label>
      </div>

      ${Object.keys(links).map((key) => {
        return `
          <div>
            ${CopyButton({
              id: key,
              link: links[key].shortUrl
            })}
          </div>
          <div class="view-cell">
            <a href="${links[key].shortUrl}">
              ${key}
            </a>
          </div>
          <div>
            <a href="${links[key].originalUrl}">
              ${links[key].originalUrl}
            </a>
          </div>
        `
      }).join('')}
    </form>
  `
}, {
  beforeUpdate(target) {
    {
      if(!target.mounted) {
        target.mounted = true
        target.cache = Cache(target.id)

        target.cache.get(elf).then(record => {
          if(record) {
            $.mouth(record.data)
          }
        })
      }
    }
  },
  afterUpdate(target) {
    target.cache.put(elf, $.ear())
  }
})

$.eye(`
  & {
    display: block;
    width: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  & .table {
    display: grid;
    grid-template-columns: auto 1fr 2fr;
    gap: .5rem;
    place-items: end;
  }

  & form > * {
    width: 100%;
  }

  & .field {
    width: 100%;
    margin-bottom: 0;
  }

  & .view-cell {
    padding: .25rem .5rem;
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    --v-font-casl: 0;
    --v-font-mono: 1;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive" !important;
  }
`)

$.hand('click', '[data-copy]', async (event) => {
  event.preventDefault()
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
