import module from '@silly/tag'
import Color from "colorjs.io"
import { hideModal, showModal, types as modalTypes } from './plan98-modal.js'
import { doingBusinessAs } from './sillonious-brand.js'

const elves = [
  'sillyz.computer',
  '1998.social',
  'yourlovedones.online',
  'ncity.executiontime.pub',
  'css.ceo',
  'y2k38.info'
].map((elve, i) => {
  const { color, image, emote } = doingBusinessAs[elve]
  const council = "42"
  const portal = `
    <div class="portal">
      <button class="box" data-theme="${color}" data-image="url('${image}')">
        <sillonious-brand host="${elve}" council="${council}" seat="${i}"></sillonious-brand>
      </button>
    </div>
  `
  const profile = `
    <div class="profile">
      <div class="hat">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
          <!-- Hat Band (Smooth Curve at the bottom) -->
          <path d="M0,1000 Q500,-500 1000,1000" fill="${color}" />
        </svg>
      </div>
      <div class="face" style="border: 8px solid ${color};">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
          <text class="resting-face" x="70%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="50" fill="yellow">:)</text>
          <text class="emoting-face" x="70%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="50" fill="yellow">${emote}</text>
        </svg>
      </div>
    </elv>
  `

  return { profile, portal, color, image, emote }
})

const $ = module('elve-council', { elves })

$.draw(() => {
  const { elves } = $.learn()
  return elves.map(({profile, portal, color}) => {
    return `
      <div class="elve" style="--expression: ${color};">
        ${portal}
        ${profile}
      </div>
    `
  }).join('')
})

$.when('click', '.box', (event) => {
  event.stopPropagation()
  event.preventDefault()
  showModal(event.target.innerHTML, {
    maximized: true,
    theme: event.target.dataset.theme,
    image: event.target.dataset.image,
  })
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
    overflow: hidden;
    position: absolute;
    border: 5px solid black;
    border-radius: 0;
    aspect-ratio: 1;
    top: 2rem;
    width: 2rem;
    height: 2rem;
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

  & .elve {
    display: grid;
    grid-template-rows: 1fr 1fr;
  }

  & .portal {
    place-self: start;
  }

  & .profile {
    place-self: end;
  }

  & .face {
    background: chocolate;
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

