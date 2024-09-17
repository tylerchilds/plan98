import elf from '@silly/tag'
const $ = elf('plan98-hero')

$.draw(() => {
  return `
    <div class="hero">
      <div class="frame">
        <div style="text-align: center">
          <div class="logo-mark">
            <div class="plan98-letters">
              Plan98
            </div>
            <div class="plan98-slants">
              <div class="slant-1"></div>
              <div class="slant-2"></div>
              <div class="slant-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})

$.style(`
  & .logo-mark {
    --v-font-mono: 0;
    --v-font-casl: 0;
    --v-font-wght: 800;
    --v-font-slnt: 0;
    --v-font-crsv: 1;
    font-variation-settings:
      "MONO" var(--v-font-mono),
      "CASL" var(--v-font-casl),
      "wght" var(--v-font-wght),
      "slnt" var(--v-font-slnt),
      "CRSV" var(--v-font-crsv);
    font-family: 'Recursive';
    font-size: 72px;
    position: relative;
    display: inline-block;
  }

  & .frame {
    max-width: 100%;
  }

  & .hero {
    background-color: var(--color, mediumpurple);
    background-image: linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.5));
    padding-top: 100px;
    display: grid;
    place-items: end center;
  }

  & .about {
    margin-bottom: 2rem;
  }

  & .plan98-slants {
    display: grid;
    grid-template-columns: 1ch 1ch 1ch;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    transform: skew(-25deg) translateX(-1rem);
    opacity: .75;
  }

  & .slant-1 {
    background: var(--accent-color-0, var(--red));
  }
  & .slant-2 {
    background: var(--accent-color-1, var(--orange));
  }
  & .slant-3 {
    background: var(--accent-color-2, var(--yellow));
  }

  & .plan98-letters {
    position: relative;
    z-index: 2;
    color: rgba(255,255,255,1);
    text-shadow: 1px 1px rgba(0,0,0,1);
    border-bottom: 1rem solid var(--underline-color, mediumseagreen);
    padding: 0 2rem;
  }


`)
