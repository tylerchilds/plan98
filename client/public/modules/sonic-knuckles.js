import module from '@silly/tag'

const $ = module('sonic-knuckles')

$.draw(() => {
  return `
    <iframe src="/?world=1998.social"></iframe>
  `
})

$.when('click', 'button', (event) => {
  event.target.cloest($.link).querySelector('iframe').contentWindow.focus()
})

$.style(`
  & {
    display: block;
    aspect-ratio: 16/9;
    position: relative;
  }
  & iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
`)
