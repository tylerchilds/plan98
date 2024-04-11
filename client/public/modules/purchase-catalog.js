import module from '@sillonious/module'
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
    list: ['000-000-000']
  },
  {
    type: 'List',
    name: "Quan's Cards",
    list: ['000-000-001']
  }
]

const $ = module('purchase-catalog')
$.draw(catalog(ListOfTypeListOfType))

function catalog(ListOfTypeListOfType) {
  return () => ListOfTypeListOfType.map((ListOfType, index) => {
    const { name, list, type } = ListOfType
    return `
      <div>
        <h2>${name}</h2>
        ${page(list)}
      </div>
    `
  }).join('')
}


function page(list) {
  return list.map(x => skuTable[x]).map((item, index) => {
    const { type, name, boxart } = item
    return `
      <div class="${type}">
        <img src="${boxart}" alt="Boxart for ${name}" />
        ${name}
        <button class="add-to-cart" data-sku="${list[index]}">
          Add to Cart
        </button>
      </div>
    `
  }).join('')
}

$.when('click', '.add-to-cart', (event) => {
  const {sku} = event.target.dataset
  const quantity = currentCart().items[sku] || 0
  currentCart().items[sku] = quantity + 1
})
