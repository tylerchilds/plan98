import module from '@silly/tag'
import { skuTable } from './purchase-catalog.js'

const $ = module('product-details')

$.draw((target) => {
  const { sku } = target.dataset
  const item = skuTable[sku]

  return `
    ${item.name}
  `
})
