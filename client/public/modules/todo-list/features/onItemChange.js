import findItemById from './findItemById.js'
import updateItem from './updateItem.js'

// add a keypress event listener for updating an item
export default function onItemChange($, flags) {
  if(!flags.actions) return

  function changeItemHandler($, event) {
    const id = event.target.dataset.changeId
    const { value } = event.target
    const item = findItemById($, id)

    updateItem($, {
      ...item,
      editing: false,
      task: value
    })
  }

  $.when(
    'keypress',
    '[data-change-id]',
    (event) => {
      if (event.which === flags.actions.enter) {
        changeItemHandler($, event)
      }
    }
  )

  $.when(
    'blur',
    '[data-change-id]',
    (event) => changeItemHandler($, event)
  )
}
