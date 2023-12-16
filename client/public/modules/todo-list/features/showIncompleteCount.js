// a render helper for returning the number of tasks remaining
export default function showIncompleteCount($) {
  const { items } = $.learn()
  const incomplete = items.filter(x => !x.completed)
  return `
    <span class="todo-count">
      ${incomplete.length} remaining
    </span>
  `
}
