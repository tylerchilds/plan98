import { tag, randomString } from "/deps.js"
import "/packages/tags/variable-text.js"
import "/packages/tags/highlighter.js"
import "/packages/tags/rainbow-button.js"
import "/packages/tags/live-code.js"
import "/packages/widgets/play-wheel.js"

import { showModal } from '/packages/ui/modal.js'

const $ = tag('tutorial')

$.on('click', '.start', () => {
  $.write({ html: `
    <rainbow-button class="fbl">
      <button class="remix">
        Remix
      </button>
    </rainbow-button>
    <play-wheel></play-wheel>
  ` })
})

$.on('click', '.remix', async () => {
  const randomPath = randomString(128) + '.html'
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

$.render(() => {
  const { html } = $.read()
  if(html) return html
  return `
    <section class="layout">
      <div class="horizon"></div>
      <div class="land">
        <div class="grid-3d"></div>
      </div>
    </section>

    <div class="skybox">
      <div class="a"></div>
      <div class="b"></div>
      <div class="c"></div>
      <div class="d"></div>
      <div class="e"></div>
      <div class="f">
        <iframe title="Avatar of a Surfer" src="/pages/avatar.html" id="surfer-avatar"></iframe>
        <div id="foreground">
          <div id="logo">
            <variable-text id="vt1" monospace="0" slant="-15" casual="1" cursive="1" weight="800">
              Sillyz.
            </variable-text>
            <variable-text id="vt2" monospace="1" slant="0" casual="0" cursive="0">
              COMPUTER
            </variable-text>
          </div>
          <rainbow-button>
            <button class="start">
              Start
            </button>
          </rainbow-button>
        </div>
      </div>
    </div>
  `
})

$.style(`
  & {
    display: block;
    margin: auto;
    position: absolute;
    height: 100vmin;
    inset: 0;
    transform-style: preserve-3d;
    width: 100vmin;
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
   opacity: 1;
   transform: translate(0, 0) rotateX(0) rotateY(0) scale(1);
 }

 & .a {
   animation: pulse ease-in-out 5000ms alternate infinite;
   background: var(--wheel-5-5);
   transform-origin: top;
   transform: rotateX(-90deg) translate(0, 0);
 }

 & .b {
   animation: pulse ease-in-out 5000ms alternate infinite;
   background: var(--wheel-5-4);
   box-shadow: 0 0 10px 1px rgba(0,0,0,.25) inset;
   transform-origin: right;
   transform: rotateY(-90deg) translate(0, 0);
 }

 & .c {
   animation: pulse ease-in-out 5000ms alternate infinite;
   background: var(--wheel-5-3);
   transform-origin: bottom;
   transform: rotateX(90deg) translate(0, 0);
 }

 & .d {
   animation: pulse ease-in-out 5000ms alternate infinite;
   background: var(--wheel-5-4);
   box-shadow: 0 0 10px 1px rgba(0,0,0,.25) inset;
   transform-origin: left;
   transform: rotateY(90deg) translate(0, 0);
 }

 & .e {
   animation: e-scale-out-in ease-in-out 5000ms alternate 1, pulse ease-in-out 5000ms alternate infinite;
   background: var(--wheel-5-4);
   box-shadow: 0 0 10px 1px rgba(0,0,0,.25) inset;
   transform: translateZ(-100vmin) scale(1);
   opacity: 1;
 }

 & .f {
   display: grid;
   grid-template-areas: "stack";
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
     opacity: .75;
   }
   100% {
     opacity: .25;
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

 & .horizon {
   grid-area: 1 / 1 / -1 / -1;
   background: 
   linear-gradient(
     transparent 0%,
     var(--wheel-0-1) 75%
   ),
   radial-gradient(
     var(--wheel-7-3) 0%,
     var(--wheel-7-0) 70%
   );
 }

 & .land {
   grid-area: 32 / 1 / -1 / -1;
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
 }

 & .grid-3d {
   grid-area: 32 / 1 / -1 / -1;
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
   transform: rotateX(70deg);
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
   animation: fade-in 500ms 1000ms ease-in forwards, fly-in 1000ms 1000ms ease-out forwards;
   color: white;
   text-shadow: 2px 2px black;
}

& #logo variable-text:first-child {
  display: block;
  font-size: 16vmin;
}

& #logo variable-text:last-child {
  display: block;
  font-size: 7vmin;
  letter-spacing: .25em;
  line-height: 1.5;
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
`)

