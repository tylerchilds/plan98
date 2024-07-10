import tag from '@silly/tag'


const $ = tag('cutestrap-page')

const stars = getStars()
$.draw((target) => {
  target.style = `background: ${stars}`
  debugger
})

function getStars() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('line-height'));
  canvas.height = rhythm;
  console.log(rhythm)
  canvas.width = rhythm;

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, rhythm, rhythm);

  ctx.fillStyle = 'dodgerblue';
  ctx.fillRect(0, rhythm - 1, rhythm, 1);

  return `url(${canvas.toDataURL()}`;
}


