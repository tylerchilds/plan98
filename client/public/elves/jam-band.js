import elf from '@silly/elf'
import diffHTML from 'diffhtml'
import * as Tone from 'tone@next'
import { SampleLibrary } from '/cdn/attentionandlearninglab.com/Tonejs-Instruments.js'
import { systemMenu, renderPauseMenu } from './paper-pocket.js'

// load samples / choose 4 random instruments from the list //
const instruments = ['piano', 'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute', 'french-horn', 'guitar-acoustic', 'guitar-electric','guitar-nylon', 'harmonium', 'harp', 'organ', 'saxophone', 'trombone', 'trumpet', 'tuba', 'violin', 'xylophone']

Tone.Transport.start();

const defaultInstruments = ['piano', 'violin', 'saxophone', 'guitar-acoustic']

const playerInstruments = {
  0: null,
  1: null,
  2: null,
  3: null
}

loadInstrument(0, defaultInstruments[0])
loadInstrument(1, defaultInstruments[1])
loadInstrument(2, defaultInstruments[2])
loadInstrument(3, defaultInstruments[3])

function loadInstrument(slot, instrument) {
  playerInstruments[slot] = null
  const synth = SampleLibrary.load({
    instruments: instrument,
    baseUrl: (self.plan98.env.HEAVY_ASSET_CDN_URL || '') + "/private/tychi.1998.social/SourceCode/tonejs-instruments/samples/",
    onload() {
      synth.release = .5;
      synth.toDestination();

      playerInstruments[slot] = {
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
  { label: 'F#', midi: 54 },
  { label: 'C#', midi: 61 },
  { label: 'Ab', midi: 56 },
  { label: 'Eb', midi: 63 },
  { label: 'Bb', midi: 58 },
]

const noteLabels = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

const offsetValues = [];
for (let i = -24; i <= 24; i++) {
  offsetValues.push(i);
}

function circleInfo(slot) {
  return circle[mod(slot, circle.length)]
}

const newPlayer = {
  settingsOpen: false,
  circleIndex: 1,
  frequencyOffset: 0,
  activeNotes: [],
  settingsKey: 'instrument',
}

const $ = elf('jam-band', {
  pauseKey: Object.keys(systemMenu)[0],
  pauseIndex: 0,
  mode: romModes.play,
  tiles: [0,1,2,3],
  players: {
  },
  pauseMenu: systemMenu,
  settings: {
    instrument: {
      label: 'Instrument',
      description: 'Selected sound samples',
      options: instruments,
    },
    circleKey: {
      label: 'Key Signature',
      description: 'Harmonic root',
      options: noteLabels,
    },
    frequencyOffset: {
      label: 'Frequency Offset',
      description: 'Steps up or down from root',
      options: offsetValues,
    },
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

const sideEffects = {
  instrument: (value, slot) => {
    loadInstrument(slot, value)
  },
  circleKey: (value, slot) => {
    const circleIndex = circle.findIndex(x => x.label === value)
    $.teach({
      circleIndex
    }, mergePlayer(slot))
  },
}

function settingsChange(settingsKey, slot, nextValue) {
  if(sideEffects[settingsKey]) {
    sideEffects[settingsKey](nextValue, slot)
  }
}

function processPause(frameInputs) {
  frameInputs.forEach((data, slot) => {
    if(data) {
      const { id, gamepad } = data

      toggleSpam('start', gamepad.start, () => {
        $.teach({
          mode: romModes.play
        })
      })

      toggleSpam('select', gamepad.select, () => {
        $.teach({
          mode: romModes.play
        })
      })

      toggleSpam('up', gamepad.up, () => {
        const { pauseKey, pauseMenu, pauseIndex } = $.learn()
        const { list } = pauseMenu[pauseKey]
        const index = mod((pauseIndex - 1), list.length)
        $.teach({
          pauseIndex: index,
        })
      })

      toggleSpam('down', gamepad.down, () => {
        const { pauseKey, pauseMenu, pauseIndex } = $.learn()
        const { list } = pauseMenu[pauseKey]
        const index = mod((pauseIndex + 1), list.length)
        $.teach({
          pauseIndex: index,
        })
      })

      toggleSpam('left', gamepad.left, () => {
        const { pauseKey, pauseMenu } = $.learn()
        const keys = Object.keys(pauseMenu)
        const index = mod((keys.indexOf(pauseKey) - 1), keys.length)
        $.teach({
          pauseIndex: 0,
          pauseKey: keys[index]
        })
      })

      toggleSpam('right', gamepad.right, () => {
        const { pauseKey, pauseMenu } = $.learn()
        const keys = Object.keys(pauseMenu)
        const index = mod((keys.indexOf(pauseKey) + 1), keys.length)
        $.teach({
          pauseIndex: 0,
          pauseKey: keys[index]
        })
      })

      toggleSpam('b', gamepad.b, () => {
        $.teach({
          mode: romModes.play
        })
      })
    }
  })
}


function processSettings(players, slot, gamepad) {
  const { settings } = $.learn()

  const player = players[slot] || newPlayer
  const {
    settingsOpen,
    settingsKey
  } = player

  const data = {}

  toggleSpam(slot + 'start', gamepad.start, () => {
    $.teach({
      mode: romModes.pause
    })
  })


  toggleSpam(slot + 'select', gamepad.select, () => {
    $.teach({
      mode: romModes.play
    })
    data.settingsOpen = !settingsOpen
  })

  if(gamepad.up === 1) {
    debounceSpam(slot + 'up', 200, () => {
      const keys = Object.keys(settings)
      const index = mod((keys.indexOf(settingsKey) - 1), keys.length)
      data.settingsKey =  keys[index]
    })
  }

  if(gamepad.down === 1) {
    debounceSpam(slot + 'down', 200, () => {
      const keys = Object.keys(settings)
      const index = mod((keys.indexOf(settingsKey) + 1), keys.length)
      data.settingsKey =  keys[index]
    })
  }

  if(gamepad.left === 1) {
    debounceSpam(slot + 'left', 200, () => {
      const { options } = settings[settingsKey]
      const value = player[settingsKey]

      const index = options.indexOf(value)

      const nextIndex = mod(index - 1, options.length)
      const nextValue = options[nextIndex]
      settingsChange(settingsKey, slot, nextValue)

      console.log(settingsKey, nextValue)
      data[settingsKey] = nextValue
    })
  }

  if(gamepad.right === 1) {
    debounceSpam(slot + 'right', 200, () => {
      const { options } = settings[settingsKey]
      const value = player[settingsKey]

      const index = options.indexOf(value)

      const nextIndex = mod(index + 1, options.length)
      const nextValue = options[nextIndex]
      settingsChange(settingsKey, slot, nextValue)

      console.log(settingsKey, nextValue)
      data[settingsKey] = nextValue
    })
  }

  toggleSpam(slot+'b', gamepad.b, () => {
    $.teach({
      mode: romModes.play
    })
  })

  toggleSpam(slot+'a', gamepad.b, () => {
    $.teach({
      mode: romModes.play
    })
  })

  $.teach({
    ...data,
  }, mergePlayer(slot))
}

const rpcHandlers = {
  inputFrame(frameInputs) {
    const { players, tiles, mode } = $.learn()

    if(mode === romModes.pause) {
      const heldNotes = [...new Set(tiles.flatMap(slot => {
       const {
          activeNotes,
        } = players[slot] || newPlayer

        return activeNotes
      }))]

      console.log(heldNotes)
      processPause(frameInputs)
      return
    }

    frameInputs.forEach((data, slot) => {
      if(data) {
        const { id, gamepad } = data
        let player = players[slot]
        if(!player) {
          $.teach({
            ...newPlayer,
            id,
            instrument: defaultInstruments[slot],
            circleKey: 'C',
            frequencyOffset: 0
          }, mergePlayer(slot))
          player = $.learn().players[slot]
        }
        let {
          settingsOpen,
          circleIndex,
          activeNotes,
          frequencyOffset
        } = player

        if(settingsOpen) {
          processSettings(players, slot, gamepad)
          return
        }

        const { midi } = circleInfo(circleIndex)
        const root = midi + frequencyOffset
        const notes = []

        toggleSpam(slot + 'start', gamepad.start, () => {
          const { mode } = $.learn()
          const newMode = mode === romModes.play ? romModes.pause : romModes.play
          $.teach({
            mode: newMode
          })
        })

        toggleSpam('os', gamepad.os, () => {
          console.log('control the os')
        })

        toggleSpam(slot + 'select', gamepad.select, () => {
          $.teach({
            mode: romModes.play
          })

          settingsOpen = !settingsOpen
        })

        if(gamepad.up === 1) {
          debounceSpam(slot + 'up', 200, () => {
            circleIndex -= 1
          })
        }

        if(gamepad.down === 1) {
          debounceSpam(slot + 'down', 200, () => {
            circleIndex += 1
          })
        }

        if(gamepad.left === 1) {
          debounceSpam(slot + 'left', 200, () => {
            const nextOffset = frequencyOffset - 1

            if(nextOffset < -24) return
            frequencyOffset = nextOffset
          })
        }

        if(gamepad.right === 1) {
          debounceSpam(slot + 'right', 200, () => {
            const nextOffset = frequencyOffset + 1

            if(nextOffset > 24) return
            frequencyOffset = nextOffset
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

        releaseNotes(slot, finishedNotes)
        attackNotes(slot, newNotes)

        $.teach({
          id,
          frequencyOffset,
          settingsOpen,
          circleIndex,
          activeNotes: notes
        }, mergePlayer(slot))
      }
    })
  }
}

function releaseNotes(slot, notes) {
  const instrument = playerInstruments[slot]
  if(instrument && notes.length > 0) {
    notes.forEach(note => {
      instrument.synth.triggerRelease(Tone.Frequency(note, "midi").toNote());
    })
  }
}

function attackNotes(slot, notes) {
  const instrument = playerInstruments[slot]
  if(instrument && notes.length > 0) {
    notes.forEach(note => {
      instrument.synth.triggerAttack(Tone.Frequency(note, "midi").toNote());
    })
  }
}

function mergePlayer(slot) {
  return (state, payload) => {
    return {
      ...state,
      players: {
        ...state.players,
        [slot]: {
          ...state.players[slot],
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
    const { mode, tiles, players, settings } = $.learn()

    if(target.dataset.mode !== mode) {
      target.dataset.mode = mode
    }

    const pauseMenuNode = target.querySelector('.pause-menu')
    if(mode === romModes.pause) {
      diffHTML.innerHTML(pauseMenuNode, renderPause())
      return
    } else {
      diffHTML.innerHTML(pauseMenuNode, '')
    }

    tiles.map((slot) => {
      const tile = target.querySelector(`.tile[data-slot="${slot}"]`)
      if(players[slot]) {
        const player = players[slot] || newPlayer
        const {
          settingsKey,
          settingsOpen,
          circleIndex,
          activeNotes,
          frequencyOffset
        } = player
        const { label } = circleInfo(circleIndex)
        const offsetNoteIndex = noteLabels.findIndex(x => x === label) + frequencyOffset
        const offsetLabel = frequencyOffset=== 0
          ? label
          : noteLabels[mod(offsetNoteIndex, noteLabels.length)]

        diffHTML.innerHTML(tile, settingsOpen ? `
          <div class="settings-menu" data-slot="${slot}">
            <div class="menu-list">
              ${
                Object.keys(settings).map((key, i) => {
                  const setting = settings[key]
                  return `
                    <div aria-role="button" class="setting ${settingsKey === key ? 'focused':''}" data-key="${key}">
                      <div class="setting-label">
                        ${setting.label}
                      </div>
                      <div class="setting-description">
                        ${setting.description}
                      </div>
                      <div class="options-list">
                        <div class="setting-options">
                          ${setting.options.map((x) => {
                            return `
                              <button data-setting="${key}" data-value="${x}" class="option ${player[key] === x?'selected':''}">
                                ${x}
                              </button>
                            `
                          }).join('')}
                        </div>
                      </div>
                    </div>
                  `
                }).join('')
              }
            </div>
          </div>
        `: `
          <div class="player-hud">
            <div class="midi-notes">
              ${activeNotes.map(midi => `
                ${midi}
              `).join('')}
            </div>
            <div class="theory-label">
              ${offsetLabel}
            </div>
            <div class="instrument-label">
              ${playerInstruments[slot] ? playerInstruments[slot].name : 'loading...'}
            </div>
          </div>
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
}, {
  afterUpdate(target) {
    {
      const { settingsKey } = $.learn()

      if(target.settingsKey !== settingsKey) {
        target.settingsKey = settingsKey
        const active = target.querySelector('.setting.focused')

        if(active) {
          active.scrollIntoView()
        }
      }
    }

    {
      const active = target.querySelector('.setting.focused .option.selected')
      if(active) {
        active.scrollIntoView({
          block: "nearest",  // Keeps the vertical position as close as possible
          inline: "center"    // Scrolls only in the inline direction
        });
      }
    }

    {
      const active = target.querySelector('.application-list.active')
      if(active) {
        active.scrollIntoView()
      }
    }


  }
})

function renderPause() {
  const { pauseMenu, pauseIndex, pauseKey } = $.learn()
  return `
    <div class="pause-overlay">
      <div class="pause-menu">
        ${renderPauseMenu(pauseMenu, pauseIndex, pauseKey)}
      </div>
    </div>
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

  & .pause-menu {
    position: fixed;
    inset: 0;
    background: linear-gradient(335deg, rgba(255,255,255, .65), rgba(0,0,0,.65));
    backdrop-filter: blur(10px);
    display: none;
    z-index: 10;
  }

  & .application-list {
    height: 100%;
    overflow: auto;
    background:
      linear-gradient(335deg, var(--root-theme, lightgray), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-35deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      linear-gradient(-65deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      var(--root-theme, lightgray);
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & .pane-select {
    color: rgba(255,255,255,1);
    background: linear-gradient(335deg, rgba(0,0,0,.25), rgba(0,0,0,.65)), var(--root-theme);
    padding: 4px 8px;
    margin-bottom: 8px;
    font-weight: light;
    font-size: 2rem;
  }

  &[data-mode="${romModes.pause}"] .pause-menu {
    display: block;
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
    position: relative;
  }

  & .tile .player-hud {
    position: absolute;
    display: grid;
    padding: 1rem;
    gap: .5rem;
    max-width: 100%;
    width: 180px;
    grid-template-columns: 1fr auto;
  }

  & .theory-label {
    color: rgba(255,255,255,.5);
    font-weight: bold;
    font-size: 2rem;
    white-space: nowrap;
  }

  & .instrument-label {
    grid-column: -1 / 1;
    color: rgba(255,255,255,.65)
  }

  & .midi-notes {

  }

  & .tile[data-slot="0"] .player-hud {
    top: 1rem;
    left: 0;
    background: linear-gradient(335deg, rgba(0,0,0,.85), rgba(0,0,0,.65)), var(--green, mediumseagreen);
    border-radius: 0 1rem 1rem 0;
  }

  & .tile[data-slot="1"] .player-hud {
    top: 1rem;
    right: 0;
    background: linear-gradient(335deg, rgba(0,0,0,.85), rgba(0,0,0,.65)), var(--red, firebrick);
    border-radius: 1rem 0 0 1rem;
  }

  & .tile[data-slot="2"] .player-hud {
    bottom: 1rem;
    left: 0;
    background: linear-gradient(335deg, rgba(0,0,0,.85), rgba(0,0,0,.65)), var(--yellow, gold);
    border-radius: 0 1rem 1rem 0;
  }

  & .tile[data-slot="3"] .player-hud {
    bottom: 1rem;
    right: 0;
    background: linear-gradient(335deg, rgba(0,0,0,.85), rgba(0,0,0,.65)), var(--blue, dodgerblue);
    border-radius: 1rem 0 0 1rem;
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
