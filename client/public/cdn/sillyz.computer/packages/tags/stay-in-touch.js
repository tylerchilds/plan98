import { tag } from '/deps.js'
import { showModal } from '/packages/ui/modal.js'
import '/packages/tags/variable-text.js'
import '/packages/tags/highlighter.js'
import '/packages/widgets/subscribe-email.js'

const $ = tag('stay-in-touch')


$.render(() => {
  const {
   pic, nick, color, pronoun="whiz" 
  }= bus.state['https://1998.social/~tychi'] || {}

  return `
    <a
      href="javascript:;"
      data-pic="${pic}"
      data-nick="${nick}"
      data-color="${color}"
      data-pronoun="${pronoun}"
    >
      Stay in Touch!
    </a>
  `
})

$.on('click', 'a', (event) => {
  const {
   pic, nick, color, pronoun="whiz" 
  } = event.target.dataset

  showModal(`
    <h1>Human Connection</h1>
    <p>
      Sillyz.Computer is an interactive art piece and medium (and LLC!), created and curated by <highlighter color="${color}">just one ${pronoun}</highlighter>. Staying in touch would be super appreciated.
    </p>
    <p>
      If any of your experience was fun, I'd love to hear about it. Please leave your email and I will be in touch with updates!
    </p>

<div>
  <subscribe-email></subscribe-email>
</div>

    Thanks,<br/>
    <variable-text monospace="0" casual="1" weight="100" slant="-15" cursive="1">
      <span style="font-size: 5rem; line-height: 1">${nick}</span>
    </variable-text>
    <img src="${pic}" style="display: block; width: 10rem; height: 10rem; border-radius: 100%; margin: 1rem 0;" alt="an avatar" />
    <a href="https://tychi.me">tychi.me</a>
  `)
})

$.style(`
  & {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 0;
    display: grid;
    place-content: center;
    z-index: 900;
  }

  & a {
    background: rgba(255, 255, 255, .85);
    padding: 1rem 2rem;
    font-size: 1.25rem;
    border-radius: var(--border-radius, 4px) var(--border-radius, 4px) 0 0;
    transform: translateY(-50%);
  }
`)
