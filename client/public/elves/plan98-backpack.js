import elf from '@plan98/elf'

const $ = elf('plan98-backpack')

$.draw((target) => {
  return `
    <hypertext-highlighter color="gold">
      <a href="/app/remote-control">
        Remote
      </a>
    </hypertext-highlighter>


    <hypertext-highlighter color="dodgerblue">
      <a href="/app/ur-shell">
        Shell
      </a>
    </hypertext-highlighter>

    <hypertext-highlighter color="mediumseagreen">
      <a href="/app/door-man">
        Desktop
      </a>
    </hypertext-highlighter>

    <hypertext-highlighter color="mediumpurple">
      <a href="/app/mobile-device">
        Mobile
      </a>
    </hypertext-highlighter>

    <hypertext-highlighter color="firebrick">
      <a href="/app/couch-coop">
        Gaming
      </a>
    </hypertext-highlighter>

    <hypertext-highlighter color="darkorange">
      <a href="/app/paper-pocket">
        Music
      </a>
    </hypertext-highlighter>
  `
})

$.style(`
  & {
    display: inline-block;
  }

  & a {
    display: inline-block;
    padding: .5rem;
  }
`)
