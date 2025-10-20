import elf from '@silly/elf'
import diffHTML from 'diffhtml'
import * as Tone from 'tone@next'
import { SampleLibrary } from '/public/cdn/attentionandlearninglab.com/Tonejs-Instruments.js'
import { systemMenu, getTheme } from './paper-pocket.js'
import { gamestateUplink, gamestateDownlink } from './couch-coop.js'

// load samples / choose 4 random instruments from the list //
const instruments = ['piano', 'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute', 'french-horn', 'guitar-acoustic', 'guitar-electric','guitar-nylon', 'harmonium', 'harp', 'organ', 'saxophone', 'trombone', 'trumpet', 'tuba', 'violin', 'xylophone']

const scoringTypes = ['cooperative', 'competitive']

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

const attributes = {
  'STR': 'Strength',
  'DEX': 'Dexterity',
  'CON': 'Constitution',
  'INT': 'Intelligence',
  'WIS': 'Wisdom',
  'CHA': 'Charisma',
}

const ancestries = [
  'Dwarf',
  'Elf',
  'Gnome',
  'Halfling',
  'Human',
  'Leshy',
  'Orc',
]

const classes = [
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Ranger',
  'Rogue',
  'Witch',
  'Wizard',
]

const ethics = ["Lawful", "Neutral", "Chaotic"]
const morals = ["Good", "Neutral", "Evil"]

const skills = [
  'Acrobatics',
  'Arcana',
  'Athletics',
  'Crafting',
  'Deception',
  'Diplomacy',
  'Intimidation',
  'Lore',
  'Medicine',
  'Nature',
  'Occultism',
  'Performance',
  'Religion',
  'Society',
  'Stealth',
  'Survival',
  'Thievery',
]

const bpmOptions = ['20', '40', '60', '80', '100', '120', '140', '160', '180', '200', '220', '240', '280', '300', '320', '340', '360']
const noteDurationOptions = ['4m', '2m', '1m', '1n', '2n', '4n', '8n', '16n', '32n', '64n']

export function getBpmOptions() {
  return bpmOptions
}

export function setNoteDuration(duration) {
  $.teach({ noteDuration: duration })
}

export function getNoteDuration() {
  if(!$) return '4n'
  return $.learn().notDuration || '4n'
}

export function getNoteDurationOptions() {
  return noteDurationOptions
}

export function setBpm(bpm) {
  Tone.Transport.bpm.value = parseInt(bpm)
  $.teach({ bpm })
}

export function getBpm() {
  if(!$) return '20'
  return $.learn().bpm || '20'
}

const settings = {
  instrument: {
    label: 'Instrument',
    description: 'What honk are you?',
    options: instruments,
  },
  scoringType: {
    label: 'Scoring',
    description: 'How should the waves be counted, together or separate?',
    options: scoringTypes,
  },
  classy: {
    label: 'Class',
    description: 'What make are you?',
    options: classes
  },
  ancestry: {
    label: 'Ancestry',
    description: 'What model are you?',
    options: ancestries
  },
  ethics: {
    label: 'Ethicaleathality',
    description: 'Your ethical intake to enact reality to the degree of which is',
    options: ethics
  },
  moral: {
    label: 'Moraleousidacery',
    description: 'Your moral guideline democracy worldview philosophy engine',
    options: morals
  },
  skill: {
    label: 'Skill',
    description: 'The thing you practice the most',
    options: skills
  },
  bpm: {
    label: 'Beats per minute',
    description: 'The score multiplier per note played and speed of the track',
    options: getBpmOptions(),
  },
  noteDuration: {
    label: 'Note Duration',
    description: 'TBD, the timing window for critial hits',
    options: getNoteDurationOptions(),
  },
}


function loadInstrument(slot, instrument) {
  playerInstruments[slot] = null
  const synth = SampleLibrary.load({
    instruments: instrument,
    baseUrl: (self.plan98.env.HEAVY_ASSET_CDN_URL || '') + "/private/tychi.1998.social/SourceCode/tonejs-instruments/samples/",
    onload() {
      Tone.Transport.bpm.value = parseInt(getBpm())
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

function newEnemies() {
  return noteLabels.reduce((enemies, label) => {
    // yeileds { 'Cs': [] }
    enemies[label] = {}
    return enemies
  }, {})
}

function newScore() {
  return 0
}

const MAX_HEALTH = 24
function newHealth() {
  return MAX_HEALTH
}

const newPlayer = {
  score: newScore(),
  health: newHealth(),
  maxHealth: MAX_HEALTH,
  streak: 0,
  enemies: newEnemies(),
  settingsOpen: false,
  circleIndex: 1,
  frequencyOffset: 0,
  activeNotes: [],
  scoringType: 'cooperative',
  classy: 'Bard',
  skill: 'Crafting',
  ancestry: 'Human',
  ethics: 'Neutral',
  moral: 'Neutral',
  settingsKey: 'instrument',
  bpm: '20',
  noteDuration: '4n',
}

const pauseMenu = {
  pause: {
    label: "Pause",
    list: [
      {
        label: 'New Game',
        action: 'new-game'
      },
      {
        label: 'Restart',
        action: 'restart'
      },
    ]
  }
}

const $ = elf('player-piano', {
  systemKey: Object.keys(systemMenu)[0],
  systemIndex: 0,
  pauseKey: Object.keys(pauseMenu)[0],
  pauseIndex: 0,
  mode: romModes.play,
  tiles: [0,1,2,3],
  players: {},
  pauseMenu,
  systemMenu,
  settings
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
  bpm: (value) => {
    setBpm(value)
  },
  noteDuration: (value) => {
    setNoteDuration(value)
  },
}

function settingsChange(settingsKey, slot, nextValue) {
  if(sideEffects[settingsKey]) {
    sideEffects[settingsKey](nextValue, slot)
  }
}

function launchSystemUrl(event) {
  const { systemKey, systemMenu, systemIndex } = $.learn()
  const { list } = systemMenu[systemKey]
  const { url } = list[systemIndex]

  if(url) {
    $.teach({ systemUrl: url })
  }
}

const actionEffects = {
  'new-game': () => {
    const { players, tiles } = $.learn()

    tiles.map((slot) => {
      if(players[slot]) {
        $.teach({
          dead: false,
          settingsOpen: false,
          streak: 0,
          score: newScore(),
          health: newHealth(),
          enemies: newEnemies()
        }, mergePlayer(slot))
      }
    })

    $.teach({
      mode: romModes.play
    })

    setBpm(bpmOptions[0])
    difficultyLoop()
  },
  'restart': () => {
    $.teach({
      systemUrl: null,
      mode: romModes.system
    })
  }
}

function triggerActionEffects(mode) {
  if(actionEffects[mode]) {
    actionEffects[mode]()
  }
}

function launchGameAction(event) {
  const { pauseKey, pauseMenu, pauseIndex } = $.learn()
  const { list } = pauseMenu[pauseKey]
  const { action } = list[pauseIndex]

  if(action) {
    triggerActionEffects(action)
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

      toggleSpam(slot+'a', gamepad.a, () => {
        launchSystemUrl()
      })

      toggleSpam(slot+'up', gamepad.up, () => {
        const { systemKey, systemMenu, systemIndex } = $.learn()
        const { list } = systemMenu[systemKey]
        const index = mod((systemIndex - 1), list.length)
        $.teach({
          systemIndex: index,
        })
      })

      toggleSpam(slot+'down', gamepad.down, () => {
        const { systemKey, systemMenu, systemIndex } = $.learn()
        const { list } = systemMenu[systemKey]
        const index = mod((systemIndex + 1), list.length)
        $.teach({
          systemIndex: index,
        })
      })

      toggleSpam(slot+'left', gamepad.left, () => {
        const { systemKey, systemMenu } = $.learn()
        const keys = Object.keys(systemMenu)
        const index = mod((keys.indexOf(systemKey) - 1), keys.length)
        $.teach({
          systemIndex: 0,
          systemKey: keys[index]
        })
      })

      toggleSpam(slot+'right', gamepad.right, () => {
        const { systemKey, systemMenu } = $.learn()
        const keys = Object.keys(systemMenu)
        const index = mod((keys.indexOf(systemKey) + 1), keys.length)
        $.teach({
          systemIndex: 0,
          systemKey: keys[index]
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

      toggleSpam(slot+'a', gamepad.a, () => {
        launchGameAction()
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
          notes.push(root + 2)
        }

        if(gamepad.x === 1) {
          notes.push(root - 2)
        }

        if(gamepad.y === 1) {
          notes.push(root - 6)
        }

        if(gamepad.lb === 1) {
          notes.push(root - 3)
        }

        if(gamepad.rb === 1) {
          notes.push(root + 3)
        }

        if(gamepad.lt === 1) {
          notes.push(root - 4)
        }

        if(gamepad.rt === 1) {
          notes.push(root + 4)
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
      score(slot, note)
      instrument.synth.triggerAttack(Tone.Frequency(note, "midi").toNote());
    })
  }
}

function score(slot, note) {
  const { players } = $.learn()

  if(players[slot] && !players[slot].dead) {
    const { enemies, score, streak, scoringType } = players[slot]
    const noteLabel = noteLabels[mod(note, noteLabels.length)]
    const alive = Object.keys(enemies[noteLabel])

    if(alive.length > 0) {
      const { bpm } = enemies[noteLabel][alive[0]]

      const newStreak = streak + 1
      const streakMultiplier = parseInt(streak / 8 ) + 1
      const nextScore = score + ((bpm || 20) * streakMultiplier)
      const newEnemies = remove(alive[0], noteLabel, enemies)
      const nextFrame = {
        score: nextScore,
        enemies: newEnemies,
        streak: newStreak
      }

      if(scoringType === 'cooperative') {
        syncBoard(nextFrame)
      } else {
        $.teach(nextFrame, mergePlayer(slot))
      }
    } else {
      $.teach({ streak: 0 }, mergePlayer(slot))
    }
  }
}

function remove(id, noteLabel, enemies) {

  const stillAlive = {}
  for(const key in enemies[noteLabel]) {
    if(enemies[noteLabel][key].id !== id) {
      stillAlive[key] = enemies[noteLabel][key]
    }
  }

  return {
    ...enemies,
    [noteLabel]: { ... stillAlive }
  }
}

function syncBoard(nextFrame) {
  const { players, tiles } = $.learn()
  tiles.map((slot) => {
    if(players[slot]) {
      $.teach(nextFrame, mergePlayer(slot))
    }
  })
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

function displayByMode(target, state, callback) {
  const { mode } = state
  if(target.dataset.mode !== mode) {
    target.dataset.mode = mode
  }

  const systemContainer = target.querySelector('.system-container')
  if(mode === romModes.system) {
    diffHTML.innerHTML(systemContainer, renderSystem(state))
    return
  }


  const pauseContainer = target.querySelector('.pause-container')
  if(mode === romModes.pause) {
    diffHTML.innerHTML(pauseContainer, renderPause(state))
    return
  } else {
    diffHTML.innerHTML(pauseContainer, '')
  }

  callback()
}

gamestateDownlink((data) => {
  if(!data.elf) return
  const { elf, partyId, snapshot } = data
  if(elf === $.link) {
    $.teach({ [partyId]: { snapshot } })
  }
})


$.draw((target) => {
  const { partyId, slot, solo, variation } = target.dataset

  if(slot && solo === "true") {
    if(!target.innerHTML) {
      //listenForGamestateSnapshot(target)
      target.innerHTML = `
        <div class="system-container"></div>
        <div class="pause-container"></div>
        <div class="solo-screen">
          <div class="tile" data-slot="${slot}"></div>
        </div>
      `
    }

    requestAnimationFrame(() => {
      const { snapshot } = $.learn()[partyId] || {}

      const tile = target.querySelector(`.tile[data-slot="${slot}"]`)
      if(snapshot) {
        displayByMode(target, snapshot, function singleFps() {
          const { mode, players } = snapshot
          if(players[slot]) {
            const player = players[slot] || newPlayer
            renderTile(tile, parseInt(slot), player)

            {
              if(mode === romModes.pause || mode === romModes.system) {
                const active = target.querySelector('.menu-link.active')
                if(active) {
                  active.scrollIntoView()
                }
              }
            }

            {
              if(mode === romModes.play) {
                const active = target.querySelector('.solo-screen .wave-grid .active-lane')
                if(active && active.dataset.key !== target.lastActiveKey) {
                  target.lastActiveKey = active.dataset.key
                  active.scrollIntoView({
                    block: 'nearest',
                    inline: 'center'
                  })
                }
              }
            }

            const { settingsKey, settingsOpen } = player
            if(!settingsOpen) return

            {
              const column = target.querySelector(`.tile[data-slot="${slot}"] .setting.focused .option.selected`)
              if(column && target[slot + 'column'] !== player[settingsKey]) {
                target[slot + 'column'] = player[settingsKey]
                column.scrollIntoView({
                  inline: "center"    // Scrolls only in the inline direction
                });
                const row = target.querySelector(`.tile[data-slot="${slot}"] .setting.focused`)
                if(row) {
                  row.scrollIntoView({
                    block: "start"
                  })
                }
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
          }
        })
      } else {
        diffHTML.innerHTML(tile, '<flying-disk></flying-disk>')
      }

      afterPeerUpdate(target)
    })

    return
  } else {
    if(!target.innerHTML) {
      target.innerHTML = `
        <div class="newgame-container">
          <p>
            You're a band of misadventurers. Play the piano if you want to survive.
          </p>

          <p>
            Touch the screen or any key to continue.
          </p>
        </div>
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
      gamestateUplink({ elf: $.link, partyId, snapshot: $.learn() })
      displayByMode(target, $.learn(), function multiSplit3ps() {
        const { tiles, players } = $.learn()
        tiles.map((slot) => {
          const tile = target.querySelector(`.tile[data-slot="${slot}"]`)
          if(players[slot]) {
            const player = players[slot] || newPlayer
            renderTile(tile, slot, player)
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
      })

      afterHostUpdate(target)
    })
  }
})

function renderTile(tile, slot, player) {
  const {
    settingsKey,
    settingsOpen,
    circleIndex,
    activeNotes,
    frequencyOffset,
    ancestry,
    classy,
    moral,
    skill,
    ethics,
    score,
    instrument,
    maxHealth,
    health,
    dead
  } = player

  //const instrument = playerInstruments[slot] ? playerInstruments[slot].name : 'loading...'
  const { label } = circleInfo(circleIndex)
  const offsetNoteIndex = noteLabels.findIndex(x => x === label) + frequencyOffset
  const offsetLabel = frequencyOffset=== 0
    ? label
    : noteLabels[mod(offsetNoteIndex, noteLabels.length)]

  tile.dataset.dead = dead

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
        <div class="health-label">
          <div class="health-bar" style="--health-width: calc(${health} / ${maxHealth} * 100%)"></div>
        </div>
        <div class="score-label">
          ${score}
        </div>
      </div>
      <div class="perspective" data-slot="${slot}">
        ${renderCamera(slot, player, { offsetLabel })}
        <div class="game-over">
          A one-of-a-kind ${ancestry} of ${moral} moral. And the most ${ethics} ${classy}. From your sheer talent on the ${instrument}, to your passion for ${skill}, you will be remembered. Rest in peace. <strong>Final Score: ${score}</strong><br><br>Play Again?
        </div>
      </div>
      <div class="minimap">${renderMinimap(slot,player, { offsetLabel })}</div>
    `)
  }
}

function afterPeerUpdate(target) {
  
  {
    const theme = getTheme()
    if(target.theme !== theme) {
      target.theme = theme
      document.body.style.setProperty('--root-theme', theme)
    }
  }
}


function afterHostUpdate(target) {
  {
  }
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
          const row = target.querySelector(`.tile[data-slot="${slot}"] .setting.focused`)
          if(row) {
            row.scrollIntoView({
              block: "start"
            })
          }
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
    if(mode === romModes.pause || mode === romModes.system) {
      const active = target.querySelector('.menu-link.active')
      if(active) {
        active.scrollIntoView()
      }
    }
  }

  {
    const theme = getTheme()
    if(target.theme !== theme) {
      target.theme = theme
      document.body.style.setProperty('--root-theme', theme)
    }
  }
}

function renderCamera(slot, player, data) {
  return `
    <div class="skybox">
      <div class="floor">
        <div class="ufo-grid">
          ${renderUFOs(slot, player, data)}
        </div>
        <div class="wave-grid">
          ${renderEnemies(slot, player, data)}
        </div>
        <div class="piano">
          ${renderPiano(slot, player, data)}
        </div>
      </div>
    </div>
  `
}

const pianoKeys = [
  { type: 'natural', key: "C" },
  { type: 'accidental', key: "Cs" },
  { type: 'natural', key: "D" },
  { type: 'accidental', key: "Eb" },
  { type: 'natural', key: "E" },
  { type: 'natural', key: "F" },
  { type: 'accidental', key: "Fs" },
  { type: 'natural', key: "G" },
  { type: 'accidental', key: "Ab" },
  { type: 'natural', key: "A" },
  { type: 'accidental', key: "Bb" },
  { type: 'natural', key: "B" },
]

function renderUFOs(slot, player, data) {
  return pianoKeys.map(x => {
    return `
      <div class="attack-lane ${x.type} ${x.key === data.offsetLabel ?'active-lane':'' }" data-key="${x.key}"></div>
    `
  }).join('')
}

const heartSound = new Tone.MembraneSynth({
  pitchDecay: 0.01,
  octaves: 1,
  oscillator: { type: 'sine' },
  envelope: {
    attack: 0.001,
    decay: 0.05,
    sustain: 0,
    release: 0.01
  }
}).toDestination();

const quantizeInterval = "4n"; // Adjust as needed

let latestCallback = null; // Store the most recent callback
let isScheduled = false; // Prevent duplicate scheduling

// Schedule a repeating event that fires on every 16th note
Tone.Transport.scheduleRepeat((time) => {
  if (latestCallback) {
    latestCallback(time); // Execute the most recent user input
    latestCallback = null; // Reset after execution
    isScheduled = false; // Allow new inputs
  }
}, quantizeInterval);

export function quantize(callback) {
  Tone.Transport.bpm.value = getBpm()
  if (!isScheduled) {
    latestCallback = callback; // Store latest callback
    isScheduled = true; // Prevent multiple triggers per 16n
  }
};

let difficultyTimeout

function difficultyLoop() {
  if(difficultyTimeout) {
    clearTimeout(difficultyTimeout)
  }

  if(parseInt(getBpm() > 350)) {
    return
  }

  difficultyTimeout = setTimeout(() => {
    setBpm(`${parseInt(getBpm()) + 20}`)
    difficultyLoop()
  }, 12 * 1000)
}

difficultyLoop()

function enemyLoop() {
  quantize(function setEnemies(time) {
    const { players, tiles } = $.learn()
    const nextNote =  noteLabels[Math.floor(Math.random()*noteLabels.length)]
    const nextKey = pianoKeys.find(x => x.key === nextNote)
    let nextID
    try {
      nextID = self.crypto.randomUUID()
    } catch(e) {
      nextID = uuidv4()
    }

    const playerSynopsis = tiles.map((slot) => {
      if(players[slot]) {
        const player = players[slot]
        const { dead, enemies } = player || { enemies: []}

        const lastWave = { ...enemies }
        const nextWave = {
          ...lastWave,
          [nextNote]: {
            ...lastWave[nextNote],
            [nextID]: {
              ...nextKey,
              bpm: parseInt(getBpm()),
              id: nextID,
            }
          }
        }


        $.teach({
          enemies: nextWave,
        },
          mergePlayer(slot)
        )

        return { dead }
      }

      return null
    })

    const allDead = playerSynopsis.filter(alive => alive !== null).every(({ dead }) => {
      return dead
    })

    if(!allDead) {
      heartSound.volume.value = -15; // Very quiet, adjust as needed
      heartSound.triggerAttackRelease('C3', '8n', time);
    }
  })

  requestAnimationFrame(enemyLoop)
}

requestAnimationFrame(enemyLoop)

function renderMinimap(slot, player, data={}) {
  const { enemies } = player || newPlayer
  return pianoKeys.map(x => {
    const enemiesByType = enemies[x.key] || {}
    const enemiesCount = Object.keys(enemiesByType).length
    return `
      <div class="attack-lane minimap-cell ${x.type} ${x.key === data.offsetLabel ?'active-cell':'' }" data-key="${x.key}">
        <div class="enemy-count">${enemiesCount}</div>
      </div>
    `
  }).join('')
}



function renderEnemies(slot, player, data={}) {
  const { enemies } = player || newPlayer
  return pianoKeys.map(x => {
    const enemiesByType = enemies[x.key] || {}
    return `
      <div class="attack-lane ${x.type} ${x.key === data.offsetLabel ?'active-lane':'' }" data-key="${x.key}">
        ${Object.keys(enemiesByType).map(id => {
          return `
            <div class="enemy-sprite" key="${id}" data-note="${x.key}" data-slot="${slot}"></div>
          `
        }).join('')}
      </div>
    `
  }).join('')
}

function renderPiano(slot, player, data={}) {
  return pianoKeys.map(x => {
    return `
      <button class="${x.type}" data-key="${x.key}">
        ${x.key === data.offsetLabel ? `<div class="player-sprite" data-slot="${slot}"></div>`:''}
      </button>

    `
  }).join('')
}

function renderSystem(state) {
  const { systemUrl, systemMenu, systemIndex, systemKey } = state
  const { list, label } = systemMenu[systemKey]

  if(systemUrl) {
    return `
      <iframe src="${systemUrl}"></iframe>
    `
  }

  const items = list.map((item, i) => {
    const { label, mode, url } = item
    return `
      <button ${url? `data-href="${url}"`:''} ${mode ? `data-mode="${mode}"`:''} data-index="${i}" class="menu-link ${systemIndex === i ? 'active':''}">
        ${label}
      </button>
    `
  }).join('')

  return `
    <div class="pause-overlay system-overlay">
      <div class="pause-menu">
        <div class="pause-label">${label}</div>
        <div class="pause-list">
          ${items}
        </div>
      </div>
    </div>
  `
}


function renderPause(state) {
  const { pauseMenu, pauseIndex, pauseKey } = state
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

$.when('animationend', '.split-screen .enemy-sprite', (event) => {
  const { players } = $.learn()
  const key = event.target.key
  const noteLabel = event.target.dataset.note
  const slot = parseInt(event.target.dataset.slot)


  if(players[slot]) {
    const { health, enemies } = players[slot];

    if(enemies[noteLabel][key]) {
      const newEnemies = remove(enemies[noteLabel][key].id, noteLabel, enemies)
      const nextHealth = health - 1

      if(health === 0) {
        $.teach({
          enemies: newEnemies,
          dead: true,
        }, mergePlayer(slot))
      } else {
        $.teach({
          enemies: newEnemies,
          health: nextHealth
        }, mergePlayer(slot))
      }
    }
    return
  }
  console.error('player not found')
})

$.when('click', '.system-overlay .menu-link', (event) => {
  const { href, index } = event.target.dataset

  const pauseIndex = parseInt(index)

  if(href) {
    $.teach({
      pauseIndex,
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
    background: black;
    color: white;
    width: 100%;
    height: 100%;
    position: relative;
  }

  & .pause-container {
    position: absolute;
    inset: 0;
    background: linear-gradient(335deg, rgba(255,255,255, .65), rgba(0,0,0,.65));
    backdrop-filter: blur(10px);
    display: none;
    z-index: 120;
  }

  &[data-mode="${romModes.pause}"] .pause-container {
    display: block;
  }

  & .newgame-container {
    position: absolute;
    inset: 0;
    z-index: 140;
    background: black;
    color: white;
    font-size: 3rem;
    line-height: 1;
    font-weight: bold;
    padding: 1rem;
    overflow: auto;
  }

  & .system-container {
    position: absolute;
    inset: 0;
    background: linear-gradient(335deg, rgba(255,255,255, .65), rgba(0,0,0,.65));
    backdrop-filter: blur(10px);
    display: none;
    z-index: 120;
  }

  &[data-mode="${romModes.system}"] .system-container {
    display: block;
  }

  & .solo-screen {
    height: 100%;
    opacity: 1;
    overflow: auto;
    inset: 0;
    z-index: 2;
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr;
    gap: .5rem;
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

  & .split-screen .tile {
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  & .solo-screen .tile {
    height: 100%;
    overflow: auto;
    position: relative;
  }

  & .tile .player-hud {
    position: absolute;
    display: grid;
    padding: .5rem;
    gap: .5rem;
    max-width: 320px;
    width: 100%;
    grid-template-columns: 1fr;
    z-index: 110;
    border-radius: 0;
  }

  & .tile[data-dead="true"] .player-hud,
  & .tile[data-dead="true"] .minimap {
    display: none;
  }

  & .theory-label {
    color: rgba(255,255,255,.5);
    font-weight: bold;
    font-size: 2rem;
    white-space: nowrap;
    line-height: 1;
  }

  & .health-label {
    color: rgba(255,255,255,.85)
    grid-column: -1 / 1;
    background: black;
    border: 3px solid white;
    height: 5cqh;
    max-width: 100%;
  }

  & .score-label {
    text-align: right;
    white-space: nowrap;
    color: rgba(255,255,255,.5);
    font-weight: bold;
    font-size: 2erem;
    line-height: 1;
    grid-column: -1 / 1;
  }


  & .health-bar {
    background: var(--slot-color, firebrick);
    width: var(--health-width);
    height: 100%;
  }

  & .instrument-label {
    grid-column: -1 / 1;
    color: rgba(255,255,255,.65)
  }

  & .midi-notes {
    line-height: 1;
  }

  & .tile[data-slot="0"] {
    --slot-color: linear-gradient(335deg, rgba(0,0,0,.65), rgba(0,0,0,.35)), var(--green, mediumseagreen);
  }

  & .tile[data-slot="1"] {
    --slot-color: linear-gradient(335deg, rgba(0,0,0,.65), rgba(0,0,0,.35)), var(--red, firebrick);
  }

  & .tile[data-slot="2"] {
    --slot-color: linear-gradient(335deg, rgba(0,0,0,.65), rgba(0,0,0,.35)), var(--yellow, gold);
  }

  & .tile[data-slot="3"] {
    --slot-color: linear-gradient(335deg, rgba(0,0,0,.65), rgba(0,0,0,.35)), var(--blue, dodgerblue);
  }

  & .tile[data-slot="0"] .player-hud {
    top: 1rem;
    left: 0;
  }

  & .tile[data-slot="1"] .player-hud {
    top: 1rem;
    right: 0;
  }

  & .tile[data-slot="2"] .player-hud {
    top: 1rem;
    left: 0;
  }

  & .tile[data-slot="3"] .player-hud {
    top: 1rem;
    right: 0;
  }

  & .solo-screen .tile .player-hud {
    left: auto;
    right: 1cqw;
    top: 1cqh;
    text-align: right;
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


  & .pause-overlay {
    height: 100%;
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

  & .perspective {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  & .game-over {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: none;
    background: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.45));
    padding: 1rem;
  }

  & [data-dead="true"] .game-over {
    display: block;
  }

  & .skybox {
    display: grid;
    background: linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.25)), var(--slot-color, dodgerblue);
    grid-template-areas: 'skybox';
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
    z-index: 100;
    perspective-origin: center;
    perspective: 500px;
    transform-style: preserve-3d;
    container-name: skybox;
  }

  & .split-screen .skybox .floor {
    background: linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.25));
    transform-origin: bottom;
    transform: rotateX(60deg) translate(0, 0);
    position: relative;
    margin-left: -50%;
    margin-right: -50%;
   transform-style: preserve-3d;
  }

  & .solo-screen .skybox .floor {
    background: linear-gradient(rgba(0,0,0,.95), rgba(0,0,0,.65)), var(--green, mediumseagreen);
    position: relative;
    transform-style: preserve-3d;
    height: 100%;
    transform: scale(.5);
    overflow: visible;
  }

  & .solo-screen .skybox .floor > * {
    grid-area: ground-floor;
  }

  & .split-screen .ufo-grid,
  & .split-screen .wave-grid {
    grid-template-columns: repeat(7, 1fr);
    grid-template-areas: "C D E F G A B";
    display: grid;
    height: 100%;
    width: 50%;
    margin: auto;
  }

  & .minimap {
    grid-template-columns: repeat(7, 1fr);
    grid-template-areas: "C D E F G A B";
    display: grid;
  }

  & .solo-screen .ufo-grid,
  & .solo-screen .wave-grid {
    height: 100%;
    width: 100%;
    margin: auto;
    display: flex;
    position: absolute;
    inset: 0;
  }

  & .split-screen .wave-grid {
    opacity: .75;
    position: relative;
    z-index: 4;
  }

  & .solo-screen .ufo-grid {
    display: none;
  }

  & .solo-screen .wave-grid {
  }

  & .split-screen .wave-grid::before{
    content: '';
    background: linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.85));
    z-index: 2;
    position: absolute;
    inset: 0;
  }

  & .solo-screen .wave-grid::after{
    content: '';
    display: grid;
    grid-area: lane;
    opacity: .5;
    width: 100%;
    height: 100%;
    flex-shrink: 0;
  }

  & .split-screen .ufo-grid {
    opacity: .65;
    transform: rotateX(-15deg) translateY(-50%);
    position: absolute;
    margin: auto;
    left: 0;
    right: 0;
    top: -15%;
    height: 30%;
  }

  & .split-screen .ufo-grid .attack-lane {
    clip-path: polygon(100% 100%, 50% 0%, 0% 100%);
  }

  & .split-screen .ufo-grid .attack-lane::before {
    content: '';
    background: linear-gradient(rgba(255,255,255,.75), rgba(0,0,0,.25));
    opacity: .5;
    z-index: 2;
    position: absolute;
    inset: 0;
  }

  & .split-screen .ufo-grid .active-lane::before {
    opacity: 1;
  }

  & .split-screen .attack-lane {
    display: grid;
    grid-area: lane;
    position: relative;
    opacity: .4;
  }

  & .split-screen .attack-lane.active-lane {
    opacity: .9;
  }

  & .split-screen .attack-lane.accidental.active-lane {
    filter: brightness(2);
  }

  & .split-screen .attack-lane.natural {
  }

  & .split-screen .attack-lane.accidental {
    width: 50%;
    z-index: 5;
  }

  & .solo-screen .wave-grid .attack-lane {
    display: grid;
    grid-area: lane;
    opacity: .5;
    width: 100%;
    height: 100%;
    flex-shrink: 0;
  }

  & .solo-screen .attack-lane.active-lane {
    opacity: 1;
  }

  & .solo-screen .attack-lane.accidental.active-lane {
    filter: brightness(2);
  }

  & .solo-screen .piano {
    display: none;
  }

  & .split-screen .piano {
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

  & .split-screen .piano [data-key] {
    border: none;
    border-radius: 3px;
    width: 100%;
    aspect-ratio: 1;
    z-index: 5;
    opacity: .65;
    display: grid;
    place-items: center;
  }

  & .split-screen .piano .accidental .player-sprite {
    opacity: .65;
  }

  & .split-screen .piano .natural[data-key] {
    background: white;
    border: 1px solid black;
    padding: 25%;
  }

  & .split-screen .piano .accidental[data-key] {
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


  & .minimap .attack-lane[data-key="Cs"],
  & .minimap .attack-lane[data-key="Eb"],
  & .minimap .attack-lane[data-key="Fs"],
  & .minimap .attack-lane[data-key="Ab"],
  & .minimap .attack-lane[data-key="Bb"] {
    transform: translate(-50%, -100%);
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

  & .solo-screen .wave-grid .attack-lane[data-key="Cs"],
  & .solo-screen .wave-grid .attack-lane[data-key="Eb"],
  & .solo-screen .wave-grid .attack-lane[data-key="Fs"],
  & .solo-screen .wave-grid .attack-lane[data-key="Ab"], 
  & .solo-screen .wave-grid .attack-lane[data-key="Bb"] {
    transform: translate(0, 0);
  }

  & .split-screen .enemy-sprite {
    grid-area: lane;
    z-index: 4;
    transform-style: preserve-3d;
    position: absolute;
    inset: calc(100%/7*-1) 0 calc(100%/7);
    animation: &-enemy-slide 5000ms linear forwards;
    padding: 0 15%;
  }

  & .split-screen .attack-lane.natural .enemy-sprite {
    padding: 0 33%;
  }

  & .split-screen .enemy-sprite::before {
    content: '';
    width: 100%;
    aspect-ratio: 1;
    background-color: lemonchiffon;
    animation: &-floppy ease-in-out 1000ms infinite alternate-reverse;
    display: block;
  }

  @keyframes &-floppy {
    0% {
      transform: rotateZ(-360deg);
    }

    100% {
      transform: rotateZ(360deg)
    }
  }

  @keyframes &-enemy-slide {
    0% {
      transform: translateY(0);
    }

    100% {
      transform: translateY(100%);
    }
  }
  

  @keyframes &-enemy-scale {
    0% {
      transform: scale(.001);
    }

    100% {
      transform: scale(1);
    }
  }

  & .solo-screen .enemy-sprite {
    grid-area: lane;
    z-index: 4;
    transform-style: preserve-3d;
    animation: &-enemy-scale 5000ms ease-in forwards;
    width: 100vmin;
    height: 100vmin;
    margin: auto;
    position: relative;
    top: -20%;
  }

  & .solo-screen .enemy-sprite::before {
    content: '';
    width: 100%;
    aspect-ratio: 1;
    background-color: lemonchiffon;
    animation: &-floppy ease-in-out 1000ms infinite alternate-reverse;
    display: block;
  }

  & .split-screen .minimap {
    display: none;
  }

  & .solo-screen .minimap {
    position: absolute;;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    gap: .5rem;
  }

  & .minimap-cell {
    background: rgba(0,0,0,.85);
    color: white;
    font-size: 1rem;
    border-radius: 100%;
    padding: .5rem;
    display: grid;
    place-items: center;
  }

  & .minimap-cell.active-cell {
    background: rgba(255,255,255,.85);
    color: rgba(0,0,0,.85);
  }

  & .newgame-container > * {
    pointer-events: none;
  }
`)

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


document.addEventListener('keydown', startAudioContext)

function startAudioContext() {
  document.querySelector('.newgame-container').remove()
  document.removeEventListener('keydown', startAudioContext)
}

$.when('pointerdown', '.newgame-container', (event) => {
  document.removeEventListener('keydown', startAudioContext)
  event.target.remove()
})
