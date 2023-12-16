import updateItem from './updateItem.js'

// adds a click event listener for when the complete all action is performed
// all items will be marked as completed in the items state
export default function onCompletenessToggle($) {
  $.when(
    'change',
    '[data-toggle-all]',
    (event) => handler($, event)
  )
}

function handler($, event) {
  const { checked } = event.target
  const { items } = $.learn()
  const markedItems = items.map(x => ({
    ...x,
    completed: checked
  }))

  markedItems.map(item => updateItem($, item))
}
