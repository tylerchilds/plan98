import module from '@sillonious/module'
import { hideModal, showModal, types as modalTypes } from './plan98-modal.js'

const emoticons = {
  happy: {
    emote: ':)',
    color: 'chocolate',
    nick: 'sol'
  },
  smirk: {
    emote: ';)',
    color: 'pink',
    nick: 'sully'
  },
  laugh: {
    emote: ':D',
    color: 'orange',
    nick: 'silly'
  },
  sad: {
    emote: ':(',
    color: 'dodgerblue',
    nick: 'sally'
  },
  surprise: {
    emote: ':o',
    color: 'indigo',
    nick: 'shelly'
  },
  cheeky: {
    emote: ':p',
    color: 'green',
    nick: 'wally'
  },
  kiss: {
    emote: ':*',
    color: 'crimson',
    nick: 'sol'
  },
}

const elves = [
  'smirk',
  'laugh',
  'sad',
  'surprise',
  'cheeky',
  'kiss'
].map((emotion, i) => {
  const expression = emoticons[emotion]
  return `
    <div class="elve" style="--expression: ${expression.color}">
      <button class="box">
        <qr-code text="${window.location.href}?roomcode=456123&&slot=${i}"></qr-code>
      </button>
      <div class="hat">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
          <!-- Hat Band (Smooth Curve at the bottom) -->
          <path d="M0,1000 Q500,-500 1000,1000" fill="${expression.color}" />
        </svg>
      </div>
      <div class="face" style="border: 8px solid ${expression.color};">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
          <text class="resting-face" x="70%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="50" fill="yellow">:)</text>
          <text class="emoting-face" x="70%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="50" fill="yellow">${expression.emote}</text>
        </svg>
      </div>
    </elv>
  `
})

const $ = module('elve-council', { elves })

$.draw(() => $.learn().elves.join(''))

$.when('click', '.box', (event) => {
  event.stopPropagation()
  event.preventDefault()
  showModal(event.target.innerHTML, { bannerType: modalTypes.news })
})

$.style(`
  & {
    display: grid;
    height: 100%;
    gap: 8px;
    grid-auto-flow: column;
    position: relative;
    pointer-events: none;
    position: absolute;
    padding-bottom: 2rem;
    inset: 0;
    z-index: 1;
    place-content: end center;
    z-index: 1002;
  }

  & .box {
    border: 5px solid black;
    border-radius: 0;
    aspect-ratio: 1;
    position: absolute;
    top: 2rem;
    width: 2rem;
    animation: &-pulse ease-in-out 5000ms alternate infinite;
    box-shadow:
      0 0 10px 10px var(--expression),
      0 0 30px 0 var(--expression),
      0 0 50px 25px var(--expression);
    pointer-events: all;
    z-index: 1;
  }

   @keyframes &-pulse {
     0% {
       opacity: .75;
     }
     100% {
       opacity: .25;
     }
   }


  & .face {
    background: ${emoticons.happy.color};
    max-width: 25vh;
    aspect-ratio: 1;
    border-radius: 100%;
    transform: rotate(90deg);
    width: 100%;
    min-width: 48px;
    padding: 5px;
    pointer-events: all;
  }

  & .hat {
    transform: translateY(45%);
    z-index: 2;
    position: relative;
  }

  & .resting-face {
    opacity: 1;
  }

  & .emoting-face {
    opacity: 0;
  }

  & .face:hover .resting-face {
    opacity: 0;
  }

  & .face:hover .emoting-face {
    opacity: 1;
  }
`)

