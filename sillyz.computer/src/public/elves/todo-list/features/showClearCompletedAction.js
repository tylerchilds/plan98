// a helper function for rendering the clear and complete actions
export default function showClearCompletedAction($) {
  // grab the items state
  const { items } = $.learn()
  const button = `
    <button data-clear-completed class="clear-completed">
      Clear completed
    </button>
  `
  // true, if there are are COMPLETED items
  const hasCompleteItems = items.some(x => x.completed)

  return hasCompleteItems ? button : ''
}
