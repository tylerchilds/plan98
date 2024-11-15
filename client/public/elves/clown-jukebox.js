const tag = 'clown-jukebox'

// the solution i propose solves the technical complexity of the following line of code

customElements.define(tag, class WebComponent extends HTMLElement { constructor() { super() } });

/*
const playbill = render(`<title-page
author: tychi
title: six elves in a trench coae

# silicon valley -day

laying down you close your eyes, in your mind you sit up

you stand and walk across the void, the blank black space of bottomless think

in the distance a spark. it slowly burns and grows, a window to another world

before stepping through the gateway, you remove an artifact from your person

left above the threshold as you climb through, down into the rabbit hole

a million more worlds lay beyond nestled neatly compactly inside this page

what are they called? can we define them? can we tag them?

kingdom phylum class order family species

hyper text markup language element constructor super, utter these words

six elves in a trenchcoat, flee from me, flee from me, let me be, flee from me.
`)
*/

import("@silly/elf").then((elf) => {
  const hands = {
    blurb: 'Drums to set the background for any other musicians',
    accent: 'mediumseagreen'
  }

  const cards = {
    blurb: 'Magic to pull secrets out of thin air',
    accent: 'lemonchiffon'
  }

  const sticks = {
    blurb: 'Fire sticks, fire not included. Same physics lower stakes',
    accent: 'firebrick'
  }

  const sacks = {
    blurb: 'Juggling balls for the hands and feet, windows to another world',
    accent: 'dodgerblue'
  }

  const song = {
    blurb: 'Jazz vocals? We can hit rhyme or reason maybe both xor',
    accent: 'gold'
  }

  const dance = {
    blurb: 'Interpretive dance to whatever happens to be playing at the time',
    accent: 'mediumpurple'
  }

  const jest = {
    blurb: 'Topical humor on subjects that you care about for silly reasons',
    accent: 'darkorange'
  }

  const code = {
    blurb: 'Serious computers. Silly no joke computer, Gronk.',
    accent: 'black'
  }

  const clown = elf.default(tag, {
    choices: {
      'earth': hands,
      'air': cards,
      'fire': sticks,
      'water': sacks,
      'breath': song,
      'body': dance,
      'blood': jest,
      'spirit': code
    },
    votes: {
      'earth': 0,
      'air': 0,
      'fire': 0,
      'water': 0,
      'breath': 0,
      'body': 0,
      'blood': 0,
      'spirit': 0
    }
  })

  clown.draw((target) => {
    const { hidden, choices, votes } = clown.learn()
    let total = 0
    const results = Object
      .keys(votes)
      .sort((a,b) => {
        return votes[a] < votes[b]
      })
      .reduce((results, key) => {
        const count = votes[key]
        total += count
        results.ranked.push({ key, count })
        return results
    }, { ranked: [] }) // results, default

    const polls = results.ranked.map(choice => {
      const { key, count } = choice
      const { blurb, accent } = choices[key]
      return `
        <div class="result" style="--accent: ${accent}">
          <div class="count">
            ${count}
          </div>
          <label data-key="${key}" data-count="${count}">${blurb}</label>
        </div>
      `
    }).join('')

    const ballots = Object.keys(votes).map(key => {
      const { blurb, accent } = choices[key]
      return `
        <button class="vote" style="--accent: ${accent}" data-key="${key}" aria-label="Vote! ${blurb}" data-tooltip="Vote!">
          ${votes[key]}
        </button>
      `
    }).join('')

    return `
      <div class="background">
        <iframe src="/app/draw-term"></iframe>
      </div>
      <div class="foreground ${hidden ? 'hidden':''}">
        <a class="nonce to-tutorial" href="/app/impromptu-stagehand"></a>
        <div class="output">
          ${polls}
        </div>
        <button data-close class="nonce"></button>
      </div>
      <div class="input ${hidden ? 'hidden':''}">
        ${ballots}
      </div>
    `
  })

  clown.when('click', '.show-modal', () => showModal(playbill))
  clown.when('click', '[data-close]', () => clown.teach({ hidden: true }))

  clown.when('click', '.vote', (event) => {
    const { key } = event.target.dataset
    console.log(event)
    clown.teach({ key, count: 1 }, add)
  })

  clown.when('click', '[data-close]', () => clown.teach({ hidden: true }))

  function add(state, payload) {
    return {
      ...state,
      votes: {
        ...state.votes,
        [payload.key]: state.votes[payload.key] + payload.count
      }
    }
  }

  clown.style(`
    & {
      display: block;
      background: #54796d;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      touch-action: manipulation;
      user-select: none; /* supported by Chrome and Opera */
      -webkit-user-select: none; /* Safari */
      -khtml-user-select: none; /* Konqueror HTML */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
    }

    & iframe {
      border: 0;
      width: 100%;
      height: 100%;
    }

    & .hidden {
      display: none;
    }

    & .input {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      background: lemonchiffon;
      border-top: 1px solid saddlebrown;
      padding: 1rem;
      white-space: nowrap;
      overflow-x: auto;
      z-index: 10;
    }

    & .output {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }

    & .background,
    & .foreground {
      position: absolute;
      inset: 0;
    }

    & .foreground {
      text-align: center;
      overflow: auto;
      padding-bottom: calc(50% - 5rem);
    }

    & .foreground button {
      pointer-events: all;
    }

    & textarea {
      resize: none;
      border: none;
      background: transparent;
    }

    & .result {
      background: lemonchiffon;
      color: saddlebrown;
      box-shadow: -1px -1px var(--accent, white), 3px 3px 0px 0px saddlebrown;
      padding: 1rem;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1rem;
    }

    & .result .count {
      width: 50px;
      height: 50px;
      border-radius: 100%;
      border: 3px solid var(--accent);
      background: transparent;
      color: saddlebrown;;
      font-weight: 1000;
      display: grid;
      place-items: center;
    }

    & .input button {
      width: 50px;
      height: 50px;
      border-radius: 100%;
      border: 3px solid var(--accent);
      background: transparent;
      color: dodgerblue;
      font-weight: 1000;
      display: inline-block;
    }

    & .to-tutorial {
      padding: 1rem;
      display: inline-block;
    }
  `)
})
