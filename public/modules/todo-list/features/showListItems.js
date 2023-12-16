// returns the list of items corresponding to the current filter
export default function showListItems($, flags = {}) {
  if(!flags.filterOrdered) return

  // grab the filter and items state
  const { filter, items } = $.learn()
  const [ALL, ACTIVE, COMPLETED] = flags.filterOrdered

  // a callback function that determines if an item matches the current filter
  const filterItems = (item) => {
    // create a dictionary of true/false from the item based on filter
    const lookup = {
      [ALL]: true,
      [ACTIVE]: !item.completed,
      [COMPLETED]: item.completed
    }

    // use the current filter to know if the item is shown/hidden
    return lookup[filter]
  }

  return items
    .filter(filterItems)
    .map(item => {
      // if the item is completed, mark it as done for styling
      const classList = `class="${
        item.done ? 'completed' : ''
      } ${
        item.editing ? 'editing' : ''
      }"`

      const checked = item.completed
        ? 'checked="true"'
        : ''

      // for all visible items return a toggle button and a delete button
      return `
        <li ${classList}>
          <div class="view">
            <input ${checked} data-toggle-id="${item.url}" class="toggle" type="checkbox">
            <label data-edit-id="${item.url}">${item.description}</label>
            <button data-delete-id="${item.url}" class="destroy"></button>
          </div>
          <input data-change-id="${item.url}" class="edit" type="text" value="${item.description}" />
        </li>
      `
    }).join('') // convert this array to a string
}
