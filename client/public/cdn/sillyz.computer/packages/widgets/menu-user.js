import { tag, signal } from "/deps.js"
import { showDrawer, hideDrawer, byDrawer } from '/packages/ui/drawer.js'
import { popover } from '/packages/ui/popover.js';

const $ = tag('menu-user', { link: 'https://1998.social/~tychi' })
export default $

const $content = tag('menu-user-content')
$content.render(() => {
  const user = $.read()
  if(!user) return

  return `
    <img src="${user.pic}" alt="image for ${user.nick}" />
    <input type="text" name="link" value="${user._link}" />
    <input type="text" name="nick" value="${user.nick}" />
    <input type="text" name="pic" value="${user.pic}" />
    <input type="text" name="color" value="${user.color}" />
  `
})

$content.on('blur', 'input', event => {
  const { value, name } = event.target
  if(name === 'link') {
    $.write({ link: value })
    return
  }

  signal($.read()._link)[name] = value
})

function userMenu() {
  const { isOpen } = byDrawer('left')

  isOpen 
    ? hideDrawer('left')
    : showDrawer({ position: 'left', body: `
      <menu-user-content></menu-user-content>
    `})
}

$.on('click', 'button', userMenu)

$.render(target => {
  const user = $.read()
  if(!user) return
  return `
    <button class="interface-button tl" data-tooltip="Who am I?">
      <img src="${user.pic}" alt="image for ${user.nick}" />
    </button>
  `
})

$.style(`
  & a {
    display: block;
  }

  & button * {
    pointer-events: none;
  }

  & .user-menu-content {
    background: white;
    border-radius: 4px;
    display: none;
    position: absolute;
    right: 0;
    top: -12px;
    transform: translateY(-100%);
    animation: &-fade-in 200ms ease-in-out;
    width: 100%;
  }

  & .menu-item {
    border-bottom: 1px solid rgba(128, 128, 128, .4);
    padding: 8px 12px;
  }

  & .menu-item:last-child {
    border-bottom: none;
  }

  @keyframes &-fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`)

function activate(){
  console.log('a')
  $.write({ active: true })
}

function deactivate() {
  console.log('de')
  $.write({ active: false })
}
