export default function showCompletenessToggle($) {
  // grab the items state
  const { items } = $.learn()

  // true, if there are are COMPLETED items
  const hasIncompleteItems = items.some(x => !x.completed)

  const checked = hasIncompleteItems
    ? ''
    : 'checked="true"'

  return `
    <input data-toggle-all ${checked} id="toggle-all" class="toggle-all" type="checkbox">
    <label for="toggle-all">Mark all as complete</label>
  `
}
