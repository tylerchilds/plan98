import performItemCreation from './performItemCreation.js'

// a helper function to add an item to the items state
export default async function createItem($, flags) {
  const item = await performItemCreation($, flags);

  // a helper function for appending an item into the item state
  const handler = (state, payload) => {
    return {
      ...state,
      items: [
        ...state.items,
        payload
      ]
    }
  }

  // add the new item to the items state
  $.teach({
    ...item,
    editing: false,
  }, handler)
}
