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
