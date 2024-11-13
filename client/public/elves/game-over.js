/* the ethnography of the time machine */

// import includes modules
//
// the string inside the import function uses an import map to find the url
//
// then will happen when import is successful
//
// elf is object that contains the entire kernel
import('@silly/elf').then((elf) => {

  // silly is an elf created using the default kernel
  //
  // the secure home entertainment system begins and ends with a game over
  const silly = elf.default('game-over')

  // silly has a canvas for drawing on
  //
  // when a pointer goes down it starts tracking the input on a grid
  silly.when('pointerdown', 'canvas', start)

  // when the silly pointer moves, the cursor's x and y are updated
  silly.when('pointermove', 'canvas', move)

  // when the silly pointer is lifted up from the canvas, end tracking
  silly.when('pointerup', 'canvas', end)

  // when silly is updated, we draw the elves that run in sillyz mind
  silly.draw((target) => {
    // any other elf can hide behind the canvas
    return '<plan98-welcome></plan98-welcome><canvas></canvas>'
  },
    // hooks happen before draw updates and after draw updates
    { beforeUpdate, afterUpdate }
  )

  // beforeUpdate, use case: persist ephemeral user experience for a frame
  function beforeUpdate(target) {
    {
      // scope to run before
    }
  }

  // afterUpdate, use case: persist ephemeral user experience for a frame
  function afterUpdate(target) {
    {
      // scope to run after
    }
  }

  function start(event) {
    const { target, x, y } = event
    console.log({ target, x, y })
  }

  function move(event) {
    const { target, x, y } = event
    console.log({ target, x, y })
  }

  function end(event) {
    const { target } = event
    console.log({ target })
  }

  // silly can be re-composited with style
  silly.style(`
    & {
      display: block;
      height: 100%;
      width: 100%;
      position: relative;
    }

    & > * {
      position: absolute;
      inset: 0;
    }

    & canvas {
      display: block;
      height: 100%;
      width: 100%;
    }
  `)
}).catch(e => console.error(e))
