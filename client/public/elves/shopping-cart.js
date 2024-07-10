import module from '@silly/tag'
import { currentCart } from '../cdn/thelanding.page/game-state.js'
import { skuTable } from './purchase-catalog.js'

const $ = module('shopping-cart')

$.draw(() => {
  const skus = Object.keys(currentCart().items)
  const goods = skus.map(x => skuTable[x]).map((item, index) => {
    const sku = skus[index]
    const quantity = currentCart().items[sku]
    const { name, boxart, type, amount } = item

    const total = `${amount.value * quantity} ${amount.currency}`
    return `
      <div class="row ${type}">
        <img class="boxart" src="${boxart}" alt="Boxart for ${name}" />
        <div class="title">
          ${name}
        </div>

        <div class="quantity">
          <button data-less data-sku="${sku}">less</button>
          <div>quantity: ${quantity}</div>
          <button data-more data-sku="${sku}">more</button>
        </div>

        <div class="price">
          ${total}
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

$.when('click', '[data-less]', (event) => {
  const { sku } = event.target.dataset
  const quantity = currentCart().items[sku] || 0
  if(quantity === 0) return
  currentCart().items[sku] = quantity - 1
})

$.when('click', '[data-more]', (event) => {
  const { sku } = event.target.dataset
  const quantity = currentCart().items[sku] || 0
  if(quantity === 99) return
  currentCart().items[sku] = quantity + 1
})

$.style(`
  & .row {
    padding: 1rem;
    margin: 1rem 0;
    clear: both;
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
    max-width: 128px;
    float: left;
    margin-right: 1rem;
  }

  & .price {
  }
  & .title {
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

  & .quantity {
    display: flex;
    flex-direction: column;
  }

  & .quantity button {
    background: rgba(0,0,0,.85);
    color: dodgerblue;
    border: none;
    padding: .5rem;
  }
`)
