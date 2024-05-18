import module from '@silly/tag'
import 'gun'

const gun = window.Gun(['https://gun.1998.social/gun']);

const $ = module('gun-clipboard')

$.draw((target) => {
  subscribe(target)
  const { value } = $.learn()
  return `<textarea style="background-image: ${getLines(target)}">${value?value:''}</textarea>`
})

$.when('input', '>textarea', (event) => {
  const { gun } = event.target.closest($.link)
  gun.put(event.target.value)
})

function subscribe(target) {
  if(target.subscribed) return
  target.subscribed = true

  target.gun = gun.get($.link).get(window.location.href)
  target.gun.on(value => $.teach({ value }))
}

function getLines(target) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(target).getPropertyValue('line-height'));
  canvas.height = rhythm;
  canvas.width = rhythm;

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, rhythm, rhythm);

  ctx.fillStyle = 'dodgerblue';
  ctx.fillRect(0, rhythm - (rhythm * .1), rhythm, 1);

  return `url(${canvas.toDataURL()}`;
}



$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  & textarea {
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    padding: 0;
    background: white;
  }
`)
