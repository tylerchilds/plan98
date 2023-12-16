import findItemById from './findItemById.js'
import updateItem from './updateItem.js'

// add a keypress event listener for updating an item
export default function onItemEdit($) {
  function editItemHandler($, event) {
    const url = event.target.dataset.editId
    const item = findItemById($, url)

    updateItem($, {
      ...item,
      editing: true,
    })
  }

  $.when(
    'dblclick',
    '[data-edit-id]',
    (event) => editItemHandler($, event)
  )
}
