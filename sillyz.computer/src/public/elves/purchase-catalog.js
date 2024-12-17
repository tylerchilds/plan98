import module from '@silly/tag'
import { currentCart } from '../cdn/thelanding.page/game-state.js'

export const skuTable = {
  '000-000-000': {
    type: 'Computer',
    boxart: '/cdn/boxart.svg',
    name: 'Laptop',
    amount: {
      value: 2100,
      currency: "USD"
    },
  },
  '000-000-001': {
    type: 'Card',
    boxart: '/cdn/boxart.svg',
    name: 'Charizard',
    amount: {
      value: 4200,
      currency: "USD"
    },
  }
}

const ListOfTypeListOfType = [
  {
    type: 'List',
    name: 'Sillyz.Computer',
    list: ['000-000-000', '000-000-000', '000-000-000', '000-000-000', '000-000-000', '000-000-000', '000-000-000', '000-000-000']
  },
  {
    type: 'List',
    name: "Quan's Cards",
    list: ['000-000-001', '000-000-001', '000-000-001', '000-000-001', '000-000-001', '000-000-001', '000-000-001', '000-000-001']
  }
]

const $ = module('purchase-catalog')
$.draw(catalog(ListOfTypeListOfType))

function catalog(ListOfTypeListOfType) {
  return () => ListOfTypeListOfType.map((ListOfType, index) => {
    const { name, list, type } = ListOfType
    return `
      <h2>${name}</h2>
      <div class="row">
        ${page(list)}
      </div>
    `
  }).join('')
}


function page(list) {
  return list.map(x => skuTable[x]).map((item, index) => {
    const { type, name, boxart, amount } = item
    return `
      <div class="box ${type}">
        <img class="boxart" src="${boxart}" alt="Boxart for ${name}" />
        <button class="add-to-cart" data-sku="${list[index]}">
          Add to Cart
        </button>
        <div class="title">
          ${name}
        </div>
        <div class="price">
          ${amount.value} ${amount.currency}
        </div>
      </div>
    `
  }).join('')
}

$.when('click', '.add-to-cart', (event) => {
  const {sku} = event.target.dataset
  const quantity = currentCart().items[sku] || 0
  currentCart().items[sku] = quantity + 1
})

$.style(`
  & .row {
    display: flex;
    overflow-x: auto;
    padding: 1rem;
    gap: 1rem;
  }

  & .box {
    min-width: 240px;
    aspect-ratio: 1;
    position: relative;
    background: dodgerblue;
    display: flex;
    flex-direction: column-reverse;
    gap: .5rem;
    padding: .5rem;
  }

  & .box::before {
    content: '';
    background: linear-gradient(transparent, rgba(0,0,0,.85));
    position: absolute;
    inset: 0;
    z-index: 2;
  }

  & .boxart {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  & .price {
    position: relative;
    z-index: 3;
    text-align: right;
    color: rgba(255,255,255,.75);
  }
  & .title {
    position: relative;
    z-index: 3;
    color: rgba(255,255,255,.85);
    text-align: right;
  }
  & .add-to-cart {
    position: relative;
    z-index: 3;
    padding: 1rem;
    background: dodgerblue;
    color: white;
    border: 2px solid dodgerblue;
    border-radius: 1rem;
    transition: background 100ms ease-in-out;
  }

  & .add-to-cart:hover,
  & .add-to-cart:focus {
    border: 2px solid dodgerblue;
    background: rgba(0,0,0,.85);
  }
`)
