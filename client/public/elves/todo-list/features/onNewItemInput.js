import createItem from './createItem.js'

// adds a submit event listener for the form
export default function onNewItemInput($, flags = {}) {
  if(!flags.actions) return

  function newItemHandler($, event) {
    const input = event.target

    if (event.which === flags.actions.enter) {
      // if the input is valid, create a new item and clear the field
      if(validate(input)) {
        createItem($, {
          description: input.value.trim(),
        })
        input.value = ''
      }
    }
  }

  $.when(
    'keypress',
    '[data-new-item-input]',
    function (event) { newItemHandler($, event) }
  )
}

// a quick check to see if the value is not empty
function validate({ value }) { return !!value }
