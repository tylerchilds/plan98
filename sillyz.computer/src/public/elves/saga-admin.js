import elf from '@silly/tag'
import { render } from '@sillonious/saga'

const $ = elf('saga-admin')

const adminSaga = `
<a
href: javascript:history.back()
text: back

<a
href: /app/hyper-script?src=/public/sagas/sillyz.computer/en-us/about.saga
text: edit me
`

$.draw(() => {
  return `
    <div class="admin-banner">
      ${render(adminSaga)}
    </div>
  `
})

$.style(`
  & {
  }

  & a:link,
  & a:visited {
    display: inline-block;
    padding: 1rem;
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
    text-decoration: none;
  }
`)
