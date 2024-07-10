import findItemById from './findItemById.js'
import updateItem from './updateItem.js'

// add a click event listener for toggling a task's completeness
export default function onItemToggle($) {
  function toggleItemHandler($, event) {
    // get the id of the toggled task and locate the corresponding item in state
    const url = event.target.dataset.toggleId
    const item = findItemById($, url)

    // calls a helper function to update the items state for this updated item
    updateItem($, {
      ...item,
      completed: !item.completed
    })
  }

  $.when(
    'click',
    '[data-toggle-id]',
    (event) => toggleItemHandler($, event)
  )
}
