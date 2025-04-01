import elf from '@silly/elf'
import diffHTML from 'diffhtml'

const newPlayer = {
  x: 0,
  y: 0,
  z: 0,
  jump: false,
  cancel: false,
  interact: false,
  swap: false,
  item1: false,
  item2: false,
  item3: false,
  item4: false,
  select: false,
  start: false,
  os: false
}

const $ = elf('multiplayer-template', {
  tiles: [0,1,2,3],
  players: {
  }
})

const sonic = 1/256

const rpcHandlers = {
  inputFrame(frameInputs) {
    const { players } = $.learn()

    frameInputs.forEach((data, index) => {
      if(data) {
        const { id, gamepad } = data
        let {
          x,
          y,
          z,
          jump,
          cancel,
          interact,
          swap,
          item1,
          item2,
          item3,
          item4
        } = players[index] || newPlayer

        if(gamepad.up === 1) {
          z += sonic
        }

        if(gamepad.down === 1) {
          z -= sonic
        }

       if(gamepad.left === 1) {
          x -= sonic
        }

        if(gamepad.right === 1) {
          x += sonic
        }

        if(gamepad.a === 1) {
          jump = true
        } else {
          jump = false
        }

        if(gamepad.b === 1) {
          cancel = true
        } else {
          cancel = false
        }

        if(gamepad.x === 1) {
          interact = true
        } else {
          interact = false
        }

        if(gamepad.y === 1) {
          swap = true
        } else {
          swap = false
        }

        if(gamepad.lb === 1) {
          item1 = true
        } else {
          item1 = false
        }

        if(gamepad.rb === 1) {
          item2 = true
        } else {
          item2 = false
        }

        if(gamepad.lb === 1) {
          item3 = true
        } else {
          item3 = false
        }

        if(gamepad.rb === 1) {
          item4 = true
        } else {
          item4 = false
        }

        $.teach({
          id,
          x,
          z,
          jump,
          cancel,
          interact,
          swap,
          item1,
          item2,
          item3,
          item4
        }, mergePlayer(index))
      }
    })
  }
}

function mergePlayer(index) {
  return (state, payload) => {
    return {
      ...state,
      players: {
        ...state.players,
        [index]: {
          ...state.players[index],
          ...payload
        }
      }
    }
  }
}

$.draw((target) => {
  const { partyId } = target.dataset

  if(!target.innerHTML) {
    target.innerHTML = `
      <div class="split-screen">
        <div class="tile" data-index="0"></div>
        <div class="tile" data-index="1"></div>
        <div class="tile" data-index="2"></div>
        <div class="tile" data-index="3"></div>
      </div>
    `

  }
  requestAnimationFrame(() => {
    const { tiles, players } = $.learn()

    tiles.map((slot) => {
      const tile = target.querySelector(`.tile[data-index="${slot}"]`)
      if(players[slot]) {
        diffHTML.innerHTML(tile, `
          <pre>${JSON.stringify(players[slot], null, 4)}</pre>
        `)
      } else {
        if(tile.querySelector('qr-code')) return
        const url = plan98.env.PLAN98_PEER
          ?`http://${plan98.env.PLAN98_PEER}`
          :`${window.location.origin}`
        diffHTML.innerHTML(tile, `
          <div class="no-player-yet" data-slot="${slot}">
            <div class="join-code" data-slot="${slot}">
              <qr-code data-bg="transparent" src="${url}/app/couch-coop?id=${partyId}&slot=${slot}&controller=true"></qr-code>
            </div>
          </div>
        `)
      }
    })
  })
})

$.when('json-rpc', (event) => {
  const { method, params } = event.detail

  if(rpcHandlers[method]) {
    rpcHandlers[method](params)
  }
})

$.style(`
  & {
    display: block;
    height: 100%;
    background: black;
    color: white;
  }
  & .split-screen {
    height: 100%;
    opacity: 1;
    overflow: auto;
    position: absolute;
    inset: 0;
    z-index: 2;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "first second" "third fourth";
  }

  & pre {
    margin: 0;
  }

  & .tile {
    height: 100%;
    overflow: hidden;
  }

  & .no-player-yet {
    overflow: hidden;
    height: 100%;
    padding: 1rem;
  }

  & .join-code {
    overflow: hidden;
    height: 100%;
    padding: 1rem;
    border-radius: 1rem;
    border: 0;
    background: white;
    width: 100%;
    display: flex;
    flex-direction: column;
    place-items: center;
  }

  & qr-code {
    margin: auto;
  }
  & .join-code[data-slot="0"] {
    background: linear-gradient(335deg, rgba(255,255,255,.85), rgba(255,255,255,.65)), var(--green, mediumseagreen);
  }

  & .join-code[data-slot="1"] {
    background: linear-gradient(335deg, rgba(255,255,255,.85), rgba(255,255,255,.65)), var(--red, firebrick);
  }

  & .join-code[data-slot="2"] {
    background: linear-gradient(335deg, rgba(255,255,255,.85), rgba(255,255,255,.65)), var(--yellow, gold);
  }

  & .join-code[data-slot="3"] {
    background: linear-gradient(335deg, rgba(255,255,255,.85), rgba(255,255,255,.65)), var(--blue, dodgerblue);
  }
`)
