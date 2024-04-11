import module from '@sillonious/module'
import { currentCart } from '../cdn/thelanding.page/game-state.js'
import { skuTable } from './purchase-catalog.js'

const $ = module('shopping-cart')

$.draw(() => {
  const skus = Object.keys(currentCart().items)
  const goods = skus.map(x => skuTable[x]).map((item, index) => {
    const sku = skus[index]
    const quantity = currentCart().items[sku]
    const { name, boxart, type } = item
    return `
      <div>
        ${quantity}
        <div class="${type}">
          <img src="${boxart}" alt="Boxart for ${name}" />
          ${name}
        </div>
      </div>
    `
  }).join('')

  return goods.length > 0 ? `
    Cart:
    ${goods}
  ` : `
    Nothing in cart...
  `
})
