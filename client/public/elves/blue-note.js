import { Activities, Text } from '@plan98/types'
import MVCES from '@plan98/elf'
import { escapeHyperText, mod } from '@silly/helpers'

const schemas = {
  'org.plan98.blue-note': {
    moniker: '',
    loading: false,
    activities: [],
    index: 0,
    saga: ''
  }
}

const schema = 'org.plan98.blue-note'

const { m, v, c, e, s } = MVCES('blue-note', schemas[schema])

function sillySky(moniker) {
  const address = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${moniker}`

  fetch(address)
    .then(res => res.json())
    .then(data => {
      const activities = (data.feed || [])
        .map(item => item.post?.record?.text || '')
        .flatMap(Activities)
        .map(x => x?.object?.content || '')
        .reverse()

      c({
        loading: false,
        activities,
        saga: data
          .feed
          .flatMap(item => item
            .post
            ?.record
            ?.text || ''
          ).reverse().join('\n')
      })
    })

  c({ loading: true, activities: [] })
}

v((target) => {
  const {
    moniker,
    loading,
    activities,
    index
  } = m()

  if (loading) {
    return `<c><flying-disk></flying-disk></c>`
  }

  const leftMost = `
    <button data-back class="minimal-button">&lt;</button>
  `
  const rightMost = `
    <button data-next class="minimal-button">&gt;</button>
  `

  target.innerHTML = `
    <div class="tim-cookin">
      <div class="action-bar">
        <div>
          <button data-crawl class="minimal-button">Q</button>
        </div>
        <div class="url-grid">
          ${leftMost}
          <span class="protocol">NETDIR://</span>
          <input value="${escapeHyperText(moniker)}" name="moniker"/>
          ${rightMost}
        </div>
        <div style="text-align: right;">
          <button data-load class="minimal-button">R</button>
        </div>
      </div>
      <div class="arena" key="${index}">
        ${activities[index] || ''}
      </div>
    </div>
  `
}, {
  beforeUpdate(target) {
    if (!target.mounted) {
      target.mounted = true
      const moniker = target.getAttribute('moniker') || 'sillyz.computer'
      c({ moniker })
      sillySky(moniker)
    }
  },
  afterUpdate(target) {}
})

e('click', 'button[data-load]', ({ target }) => {
  const { moniker } = m()
  sillySky(moniker)
})

e('click', 'button[data-crawl]', ({ target }) => {
  self.location.href = `/app/saga-crawler?data=${encodeURIComponent(btoa(Text(m().saga)))}`
})

e('click', 'button[data-back]', ({ target }) => {
  const { index, activities } = m()
  c({ index: mod(index - 1, activities.length) })
})

e('click', 'button[data-next]', ({ target }) => {
  const { index, activities } = m()

  c({ index: mod(index + 1, activities.length) })
})

e('input', '[name="moniker"]', ({ target }) => c({ moniker: target.value }))

s(`
  & {
    display: block;
    height: 100%;
    overflow; hidden;
    font: 'Courier' 12pt;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    touch-action: none;
  }

  & .action-bar {
    background: rgba(0,0,0,.85);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    padding: 2px;
  }

  & .arena {
    height: 100%;
    overflow: auto;
  }

  & .tim-cookin {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
  }

  & input {
    color: #d79921;          /* neutral_yellow, was #ebb22e */
    display: block;
    width: 100%;
    margin: auto;
    text-align: left;
    background: transparent;
    font-size: .9rem;
    padding: 4px;
    margin: 0 auto;
    border-radius: 0;
    border: none;
  }

  & .url-grid {
    grid-template-columns: auto auto 1fr auto;
    display: grid;
    gap: 4px;
    place-content: center;
  }

  & .protocol {
    color: #8ec07c;
    display: grid;
    place-content: center;
  }

`)
