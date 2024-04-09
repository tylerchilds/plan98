import module from '@sillonious/module'

const computers = [
  {
    type: 'Computer',
    boxart: '/cdn/boxart.svg',
    name: 'Funbox',
    price: '10000',
    amount: {
      value: 4200,
      currency: "USD"
    },

  }
]

const cards = [
  {
    type: 'Card',
    boxart: '/cdn/boxart.svg',
    name: 'Funbox',
    price: '10000',
    amount: {
      value: 4200,
      currency: "USD"
    },

  }
]

const ListOfTypeListOfType = [
  {
    type: 'List',
    name: 'Sillyz.Computer',
    list: computers
  },
  {
    type: 'List',
    name: "Quan's Cards",
    list: cards
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


function page(List) {
  return List.map(Type => {
    const { type, name } = Type
    return `
      <div class="${type}">
        ${name}
      </div>
    `
  }).join('')
}

export function getCart() {
  return {
    items: []
  }
}
