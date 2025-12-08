import Self from '@silly/elf'

const $ = Self('patch-notes')

$.draw((target) => {
  const language = target.getAttribute('lang') || 'en-US'
  return `
    <div class="wizard">
      <mark-down src="/public/patch-notes/${language}/index.md"></mark-down>
    </div>
  `
})

$.style(`
  & {
    height: 100%;
    background: white;
    padding: 1rem;
    overflow: auto;
    display: block;
  }

  & mark-down {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  & a {
    white-space: nowrap;
  }
`)
