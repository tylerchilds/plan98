import elf from '@silly/elf'

const $ = elf('new-session')

$.draw((target) => {
  const src = $.learn()[target.id]

  if(src) {
    return `<iframe src="${src}"></iframe>`
  }

  if(target.innerHTML) return

  const rom = target.getAttribute('rom') || 'mobile-device'

  const host = plan98.env.PLAN98_PEER
    ? `http://${plan98.env.PLAN98_PEER}`
    : self.location.origin

  return `
    <div class="zero-state">
      <qr-code no-link="true" data-fg="rgba(0,0,0,.85)" data-bg="transparent" src="${host}/app/${rom}?id=${target.id}"></qr-code>
    </div>
  `
})

$.when('click', 'qr-code', (event) => {
  const root = event.target.closest($.link)
  const src = event.target.getAttribute('src')
  $.teach({ [root.id]: src })
})

$.style(`
  & {
    display: block;
    height: 100%;
    width: 100%;
  }

  & .zero-state {
    height: 100%;
    display: flex;
    flex-direction: column;
    place-content: center;
    gap: 2rem;
    padding: 40px;
    text-align: center;
  }

  & qr-code {
    margin: 0 auto;
    width: 45vh;
    max-width: 100%;
  }

  & qr-code * {
    pointer-events: none;
  }
`)
