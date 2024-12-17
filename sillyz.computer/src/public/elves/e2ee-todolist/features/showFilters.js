export default function showFilters($, flags = {}) {
  if(!flags.filterOrdered) return

  // get the filter state
  const { filter } = $.learn()

  // a render helper to generate a button from a key
  const render = (key) => `
    <li>
      <a
        href="#/${key}"
        data-filter="${key}"
        ${filter === key ? 'class="selected"' : ''}
      >
        ${flags.filters[key].label}
      </a>
    </li>
  `

  // loop over filter options and return a string of buttons
  return flags.filterOrdered.map(render).join('')
}
