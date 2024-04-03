import module from '@sillonious/module'

const $ = module('action-script')

$.draw(target => {
  target.setAttribute('aria-role', 'button')
})

$.when('click', '', async (event) => {
  const { action, script } = event.target.dataset
  const dispatch = (await import(script))[action]
  dispatch(event, $)
})
