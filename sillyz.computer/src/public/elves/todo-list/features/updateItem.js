import performItemUpdation from './performItemUpdation.js'

// a helper function to update the items state for an item
export default function updateItem($, item) {
  // a helper function for merging an item with updates in the items state
  const handler = (state, payload) => {
    return {
      ...state,
      items: [
        ...state.items.map((item) => {
          if(item.url !== payload.url) {
            return item
          }

          return {
            ...item,
            ...payload
          }
        })
      ]
    }
  }

  // update the item in the item state
  $.teach(item, handler)

  performItemUpdation($, item)
}
