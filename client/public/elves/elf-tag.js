import elf from '@silly/elf'

const $ = elf('elf-tag', {
  index: 0,
  messages: {
    [self.crypto.randomUUID()]: {
      text: 'mercury has invited you to play video games',
      responses: ['on my way!', 'maybe later', 'not today'],
      state: 'unacknowledged'
    },
    [self.crypto.randomUUID()]: {
      text: 'venus is curious about grabbing lunch tomorrow',
      responses: ['tacos', 'sushi', 'another day', 'already booked'],
      state: 'unacknowledged'
    },
    [self.crypto.randomUUID()]: {
      text: 'earth needs your help',
      responses: ['not again', 'how urgently', 'already fixed'],
      state: 'unacknowledged'
    },
    [self.crypto.randomUUID()]: {
      text: 'mars needs defense against billionaires from earth',
      responses: ['say no more', 'mars had it coming', 'is this expedition funded?'],
      state: 'unacknowledged'
    },
    [self.crypto.randomUUID()]: {
      text: 'jupiter is lonely',
      responses: ['send flowers', 'buy pizza'],
      state: 'unacknowledged'
    },
    [self.crypto.randomUUID()]: {
      text: 'saturn would like to go out on a double date',
      responses: ['friday night', 'saturday night', 'next week'],
      state: 'unacknowledged'
    },
    [self.crypto.randomUUID()]: {
      text: 'uranus was brought up in middle school science class',
      responses: ['giggle', 'scold'],
      state: 'unacknowledged'
    },
    [self.crypto.randomUUID()]: {
      text: 'neptune got a bad haircut',
      responses: ['not that bad', 'shave it all'],
      state: 'unacknowledged'
    },
    [self.crypto.randomUUID()]: {
      text: 'pluto would like to be re-invited to planet chat',
      responses: ['approve', 'decline'],
      state: 'unacknowledged'
    },
  }
})

$.draw(() => {
  const { messages, index } = $.learn()

  return Object.keys(messages).map((id, i) => {
    const message = messages[id]
    return `
      <div aria-role="button" class="message ${index === i ? 'focused':''}" id="${id}" data-index="${i}">
        <div class="message-body">
          ${message.text}
        </div>
        <div class="message-responses">
          ${
            message.state !== 'unacknowledged'
              ? `
                <button class="acknowledgement" data-message="${id}">
                  ${message.state}
                </button>
              `
              : message.responses.map((x, n) => {
                return `
                  <button data-message="${id}" data-response="${n}" class="response ${(message.focusedResponseIndex||0) === n?'focused':''}">
                    ${x}
                  </button>
                `
              }).join('')
          }
        </div>
      </div>
    `
  }).join('')
}, {
  afterUpdate: (target) => {
    {
      const { index } = $.learn()

      if(target.index !== index) {
        target.index = index
        const active = target.querySelector('.message.focused')

        if(active) {
          active.scrollIntoView()
        }
      }
    }
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

const jsonrpc = {
  'up': (params) => {
    debounceSpam('up', 150, () => {
      const { index, messages } = $.learn()
      $.teach({
        index: mod((index - 1), Object.keys(messages).length)
      })
    })
  },
  'down': (params) => {
    debounceSpam('down', 150, () => {
      const { index, messages } = $.learn()
      $.teach({
        index: mod((index + 1), Object.keys(messages).length)
      })
    })
  },
  'a': (params) => {
    debounceSpam('a', 150, () => {
      const { index, messages } = $.learn()
      $.teach({
        index: (index + 1) % Object.keys(messages).length
      })
    })
  },
  'b': (params) => {
    debounceSpam('b', 150, () => {
      const { index, messages } = $.learn()
      const id = Object.keys(messages)[index]
      const { state, responses, focusedResponseIndex=0 } = messages[id]

      if(params.type === 'click') {
        $.teach({ id }, messageResponseIndexReducer)
      }

      if(params.type === 'hold') {
        const response = responses[focusedResponseIndex]
        const newState = state === 'unacknowledged'
          ? response
          : 'unacknowledged'

        $.teach({ id, newState }, messageStateReducer)
      }
    })
  },
}

function messageResponseIndexReducer(state, payload) {
  const message = state.messages[payload.id]
  const { responses, focusedResponseIndex=0 } = message
  const newIndex = (focusedResponseIndex + 1) % responses.length
  return {
    ...state,
    messages: {
      ...state.messages,
      [payload.id]: {
        ...message,
        focusedResponseIndex: newIndex
      }
    }
  }
}

function messageStateReducer(state, payload) {
  return {
    ...state,
    messages: {
      ...state.messages,
      [payload.id]: {
        ...state.messages[payload.id],
        state: payload.newState
      }
    }
  }
}

$.when('json-rpc', '', (event) => {
  const { method, params } = event.detail

  if(jsonrpc[method]) {
    jsonrpc[method](params)
  }
})

$.when('click', '.message', (event) => {
  const { index } = event.target.dataset
  $.teach({
    index: parseInt(index)
  })
})

$.when('click', '.acknowledgement', (event) => {
  const { message } = event.target.dataset

  const newState = 'unacknowledged'
  $.teach({ id: message,  newState }, (state, payload) => {
    return {
      ...state,
      messages: {
        ...state.messages,
        [payload.id]: {
          ...state.messages[payload.id],
          state: payload.newState
        }
      }
    }
  })

})

$.when('click', '.response', (event) => {
  const { message, response } = event.target.dataset
  const focusedResponseIndex = parseInt(response)
  const { index, messages } = $.learn()
  const id = Object.keys(messages)[index]
  const { responses } = messages[id]


  const newState = responses[focusedResponseIndex]

  $.teach({ id: message, focusedResponseIndex, newState }, (state, payload) => {
    return {
      ...state,
      messages: {
        ...state.messages,
        [payload.id]: {
          ...state.messages[payload.id],
          focusedResponseIndex: payload.focusedResponseIndex,
          state: payload.newState
        }
      }
    }
  })
})



$.style(`
  & {
    display: block;
    height: 100%;
    background: black;
  }

  & .message {
    display: block;
    padding: 1rem;
    background: rgba(255,255,255,.15);
    color: rgba(255,255,255,.5);
    display: grid;
    gap: 1rem;
  }

  & .message:not(.focused) > * {
    pointer-events: none;
  }

  & .message.focused .message-body {
    font-weight: bold;
  }

  & .message-responses {
    display: none;
  }

  & .message.focused {
    color: black;
    background: white;
  }

  & .message.focused .message-responses {
    display: block;
  }

  & .response {
    padding: 4px 8px;
    border: none;
    background: rgba(0,0,0,.85);
    color: white;
    border-radius: 4px;
    display: inline-block;
    margin-bottom: 4px;
  }

  & .response.focused {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--blue);
  }

  & .acknowledgement {
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75)), var(--green);
    color: rgba(255,255,255,.85);
    padding: 4px 8px;
    border: none;
    color: white;
    border-radius: 4px;
    display: inline-block;
    margin-bottom: 4px;
  }
`)

function mod(x, n) {
  return ((x % n) + n) % n;
}

