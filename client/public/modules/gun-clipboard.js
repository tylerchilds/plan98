import module from '@silly/tag'
import 'gun'

const gun = window.Gun(['https://gun.1998.social/gun']);

const $ = module('gun-clipboard')

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    line-height: 2rem;
  }

  & textarea {
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    padding: 2rem 1rem;
    line-height: 2rem;
    background: transparent;
  }

  & .page {
    height: 100%;
    line-height: 3rem;
    background: rgba(255,255,255,.85);
  }
`)

$.draw((target) => {
  subscribe(target)
  const { value } = $.learn()
  return `
    <div class="page">
      <textarea style="background-image: ${getLines(target)}">${value?value:''}</textarea>
    </div>
  `
})

$.when('input', '.page textarea', (event) => {
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

$.when('scroll', 'textarea', function({ target }) {
    const scrollTop = target.scrollTop;
console.log(scrollTop)
    target.style.backgroundPosition = `0px ${-scrollTop}px`;
});
