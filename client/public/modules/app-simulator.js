import tag from '@silly/tag'

const $ = tag('app-simulator')

$.draw((target) => {
  if(target.querySelector('.device')) return

  const app = target.getAttribute('app')

  return `
    <div class="device">
      ${target.innerHTML}
      <${app}></${app}>
    </div>
  `
})

$.style(`
  & {
    display: grid;
    place-content: center;
    height: 100%;
    background-image: linear-gradient(35deg, dodgerblue, rgba(0,0,0,.5)), url('/cdn/tychi.me/photos/pacifica.JPG');
    background-size: cover;
  }

  & .device {
    width: 320px;
    height: 480px;
    border-radius: 13px;
    overflow: hidden;
    position: relative
  }
`)
