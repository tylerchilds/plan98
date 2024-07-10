import { decks } from 'cards'
import module from '@silly/tag'

const suits = {
  hearts: '&#9829;',
  spades: '&#9824;',
  clubs: '&#9827;',
  diamonds: '&#9830;',
}

const deck = new decks.StandardDeck({ jokers: 2 });

// Shuffle the deck
deck.shuffleAll();

// Draw a hand of five cards from the deck
const hand = deck.draw(8);

// Pull 2 cards out of the hand to exchange
const toExchange = hand.splice(2, 2);

// Discard those 2 cards
deck.discard(toExchange);

// Draw 2 new ones from the deck
hand.push(...deck.draw(2));

const $ = module('free-cell')

$.draw((target) => {
  const cards = hand.map(({ rank, suit }, index) => {
    return `
      <div class="card ${rank.name} ${suit.name}" data-index="${index}" style="--spread-x: ${index * .25}in; --spread-y: ${index * .25}in;">
        <span class="rank">
          ${rank.abbrn}
        </span>
        <span class="suit">
          ${suits[suit.name]}
        </span>
      </div>
    `
  }).join('')
  return `
    <div class="felt">
      <div class="mat">
        <div class="generic">
        </div>
        <div class="specific">
          ${cards}
        </div>
      </div>
      <div class="hand">
        ${cards}
      </div>
    </div>
  `
})

$.style(`
  & {
    display: block;
    overflow: hidden;
  }
  & .felt{
    background: linear-gradient(90deg, green, darkgreen);
    overflow: auto;
  }
  & .generic,
  & .specific {
    display: grid;
    grid-template-columns: repeat(8, minmax(100px, 1fr));
  }
  & .hand {
    position: relative;
  }
  & .card {
    width: 2.5in;
    max-width: 100%;
    aspect-ratio: 2.5/3.5;
    border-radius: .25in;
    background: white;
    line-height: 1;
    padding: .25in;
    place-content: start;
    font-size: 3rem;
    box-shadow: var(--shadow);
    position: relative;
    overflow: hidden;
  }

  & .card:hover,
  & .card:focus {
      z-index: 2;
  }
  & .hearts,
  & .diamonds {
    color: red;
  }

  & .clubs,
  & .spades {
    color: black;
  }
`)
