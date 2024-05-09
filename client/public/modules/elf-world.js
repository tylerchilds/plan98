import module from '@silly/tag'

const keyframes = [
  {
    world: 0,
    level: 0,
  },
  {
    world: 0,
    level: 1,
  },
  {
    world: 0,
    level: 2,
  },
  {
    world: 0,
    level: 3,
  },
  {
    world: 0,
    level: 4,
  },
  {
    world: 0,
    level: 5,
  },
  {
    world: 0,
    level: 6,
  },
]

const $ = module('elf-world', {
  reversed: true,
  current: keyframes.length -1,
  mirror: 2
})

$.draw(() => {
  const { reverse, current, mirror } = $.learn()

  const ordered = reverse ? keyframes.reverse() : keyframes

  const levels = ordered.map((keyframe, i) => {
    const offsetIndex = reverse ? keyframes.length - i : i
    const offsetLevel = ((offsetIndex - current))
    const scale = 1 - (Math.abs(offsetLevel) * .15)
    const opacity = 1 - (Math.abs(offsetLevel) * .1)
    return `
      <div
        style="
          border-bottom: 2rem solid var(--wheel-${keyframe.world}-${keyframe.level});
          transform: scale(${scale});
          opacity: ${opacity};
          z-index: ${ordered.length - offsetIndex};
        "
      >
        ${i === current ? 'comic' : ''}
        ${i === mirror ? 'cartoon' : ''}
      </div>
    `
  }).join('')

  return `
    <div class="${reverse ? 'levels mirrored' : 'levels'}">
      ${levels}
    </div>
  `
})

$.style(`
  & {
    perspective-origin: center;
    perspective: 1000px;
    position: relative;
    overflow: hidden;
    transform-style: preserve-3d;
  }
  & .levels {
    display: grid;
    grid-template-areas:
  "slot";
    grid-template-rows: 1fr;
    grid-template-columns: 1fr;
    height: 100vh;
    background: linear-gradient(rgb(128,128,128,.25), rgb(128,128,128,1));
    mix-blend-mode: multiply;
  }

  & .levels.mirrored {
  }

  & .levels > * {
    grid-area: slot;
  }
`)

setInterval(() => { 
  const { reverse, current, mirror } = $.learn()
  $.teach({
    reverse: !reverse,
    current: mirror,
    mirror: current
  })
}, 1000)
