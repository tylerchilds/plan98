/* the live action re-telling of the time machine */

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

  // when the nonce is clicked, navigate home
  silly.when('click', '.nonce', () => {
    window.location.href = '/'
  })

  // when silly is updated, we draw the elves that run in sillyz mind
  silly.draw((target) => {
    // once we've drawn the first time, let's handle updates surgically
    if(target.innerHTML) return

    // layer the welcome screen behind the sticky nose under the invisible canvas
    return `
      <plan98-welcome></plan98-welcome>
      <canvas></canvas>
      <button class="nonce"></button>
    `
  },
    // hooks happen before draw updates and after draw updates
    { beforeUpdate, afterUpdate }
  )

  // beforeUpdate, use case: persist ephemeral user experience for a frame
  function beforeUpdate(target) {
    {
      // learn the status of whether silly is pressed
      const { pressed } = silly.learn()
      if(pressed) {
        // label the target as pressed
        target.classList.add('pressed')
      } else {
        // unlabel the target as pressed
        target.classList.remove('pressed')
      }
    }
  }

  // afterUpdate, use case: recover ephemeral user experience for a frame
  function afterUpdate(target) {
    {
      // scope to run after
      const { x, y } = silly.learn()
      // set the endgame x and endgame y variables to update layout
      target.style.setProperty('--endgame-x', x + 'px')
      target.style.setProperty('--endgame-y', y + 'px')
    }
  }

  function start(event) {
    const { x, y } = event
    // teach the x, y coordinates and activate pressed
    silly.teach({ x, y, pressed: true })
  }

  function move(event) {
    const { x, y } = event
    // update the x, y coordinates
    silly.teach({ x, y })
  }

  function end(event) {
    // deactivate pressed
    silly.teach({ pressed: false })
  }

  // silly can be re-composited with style
  silly.style(`
    & {
      display: block;
      height: 100%;
      width: 100%;
      position: relative;
    }

    & .nonce {
      position: absolute;
      left: 0;
      right: 0;
      transform: translate(calc(var(--endgame-x) - 1.5rem), calc(var(--endgame-y) - 1.5rem));
      transform-origin: center;
      width: 3rem;
      height: 3rem;
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

    & .nonce {
      pointer-events: none;
    }

    &.pressed .nonce {
      display: none;
      pointer-events: all;
    }
  `)
}).catch(e => console.error(e))

customElements.define('game-over', class WebComponent extends HTMLElement { constructor() { super() } });
