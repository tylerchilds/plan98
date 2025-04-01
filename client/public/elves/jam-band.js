import elf from '@silly/elf'
import diffHTML from 'diffhtml'
import * as Tone from 'tone@next'
import { SampleLibrary } from '/cdn/attentionandlearninglab.com/Tonejs-Instruments.js'

// load samples / choose 4 random instruments from the list //
const instruments = ['piano', 'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute', 'french-horn', 'guitar-acoustic', 'guitar-electric','guitar-nylon', 'harmonium', 'harp', 'organ', 'saxophone', 'trombone', 'trumpet', 'tuba', 'violin', 'xylophone']

Tone.Transport.start();

const playerInstruments = {
  0: null,
  1: null,
  2: null,
  3: null
}

loadInstrument(0, 'piano')
loadInstrument(1, 'violin')
loadInstrument(2, 'saxophone')
loadInstrument(3, 'guitar-acoustic')

function loadInstrument(index, instrument) {
  playerInstruments[index] = null
  const synth = SampleLibrary.load({
    instruments: instrument,
    baseUrl: (self.plan98.env.HEAVY_ASSET_CDN_URL || '') + "/private/tychi.1998.social/SourceCode/tonejs-instruments/samples/",
    onload() {
      synth.release = .5;
      synth.toDestination();

      playerInstruments[index] = {
        name: instrument,
        synth
      }
    }
  })
}

const romModes = {
  pause: 'pause',
  play: 'play'
}

function mod(x, n) {
  return ((x % n) + n) % n;
}

const circle = [
  { label: 'F', midi: 43 },
  { label: 'C', midi: 48 },
  { label: 'G', midi: 55 },
  { label: 'D', midi: 50 },
  { label: 'A', midi: 57 },
  { label: 'E', midi: 52 },
  { label: 'B', midi: 59 },
  { label: 'F#/Gb', midi: 54 },
  { label: 'C#/Db', midi: 61 },
  { label: 'Ab', midi: 56 },
  { label: 'Eb', midi: 63 },
  { label: 'Bb', midi: 58 },
]

function circleInfo(index) {
  return circle[mod(index, circle.length)]
}

const newPlayer = {
  settingsOpen: false,
  circleIndex: 1,
  offset: 0,
  activeNotes: []
}

const $ = elf('jam-band', {
  mode: romModes.play,
  tiles: [0,1,2,3],
  players: {
  }
})

const spamCache = {}
function debounceSpam(code, timeout, callback) {
  if(spamCache[code]) return
  spamCache[code] = true

  callback()

  setTimeout(() => {
    spamCache[code] = false
  }, timeout)
}

const toggleCache = {}
function toggleSpam(code, value, callback) {
  if(!toggleCache[code] && value === 1) {
    callback()
  }

  toggleCache[code] = value
}

const rpcHandlers = {
  inputFrame(frameInputs) {
    const { players } = $.learn()

    frameInputs.forEach((data, index) => {
      if(data) {
        const { id, gamepad } = data
        let {
          settingsOpen,
          circleIndex,
          activeNotes,
          offset
        } = players[index] || newPlayer

        const root = circleInfo(circleIndex).midi
        const notes = []

        toggleSpam(index + 'start', gamepad.start, () => {
          const { mode } = $.learn()
          const newMode = mode === romModes.play ? romModes.pause : romModes.play
          $.teach({
            mode: newMode
          })
        })

        toggleSpam('os', gamepad.os, () => {
          console.log('control the os')
        })

        toggleSpam(index + 'select', gamepad.start, () => {
          settingsOpen = !settingsOpen
        })

        if(gamepad.up === 1) {
          debounceSpam(index + 'up', 200, () => {
            circleIndex -= 1
          })
        }

        if(gamepad.down === 1) {
          debounceSpam(index + 'down', 200, () => {
            circleIndex += 1
          })
        }

        if(gamepad.left === 1) {
          debounceSpam(index + 'left', 200, () => {
            const nextOffset = offset - 1

            if(nextOffset < -24) return
            offset = nextOffset
          })
        }

        if(gamepad.right === 1) {
          debounceSpam(index + 'right', 200, () => {
            const nextOffset = offset + 1

            if(nextOffset > 24) return
            offset = nextOffset
          })
        }

        if(gamepad.a === 1) {
          notes.push(root)
        }

        if(gamepad.b === 1) {
          notes.push(root + 12)
        }

        if(gamepad.x === 1) {
          notes.push(root - 12)
        }

        if(gamepad.y === 1) {
          notes.push(root - 24)
        }

        if(gamepad.lb === 1) {
          notes.push(root + 24)
        }

        if(gamepad.rb === 1) {
          notes.push(root + 7)
        }

        if(gamepad.lt === 1) {
          notes.push(root - 7)
        }

        if(gamepad.rt === 1) {
          notes.push(root + 2)
        }

        const finishedNotes = activeNotes.filter(x => {
          return !notes.includes(x)
        })

        const newNotes = notes.filter(x => {
          return !activeNotes.includes(x)
        })

        releaseNotes(index, finishedNotes)
        attackNotes(index, newNotes)

        $.teach({
          id,
          offset,
          settingsOpen,
          circleIndex,
          activeNotes: notes
        }, mergePlayer(index))
      }
    })
  }
}

function releaseNotes(index, notes) {
  const instrument = playerInstruments[index]
  if(instrument && notes.length > 0) {
    notes.forEach(note => {
      instrument.synth.triggerRelease(Tone.Frequency(note, "midi").toNote());
    })
  }
}

function attackNotes(index, notes) {
  const instrument = playerInstruments[index]
  if(instrument && notes.length > 0) {
    notes.forEach(note => {
      instrument.synth.triggerAttack(Tone.Frequency(note, "midi").toNote());
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
      <div class="pause-menu"></div>
      <div class="split-screen">
        <div class="tile" data-slot="0"></div>
        <div class="tile" data-slot="1"></div>
        <div class="tile" data-slot="2"></div>
        <div class="tile" data-slot="3"></div>
      </div>
    `

  }
  requestAnimationFrame(() => {
    const { mode, tiles, players } = $.learn()

    if(target.dataset.mode !== mode) {
      target.dataset.mode = mode
    }

    const pauseMenu = target.querySelector('.pause-menu')
    if(mode === romModes.pause) {
      diffHTML.innerHTML(pauseMenu, renderPause())
      return
    } else {
      diffHTML.innerHTML(pauseMenu, '')
    }

    tiles.map((slot) => {
      const tile = target.querySelector(`.tile[data-slot="${slot}"]`)
      if(players[slot]) {
        const {
          settingsOpen,
          circleIndex,
          activeNotes,
          offset
        } = players[slot] || newPlayer
        const { label } = circleInfo(circleIndex)
        diffHTML.innerHTML(tile, settingsOpen ? `
          <div class="settings-menu" data-slot="${slot}">
            Settings for slot ${slot}
          </div>
        `: `
          ${activeNotes.map(midi => `
            ${midi}
          `).join('')}
          ${offset=== 0 ? label : offset}
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

function renderPause() {
  return `
    Menu paused
  `
}

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
