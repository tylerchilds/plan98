import performItemDeletion from './performItemDeletion.js'

// a helper function to remove an item from the items state
export default function deleteItem($, item) {
  // a helper function for filtering the current item out of the item state
  const handler = (state, payload) => {
    return {
      ...state,
      items: [
        ...state.items.filter((item) => {
          if(item.url !== payload.url) {
            return item
          }
        })
      ]
    }
  }

  // remove the item from the item state
  $.teach(item, handler)
  performItemDeletion($, item)
}
