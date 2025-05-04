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

    <br>
    <br>
    <a href="/cdn/sillyz.computer/en-us/six-modalities/index.md">
      Help (Instructional Videos)
    </a>
  `
}, {
  beforeUpdate(target) {
    target.style.fontSize = '2rem';
  }, afterUpdate(target) {
    const lines = getLines(target)
    target.style.backgroundImage = lines
  }
})

function getLines(target) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(target).getPropertyValue('line-height'));
  canvas.height = rhythm;
  canvas.width = rhythm;

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, rhythm, rhythm);

  ctx.fillStyle = 'dodgerblue';
  ctx.fillRect(0, rhythm - (rhythm), rhythm, 1);

  return `url(${canvas.toDataURL()}`;
}


$.style(`
  & {
    display: block;
    height: 100%;
  }

  & a {
    display: inline-block;
    padding: 0 .5rem;
    margin: 0 .5rem;
    text-decoration: none;
  }
`)
