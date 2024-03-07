import module from '@sillonious/module'
//import { //showModal } from '../modal-module.js'

const $ = module('quick-start')

$.when('click', '.start', () => {
  $.teach({ html: `
    <iframe src="https://1998.social" title="1998.social"></iframe>
    <!--
    <script-type src="war-on-clowns-by-bills-pc"></script-type>
    -->
  ` })
})

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

  /*
  showModal(`
    <rainbow-button class="atl">
      <a href="${clientUrl}" target="_blank">Play!</a>
    </rainbow-button>
		<br />
    <live-code src="${serverUrl}"></live-code>
  `)
  */
})

$.draw(() => {
  const { html } = $.learn()
  if(html) return html
  return `
    <section class="layout">
      <div class="horizon"></div>
      <div class="land">
        <div class="grid-3d"></div>
      </div>
    </section>

    <div class="skybox ${html ? '' : 'active'}">
      <div class="a"></div>
      <div class="b"></div>
      <div class="c"></div>
      <div class="d"></div>
      <div class="e"></div>
      <div class="f">
        <iframe title="Avatar of a Surfer" src="/avatar/" id="surfer-avatar"></iframe>
        <div id="foreground">
          <div id="logo">
              <hypertext-variable id="vt1" monospace="0" slant="-15" casual="1" cursive="1" weight="800">
                Sillyz.
              </hypertext-variable>
              <hypertext-variable id="vt2" monospace="1" slant="0" casual="0" cursive="0">
                COMPUTER
              </hypertext-variable>
            </div>
            <rainbow-action>
              <button class="start">
                Start
              </button>
            </rainbow-action>
          </div>
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

  & .remix {
    display: none;
  }

  & .skybox.active .a,
  & .skybox.active .b,
  & .skybox.active .c,
  & .skybox.active .d,
  & .skybox.active .e {
   opacity: 1;
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
   background: var(--wheel-5-4);
   box-shadow: 0 0 10px 1px rgba(0,0,0,.25) inset;
   transform: translateZ(-100vmin) scale(1);
   opacity: 1;
 }

 & .f {
   opacity: 1;
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

 & synth-module,
 & hyper-piano {
   grid-area: 1 / 1 / -1 / -1;
 }

 & .horizon {
   grid-area: 1 / 1 / -1 / -1;
   background: url('/cdn/boxart.svg');
   background-size: cover;
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
   animation: fade-in 500ms 1000ms ease-in forwards, fly-in 1000ms 1000ms ease-out forwards;
   color: white;
   text-shadow: 2px 2px black;
}

& #logo hypertext-variable:first-child {
  display: block;
  font-size: 16vmin;
}

& #logo hypertext-variable:last-child {
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

