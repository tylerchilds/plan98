import elf from '@silly/elf'
import { toast } from './plan98-toast.js'

/*
 <blockquote>
    I adore my computer and have had a big-time relationship with it for thirteen years now. I would never have been able to write my memoirs (and enjoy doing so—a lot!) were it not for my PC, its files, cutting and pasting. Ooooh it was so much better than how I used to do it…taking scissors and cutting and taping paragraphs in new places
</blockquote>
<p>
  Jane Fonda, 2009, <a href="https://www.janefonda.com/2009/01/firstblog/">A New Year</a>
</p>
*/

const $ = elf('plan98-boxart')

function countdown(target) {
  if(target.countdown) return
  target.countdown = true
  if(target.getAttribute('diffused') === 'true') {
    $.teach({ diffused: true })
    return
  }

  $.teach({ timer: 15 })
  requestIdleCallback(readyCountdown)
}

function readyCountdown() {
  const { timer } = $.learn()

  const nextTime = timer - 1

  if(nextTime < 0) {
    self.location.href = '/app/ur-shell?command=color'
    return
  }

  setTimeout(() => {
    const { diffused } = $.learn()
    if(diffused) return
    $.teach({ timer: nextTime })
    readyCountdown()
  }, 1000)
}

$.draw((target) => {
  countdown(target)
  const title = target.getAttribute('title') || 'Plan98'
  const subtitle = target.getAttribute('subtitle') || 'REBOOT YOUR SELF'

  if(target.innerHTML) return

  return `
    <div style="display: grid; height: 100%; position: relative;">
      <footer>
        <div>
          <a href="/cdn/sillyz.computer/index.md">Help</a>
        </div>
        <form name="enter-cheat">
          <input name="cheat-code" placeholder="cool-chat" type="text" />
          <button type="submit">
            Go
          </button>
        </form>
      </footer>
      <div name="square">
        <section class="layout">
          <div class="horizon">
            <plan98-icon></plan98-icon>
          </div>
          <div class="land">
            <div class="elements"></div>
          </div>
        </section>
        <div class="skybox active">
          <div class="a">
          </div>
          <div class="c">
          </div>
          <div class="b">
          </div>
          <div class="d">
          </div>
          <div class="e">
            <div style="display: grid;place-content: center;">
              <sticky-note>
              </sticky-note>
            </div>
          </div>
          <div class="f">
            <sillyz-avatar></sillyz-avatar>
            <div id="foreground">
              <div id="logo">
                <hypertext-variable id="vt1" monospace="0" slant="-15" casual="1" cursive="1" weight="800">
                  ${title}
                </hypertext-variable>
                <hypertext-variable id="vt3" weight="800" monospace="1" slant="0" casual="0" cursive="0">
                  ${subtitle}
                </hypertext-variable>
              </div>
              <div class="game-modes">
                <button class="cta spinning-border" data-start>
                  <span class="cta-inner">Boot</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}, {
  afterUpdate(target) {
    {
      const { timer, diffused } = $.learn()
      const start = target.querySelector('[data-start] .cta-inner')
      
      if(start && !diffused) {
        start.innerText = `Boot (${timer})`
      } else if(start) {
        start.innerText = `Boot`
      }
    }
  }
})

$.when('submit', '[name="enter-cheat"]', async (event) => {
  event.preventDefault()
  const cheatCode = event.target['cheat-code'].value
  const [elf] = cheatCode.split('?')
  const url = `/public/elves/${elf}.js`
  const exists = (await fetch(url, { method: 'HEAD' })).ok
  if(!exists) {
    toast('Not Found', { type: 'error' })
    return
  }

  self.location.href = '/app/' + cheatCode

})

$.when('focus', '[name="cheat-code"]', () => {
  $.teach({ diffused: true })
})
$.when('click', '[data-start]', start)
$.when('click', '.cheat-prefix', () => {
  self.location.href = "/app/sillyz-computer"
})

const unbind = $.when('click', '*', (event) => {
  diffuse()
  unbind()
})

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    diffuse()
  }
});


function diffuse(event) {
  $.teach({ diffused: true })
}

function start(event) {
  self.location.href = '/app/ur-shell?command=color'
}

$.style(`
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
   perspective: 1000px;
   position: relative;
   overflow: hidden;
   transform-style: preserve-3d;
   width: 100%;
   z-index: 100;
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
   background: linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.25)), lemonchiffon;
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

 @keyframes e-scale-out-in {
   0% {
     opacity: 1;
     transform: translateZ(-100vmin) scale(1);
   }

   50% {
     opacity: .25;
     transform: translateZ(-80vmin) scale(.5);
   }

   100% {
     opacity: 1;
     transform: translateZ(-100vmin) scale(1);
   }
 }

 @keyframes &-spin {
   0% {
    transform: rotate(-360deg) scale(1);
   }
   100% {
    transform: rotate(360deg) scale(.1);
   }
 }

 @keyframes pulse {
   0% {
     opacity: 1;
     filter: blur(0px);
   }
   100% {
     opacity: 0;
     filter: blur(10px);

   }
 }
  @keyframes &-rainbow-background {
    0% {
			background: var(--theme, var(--wheel-0-6));
    }
    8% {
			background: var(--theme, var(--wheel-1-6));
    }
    16% {
			background: var(--theme, var(--wheel-2-6));
    }
    24% {
			background: var(--theme, var(--wheel-3-6));
    }
    32% {
			background: var(--theme, var(--wheel-4-6));
    }
    40% {
			background: var(--theme, var(--wheel-5-6));
    }
    48% {
			background: var(--theme, var(--wheel-6-6));
    }
    56% {
			background: var(--theme, var(--wheel-7-6));
    }
    64% {
			background: var(--theme, var(--wheel-8-6));
    }
    72% {
			background: var(--theme, var(--wheel-9-6));
    }
    80% {
			background: var(--theme, var(--wheel-10-6));
    }
    88% {
			background: var(--theme, var(--wheel-11-6));
    }
    100% {
			background: var(--theme, var(--wheel-0-6));
    }
  }

 & .layout {
   display: grid;
   grid-template-columns: repeat(48, 1fr);
   grid-template-rows: repeat(48, 1fr);
   height: 100%;
   width: 100%;
   position: absolute;
   top: 0;
   left: 0;
 }

 & synth-module,
 & hyper-piano {
   grid-area: 1 / 1 / -1 / -1;
 }

 & twgl-demo {
   grid-area: 1 / 1 / -1 / -1;
 }
 & .horizon {
   grid-area: 1 / 1 / -1 / -1;
   /*background: url('/cdn/boxart.svg');*/
   background-size: cover;
   position: relative;
   z-index: 1;
 }

  & .elements {
    background: url('/cdn/tychi.me/photos/james-franklin-hyde.png');
    background-size: contain;
    width: 100%;
    height: 100%;
    transform: rotateX(60deg) scale(3);
    transform-origin: center;
    position: absolute;
    opacity: .5;
    inset: 0;
    background-repeat: no-repeat;
    background-position: center;
  }

 & .land {
   grid-area: 30 / 1 / -1 / -1;
   background: 
     radial-gradient(
       var(--wheel-7-1) 0%,
       transparent 100%
     ),
     linear-gradient(
       var(--wheel-6-2) 0%,
       var(--wheel-7-3) 10%,
       var(--wheel-0-3) 25%,
       var(--wheel-1-4) 100%
     );
   overflow: hidden;
   perspective: 1000px;
   position: relative;
   z-index: 1;
 }

 & #surfer-avatar {
   border: none;
   width: 100%;
   height: 100%;
   animation: fade-in 1000ms 2000ms ease-in forwards, fly-in 2000ms 2000ms ease-out forwards;
   padding: 3rem;
   transform: scale(.1);
   opacity: 0;
   grid-area: stack;
 }
& #foreground {
   grid-area: stack;
   place-self: center;
   z-index: 1;
   line-height: 1;
   text-align: center;
   transform: scale(.1);
   opacity: 0;
   animation: fade-in 500ms 500ms ease-in forwards, fly-in 1000ms 500ms ease-out forwards;
   color: white;
   text-shadow: 3px 3px black, -1px -1px rgba(0,0,0,.25);
   width: 100%;
}

& sillyz-avatar {
   opacity: 0;
   transform: scale(.1);
   animation: fade-in 500ms 1000ms ease-in forwards, fly-in 1000ms 1000ms ease-out forwards;
   width: 75%;
   height: 75%;
   place-self: center;
}

& #logo #vt1 {
  display: block;
  font-size: clamp(1rem, 700%, 20vmin);
}

& #logo #vt2 {
  display: block;
  font-size: clamp(1rem, 300%, 10vmin);
  letter-spacing: .25em;
  line-height: 1.5;
}

& #logo #vt3 {
  display: block;
  font-size: clamp(1rem, 300%, 10vmin);
  line-height: 1.5;
  margin: 0 0 1rem 0;
}


& rainbow-button {
  opacity: 0;
   animation: fade-in 250ms 4000ms ease-in forwards;
}

& rainbow-button button {
  font-size: 6vmin;
  line-height: 1;
  padding: 3vmin 4vmin;
  margin: 4vmin;
}
 @keyframes fade-in {
   0% {
     opacity: 0;
   }
   100% {
     opacity: 1
   }

 }

 @keyframes fly-in {
   0% {
     transform: scale(.1) translateY(50vh)
   }
   100% {
     transform: scale(1) translateY(0)
   }
 }

  & .fbl {
    position: fixed;
    bottom: 0;
    left: 0;
  }

  .modal .atl {
    position: absolute;
    top: 0;
    left: 0;
  }

  & .start {
    border-radius: 0;
    left: 0;
    bottom: 0;
  }

  & .start button {
    border-radius: 100%;
  }


  & footer {
    padding: .5rem;
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
    position: absolute;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    align-items: center;
  }

  & footer form {
    display: flex;
    grid-template-columns: auto auto 1fr auto;
    align-items: center;
    justify-content: end;
  }

  & footer a:link,
  & footer a:visited {
    text-decoration: none;
    padding: 0 1rem;
    border: 1px solid lemonchiffon;
    background: lemonchiffon;
    color: dodgerblue;
    border-radius: 4px;
    line-height: 2rem;
    display: block;
    font-weight: bold;
  }

  & footer a:hover,
  & footer a:focus {
    color: lemonchiffon;
    background: dodgerblue;
  }

  & footer form label {
    color: lemonchiffon;
    white-space: nowrap;
  }

  & .cheat-prefix {
    border: 1px solid lemonchiffon;
    border-radius: 4px 0 0 4px;
    color: lemonchiffon;
    line-height: 0;
    border-right: none;
    padding: 0;
    background: transparent;
  }

  & .cheat-prefix .nonce {
    width: 2rem;
    height: 2rem;
  }

  & [name="cheat-code"] {
    padding: 0 .5rem;
    border: 1px solid lemonchiffon;
    border-radius: 4px 0 0 4px;
    color: lemonchiffon;
    background: transparent;
    color: rgba(255,255,255,.85);
    line-height: 2rem;
    max-width: 280px;
    width: 100%;
  }

  & form [type="submit"] {
    border: 1px solid lemonchiffon;
    padding: 0 4px;
    border-radius: 0 4px 4px 0;
    background: lemonchiffon;
    color: dodgerblue;
    line-height: 2rem;
    font-weight: bold;
    cursor: pointer;
  }

  & form [type="submit"]:hover,
  & form [type="submit"]:focus {
    color: lemonchiffon;
    background: dodgerblue;
  }

  & [data-diffuse] {
    position: absolute;
    left: 0;
    right: 0;
    top: .75%;
    display: grid;
    place-items: center;
    font-size: 2rem;
    background: rgba(0,0,0,.65);
    color: rgba(255,255,255,.65);
    border: none;
    font-weight: bold;
  }

  & [data-diffuse]:hover,
  & [data-diffuse]:focus {
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
  }
`)

