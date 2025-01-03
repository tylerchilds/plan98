import "/packages/tags/rainbow-button.js"
import "/packages/tags/qr-code.js"
import "/packages/tags/live-code.js"
import { tag, randomString } from "/deps.js"
import { showModal } from '/packages/ui/modal.js'

const $ = tag('share-button')
const $modal = tag('share-button-modal')

$.render(() => {
  return `
    <rainbow-button>
      <button style="
        font-size: 6vmin;
        line-height: 1;
        padding: 3vmin 4vmin;
      ">
        Share
      </button>
    </rainbow-button>
  `
})

$modal.render(() => {
  const { href } = window.location

  return `
		<qr-code url="${href}"></qr-code>
		<a href="${href}">Regular Link</a>
    <rainbow-button>
      <button class="remix">
        Remix
      </button>
    </rainbow-button>
	`
})

$.on('click', 'button', function() {
  	showModal(`<share-button-modal></share-button-modal>`)
})

$modal.on('click', '.remix', async () => {
  const { href } = window.location
  const randomPath = randomString(128) + '.html'
  const clientUrl = "https://sillyz.computer/tmp/" + randomPath
  const serverUrl = "https://1998.social/tmp/" + randomPath

  const file = await fetch(href).then(res => res.text())

  bus.state[serverUrl] = { file, childOf: href }

  showModal(`
    <rainbow-button class="atl">
      <a href="${clientUrl}" target="_blank">Play!</a>
    </rainbow-button>
		<br />
    <live-code src="${serverUrl}"></live-code>
  `)
})

$modal.style(`
  & {
    display: grid;
    place-content: center;
    text-align: center;
    gap: 2rem;
  }
`)
