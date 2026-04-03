import { Activities } from '@plan98/types'
import MVCES from '@plan98/elf'
import { escapeHyperText } from '@silly/helpers'

const schemas = {
  'org.plan98.blue-note': {
    moniker: '',
    loading: false,
    activities: null,
    index: 0,
    saga: ''
  }
}

const schema = 'org.plan98.blue-note'

const { m, v, c, e, s } = MVCES('blue-note', schemas[schema])

v((target) => {
  const {
    moniker,
    loading,
    activities,
    index
  } = m()

  if(!activities) {
    return `
      <h1>welcome 2 silly sky</h1>
      <p>go away</p>
      <input value="${escapeHyperText(moniker)}" name="moniker"/>
      <button data-load>App View</button>
      <a href="/app/was-code?src=/public/elves/blue-note.js">Remix</a>
    `
  }

  if (loading) {
    return `<c><flying-disk></flying-disk></c>`
  }

  const leftMost = index !== 0 ? `
    <button data-back class="minimal-button">Back</button>
  ` : ''
  const rightMost = index !== activities.length - 1 ? `
    <button data-next class="minimal-button">Next</button>
  ` : ''

  target.innerHTML = `
    <div class="tim-cookin">
      <div class="arena" key="${index}">
        ${activities[index] || ''}
      </div>
      <div class="action-bar">
        <div>
          ${leftMost}
        </div>
        <div>
          <button data-crawl class="minimal-button">Crawl</button>
        </div>
        <div style="text-align: right;">
          ${rightMost}
        </div>
      </div>
    </div>
  `
}, {
  beforeUpdate(target) {
    if (!target.mounted) {
      target.mounted = true
      const moniker = target.getAttribute('moniker') || 'sillyz.computer'
      c({ moniker })
    }
  },
  afterUpdate(target) {}
})

e('click', 'button[data-load]', ({ target }) => {
  const { moniker } = m()

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
})

e('click', 'button[data-crawl]', ({ target }) => {
  self.location.href = `/app/saga-crawler?data=${encodeURIComponent(btoa(m().saga))}`
})

e('click', 'button[data-back]', ({ target }) => {
  const { index } = m()

  if(index !== 0) {
    c({ index: index - 1 })
  }
})

e('click', 'button[data-next]', ({ target }) => {
  const { index, activities } = m()

  if(index !== activities.length -1) {
    c({ index: index + 1 })
  }
})

e('input', '[name="moniker"]', ({ target }) => c({ moniker: target.value }))

s(`
  & {
    display: block;
    height: 100%;
    overflow; hidden;
    font: 'Courier' 12pt;
  }

  & .action-bar {
    background: rgba(0,0,0,.5);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
  }

  & .arena {
    height: 100%;
    overflow: auto;
  }

  & .tim-cookin {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr auto;
    overflow: hidden;
  }
`)
