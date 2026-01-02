import Self from '@plan98/elf'
import Cache from '@silly/cache'
import { innerHTML } from 'diffhtml'

function mergePlayer(pid) {
  return (prev, payload) => {
    const players = prev.players || {}
    const existingPlayer = players[pid] || {}
    const updatedPlayer = Object.assign({}, existingPlayer, payload)
    const updatedPlayers = Object.assign({}, players)
    updatedPlayers[pid] = updatedPlayer

    return Object.assign({}, prev, { players: updatedPlayers })
  }
}

function kickPlayer(pid) {
  return (prev) => {
    const players = Object.assign({}, prev.players || {})
    delete players[pid]
    return Object.assign({}, prev, { players: players })
  }
}

const $ = Self('active-squad', {
  players: {}
})

let thisPlayer;

self.onbeforeunload = () => {
  if(thisPlayer) {
    $.teach({ online: false }, {
      mergeHandler: mergePlayer,
      parameters: [thisPlayer.id]
    })
  }
}

$.head((target) => {
  if(!target.innerHTML) {
    return `
      <div class="players"></div>
    `
  }
}, {
  beforeUpdate(target) {
    if(!target.mounted) {
      target.mounted = true
      target.cache = Cache(target.id)
      target.cache.get('me').then(record => {
        if(record && record.data) {
          thisPlayer = record.data
        } else {
          thisPlayer = {
            id: self.crypto.randomUUID(),
            nickname: 'Silly'
          }
        }

        $.teach({
          ...thisPlayer,
          online: true
        }, {
          mergeHandler: mergePlayer,
          parameters: [thisPlayer.id]
        })

        target.cache.put('me', $.learn().players[thisPlayer.id])
      })
    }
  },
  afterUpdate(target) {
    {
      const { players } = $.ear()
      const playersView = Object.keys(players)
        .map((pid) => {
          const { online, nickname = '' } = players[pid]
          const isMe = pid === thisPlayer?.id
          return `
            <form class="player-row">
              <div data-online="${online}">
              </div>
              <label class="field">
                <span class="label">${pid}</span>
                <input data-player="${pid}" ${isMe?'':'disabled'} name="author" value="${escapeHyperText(nickname)}"/>
              </label>
            </form>
            `
        }).join('')

      const playerNode = target.querySelector('.players')
      innerHTML(playerNode, playersView)
    }

  }
})

// Only handle input for this player's input field
$.hand('input', '[data-player]', (event) => {
  const root = event.target.closest($.link)
  const { player } = event.target.dataset

  // Only update if it's this player's field
  if(player === thisPlayer.id) {
    console.log('Updating nickname for', player, 'to', event.target.value)

    $.teach({
      nickname: event.target.value
    }, {
      mergeHandler: mergePlayer,
      parameters: [thisPlayer.id]
    })

    root.cache.put('me', $.learn().players[thisPlayer.id])
  }
})

function preventDefault(event) {
event.preventDefault()
}

$.hand('submit', 'form', preventDefault)

$.eye(`
  & {
    display: block;
    margin: 0 auto;
    max-width: 500px;
    padding: 2rem;
  }

  & .player-row {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }

  & [data-online] {
    width: 1rem;
    height: 1rem;
    border-radius: 100%;
    place-self: center;
  }

  & [data-online="true"] {
    background: mediumseagreen;
  }

  & [data-online="false"] {
    background: firebrick;
  }
`)

function escapeHyperText(text = '') {
  if(!text) return ''
  return text.replace(/[&<>'"]/g,
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}
