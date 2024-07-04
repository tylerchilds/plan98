import tag from '@silly/tag'

const $ = tag('app-simulator')

$.draw((target) => {
  if(target.querySelector('.device')) return

  const app = target.getAttribute('app')

  return `
    <div class="device">
      <iframe src="/app/${app}"></iframe>
    </div>
  `
})

$.style(`
  & {
    display: grid;
    place-content: center;
    height: 100%;
    background-image: linear-gradient(35deg, dodgerblue, rgba(0,0,0,.5));
    background-size: cover;
    overflow: auto;
    position: relative;
  }

  & .device {
    width: 320px;
    height: 480px;
    border-radius: 13px;
    overflow: hidden;
    position: relative
  }

  &.timemachine .device {
    width: 40mm;
    height: 42mm;
  }

  &.ipad .device {
    width: 1024px;
    height: 768px;
  }

  &.iphone .device {
    width: 320px;
    height: 480px;
  }

  &.full .device {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }
`)
