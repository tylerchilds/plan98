import elf from '@silly/elf'

const profiles = {
  [self.crypto.randomUUID()]: {
    name: 'Silly',
    theme: 'darkorange',
  },
  [self.crypto.randomUUID()]: {
    name: 'Sally',
    theme: 'dodgerblue',
  },
  [self.crypto.randomUUID()]: {
    name: 'Shelly',
    theme: 'mediumpurple',
  },
  [self.crypto.randomUUID()]: {
    name: 'Sully',
    theme: 'firebrick',
  },
  [self.crypto.randomUUID()]: {
    name: 'Sonny',
    theme: 'gold',
  },
  [self.crypto.randomUUID()]: {
    name: 'Wally',
    theme: 'mediumseagreen',
  },
}

const $ = elf('profile-picker', {
  popped: false,
  currentProfileId: Object.keys(profiles)[0]
})

$.draw(() => {
  const { currentProfileId, popped } = $.learn()
  const { name, theme } = profiles[currentProfileId]

  return `
    <button class="the-picker" style="--theme: ${theme}">
      ${name}
    </button>
    ${ popped ? `
      <div class="the-options">
        ${Object.keys(profiles).map((key) => {
          const { name, theme } = profiles[key]
          return `
            <button data-key="${key}" style="--theme: ${theme}">
              ${name}
            </button>
          `
        }).join('')}
      </div>
    ` : '' }
  `
})

$.when('click', '.the-picker', (event) => {
  $.teach({ popped: !$.learn().popped })
})

$.when('click', '[data-key]', (event) => {
  const root = event.target.closest($.link)
  const { key } = event.target.dataset

  const { name, theme } = profiles[key]

  root.dispatchEvent(new CustomEvent('input', {
    detail: {
      name,
      theme
    }
  }))

  $.teach({ currentProfileId: key, popped: false })
})
