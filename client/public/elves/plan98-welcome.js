import module from '@silly/tag'
import { currentSave } from '../cdn/thelanding.page/game-state.js'

/*
 <blockquote>
    I adore my computer and have had a big-time relationship with it for thirteen years now. I would never have been able to write my memoirs (and enjoy doing so—a lot!) were it not for my PC, its files, cutting and pasting. Ooooh it was so much better than how I used to do it…taking scissors and cutting and taping paragraphs in new places
</blockquote>
<p>
  Jane Fonda, 2009, <a href="https://www.janefonda.com/2009/01/firstblog/">A New Year</a>
</p>
*/

import { hideModal, showModal, types as modalTypes } from './plan98-modal.js'
import { factoryReset } from './plan98-filesystem.js'
const $ = module('plan98-welcome', { lite: true })

$.when('click', '.remix', async () => {
  const randomPath = self.crypto.randomUUID() + '.html'
  const clientUrl = "/tmp/" + randomPath
  const serverUrl = "https://1998.social/tmp/" + randomPath

  const href= "/packages/widgets/play-wheel.js"
  const code = await fetch(href).then(res => res.text())

  bus.state[serverUrl] = {
    childOf: href,
    file: `<html style="background: var(--theme, rebeccapurple)">
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="/styles/system.css" rel="stylesheet">
<body>

<share-button style="
	position: absolute;
	right: 1rem;
	bottom: 1rem;
"></share-button>
<play-wheel></play-wheel>
<stay-in-touch></stay-in-touch>

<script type="module">
import "/packages/tags/share-button.js"
import "/packages/tags/stay-in-touch.js"
import { showModal } from '/packages/ui/modal.js'
${code}
</script>`
  }

  showModal(`
    <rainbow-button class="atl">
      <a href="${clientUrl}" target="_blank">Play!</a>
    </rainbow-button>
		<br />
    <live-code src="${serverUrl}"></live-code>
  `)
})

function conditionalPlatform(has, show) {
  return has ? show : ''
}

$.draw((target) => {
  const { html, lite } = $.learn()
  if(html) return html

  const title = target.getAttribute('title') || 'Sillyz'
  const subtitle = target.getAttribute('subtitle') || 'Flying Disk'

  if(lite) {
    return `
      <div name="square">
        <section class="layout">
          <div class="horizon"></div>
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
                <hypertext-variable id="vt3" monospace="1" slant="0" casual="0" cursive="0">
                  ${subtitle}
                </hypertext-variable>
              </div>
              <!--<rainbow-action prefix="<button data-tutorial>" suffix="</button>" text="Start">
              </rainbow-action>-->
            </div>
          </div>
        </div>
      </div>
    `
  }

  const {chaosEmerald} = currentSave()
  target.innerHTML = `
    <!--
    <action-script class="reset" data-action="blankSave" data-script="/public/cdn/thelanding.page/game-state.js">
      Reset
    </action-script>
    -->
    <div name="square">
      <section class="layout">
          ${conditionalPlatform(chaosEmerald[0], `
            <twgl-demo></twgl-demo>
          `)}
          <div class="horizon"></div>
          <div class="land">
            ${conditionalPlatform(chaosEmerald[1], `
              <div class="grid-3d"></div>
            `)}
            ${conditionalPlatform(chaosEmerald[2], `
              <div class="elements"></div>
            `)}
          </div>
      </section>

      <div class="skybox active">
        <div class="emeralds">
          ${chaosEmerald.map((value, index) => `
            <div class="emerald ${value ? '-in-bag' : ''}" data-index="${index}"></div>
          `).join('')}
        </div>
        <div class="a">
          ${conditionalPlatform(chaosEmerald[3], `
            <sillyz-piano></sillyz-piano>
          `)}
        </div>
        <div class="c">
          ${conditionalPlatform(chaosEmerald[4], `
            <sillyz-ocarina></sillyz-ocarina>
          `)}
        </div>
        <div class="b">
          ${conditionalPlatform(chaosEmerald[5], `
            <mind-chess></mind-chess>
          `)}
        </div>
        <div class="d">
          ${conditionalPlatform(chaosEmerald[6], `
            <mlb-teams></mlb-teams>
          `)}
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
                Paper
              </hypertext-variable>
              <hypertext-variable id="vt2" monospace="1" slant="0" casual="0" cursive="0">
                Nautiloids
              </hypertext-variable>
            </div>
              <!--<rainbow-action class="start" prefix="<button data-endgame>" suffix="</button>" text="Start">
              </rainbow-action>-->
              <button data-about class="cta" data-tooltip="Learn about where here is.">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </div>
`
})

$.when('click', '[data-about]', (event) => {
  showModal(`
    <get-notified></get-notified>
  `, { centered: true })
})

$.when('click', '[data-tutorial]', start)
$.when('click', '[data-endgame]', finish)

function start(event) {
  const url = event.target.closest($.link).getAttribute('url') || '/9/404'
  const close = 'plan98-welcome.close'
  const start = 'plan98-welcome.start'
  window[close] = hideModal;
  window[start] = () => {
    window.location.href = `/404`
  }

  window.location.href = url
}

function finish() {
  const close = 'plan98-welcome.close'
  const start = 'plan98-welcome.start'
  window[close] = hideModal;
  window[start] = () => {
    window.location.href = `/404`
  }
  window.location.href = '?world=tychi.me'
}

$.when('click', '[data-reset]', ({target}) => {
  const { cwc } = target.closest('plan98-filesystem').dataset
  factoryReset(cwc)
})

$.style(`
  & {
    display: grid;
    margin: auto;
    height: 100%;
    animation: &-rainbow-background 10000ms ease-in-out infinite alternate-reverse;
    position: relative;
    overflow: hidden;
  }

  &::before {
    content: '';
    background-image: linear-gradient(-25deg, rgba(0,0,0,1), rgba(0,0,0,.85));
    position: absolute;
    inset: 0;
  }
  & .cta {
    background: rgba(0,0,0,.5);
    color: white;
    border: none;
    border-radius: 100%;
    padding: 1rem;
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
    max-width: 100vmin;
    max-height: 100vmin;
    place-self: center;
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
   background: var(--wheel-5-5);
   transform-origin: top;
   transform: rotateX(-60deg) translate(0, 0);
 }

 & .skybox.active .b {
   animation: pulse ease-in-out 5000ms alternate infinite;
   background: var(--wheel-5-4);
   box-shadow: 0 0 10px 1px rgba(0,0,0,.25) inset;
   transform-origin: right;
   transform: rotateY(-60deg) translate(0, 0);
 }

 & .skybox.active .c {
   animation: pulse ease-in-out 5000ms alternate infinite;
   background: var(--wheel-5-3);
   transform-origin: bottom;
   transform: rotateX(60deg) translate(0, 0);
 }

 & .skybox.active .d {
   animation: pulse ease-in-out 5000ms alternate infinite;
   background: var(--wheel-5-4);
   box-shadow: 0 0 10px 1px rgba(0,0,0,.25) inset;
   transform-origin: left;
   transform: rotateY(60deg) translate(0, 0);
 }

 & .skybox.active .e {
   animation: e-scale-out-in ease-in-out 5000ms alternate 1, pulse ease-in-out 5000ms alternate infinite;
   background: transparent;
   transform: translateZ(-100vmin) scale(1);
   opacity: 1;
 }

 & .f {
   opacity: 1;
   display: grid;
   grid-template-areas: "stack";
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
   background: url('/cdn/boxart.svg');
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

 & .grid-3d {
   background:
     linear-gradient(
     transparent 0%,
     var(--wheel-0-3) 3%,
     transparent 6%
     ),
   linear-gradient(90deg,
     transparent 0%,
     var(--wheel-0-3) 3%,
     transparent 6%
     );
   background-size: 100px 100px;
   transform: rotateX(60deg);
   transform-origin: top;
   width: 100vw;
   height: 100vh;
   animation: background3d-walk 5000ms infinite linear;
 }

 @keyframes background3d-walk {
   0% {
     background-position-y: 0px;
   }
   100% {
     background-position-y: 100px;
   }
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
   text-shadow: 2px 2px black;
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
  letter-spacing: .25em;
  font-size: 1.5rem;
  line-height: 1.5;
  margin: 1rem 0;
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

`)

