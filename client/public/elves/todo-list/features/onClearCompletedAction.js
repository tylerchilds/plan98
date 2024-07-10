import deleteItem from './deleteItem.js'

// adds a click event listener for when the clear completed action is performed
// the items state is then updated to contain only incomplete items
export default function onClearCompletedAction($) {
  $.when(
    'click',
    '[data-clear-completed]',
    function clearCompleted() {
      const { items } = $.learn()
      const completedItems = items.filter(x => x.completed)

      completedItems.map(item => deleteItem($, item))
    }
  )
}
