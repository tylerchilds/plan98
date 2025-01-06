import elf from '@silly/tag'
import * as Tone from 'tone@next'
import { SampleLibrary } from '/cdn/attentionandlearninglab.com/Tonejs-Instruments.js'
import { checkButton, checkAxis } from './debug-gamepads.js'

const $ = elf('music-walk', { root: 60, samples: {} })

let current
// load samples / choose 4 random instruments from the list //
const instruments = ['piano', 'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute', 'french-horn', 'guitar-acoustic', 'guitar-electric','guitar-nylon', 'harmonium', 'harp', 'organ', 'saxophone', 'trombone', 'trumpet', 'tuba', 'violin', 'xylophone']

function load(instrument) {
  current = SampleLibrary.load({
    instruments: instrument,
    baseUrl: (self.plan98.env.HEAVY_ASSET_CDN_URL || '') + "/private/tychi.1998.social/SourceCode/tonejs-instruments/samples/"
  })

  Tone.loaded().then(function() {
    current.release = .5;
    current.toDestination();
  })
}

load('piano')

// show error message on loading error //
$.when('change', '.samples', function(event) {
  load(instruments[event.target.value]);
})

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}

const midiCodes = [...new Array(116)].map((_, i) => i)

$.draw(() => {
  const list = Object.keys(instruments).map((item) => {
    return `
      <option value="${item}" ${current === instruments[item] ? 'selected="true"':''}>
        ${instruments[item]}
      </option>
    `
  })

  return `
    <select class="samples">
      ${list}
    </select>
  `
})

$.style(`
  & {
    display: inline-block;
  }

  & select {
    background: #54796d;
    border: 1px solid rgba(255,255,255,.65);
    border-radius: 0;
    color: rgba(255,255,255,.65);
    padding: .5rem;
  }
`)

const attacking = {}

function attack(note) {
  if(!current || attacking[note]) return
  current.triggerAttack(Tone.Frequency(note, "midi").toNote());
  attacking[note] = true
}

function pointerup(event) {
  const note = event.target.dataset.note
  release(note)
}

function release(note) {
  if(attacking[note]) {
    delete attacking[note]
  }
  if(!current) return
  current.triggerRelease(Tone.Frequency(note, "midi").toNote());
}

requestAnimationFrame(loop)
const lastFrame = {
  a: false,
  b: false,
  x: false,
  y: false,
  down: false,
  up: false,
  left: false,
  right: false,
}

function loop(time) {
  const { root } = $.learn()
  const player = {
    a: checkButton(0, 0),
    b: checkButton(0, 1),
    x: checkButton(0, 3),
    y: checkButton(0, 2),
    lb: checkButton(0, 4),
    rb: checkButton(0, 5),
    lt: checkButton(0, 6),
    rt: checkButton(0, 7),
    select: checkButton(0, 8),
    start: checkButton(0, 9),
    ls: checkButton(0, 10),
    rs: checkButton(0, 11),
    up: checkButton(0, 12),
    down: checkButton(0, 13),
    left: checkButton(0, 14),
    right: checkButton(0, 15),
    os: checkButton(0, 16),
  }

  if(player.a) {
    attack(root)
  } else {
    release(root)
  }

  if(player.b) {
    attack(root + 7)
  } else {
    release(root + 7)
  }

  if(player.x) {
    attack(root + 2)
  } else {
    release(root + 2)
  }

  if(player.y) {
    attack(root + 9)
  } else {
    release(root + 9)
  }

  if(player.lb) {
    attack(root + 4)
  } else {
    release(root + 4)
  }

  if(player.rb) {
    attack(root + 11)
  } else {
    release(root + 11)
  }

  if(player.lt) {
    attack(root + 6)
  } else {
    release(root + 6)
  }

  if(player.rt) {
    attack(root + 13)
  } else {
    release(root + 13)
  }

  if(player.up) {
    if(!lastFrame.up) {
      lastFrame.up = true
      console.log('up')
      if(root < 85) {
        $.teach({ root: root + 12 })
      } else {
        $.teach({ root: 96 })
      }
    }
  } else {
    lastFrame.up = false
  }

  if(player.down) {
    if(!lastFrame.down) {
      lastFrame.down = true
      console.log('down')
      if(root > 35) {
        $.teach({ root: root - 12 })
      } else {
        $.teach({ root: 24 })
      }
    }
  } else {
    lastFrame.down = false
  }

  if(player.left) {
    if(!lastFrame.left) {
      lastFrame.left = true
      if(root > 24) {
        $.teach({ root: root - 1 })
      }
    }
  } else {
    lastFrame.left = false
  }

  if(player.right) {
    if(!lastFrame.right) {
      lastFrame.right = true

      if(root < 96) {
        $.teach({ root: root + 1 })
      }
    }
  } else {
    lastFrame.right = false
  }

  if(player.os) {
    if(!lastFrame.os) {
      lastFrame.os = true
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
    }
  } else {
    lastFrame.os = false
  }

  requestAnimationFrame(loop)
}


