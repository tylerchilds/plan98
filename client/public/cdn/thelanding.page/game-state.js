import { state } from 'statebus'

export function currentSave() {
  if(!state['ls/save-file']) blankSave()
  return state['ls/save-file']
}

export function blankSave() {
  state['ls/save-file'] = {
    chaosEmerald: []
  }
}

export function takeButton() {
  alert('button took')
}

export function ok() {
  const upsell = document.querySelector('sillonious-upsell')

  if(upsell.trap) {
    upsell.trap.deactivate()
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
