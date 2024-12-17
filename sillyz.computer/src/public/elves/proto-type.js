import tag from '@silly/tag'

const $ = tag('proto-type')

$.draw((target) => {
  if(target.querySelector('.device')) return

  const src = target.getAttribute('src')

  return `
    <div class="space">
      <div class="device">
        <iframe src="${src}"></iframe>
      </div>
    </div>
  `
})

$.style(`
  & {
    display: grid;
    overflow: auto;
    position: relative;
    background: #54796d;
    height: 100%;
    place-items: center;
  }

  & .space {
    margin: auto;
  }

  & .device {
    width: 320px;
    height: 480px;
    border-radius: 13px;
    overflow: hidden;
    border: 5px solid rgba(0,0,0,.85);
    box-sizing: content-box;
    margin: auto;
  }

  &.timemachine .space {
    width: calc(40mm + 4rem);
  }

  &.ipad .space {
    width: calc(1024px + 4rem);
  }

  &.iphone .space {
    width: calc(320px + 4rem);
  }

  &.tv .space {
    width: calc(1920px + 4rem);
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

  &.tv .device {
    width: 1920px;
    height: 1080px;
  }
`)
