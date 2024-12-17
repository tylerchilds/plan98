import { state } from 'statebus'
import { hideModal } from '@plan98/modal'

export function currentSave() {
  if(!state['ls/save-file']) blankSave()
  return state['ls/save-file']
}

export function currentCart() {
  if(!state['ls/shopping-cart']) emptyCart()
  return state['ls/shopping-cart']
}

export function blankSave() {
  state['ls/save-file'] = {
    chaosEmerald: [],
  }
}

export function emptyCart() {
  state['ls/shopping-cart'] = {
    items: {}
  }
}

export function toThePlayground() {
  window.location.href = '?world=sillyz.computer'
}

export function takeButton() {
  alert('button took')
}

export function ok() {
  const wizard = document.querySelector('wizard-journey')

  if(wizard.trap) {
    wizard.trap.deactivate()
    hideModal()
  } else {
    window.location.href = "/?world=sillyz.computer"
  }
}

export function upsold() {
  window.location.href = "https://thelanding.page"
}

export function takeEmerald(event, root) {
  const { emerald } = root.dataset
  const index = parseInt(emerald)
  if(emerald) {
    currentSave().chaosEmerald[index] = true
  }
}
