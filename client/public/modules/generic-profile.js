import tag from '@silly/tag'

const $ = tag('generic-profile')

$.draw((target) => {
  const lines = getLines(target)
  return `
    <div class="header">
      <div class="photo"></div>
      <div class="company">
        ${target.getAttribute('name') || '(missing no.)'}
      </div>
    </div>
    <div class="grid">
      <div class="sidebar">
      </div>
      <div class="body">
        <div name="joke" class="index-card">
          <input name="setup" type="text" />
          <textarea name="punchline" style="background-image: ${lines}"></textarea>
        </div>
        <div name="joke" class="index-card">
          <input name="setup" type="text" />
          <textarea name="punchline" style="background-image: ${lines}"></textarea>
        </div>
        <div name="joke" class="index-card">
          <input name="setup" type="text" />
          <textarea name="punchline" style="background-image: ${lines}"></textarea>
        </div>
        <div name="joke" class="index-card">
          <input name="setup" type="text" />
          <textarea name="punchline" style="background-image: ${lines}"></textarea>
        </div>
      </div>
    </div>
  `
})

$.style(`
  @media (min-width: 768px) {
    & .grid {
      display: grid;
      grid-template-columns: 200px 1fr;
    }
  }
  & .sidebar {
    padding: 3rem 0 1rem;
    max-width: 320px;
    margin: auto;
  }
  & .header {
    height: 300px;
    background: dodgerblue;
    position: relative;
    margin-bottom: 4rem;
  }

  & .photo {
    background-color: orange;
    width: 75px;
    height: 75px;
    padding: 4px;
    border-radius: 100%;
    position: absolute;
    bottom: -40px;
    left: 40px;
    overflow: hidden;
  }

  & .company {
    position: absolute;
    bottom: -40px;
    left: 125px;
  }

  & .photo::before {
    display: block;
    content: '';
    background: white;
    width: 100%;
    height: 100%;
    border-radius: 100%;
  }
  & [name="setup"] {
    font-size: 2rem;
    border: none;
    border-bottom: 3px solid orange;
    padding: .5rem 1rem;
    width: 100%;
  }

  & [name="punchline"] {
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    padding: 0rem 1rem;
    line-height: 2rem;
    background-color: white;
    position: relative;
    z-index: 3;
    background-position-y: -1px;
  }

  & .joke {
    display: grid;
    grid-area: active;
    background: rgba(200,200,200,1);
  }


  & .index-card {
    width: 5in;
    height: 3in;
    position: relative;
    margin: 2rem auto;
    z-index: 2;
    display: grid;
    grid-template-rows: auto 1fr;
    box-shadow:
      0px 0px 4px 4px rgba(0,0,0,.10),
      0px 0px 12px 12px rgba(0,0,0,.05);
    max-width: 100%;
  }

  & text-area {
    resize: none;
  }
`)

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
