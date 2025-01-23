import elf from '@silly/elf'

const contentTypes = [
  {
    label: 'Anything',
    key: 'anything',
    icon: 'house'
  },
  {
    label: 'Chat',
    key: 'chat',
    icon: 'chat'
  },
  {
    label: 'Link',
    key: 'links',
    icon: 'link-45deg'
  },
  {
    label: 'Opinion',
    key: 'short-text',
    icon: 'body-text'
  },
  {
    label: 'Article',
    key: 'long-text',
    icon: 'book'
  },
  {
    label: 'Gallery',
    key: 'gallery',
    icon: 'image'
  },
  {
    label: 'Audio',
    key: 'audio',
    icon: 'speaker'
  },
  {
    label: 'Video',
    key: 'video',
    icon: 'camera-reels'
  },
  {
    label: 'Game',
    key: 'game',
    icon: 'controller'
  },
]

const channelTypes = [
  {
    label: 'Just Me',
    key: 'myself',
  },
  {
    label: 'Friends',
    key: 'friends',
  },
  {
    label: 'Bacon',
    key: 'bacon',
  },
  {
    label: 'Groups',
    key: 'groups',
  },
  {
    label: 'Feeds',
    key: 'feeds',
  },
  {
    label: 'Settings',
    key: 'settings',
  },
]


const $ = elf('just-me', {
  filter: contentTypes[0].key,
  people: channelTypes[0].key,
  focusedContent: {}
})

$.draw(() => {
  const { focusedContent, people, filter, creating, contextualize } = $.learn()

  const type = channelTypes.find(x => x.key === people)
  return `
    <div class="filters">
      ${contentTypes.map(x => `
        <button data-tooltip="${x.label}" data-filter="${x.key}" class="${x.key===filter?'active':''}">
          <sl-icon name="${x.icon}"></sl-icon>
        </button>
      `).join('')}
    </div>
    <div class="people">
      ${channelTypes.map(x => `
        <button data-people="${x.key}" class="${x.key===people?'active':''}">
          ${x.label}
        </button>
      `).join('')}
      <div class="selector">
        <select name="channel-filter">
          ${channelTypes.map((x) => `
            <option value="${x.key}" ${x.key === people?'selected':''}>
              ${x.label}
            </button>
          `).join('')}
        </select>
        <label for="channel-filter">
          ${type.label}
          <span class="iconator">
            <sl-icon name="chevron-down"></sl-icon>
          </span>
        </label>
      </div>
    </div>
    ${people === 'settings' ? `
      <div class="settings">
        Hello
      </div>
    `: `
      <button data-contextualize class="contextualize-action">
        <sl-icon name="${contextualize?'x-lg':'info-circle'}"></sl-icon>
      </button>
      <div class="content">
        ${renderContent()}
      </div>
      <div class="context ${contextualize?'contextualize':''}">
        ${renderContext(focusedContent.id)}
      </div>
      <div class="new-content ${creating?'creating':''}">
        ${creating ? `
          <div key="creating">
            ${renderCreationForm()}
          </div>
        `: `
          <button data-create="${filter}" class="creation-action">
            <sl-icon name="plus-lg"></sl-icon>
          </button>
        `}
      </div>

    `}
  `
}, {
  beforeUpdate: (target) => {
    {
      scrollSave(target, 'people')
      scrollSave(target, 'filters')
      scrollSave(target, 'content')
      scrollSave(target, 'context')
    }
  },
  afterUpdate: (target) => {
    { // recover icons from the virtual dom
      [...target.querySelectorAll('sl-icon')].map(node => {
        const nodeParent = node.parentNode
        const icon = document.createElement('sl-icon')
        icon.name = node.name
        node.remove()
        nodeParent.appendChild(icon)
      })
    }

    {
      scrollRecover(target, 'people')
      scrollRecover(target, 'filters')
      scrollRecover(target, 'content')
      scrollRecover(target, 'context')
    }
  }
})

function scrollSave(target, classifier) {
  const node = target.querySelector('.'+classifier)
  if(!node) return
  target.dataset[classifier] = JSON.stringify({ top: node.scrollTop, left: node.scrollLeft })
}

function scrollRecover(target, classifier) {
  const node = target.querySelector('.'+classifier)
  if(!node) return
  const { top=0, left=0 } = JSON.parse(target.dataset[classifier] || "{}")
  node.scrollTop = top
  node.scrollLeft = left
}

function renderContent() {
  const { filter, people } = $.learn()

  return `
    ${filter}
    ${people}
  `
}

const creationForms = {
  
}

function renderCreationForm() {
  const { creating } = $.learn()
  const type = contentTypes.find(x => x.key === creating) || { label: 'Anything' }
  return `
    <div class="create-title">
      Create
      <div class="selector">
        <select name="creation-type">
          ${contentTypes.map((x,i) => `
            <option value="${x.key}" ${x.key === creating?'selected':''} ${i===0?'disabled':''}>
              ${x.label}
            </button>
          `).join('')}
        </select>
        <label for="creation-type">
          ${type.label}
          <span class="iconator">
            <sl-icon name="chevron-down"></sl-icon>
          </span>
        </label>
      </div>

    </div>
    <button data-cancel class="creation-action">
      <sl-icon name="x-lg"></sl-icon>
    </button>
    ${creationForms[type.key] ? creationForms[type.key](type) : `
      Select something to create from the select box above.
    `}
  `
}


function renderContext(id) {
  return `
    ${id}
  `
}

$.when('click', '[data-people]', (event) => {
  const { people } = event.target.dataset
  $.teach({ people })
})

$.when('click', '[data-filter]', (event) => {
  const { filter } = event.target.dataset
  $.teach({ filter })
})

$.when('change', '[name="channel-filter"]', (event) => {
  const people = event.target.value
  $.teach({ people })
})


$.when('click', '[data-create]', (event) => {
  const { create } = event.target.dataset
  $.teach({ creating: create })
})

$.when('click', '[data-contextualize]', (event) => {
  const { contextualize } = $.learn()
  $.teach({ contextualize: !contextualize })
})

$.when('click', '[data-cancel]', (event) => {
  $.teach({ creating: null })
})


$.when('change', '[name="creation-type"]', (event) => {
  const create = event.target.value
  $.teach({ creating: create })
})



$.style(`
  & {
    display: grid;
    height: 100%;
    overflow: hidden;
    position: relative;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas: "people" "content" "filters";
    gap: 1px;
  }

  @media (min-width: 500px) {
    & {
      grid-template-columns: 180px 1fr;
      grid-template-rows: 1fr auto;
      grid-template-areas: "people content" "filters filters";
    }

  }
  @media (min-width: 768px) {
    & {
      grid-template-columns: auto 180px 1fr;
      grid-template-rows: 1fr;
      grid-template-areas: "filters people content";
    }
  }

  @media (min-width: 1024px) {
    & {
      grid-template-columns: auto 180px 1fr 1fr;
      grid-template-rows: 1fr;
      grid-template-areas: "filters people content context";
    }
  }

  & .people {
    display: flex;
    flex-direction: column;
    grid-area: people;
    gap: 1px;
    background: rgba(0,0,0,.025);
    overflow-y: auto;
  }

  & .people :focus {
    outline-color: white;
    outline-offset: -3px
  }

  & .people button {
    border: none;
    background: transparent;
    border-radius: 0;
    text-align: left;
    font-weight: 100;
    font-size: 28px;
    line-height: 42px;
    padding: 0 14px;
    color: dodgerblue;
    display: none;
  }

  & .iconator {
    display: grid;
    place-content: center;
  }

  & .people .selector {
    background: dodgerblue;
    color: white;
    padding: 1px calc(48px + 1rem) 1px 1px;
  }

  & .selector {
    display: grid;
    grid-template-areas: 'area';
  }

  @media (min-width: 500px) {
    & .selector {
      display: none;
    }
  }

  & .selector label[for],
  & .selector select[name] {
    grid-area: area;
  }

  & .selector label[for] {
    z-index: 2;
    pointer-events: none;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: .5rem;
    align-content: center;
    font-weight: 100;
    padding: 0 .5rem;
  }

  & .selector select[name] {
    font-size: 1rem;
    width: 100%;
    padding: .5rem;
    opacity: 0;
    z-index: 1;
  }

  & [for="channel-filter"] {
    color: white;
  }

  & [name="channel-filter"] {
    background: transparent;
    color: white;
    border: none;
  }

  & [name="channel-filter"]:focus + [for="channel-filter"] {
    outline: 2px solid white;
    outline-offset: -3px;
  }

  @media (min-width: 500px) {
    & .people button {
      display: block;
    }

    & .people select {
      display: none;
    }
  }


  & .people button:hover,
  & .people button:focus,
  & .people button.active {
    color: white;
    background: dodgerblue;
  }

  & .content {
    grid-area: content;
    background: white;
    z-index: 2;
    position: relative;
    padding: 1rem;
  }

  & .new-content {
    transform: translateY(calc(100% - 42px - 42px - 2rem));
    height: 100%;
    position: absolute;
    inset: 0;
    padding: 1rem;
    z-index: 7;
    background: transparent;
    transition:
      transform 100ms ease-in-out,
      background 100ms ease-in-out;
    animation: &-fade-in 250ms forwards 1000ms;
    opacity: 0;
    pointer-events: none;
  }

  @media (min-width: 500px) {
    & .new-content {
      left: 180px;
    }
  }

  @media (min-width: 768px) {
    & .new-content {
      left: 223px;
      transform: translateY(calc(100% - 42px - 2rem));
    }
  }


  & .settings {
    background: white;
    grid-row: 2;
    grid-column: 1;
    padding: 1rem;
  }

  @media (min-width: 500px) {
    & .settings {
      grid-row: 1;
      grid-column: 2 / -1;
    }
  }

  @media (min-width: 768px) {
    & .settings {
      background: white;
      grid-row: 1;
      grid-column: 3 / -1;
    }
  }


  @keyframes &-fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  & .creating.new-content {
    transform: translateY(0);
    background: white;
    pointer-events: all;
  }

  @media (min-width: 500px) {
    & .creating .new-content {
      transform: translateY(0);
    }
  }

  & .create-title {
    font-size: 1.5rem;
    font-weight: 100;
    margin-bottom: 1rem;
    display: flex;
  }

  & .create-title .selector {
    display: inline-grid;
  }

  & [name="creation-type"] {
    background: white;
    padding: 0 14px 0 0;
    font-size: 1.5rem;
    border: none;
    font-weight: 100;
  }

  & .context {
    grid-area: content;
    background-image: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.1)), linear-gradient(aliceblue, aliceblue);
    transition: 100ms transform ease-in-out;
    transform: translateX(100%);
    padding: 1rem;
  }

  & .contextualize.context {
    transform: translateX(0);
    z-index: 5;
  }

  @media (min-width: 1024px) {
    & .context {
      grid-area: context;
      transform: translateX(0);
    }
  }

  & .filters {
    display: flex;
    grid-area: filters;
    z-index: 10;
    gap: 1px;
    overflow: auto;
    background: rgba(0,0,0,.075);
  }

  & .filters :focus {
    outline-color: white;
    outline-offset: -3px;
  }

  & .filters button {
    border: none;
    border-radius: 0;
    width: 42px;
    height: 42px;
    display: grid;
    aspect-ratio: 1;
    place-content: center;
    background: transparent;
    color: mediumseagreen;
  }

  & .filters button:hover,
  & .filters button:focus,
  & .filters button.active {
    background: mediumseagreen;
    color: white;
  }
  @media (min-width: 768px) {
    & .filters {
      flex-direction: column;
    }
  }

  & .contextualize-action {
    background: darkorange;
    color: white;
    border-radius: 100%;
    width: 42px;
    height: 42px;
    display: grid;
    place-content: center;
    border: none;
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 6;
    border: 1px solid white;
  }

  & .contextualize-action:hover,
  & .contextualize-action:focus {
    outline: 2px solid white;
    outline-offset: -4px;
  }
  @media (min-width: 1024px) {
    & .contextualize-action {
      display: none;
    }
  }


  & .creation-action {
    background: mediumpurple;
    color: white;
    border-radius: 100%;
    width: 42px;
    height: 42px;
    display: grid;
    place-content: center;
    border: none;
    position: absolute;
    top: 1rem;
    right: 1rem;
    border: 1px solid white;
    pointer-events: all;
  }

  & .creation-action:hover,
  & .creation-action:focus {
    outline: 2px solid white;
    outline-offset: -4px;
  }
`)

