import elf from '@silly/elf'

const $ = elf('social-template', {
  name: '',
  theme: 'lemonchiffon'
})

$.draw((target) => {
  if(target.innerHTML) return
  return `
    <profile-picker></profile-picker>
    <div data-dom="name"></div>
  `
}, {
  beforeUpdate(target) {

  },
  afterUpdate(target) {
    const { name, theme } = $.learn()
    {
      if(getComputedStyle(event.target).getPropertyValue('--theme') !== theme) {
        document.body.style.setProperty('--theme', theme)
      }
    }

    {
      const nameNode = target.querySelector('[data-dom="name"]')
      if(nameNode.innerText !== name) {
        nameNode.innerText = name
      }
    }
  }
})

$.when('input', 'profile-picker', (event) => {
  const { name, theme } = event.detail

  $.teach({ name, theme })
})

$.style(`
  & {
    display: block;
    background: var(--theme, lemonchiffon);
    height: 100%;
  }
`)
