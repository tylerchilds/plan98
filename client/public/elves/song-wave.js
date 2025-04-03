import elf from '@silly/elf'
import diffHTML from 'diffhtml'
import * as Tone from 'tone@next'
import { SampleLibrary } from '/cdn/attentionandlearninglab.com/Tonejs-Instruments.js'

const defaultSystemUrl = '/app/home-entertainment'

// load samples / choose 4 random instruments from the list //
const instruments = ['piano', 'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute', 'french-horn', 'guitar-acoustic', 'guitar-electric','guitar-nylon', 'harmonium', 'harp', 'organ', 'saxophone', 'trombone', 'trumpet', 'tuba', 'violin', 'xylophone']

Tone.Transport.start();

const defaultInstruments = ['piano', 'piano', 'piano', 'piano']

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
  play: 'play',
  system: 'system'
}

function mod(x, n) {
  return ((x % n) + n) % n;
}

const circle = [
  { label: 'F', midi: 53 },
  { label: 'C', midi: 48 },
  { label: 'G', midi: 55 },
  { label: 'D', midi: 50 },
  { label: 'A', midi: 57 },
  { label: 'E', midi: 52 },
  { label: 'B', midi: 59 },
  { label: 'Fs', midi: 54 },
  { label: 'Cs', midi: 61 },
  { label: 'Ab', midi: 56 },
  { label: 'Eb', midi: 63 },
  { label: 'Bb', midi: 58 },
]

const noteLabels = ['C', 'Cs', 'D', 'Eb', 'E', 'F', 'Fs', 'G', 'Ab', 'A', 'Bb', 'B']

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
  enemies: noteLabels.reduce((enemies, label) => {
    enemies[label] = ['1']
    return enemies
  }, {})
}

const pauseMenu = {
  pause: {
    label: "Pause",
    list: [
      {
        label: 'New Game',
        action: 'new-game'
      },
    ]
  }
}

const $ = elf('song-wave', {
  pauseKey: Object.keys(pauseMenu)[0],
  pauseIndex: 0,
  mode: romModes.play,
  tiles: [0,1,2,3],
  systemUrl: defaultSystemUrl,
  players: {
  },
  pauseMenu,
  settings: {
    instrument: {
      label: 'Instrument',
      description: 'Selected sound samples',
      options: instruments,
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
}

function settingsChange(settingsKey, slot, nextValue) {
  if(sideEffects[settingsKey]) {
    sideEffects[settingsKey](nextValue, slot)
  }
}

function processSystem(frameInputs) {
  frameInputs.forEach((data, slot) => {
    if(data) {
      const { id, gamepad } = data
      toggleSpam(slot+'os', gamepad.os, () => {
        $.teach({
          mode: romModes.play
        })
      })

      toggleSpam(slot+'start', gamepad.start, () => {
        $.teach({
          mode: romModes.play
        })
      })

      toggleSpam(slot+'select', gamepad.select, () => {
        $.teach({
          mode: romModes.play
        })
      })
    }
  })
}


function processPause(frameInputs) {
  frameInputs.forEach((data, slot) => {
    if(data) {
      const { id, gamepad } = data

      toggleSpam(slot+'os', gamepad.os, () => {
        $.teach({
          mode: romModes.system,
          systemUrl: defaultSystemUrl
        })
      })

      toggleSpam(slot+'start', gamepad.start, () => {
        $.teach({
          mode: romModes.play
        })
      })

      toggleSpam(slot+'select', gamepad.select, () => {
        $.teach({
          mode: romModes.play
        })
      })

      toggleSpam(slot+'up', gamepad.up, () => {
        const { pauseKey, pauseMenu, pauseIndex } = $.learn()
        const { list } = pauseMenu[pauseKey]
        const index = mod((pauseIndex - 1), list.length)
        $.teach({
          pauseIndex: index,
        })
      })

      toggleSpam(slot+'down', gamepad.down, () => {
        const { pauseKey, pauseMenu, pauseIndex } = $.learn()
        const { list } = pauseMenu[pauseKey]
        const index = mod((pauseIndex + 1), list.length)
        $.teach({
          pauseIndex: index,
        })
      })

      toggleSpam(slot+'left', gamepad.left, () => {
        const { pauseKey, pauseMenu } = $.learn()
        const keys = Object.keys(pauseMenu)
        const index = mod((keys.indexOf(pauseKey) - 1), keys.length)
        $.teach({
          pauseIndex: 0,
          pauseKey: keys[index]
        })
      })

      toggleSpam(slot+'right', gamepad.right, () => {
        const { pauseKey, pauseMenu } = $.learn()
        const keys = Object.keys(pauseMenu)
        const index = mod((keys.indexOf(pauseKey) + 1), keys.length)
        $.teach({
          pauseIndex: 0,
          pauseKey: keys[index]
        })
      })

      toggleSpam(slot+'b', gamepad.b, () => {
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

  toggleSpam(slot+'os', gamepad.os, () => {
    $.teach({
      mode: romModes.system,
      systemUrl: defaultSystemUrl
    })
  })

  toggleSpam(slot+'start', gamepad.start, () => {
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

function releaseAll() {
  const { tiles, players } = $.learn()
  const heldNotes = [...new Set(tiles.flatMap(slot => {
   const {
      activeNotes,
    } = players[slot] || newPlayer

    return activeNotes
  }))]

  console.log(heldNotes)
}

const rpcHandlers = {
  inputFrame(frameInputs) {
    const { players, mode } = $.learn()

    if(mode === romModes.system) {
      releaseAll()
      processSystem(frameInputs)
      return
    }

    if(mode === romModes.pause) {
      releaseAll()
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

        toggleSpam(slot+'start', gamepad.start, () => {
          const { mode } = $.learn()
          const newMode = mode === romModes.play ? romModes.pause : romModes.play
          $.teach({
            mode: newMode
          })
        })

        toggleSpam(slot+'os', gamepad.os, () => {
          $.teach({
            mode: romModes.system,
            systemUrl: defaultSystemUrl
          })
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
            let nextOffset = frequencyOffset - 1

            if(nextOffset <= -24) {
              nextOffset = 24
            }
            frequencyOffset = nextOffset
          })
        }

        if(gamepad.right === 1) {
          debounceSpam(slot + 'right', 200, () => {
            let nextOffset = frequencyOffset + 1

            if(nextOffset >= 24) {
              nextOffset = -24
            }
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
          notes.push(root + 2)
        }

        if(gamepad.lb === 1) {
          notes.push(root + 7)
        }

        if(gamepad.rb === 1) {
          notes.push(root - 7)
        }

        if(gamepad.lt === 1) {
          notes.push(root + 5)
        }

        if(gamepad.rt === 1) {
          notes.push(root - 5)
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
  const { partyId, variation } = target.dataset

  if(!target.innerHTML) {
    target.innerHTML = `
      <div class="system-container"></div>
      <div class="pause-container"></div>
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

    const systemContainer = target.querySelector('.system-container')
    if(mode === romModes.system) {
      const { systemUrl } = $.learn()
      diffHTML.innerHTML(systemContainer, `
        <iframe src="${systemUrl}"></iframe>
      `)
      return
    } else {
      diffHTML.innerHTML(systemContainer, '')
    }


    const pauseContainer = target.querySelector('.pause-container')
    if(mode === romModes.pause) {
      diffHTML.innerHTML(pauseContainer, renderPause())
      return
    } else {
      diffHTML.innerHTML(pauseContainer, '')
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

        if(settingsOpen) {
          diffHTML.innerHTML(tile, `
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
          `)
        } else {
          diffHTML.innerHTML(tile, `
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
            <div class="camera" data-slot="${slot}">
              ${renderCamera(slot, player, { offsetLabel })}
            </div>
          `)
        }
      } else {
        if(tile.querySelector('qr-code')) return
        const url = plan98.env.PLAN98_PEER
          ?`http://${plan98.env.PLAN98_PEER}`
          :`${window.location.origin}`
        diffHTML.innerHTML(tile, `
          <div class="no-player-yet" data-slot="${slot}">
            <div class="join-code" data-slot="${slot}">
              <qr-code target="_blank" data-bg="transparent" src="${url}/app/couch-coop?id=${partyId}&slot=${slot}&controller=true&variation=elegant"></qr-code>
            </div>
          </div>
        `)
      }
    })

    afterUpdate(target)
  })
})

function afterUpdate(target) {
  {
    const { tiles, players } = $.learn()
    tiles.forEach(slot => {
      const player = players[slot] || newPlayer
      const { settingsKey, settingsOpen } = player
      if(!settingsOpen) return

      {
        const column = target.querySelector(`.tile[data-slot="${slot}"] .setting.focused .option.selected`)
        if(column && target[slot + 'column'] !== player[settingsKey]) {
          target[slot + 'column'] = player[settingsKey]
          column.scrollIntoView({
            inline: "center"    // Scrolls only in the inline direction
          });
        }
      }
      {
         const row = target.querySelector(`.tile[data-slot="${slot}"] .setting.focused`)
        if(row && target[slot + 'row'] !== settingsKey) {
          target[slot + 'row'] = settingsKey
          row.scrollIntoView({
            block: "start"
          })
        }
      }
    })
  }

  {
    const { mode } = $.learn()
    if(mode === romModes.pause) {
      const active = target.querySelector('.menu-link.active')
      if(active) {
        active.scrollIntoView()
      }
    }
  }
}

function renderCamera(slot, player, data) {
  return `
    <div class="skybox">
      <div class="floor">
        <div class="ufo-grid">
          ${renderUFOs()}
        </div>
        <div class="wave-grid">
          ${renderEnemies(slot, player)}
        </div>
        <div class="piano">
          ${renderPiano(slot, data.offsetLabel)}
        </div>
      </div>
    </div>
  `
}

const pianoKeys = [
  { type: 'natural', key: "C" },
  { type: 'natural', key: "D" },
  { type: 'natural', key: "E" },
  { type: 'natural', key: "F" },
  { type: 'natural', key: "G" },
  { type: 'natural', key: "A" },
  { type: 'natural', key: "B" },
  { type: 'accidental', key: "Cs" },
  { type: 'accidental', key: "Eb" },
  { type: 'accidental', key: "Fs" },
  { type: 'accidental', key: "Ab" },
  { type: 'accidental', key: "Bb" },
]

function renderUFOs() {
  return pianoKeys.map(x => {
    return `
      <div class="attack-lane ${x.type}" data-key="${x.key}"></div>
    `
  }).join('')
}

function renderEnemies(slot, player) {
  const { enemies } = player
  return pianoKeys.map(x => {
    const enemiesByType = enemies[x.key]
    return `
      <div class="attack-lane ${x.type}" data-key="${x.key}">
        ${enemiesByType.map(x => {
          return `
            <div class="enemy-sprite"></div>
          `
        }).join('')}
      </div>
    `
  }).join('')
}

function renderPiano(slot, offsetLabel) {
  return pianoKeys.map(x => {
    return `
      <button class="${x.type}" data-key="${x.key}">
        ${x.key === offsetLabel ? `<div class="player-sprite" data-slot="${slot}"></div>`:''}
      </button>

    `
  }).join('')
}

function renderPause() {
  const { pauseMenu, pauseIndex, pauseKey } = $.learn()
  const { list, label } = pauseMenu[pauseKey]

  const items = list.map((item, i) => {
    const { label, mode, url } = item
    return `
      <button ${url? `data-href="${url}"`:''} ${mode ? `data-mode="${mode}"`:''} data-index="${i}" class="menu-link ${pauseIndex === i ? 'active':''}">
        ${label}
      </button>
    `
  }).join('')

  return `
    <div class="pause-overlay">
      <div class="pause-menu">
        <div class="pause-label">${label}</div>
        <div class="pause-list">
          ${items}
        </div>
      </div>
    </div>
  `
}

$.when('animationend', '.enemy-sprite', (event) => {
  console.log('enemy attacked')
})

$.when('click', '.menu-link', (event) => {
  const { href, index } = event.target.dataset

  const pauseIndex = parseInt(index)

  if(href) {
    $.teach({
      pauseIndex,
      mode: romModes.system,
      systemUrl: href
    })
    return
  }
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

  & .pause-container {
    position: fixed;
    inset: 0;
    background: linear-gradient(335deg, rgba(255,255,255, .65), rgba(0,0,0,.65));
    backdrop-filter: blur(10px);
    display: none;
    z-index: 10;
  }

  &[data-mode="${romModes.pause}"] .pause-container {
    display: block;
  }

  & .system-container {
    position: fixed;
    inset: 0;
    background: linear-gradient(335deg, rgba(255,255,255, .65), rgba(0,0,0,.65));
    backdrop-filter: blur(10px);
    display: none;
    z-index: 100;
  }

  &[data-mode="${romModes.system}"] .system-container {
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
    gap: .5rem;
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
    z-index: 110;
  }

  & .theory-label {
    color: rgba(255,255,255,.5);
    font-weight: bold;
    font-size: 2rem;
    white-space: nowrap;
    line-height: 1;
  }

  & .instrument-label {
    grid-column: -1 / 1;
    color: rgba(255,255,255,.65)
  }

  & .midi-notes {
    line-height: 1;
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
    top: 1rem;
    left: 0;
    background: linear-gradient(335deg, rgba(0,0,0,.85), rgba(0,0,0,.65)), var(--yellow, gold);
    border-radius: 0 1rem 1rem 0;
  }

  & .tile[data-slot="3"] .player-hud {
    top: 1rem;
    right: 0;
    background: linear-gradient(335deg, rgba(0,0,0,.85), rgba(0,0,0,.65)), var(--blue, dodgerblue);
    border-radius: 1rem 0 0 1rem;
  }

  & .player-sprite {
    width: 100%;
    height: 100%;
    border-radius: 100%;
  }

  & .player-sprite[data-slot="0"] {
    background: var(--green, mediumseagreen);
    border-radius: 100%;
  }

  & .player-sprite[data-slot="1"] {
    background: var(--red, firebrick);
    border-radius: 100%;
  }

  & .player-sprite[data-slot="2"] {
    background: var(--yellow, gold);
    border-radius: 100%;
  }

  & .player-sprite[data-slot="3"] {
    background: var(--blue, dodgerblue);
    border-radius: 100%;
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


  & .pause-menu {
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

  & .pause-label {
    color: rgba(255,255,255,1);
    background: linear-gradient(335deg, rgba(0,0,0,.25), rgba(0,0,0,.65)), var(--root-theme);
    padding: 4px 8px;
    margin-bottom: 8px;
    font-weight: light;
    font-size: 2rem;
  }

  & .menu-list {
    height: 100%;
    overflow: auto;
    background:
      linear-gradient(335deg, var(--root-theme, lightgray), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-35deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      linear-gradient(-65deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      var(--root-theme, lightgray);
  }

  & .options-list {
    overflow-x: auto;
    max-width: 100%;
  }

  & .setting {
    display: block;
    padding: 4px 8px;
    border: none;
    background: rgba(0,0,0,.15);
    color: white;
    display: inline-block;
    gap: 1rem;
    max-width: 100%;
    width: 100%;
    margin-bottom: 4px;
  }

  & .setting:not(.focused) > * {
    pointer-events: none;
  }

  & .setting.focused .message-body {
    font-weight: bold;
  }

  & .setting-label {
    color: rgba(255,255,255,.85);
    font-weight: bold;
  }

  & .setting-description {
    color: rgba(255,255,255,.65);
  }

  & .setting.focused .setting-label {
    color: rgba(0,0,0,.85);
    font-weight: bold;
  }

  & .setting.focused .setting-description {
    color: rgba(0,0,0,.65);
  }

  & .setting-options {
    display: flex;
    gap: 4px;
    padding: 8px 0;
  }

  & .setting-options .option:not(.selected) {
    display: none;
  }

  & .setting.focused {
    color: black;
    background: white;
  }

  & .setting.focused .option {
    display: block;
  }

  & .option.selected {
    display: block;
  }

  & .option {
    border: none;
    border-radius: 2px;
    white-space: nowrap;
    padding: 4px 8px;
  }

  & .option.selected {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--root-theme, black);
    color: white;
  }

  & .pause-list {
    overflow-y: visible;
  }

  & .menu-link {
    color: white;
    display: block;
    text-decoration: none;
    padding: 4px 8px;
    line-height: 1;
    text-align: left;
    background: transparent;
    border: none;
    font-weight: 600;
    opacity: .65;
  }

  & .menu-link.active {
    color: white;
    transform: scale(1.2);
    transform-origin: left center;
    font-weight: bold;
    opacity: 1;
    border-left: 2px solid var(--root-theme);
  }

  & .camera {
    height: 100%;
    width: 100%;
  }

  & .skybox {
    display: grid;
    background: linear-gradient(rgba(0,0,0,.95), rgba(0,0,0,.65)), var(--blue, dodgerblue);
    grid-template-areas: 'skybox';
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
    z-index: 100;
    perspective-origin: center;
    perspective: 500px;
    transform-style: preserve-3d;
  }

  & .skybox .floor {
    background: linear-gradient(rgba(0,0,0,.95), rgba(0,0,0,.65)), var(--green, mediumseagreen);
    transform-origin: bottom;
    transform: rotateX(60deg) translate(0, 0);
    position: relative;
    margin-left: -50%;
    margin-right: -50%;
   transform-style: preserve-3d;
  }

  & .ufo-grid,
  & .wave-grid {
    grid-template-columns: repeat(7, 1fr);
    grid-template-areas: "C D E F G A B";
    display: grid;
    height: 100%;
    width: 50%;
    margin: auto;
  }

  & .wave-grid {
    opacity: .75;
    position: relative;
    z-index: 4;
  }

  & .wave-grid::before{
    content: '';
    background: linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.85));
    z-index: 2;
    position: absolute;
    inset: 0;
  }

  & .ufo-grid {
    opacity: .65;
    transform: rotateX(-15deg) translateY(-50%);
    position: absolute;
    margin: auto;
    left: 0;
    right: 0;
    top: -15%;
    height: 30%;
  }

  & .ufo-grid .attack-lane {
    clip-path: polygon(100% 100%, 50% 0%, 0% 100%);
  }

  & .ufo-grid .attack-lane::before {
    content: '';
    background: linear-gradient(rgba(255,255,255,.75), rgba(0,0,0,.25));
    opacity: .85;
    z-index: 2;
    position: absolute;
    inset: 0;
  }

  & .attack-lane {
    display: grid;
    grid-area: lane;
    position: relative;
  }

  & .attack-lane.natural {
  }

  & .attack-lane.accidental {
    width: 50%;
  }

  & .piano {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-areas: "C D E F G A B";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 50%;
    margin: auto;
    transform-origin: bottom;
    transform-style: preserve-3d;
    z-index: 10;
  }

  & .piano [data-key] {
    border: none;
    border-radius: 3px;
    width: 100%;
    aspect-ratio: 1;
    z-index: 5;
    opacity: .65;
    display: grid;
    place-items: center;
  }

  & .piano .accidental .player-sprite {
    opacity: .65;
  }

  & .piano .natural[data-key] {
    background: white;
    border: 1px solid black;
    padding: 25%;
  }

  & .piano .accidental[data-key] {
    background: black;
    z-index: 6;
    width: 50%;
    border: 1px solid black;
    opacity: 1;
    padding: 10%;
  }

  & .attack-lane[data-key="C"] {
    background: var(--green, mediumseagreen);
  }

  & .attack-lane[data-key="Cs"] {
    background:
      linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.65)),
      linear-gradient(90deg, var(--blue, dodgerblue), var(--green, mediumseagreen));
  }

  & .attack-lane[data-key="D"] {
    background: var(--blue, dodgerblue);
  }

  & .attack-lane[data-key="Eb"] {
    background:
      linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.65)),
      linear-gradient(90deg, var(--indigo, slateblue), var(--blue, dodgerblue));
  }

  & .attack-lane[data-key="E"] {
    background: var(--indigo, slateblue);
  }

  & .attack-lane[data-key="F"] {
    background: var(--purple, mediumpurple);
  }

  & .attack-lane[data-key="Fs"] {
    background:
      linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.65)),
      linear-gradient(90deg, var(--red, firebrick), var(--purple, mediumpurple));
  }

  & .attack-lane[data-key="G"] {
    background: var(--red, firebrick);
  }

  & .attack-lane[data-key="Ab"] {
    background: 
      linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.65)),
      linear-gradient(90deg, var(--orange, darkorange), var(--red, firebrick));
  }

  & .attack-lane[data-key="A"] {
    background: var(--orange, darkorange);
  }

  & .attack-lane[data-key="Bb"] {
    background:
      linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.65)),
      linear-gradient(90deg, var(--yellow, gold), var(--orange, darkorange));
  }

  & .attack-lane[data-key="B"] {
    background: var(--yellow, gold);
  }

  & .attack-lane[data-key="C"],
  & .piano [data-key="C"] {
    grid-area: C;
  }

  & .attack-lane[data-key="Cs"],
  & .piano [data-key="Cs"] {
    grid-area: D;
    transform: translate(-50%, 0);
  }

  & .attack-lane[data-key="D"],
  & .piano [data-key="D"] {
    grid-area: D;
  }

  & .attack-lane[data-key="Eb"],
  & .piano [data-key="Eb"] {
    grid-area: E;
    transform: translate(-50%, 0);
  }

  & .attack-lane[data-key="E"],
  & .piano [data-key="E"] {
    grid-area: E;
  }

  & .attack-lane[data-key="F"],
  & .piano [data-key="F"] {
    grid-area: F;
  }

  & .attack-lane[data-key="Fs"],
  & .piano [data-key="Fs"] {
    grid-area: G;
    transform: translate(-50%, 0);
  }

  & .attack-lane[data-key="G"],
  & .piano [data-key="G"] {
    grid-area: G;
  }

  & .attack-lane[data-key="A"],
  & .piano [data-key="A"] {
    grid-area: A;
  }

  & .attack-lane[data-key="Ab"],
  & .piano [data-key="Ab"] {
    grid-area: A;
    transform: translate(-50%, 0);
  }

  & .attack-lane[data-key="B"],
  & .piano [data-key="B"] {
    grid-area: B;
  }

  & .attack-lane[data-key="Bb"],
  & .piano [data-key="Bb"] {
    grid-area: B;
    transform: translate(-50%, 0);
  }

  & .enemy-sprite {
    grid-area: lane;
    z-index: 4;
    transform-style: preserve-3d;
    position: absolute;
    inset: calc(100%/7*-1) 0 calc(100%/7);
    animation: &-enemy-slide 5000ms linear forwards;
    padding: 0 15%;
  }

  & .attack-lane.natural .enemy-sprite {
    padding: 0 33%;
  }

  & .enemy-sprite::before {
    content: '';
    width: 100%;
    aspect-ratio: 1;
    border-radius: 100%;
    background-color: white;
    display: block;
  }

  @keyframes &-enemy-slide {
    0% {
      transform: translateY(0);
    }

    100% {
      transform: translateY(100%);
    }
  }
`)
