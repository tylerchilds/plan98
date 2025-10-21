import elf from '@silly/elf'

/*

The Paper Pocket Puppets versus Waldorf Wollaston

A great green dragon hoards the town's gold and the economy suffers so.

A brave, naive elf named Silly said, "I'll talk to IT." and was fired.

At the end of time, Silly sat alone and thought about nothing funny in particular, but still smiled nevertheless.

A great green dragon hoards the town's gold and the economy suffers so.

A savvy, curational elf, Sally, said "I bake delicious cakes. I'll sell the monster one, or a whole bakery as a daily subscription and we can trade the gold back to town at market rates, which will recover the economy as the green thing finds our society more valuable than gold." But was fired.

At the end of time, Silly and Sally giggled about a dragon so unpalatable that cakes were disregarded in poor taste.

A great green dragon hoards the town's gold and the economy suffers so.

A clever, cheeky elf, Shelly, circused a circus and the dragon fired the lot of Paper Pocket Puppets out of mutual irreverence.

At the end of time, Silly, Sally, and Shelly chuckled at a creature so lonely that by force of sheer will and ignorance became the last soul in reality.

A great green dragon hoards the town's gold and the economy suffers so.

A determined adventerous elf, Sully, slay the beast, but the gold became blood tainted and the townsfolk circused of their own accord to spite the spoils of war.

At the end of time, Silly, Sally, Shelly, Sully, and the dragon had full bellies of laughs that money was never funny.

A great green dragon hoards the town's gold and the economy suffers so.

A brave tiny, Sunny, flapped pretend little wings and the dragon joined the Paper Pocket Puppets

*/

const $ = elf('hello-elvish')

$.draw((target) => {
  const elf = target.getAttribute('elf') || 'elvish-spec'

  return `
    <div class="slot1">
      <iframe class="live-view" src="/app/${elf}"></iframe>
    </div>
    <div data-scrub>
      <button class="sillyz-switch">?</button>
    </div>
    <div class="slot2">
      <was-code class="live-code" src="/public/elves/${elf}.js"></was-code>
    </div>
  `
})

$.when('save-success', '.live-code', (event) => {
  const root = event.target.closest($.link)
  root.querySelector('.live-view').contentDocument.location.reload()
})


$.when('save-error', '.live-code', (event) => {
  alert('ey')
})

function goUp(root) {
  root.offset = '100vh'
  root.style.setProperty("--offset", root.offset);
}

function goDown(root) {
  root.offset = 10
  root.style.setProperty("--offset", root.offset + 'px');
}

$.when('click', '.sillyz-switch', event => {
  const root = event.target.closest($.link)

  if(root.offset === 10) {
    goUp(root)
  } else {
    goDown(root)
  }
})

$.when('pointerdown', '[data-scrub]', event => {
  const root = event.target.closest($.link)
  const listener = scrub(root)
  root.dataset.scrubbing = true
  document.addEventListener("pointermove", listener, false);
  document.addEventListener("pointerup", () => {
    root.dataset.scrubbing = false
    document.removeEventListener("pointermove", listener, false);
  }, false);
})

function scrub(root) {
  return function (event) {
    let offset
    if (event.touches && event.touches[0] && typeof event.touches[0]["force"] !== "undefined") {
      offset = event.touches[0].clientY
    } else {
      offset = event.clientY
    }

    root.offset = Math.max(offset, 10)

    const size = `${root.offset}px`;
    root.style.setProperty("--offset", size);
  }
}

$.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  &[data-scrubbing="true"] iframe {
    pointer-events: none;
  }

  & .slot1 {
    height: 100%;
    background: white;
    color: black;
  }

  & .slot2 {
    height: 100%;
    background: black;
    color: white;
    width: 100%;
    top: var(--offset, 100vh);
    position: absolute;
    transform: translateY(-10px);
    padding-top: 10px;
  }

  & [data-scrub] {
		user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    position: absolute;
    left: 0;
    right: 0;
    top: var(--offset, 100vh);
    transform: translateY(-10px);
    offset: 10px;
    background: linear-gradient(black, white, black);
    z-index: 10;
    cursor: row-resize;
    height: 10px;
    text-align: center;
    z-index: 9001;
  }

  & .sillyz-switch {
    border: 0;
    padding: 5px;
    background: mediumpurple;
    text-shadow: 1px 1px white;
    color: black;
    transform: translateY(-50%);
    background: radial-gradient(white, black);
    width: 2rem;
    height: 2rem;
    display: inline-grid;
    place-content: center;
    border-radius: 100%;
  }

  &[style*="--offset"][style*="10px"] .sillyz-switch {
    transform: translateY(0%);
  }
`)
