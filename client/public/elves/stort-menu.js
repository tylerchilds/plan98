import { Self } from '@plan98/types'

const PLOT_HOLE = 'plot-hole'
const ELF = 'elf'

function x(box) {
  return `
    <div class="nav-item" id="${box.id}">
      <button data-boot="${box.elf}">
        ${box.name}
      </button>
    </div>
  `
}

const db = {}

function node(elf, { data={}, children=[] }) {
  const tree = {
    id: 'node-' + self.crypto.randomUUID(),
    elf,
    children,
    root: false,
    done: false,
    expanded: false,
    ...data
  }

  db[elf] = tree

  return elf
}

const $ = Self('stort-menu', {
  active: [],
  elf: 'simple-sagas',
  tree: [
    node('stort', {
      data: {
        type: PLOT_HOLE,
        name: 'stort',
        root: true,
        description: 'the lore is the code, the code is the lore..erol eht si edoc eht ,edoc eht si erol eht'
      },
      children: [
        'toys',
        'lessons'
      ]
    }),
    node('toys', {
      data: {
        type: PLOT_HOLE,
        name: 'Toys',
        description: 'Things to be tinkered and toyed with, but for utility.'
      },
      children: [
        'bulletin-board',
        'shirt-flicks',
        'more-toys',
      ]
    }),
    node('more-toys', {
      data: {
        type: PLOT_HOLE,
        name: 'More Toys',
        description: 'More advanced things that do things.'
      },
      children: [
        'door-man',
        'plan98-wallet',
        'even-more-toys',
      ]
    }),
    node('even-more-toys', {
      data: {
        type: PLOT_HOLE,
        name: 'Even More Toys',
        description: 'These things basically do everything.'
      },
      children: [
        'source-code',
        'ur-shell',
      ]
    }),
    node('lessons', {
      data: {
        type: PLOT_HOLE,
        name: 'Lessons',
        description: 'Things to be examined and studied for understanding.'
      },
      children: [
        'hello-world',
        'hello-nickname'
      ]
    }),
    node('shirt-flicks', {
      data: {
        type: ELF,
        name: 'Shirt Flicks',
        description: 'Super positions originating in the realm of Alfheim.'
      },
    }),
    node('bulletin-board', {
      data: {
        type: ELF,
        name: 'Bulletin Board',
        description: 'Super positions originating in the realm of Alfheim.'
      },
    }),
    node('hello-world', {
      data: {
        type: ELF,
        name: 'Hello World',
        description: 'Super positions originating in the realm of Alfheim.'
      },
    }),
    node('hello-nickname', {
      data: {
        type: ELF,
        name: 'Hello Nickname',
        description: 'Super positions originating in the realm of Alfheim.'
      },
    }),
    node('hyper-script', {
      data: {
        type: ELF,
        name: 'Hello Nickname',
        description: 'Super positions originating in the realm of Alfheim.'
      },
    }),
    node('door-man', {
      data: {
        type: ELF,
        name: 'Door Man',
        description: 'The door man lets you in.'
      },
    }),
    node('plan98-wallet', {
      data: {
        type: ELF,
        name: 'Plan98 Wallet',
        description: 'This is a wallet with the code for the wallet in it.'
      },
    }),
    node('source-code', {
      data: {
        type: ELF,
        name: 'Source Code',
        description: 'Bro, you thought I was just here to flirt with spiders?'
      },
    }),
    node('ur-shell', {
      data: {
        type: ELF,
        name: 'Universal Resource Shell',
        description: 'Exactly the label'
      },
    }),
  ]
})

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-open]')) {
    $.teach({ active: [] })
  }
})

$.draw(stort, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
  const { elf } = $.model()
  if(!target.elf) {
    target.elf = elf
    target.insertAdjacentHTML('afterend', `<div class="sibling"><${elf}></${elf}></div>`)
  }
}

function afterUpdate(target) {
  const { elf } = $.model()
  if(target.elf !== elf) {
    target.elf = elf
    target.nextElementSibling.innerHTML = `<${elf}></${elf}>`
  }
}

$.style(`
  & .nav-item {
    display: none;
    position: relative;
  }

  & + .sibling {
    height: 100%;
  }

  & .nav-item button {
    display: block;
    width: 100%;
  }

  & .nav-item .children {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
  }

  & .nav-item.kids-below > .children {
    bottom: 0;
    transform: translateY(100%);
  }

  & .nav-item.kids-right > .children {
    right: 0;
    transform: translateX(100%);
  }

  & .nav-item.active {
    display: block;
  }

  & .nav-item.root {
    display: inline-flex;
  }

  & .stort-menu {
    position: absolute;
    top: 0;
    left: 0;
    display: inline-flex;
    z-index: 8999;
  }
`)

function stort() {
  const { tree, active } = $.model()

  const nav = tree.filter(x => {
    return db[x].root === true
  }).map(topnav).join('')

  return `
    <div class="stort-menu">
      <style>
        ${active.map((id) => {
          return `
            #${id} > .children > .nav-item{
              display: block;
            }
          `
        }).join('')}
      </style>
      ${nav}
    </div>
  `
}

function topnav(key) {
  const box = db[key]

  return box.type === PLOT_HOLE ? `
    <div class="nav-item root active kids-below" id="${box.id}">
      <button data-open="${box.id}">
        ${box.name}
      </button>
      <div class="children">
        ${box.children.map(stackedBelowNav).join('')}
      </div>
    </div>
  ` : x(box)
}

function stackedBelowNav(key) {
  const box = db[key]

  return box.type === PLOT_HOLE ? `
    <div class="nav-item kids-right" id="${box.id}">
      <button data-open="${box.id}">
        ${box.name}
      </button>
      <div class="children">
        ${box.children.map(stackedRightNav).join('')}
      </div>
    </div>
  ` : x(box)
}

function stackedRightNav(key) {
  const box = db[key]

  return box.type === PLOT_HOLE ? `
    <div class="nav-item kids-right" id="${box.id}">
      <button data-open="${box.id}">
        ${box.name}
      </button>
      <div class="children">
        ${box.children.map(stackedRightNav).join('')}
      </div>
    </div>
  ` : x(box)
}

// child.id -> parent.id, built once
const parentOf = Object.keys(db).reduce((index, elf) => {
  const box = db[elf]
  box.children.forEach(childSlug => {
    index[db[childSlug].id] = box.id
  })
  return index
}, {})

function lineageOf(id) {
  const path = []
  let current = id
  while (current) {
    path.push(current)
    current = parentOf[current] // undefined at root, loop ends
  }
  return path
}

$.when('click', '[data-open]', (event) => {
  const { open } = event.target.dataset

  $.controller({ activate: open }, (state, payload) => {
    return {
      ...state,
      active: lineageOf(payload.activate)
    }
  })
})

$.when('click', '[data-boot]', (event) => {
  const { boot } = event.target.dataset
  $.controller({ elf: boot })
})
