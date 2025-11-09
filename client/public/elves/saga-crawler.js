// the tanka of the tiniest violin

// Fixing the tiniest violin is the easiest trick in the book. All you do is delete four forward slashes. That's it.

////

import Self from '@silly/elf'
import Saga from "@silly/saga"

function crawlerTemplate(html) {
  return `
    <div style="display: grid; height: 100%; position: relative;">
      <div name="square">
        <div class="skybox active">
          <div class="c">
            ${html}
          </div>
        </div>
      </div>
    </div>

  `
}

const $ = Self('saga-crawler')

$.draw(() => null, {
  beforeUpdate(target) {
    if(target.initialized) return
    target.initialized = true
    const src = target.getAttribute('src') || '/public/cdn/sillyz.computer/en-us/saga-crawler.saga'
    const next = target.getAttribute('next') || '/app/shirt-flicks'
    const duration = target.getAttribute('duration')

    requestIdleCallback(() => {
      let file = ''
      fetch(src).then(async res => {
        if(res.status === 404) {

          file = 'untitled'
        } else {
          file = await res.text()
        }
      }).catch((error) => {
        console.error(error)
      }).finally(() => {
        try {
          const screenplay = Saga(file)
          if(typeof screenplay === 'string') {
            target.innerHTML = crawlerTemplate(screenplay)
          }
        } catch(e) {
          target.innerHTML = e.message
        }
      })
    })
  }
})

$.when('animationend', 'xml-html', () => {
  window.location.href = '/app/shirt-flicks'
})

$.style(`
  & xml-html {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    animation: &-crawler 60000ms linear forwards;
  }

  @keyframes &-crawler {
    0% {
      transform: translateY(100%);
    }

    100% {
      transform: translateY(-100%);
    }
  }

  & xml-html > * {
    width: 100%;
  }
  & {
    display: block;
    margin: auto;
    height: 100%;
    position: relative;
    overflow: auto;
  }

  &:not([data-started="true"])::before {
    content: '';
    background-image: linear-gradient(-25deg, rgba(0,0,0,1), rgba(0,0,0,.85));
    position: absolute;
    inset: 0;
  }

  & .game-modes {
    display: flex;
    gap: 2rem;
    justify-content: center;
  }

  & .spinning-border {
    position: relative;
    background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black background */
    backdrop-filter: blur(8px); /* Blur effect for what's behind */
    -webkit-backdrop-filter: blur(8px); /* For Safari */
    border-radius: 10px; /* Optional: rounded corners */
    overflow: hidden; /* Important: ensures content stays within bounds */
  }

  /* This pseudo-element creates the fixed container for our border */
  & .spinning-border::before {
    content: "";
    position: absolute;
    inset: -100%; /* Shorthand for top, right, bottom, left = 0 */
    border-radius: inherit;
    padding: 3px; /* Border width */
    background-clip: content-box;
    mask: linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, 
                  linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
    pointer-events: none;
  }

  /* This creates the rotating gradient that will be masked to just show at the border */
  & .spinning-border::after {
    content: "";
    position: absolute;
    inset: -100%;
    background: conic-gradient(
      var(--red, firebrick),
      var(--orange, darkorange),
      var(--yellow, gold),
      var(--green, mediumseagreen),
      var(--blue, dodgerblue),
      var(--indigo, slateblue),
      var(--violet, mediumpurple),
      var(--red, firebrick)
    );
    animation: spin 10000ms linear infinite;
    z-index: -1; /* Place it behind the content */
    pointer-events: none;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  & .cta * {
    pointer-events: none;
  }
  & .cta {
    box-shadow: var(--shadow);
    background: linear-gradient(335deg, rgba(0,0,0,.75), rgba(0,0,0,.55));
    color: white;
    border: none;
    border-radius: .5rem;
    gap: .5rem;
    display: inline-grid;
    place-items: center;
    font-weight: bold;
    padding: 4px;
  }

  & .cta span {
    background: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.5));
    border-radius: .5rem;
    font-size: 1.5rem;
    padding: 1rem 1.5rem;
  }

  & .cta.light span {
    background: linear-gradient(rgba(255,255,255,.75), rgba(255,255,255,.5));
    color: rgba(0,0,0,.85);
    border-radius: .5rem;
  }



  & .cta .nonce {
    height: 2rem;
  }

  & .cta:hover,
  & .cta:focus {
  }

  & .reset {
    position: fixed;
    bottom: 0;
    left: 0;
    animation: fade-in 1000ms ease-in-out;
    z-index: 10;
  }

  & .reset button {
    background: black;
    border: none;
    color: dodgerblue;
  }
  & [name="square"]{
    margin: auto;
    transform-style: preserve-3d;
    width: 100%;
    aspect-ratio: 1;
    max-width: 100cqmin;
    max-height: 100cqmin;
    place-self: center;
    overflow: hidden;
  }

  & .remix {
    display: none;
  }

  & .emeralds {
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    margin: 0 auto;
    display: flex;
    place-content: center;
    gap: 1rem;
  }

  & .emerald {
    width: 1rem;
    height: 2rem;
    border: 3px solid blue;
    border-radius: 1rem;
  }

  & .emerald.-in-bag {
    background: blue
  }
  & .skybox.active .a,
  & .skybox.active .b,
  & .skybox.active .c,
  & .skybox.active .d,
  & .skybox.active .e {
   opacity: 1;
  }

  & .skybox.active .a > *,
  & .skybox.active .b > *,
  & .skybox.active .c > *,
  & .skybox.active .d > *,
  & .skybox.active .e > * {
    position: absolute;
    inset: 0;
  }

 & .skybox {
   display: grid;
   grid-area: letterbox;
   grid-template-areas: 'skybox';
   height: 100%;
   margin: 0 auto;
   perspective-origin: center;
   perspective: 500px;
   position: relative;
   transform-style: preserve-3d;
   width: 100%;
   z-index: 100;
   color: gold;
   font-size: 3rem;
   font-weight: 600;
 }

 & .a, & .b, & .c, & .d, & .e, & .f {
   grid-area: skybox;
   opacity: 0;
   transform: translate(0, 0) rotateX(0) rotateY(0) scale(1);
   transition: opacity 200ms;
   overflow: auto;
 }

 & .skybox.active .a {
   animation: pulse ease-in-out 5000ms alternate infinite;
   background: linear-gradient(rgba(255,255,255,.45), rgba(0,0,0,.65)), lemonchiffon;
   transform-origin: top;
   transform: rotateX(-60deg) translate(0, 0);
 }

 & .skybox.active .b {
   animation: pulse ease-in-out 5000ms alternate infinite;
   background: lemonchiffon;
   box-shadow: 0 0 10px 1px rgba(0,0,0,.25) inset;
   transform-origin: right;
   transform: rotateY(-60deg) translate(0, 0);
 }

 & .skybox.active .c {
   animation: pulse ease-in-out 5000ms alternate infinite;
   transform-origin: bottom;
   transform: rotateX(60deg) translate(0, 0);
 }

 & .skybox.active .d {
   animation: pulse ease-in-out 5000ms alternate infinite;
   background: lemonchiffon;
   box-shadow: 0 0 10px 1px rgba(0,0,0,.25) inset;
   transform-origin: left;
   transform: rotateY(60deg) translate(0, 0);
 }

 & .skybox.active .e {
   animation: 
    e-scale-out-in ease-in-out 5000ms alternate 1,
    pulse ease-in-out 5000ms alternate infinite;
   background: transparent;
   transform: translateZ(-100vmin) scale(1);
   opacity: 1;
 }

 & .skybox.active sticky-note {
    animation: &-spin ease-in-out 5000ms alternate infinite;
 }

 & .f {
   opacity: 1;
   display: grid;
   grid-template-areas: "stack";
   overflow: hidden;
 }

 & .f > * {
  grid-area: stack;
 }
`)
