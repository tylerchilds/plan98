import elf from '@plan98/elf'
import { innerHTML } from 'diffhtml'
import { toast } from './plan98-toast.js'
import $paperPocket, { afterUpdateTheme, replaceElves } from './paper-pocket.js'
import { settingsMenu, walletDefaultHost, bios, getKeycard, listKeycards, setKeycard, getStorage, getSigner, get, del, put, touch } from './plan98-wallet.js'
import { launch, getModels, agenticToolsPlaceholder, agenticOptionsPlaceholder, agenticFormatPlaceholder } from './plan98-synthia.js'
import JSZip from 'jszip'
import lunr from 'lunr'

const bucketKeys = {
  past: 'past',
  lastWeek: 'lastWeek',
  yesterday: 'yesterday',
  today: 'today',
  tomorrow: 'tomorrow',
  thisWeek: 'thisWeek',
  nextWeek: 'nextWeek',
  future: 'future',
}

function emptyBuckets() {
  return {
    [bucketKeys.past]: {},
    [bucketKeys.lastWeek]: {},
    [bucketKeys.yesterday]: {},
    [bucketKeys.today]: {},
    [bucketKeys.tomorrow]: {},
    [bucketKeys.thisWeek]: {},
    [bucketKeys.nextWeek]: {},
    [bucketKeys.future]: {},
  }
}

const today = new Date();
const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
const nextWeek = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

export const eventTypes = {
  note: 'note',
  memo: 'memo',
  tommi: 'tommi',
  instrument: 'instrument',
  sketch: 'sketch',
  bulletin: 'bulletin',
  character: 'character',
  gallery: 'gallery',
  image: 'image',
  audio: 'audio',
  video: 'video',
  archive: 'archive',
  agent: 'agent',
  product: 'product',
  keycard: 'keycard',
  sheet: 'sheet',
  dwebcamp: 'dwebcamp'
}

export const views = {
  wallet: 'wallet',
  create: 'create',
  thinking: 'thinking',
  [eventTypes.note]: eventTypes.note,
  [eventTypes.memo]: eventTypes.memo,
  [eventTypes.tommi]: eventTypes.tommi,
  [eventTypes.product]: eventTypes.product,
  [eventTypes.keycard]: eventTypes.keycard,
  [eventTypes.agent]: eventTypes.agent,
  [eventTypes.sheet]: eventTypes.sheet,
  [eventTypes.instrument]: eventTypes.instrument,
  [eventTypes.sketch]: eventTypes.sketch,
  [eventTypes.bulletin]: eventTypes.bulletin,
  [eventTypes.character]: eventTypes.character,
  [eventTypes.gallery]: eventTypes.gallery,
  [eventTypes.image]: eventTypes.image,
  [eventTypes.audio]: eventTypes.audio,
  [eventTypes.video]: eventTypes.video,
  [eventTypes.archive]: eventTypes.archive,
  [eventTypes.dwebcamp]: eventTypes.dwebcamp,
  edge: 'edge'
}

function timeFields() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
  }
}

export const schemas = {
  [eventTypes.archive]: {
    type: eventTypes.archive,
    title: 'Archive',
    url: null,
    description: null,
    tags: [],
    creator: null,
    collection: null,
    testItem: false,
    language: null,
    license: null,
    more: {}
  },
  [eventTypes.tommi]: {
    type: eventTypes.tommi,
    url: null,
    title: 'Tommi',
    description: null,
    tags: [],
    city: null,
    country: null,
    longitude: null,
    latitude: null,
  },
  [eventTypes.product]: {
    type: eventTypes.product,
    url: null,
    title: 'Product',
    description: null,
    tags: [],
  },
  [eventTypes.keycard]: {
    type: eventTypes.keycard,
    src: '/app/time-machine',
    title: 'Keycard',
    host: walletDefaultHost,
    description: null,
    tags: [],
  },

  [eventTypes.sheet]: {
    type: eventTypes.sheet,
    url: null,
    title: 'Sheet',
    description: null,
    tags: [],
  },
  [eventTypes.agent]: {
    type: eventTypes.agent,
    title: 'Agent',
    description: null,
    tags: [],
    agentId: null,
    agentModel: 'llama3.2:3b',
    systemMessage: 'You are a personal assistant. You are friendly and helpful, yet direct with no frills.',
    format: null,
    tools: null,
    keep_alive: 60 * 1000 + 'ms',
    options: null //https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values
  },
  [eventTypes.instrument]: {
    type: eventTypes.instrument,
    title: 'Instrument',
  },
  [eventTypes.sketch]: {
    type: eventTypes.sketch,
    title: 'Sketch',
    strokeHistory: [],
    strokeRevisory: [],
  },
  [eventTypes.character]: {
    type: eventTypes.character,
    title: 'Character',
    strokeHistory: [],
    strokeRevisory: [],
  },
  [eventTypes.bulletin]: {
    type: eventTypes.bulletin,
    title: 'Bulletin',
    strokeHistory: [],
    strokeRevisory: [],
  },
  [eventTypes.note]: {
    type: eventTypes.note,
    title: 'Note',
    text: '',
  },
  [eventTypes.memo]: {
    type: eventTypes.memo,
    title: 'Memo',
    text: '',
  },
  [eventTypes.gallery]: {
    type: eventTypes.gallery,
    title: 'Gallery',
    description: null,
    tags: [],
  },
  [eventTypes.image]: {
    type: eventTypes.image,
    title: 'Image',
    description: null,
    tags: [],
  },
  [eventTypes.audio]: {
    type: eventTypes.audio,
    title: 'Audio',
    description: null,
    tags: [],
  },
  [eventTypes.video]: {
    type: eventTypes.video,
    title: 'Video',
    description: null,
    tags: [],
  },

  [eventTypes.dwebcamp]: {
    type: eventTypes.dwebcamp,
    location: null,
    locations: ['Wayback Wheel', 'Hackers Hall', 'Migration Library', 'Treehouse', 'Cultivation Station', 'Access to Knowledge Amphitheater', 'Campfire', 'Stages', 'AI Think Tank', 'Art Barn', 'Volunteers HQ', 'Nest', 'Impact Island', 'Heartwood Chapel', 'Lightning Salon', 'Tea Tent', 'Redwood Cathedral'],
    title: 'Session',
    url: null,
    description: null,
    tags: [],
    creator: null,
    collection: null,
    testItem: false,
    language: null,
    license: null,
    more: {}
  },
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function newDraft(type) {
  return {
    id: self.crypto.randomUUID(),
    title: 'Untitled',
    ...(schemas[type] || {}),
    ...timeFields()
  }
}

export function updateDraft(data) {
  $.teach(data, (state, payload) => {
    return {
      ...state,
      draft: {
        ...state.draft,
        ...payload
      }
    }
  })
}

// dear diary
const $ = elf('time-machine', {
  cards: [],
  cache: [],
  grabbing: false,
  sidebar: true,
  space: null,
  time: null,
  now: new Date(),
  buckets: emptyBuckets(),
  draft: newDraft(eventTypes.note),
  agentBaseModels: {},
  meta: {},
  context: null
})

getModels().then(agentBaseModels => {
  $.teach({ agentBaseModels })
})

$.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
    position: relative;
    animation: &-fade-in 1000ms ease-in-out forwards;
    background: var(--root-theme, mediumseagreen);
    opacity: 0;
  }

  @keyframes &-fade-in {
    0% {
      opacity: 0;
      background: var(--root-theme, mediumseagreen);
    }
    100% {
      opacity: 1;
      background: white;
    }
  }

  & .time-feed-nom-nom-nom-nom {
    height: 100%;
    overflow: auto;
  }

  & .edit-banner {
    background: black;
    color: rgba(255,255,255,.65);
    padding: .5rem;
    grid-template-columns: 1fr auto;
    display: grid;
    gap: .5rem;
    overflow: hidden;
  }

  & .edit-label {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  & .edit-banner:empty {
    display: none;
  }

  & .era {
  }

  & .creation-container {
    position: absolute;
    bottom: 0;
    right: 0;
    display: inline-grid;
    grid-template-columns: auto auto;
    z-index: 1000;
    pointer-events: none;
    padding: 4px;
  }

  & .creation-container button {
    pointer-events: all;
  }

  & .create-item {
    font-size: 2rem;
    border-radius: 3px;
    padding: .5rem;
    font-weight: bold;
    border-radius: 100%;
    display: grid;
    place-content: center;
    z-index: 27;
    position: relative;
    left: 1.25rem;
  }

  & .more-item {
    padding: .5rem .5rem .5rem 1.5rem;
    font-weight: bold;
    border-radius: 0 .5rem .5rem 0;;
    display: grid;
    place-content: center;
    z-index: 26;
  }

  & .era-header {
    position: sticky;
    background: white;
    top: 0;
    z-index: 21;
    border-top: 1px solid rgba(0, 0, 0,.2);
  }

  & .era-label {
    color: rgba(0,0,0,.85);
    text-transform: uppercase;
    font-weight: 100;
    margin-bottom: 1rem;
    margin: 0 auto;
    padding: .5rem;
    font-size: .8rem;
    display: inline-block;
  }

  & .era-events {
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px;
  }

  & .identity-selector {
    position: relative;
  }

  & [name="keycard"] {
    position: absolute;
    inset: 0;
    max-width: 320px;
  }

  & .logo-area {
    border: none;
    padding: 0;
    background: transparent;
    border-radius: 100%;
  }

  & .logo-gradient {
    border: none;
    padding: 0;
    background: linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.75)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: bold;
    --v-font-mono: 0;
    --v-font-casl: 0;
    --v-font-wght: 1000;
    --v-font-slnt: -15;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
  }

  & .now {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: .5rem;
    padding: .5rem;
    background: white;
    text-align: center;
    border-bottom: 1px solid rgba(0, 0, 0,.2);
    position: relative;
    z-index: 30; 
    grid-column: -1 / 1;
  }

  & [data-sidebar="false"] .now {
    display: none;
  }

  & .content-area {
    overflow: hidden;
  }

  & .content-area:empty {
    display: none;
  }

  & .fallback {
    overflow: hidden;
    display: none;
  }

  & .content-area:empty + .fallback {
    display: block;
  }

  & [data-sidebar="false"] .chat-sidebar {
    display: none;
  }

  & [data-sidebar="false"] .fallback,
  & [data-sidebar="false"] .content-area,
  & [data-sidebar="false"] .chat-sidebar {
    grid-row: -1 / 1;
  }

  & [data-sidebar="false"] .fallback,
  & [data-sidebar="false"] .content-area {
    grid-column: -1 / 1;
  }

  & .now-date {
    color: rgba(0,0,0,.65);
    place-self: start;
  }


  & .now-time {
    font-weight: light;
    color: rgba(0,0,0,.65);
    --v-font-mono: 0;
    --v-font-casl: 0;
    --v-font-wght: 100;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";


    place-self: start end;
  }

  & .the-past.visible {
    display: block;
  }

  & .the-past.hidden {
    display: none;
  }

  & .link-button {
    background: transparent;
    color: dodgerblue;
    text-decoration: underline;
    border: none;
    cursor: pointer;
    padding: .5rem 1rem;
  }

  & .overlay-background {
    height: 100%;
    background: rgba(0,0,0,.15);
    backdrop-filter: blur(2px);
    overflow: hidden;
  }

  & .wallet-body {
    padding: .5rem;
    overflow: auto;
  }

  & .form-card {
    display: grid;
    background: white;

    box-shadow:
      0 0 6px 6px rgba(0,0,0,.05),
      0 0 3px 3px rgba(0,0,0,.10),
      0 0 1px 1px rgba(0,0,0,.15);

    height: 100%;
    overflow: hidden;
  }

  & .draft-template {
    display: grid;
    grid-template-rows: 1fr auto;
    overflow: hidden;
    max-height: 100%;
    grid-template-areas: "body body" "footer header";
    grid-template-columns: 1fr auto;
  }

  & .raw-json {
    white-space: preserve;
    padding: .5rem;
    height: 100%;
    overflow: auto;
  }

  & .image-well {
    overflow: hidden;
    text-align: center;
    background: black;
    position: relative;
  }

  & .child-well {
    width: 100%;
    height: 100%;
    overflow: auto;
    position: relative;
    z-index: 3;
  }

  & .text-well {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  & .child-well .textarea,
  & .text-well .textarea {
    padding: 3rem .5rem 2rem;
    white-space: preserve;
    overflow: auto;
    line-height: 1.25;
    max-width: 7.5in;
    margin: auto;
    display: block;
  }

  & .child-well .full-textarea {
    padding: 3rem .5rem 2rem;
    resize: none;
    border: none;
    width: 100%;
    height: 100%;
    overflow: auto;
    line-height: 1.25;
    max-width: 7.5in;
    margin: auto;
    display: block;
  }

  & .text-well .edit-banner:empty + textarea {
    grid-row: -1 / 1;
  }

  & .draft-header {
    display: grid;
    grid-template-columns: auto auto;
    grid-area: header;
    background: rgba(0,0,0,.1);
    padding: 4px;
    gap: .5rem;
    padding-right: 5.5rem;
  }

  & .draft-body {
    grid-area: body;
  }

  & .draft-metadata {
    display: none;
    grid-area: body;
    z-index: 5;
    background: white;
    overflow: auto;
  }

  & .view-metadata {
    display: none;
    padding: .5rem;
    height: 100%;
    z-index: 5;
    background: linear-gradient(rgba(0,0,0,.05), rgba(0,0,0,.05)), white;
    grid-area: body;
  }


  & .view-metadata {
    display: none;
  }

  & .show-metadata {
    display: block;
  }


  & .draft-footer {
    display: grid;
    grid-area: footer;
    padding: 4px;
    background: rgba(0,0,0,.1);
    color: rgba(0,0,0,.65);
    display: flex;
    gap: .5rem;
  }

  & .draft-content {
    grid-area: body;
    width: 100%;
    resize: none;
    border: 1px solid rgba(0,0,0,.15);
    padding: .5rem;
  }

  & .draft-title {
    color: rgba(0,0,0,.65);
    padding: .25rem .5rem;
    line-height: 1.3;
  }

  & .time-form {
    display: flex;
    gap: .5rem;
    padding: .5rem;
    flex-wrap: wrap;
    place-content: end;
    background: black;
    color: rgba(255,255,255,.65);
  }

  & .time-form-section {
    display: flex;
    gap: .25rem;
  }

  & .event {
  }

  & .view-event {
    width: 100%;
    text-align: left;
    display: grid;
    grid-template-columns: auto 1fr;
    place-items: center start;
    gap: .5rem;
  }

  & .view-event > span {
    display: grid;
    place-items: center;
  }

  & .view-event sl-icon {
    opacity: .5;
  }

  & .view-event img,
  & .view-event video {
    max-width: 300px;
    max-height: 300px;
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
    object-fit: cover;
  }

  & .view-event[data-show="${eventTypes.note}"] {
  }

  & .view-event[data-show="${eventTypes.note}"]:hover,
  & .view-event[data-show="${eventTypes.note}"]:focus {
  }


  & .view-event[data-show="${eventTypes.tommi}"] {

  }

  & .note-preview-1 {
    color: rgba(0,0,0,.65);
    width: 100%;
    text-align: left;
  }

  & .note-preview-2 {
    color: rgba(0,0,0,.35);
    width: 100%;
    text-align: left;
  }

  & .tommi {
    padding: .5rem;
  }

  & .tommi .tommi-title {
    font-size: 2rem;
    font-weight: 1000;
  }

  & .tommi .tommi-description {
    color: rgba(0,0,0,.65);
    font-size: 1.5rem;
  }

  & .gallery-form {
    padding: .5rem;
    overflow: auto;
    height: 100%;
  }

  & .archive-form {
    padding: .5rem;
    overflow: auto;
    height: 100%;
  }

  & .image-form {
    padding: .5rem;
    overflow: auto;
    height: 100%;
  }

  & .tommi-form {
    padding: .5rem;
    overflow: auto;
    height: 100%;
  }

  & .tychi-form {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & .dwebcamp-form {
    height: 100%;
    padding: .5rem;
    overflow: auto;
  }

  & .menu-item {
    position: relative;
    display: grid;
    place-items: center;
  }

  & .dropdown-items {
    display: none;
    background: rgba(0,0,0,1);
    position: absolute;
    bottom: -4px;
    left: 0;
    max-height: calc(100vh);
    max-width: calc(100vw - 40px);
    overflow: auto;
    transform: translate(calc(-100% + 1.25rem), 0);
    z-index: 30;
  }

  & [data-os-target].active + .dropdown-items {
    display: block;
  }



  & .dropdown-items button > * {
    pointer-events: none;
  }

  & .dropdown-items button:focus,
  & .dropdown-items button.active,
  & .dropdown-items button:hover {
    background: rgba(255,255,255,.35);
  }


  & .dropdown-items  button {
    background: transparent;
    border: none;
    color: rgba(255,255,255,.85);
    width: 100%;
    text-align: left;
    white-space: nowrap;
    font-size: 1rem;
    line-height: 1;
    display: inline-flex;
    padding: .5rem;
    gap: .5rem;
    text-align: left;
    display: block;
    font-size: 1rem;
    --v-font-mono: 1;
    --v-font-casl: 0;
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
  }

  & hr {
    border-top: 1px solid rgba(255,255,255, .15);
    margin: .25rem 0;
  }

  & .chat-realm {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    z-index: 10;
    height: 100%;
  }

  & .chat-realm[data-grabbing="true"] {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  & .chat-sidebar-inner {
    position: relative;
    overflow: auto;
    height: 100%;
  }

  & .chat-sidebar {
    border-right: 1px solid rgba(0, 0, 0,.2);
    background: white;
    position: relative;
    display: none;
    z-index: 21;
    grid-template-rows: 1fr auto;
    overflow-x: hidden;
  }

  & [data-sidebar="true"] .chat-sidebar-inner {
    display: block;
  }

  & .chat-footer {
    padding: .5rem;
  }

  & .chat-footer .action-button {
    display: none;
    width: 100%;
  }
  & [data-sidebar="true"] .chat-footer .action-button {
    display: block;
  }

  & [data-sidebar="true"] .chat-footer .action-icon {
    display: none;
  }

  & .chat-footer .action-icon {
    display: block;
  }



  & [data-sidebar="true"] .chat-footer {
    position: relative;
  }

  & [data-resize-sidebar] {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: clamp(240px, var(--sidebar-width, 320px), 100%);
    transform: translateX(-10px);
    width: 10px;
    background: rgba(255,255,255,.05);
    z-index: 10;
    cursor: col-resize;
  }
  & [data-sidebar="true"] [data-resize-sidebar] {
    display: block;
  }

    & .chat-realm[data-sidebar="true"] .profile-actions {
    padding: .5rem .5rem .5rem calc(34px + 1.5rem);
    flex-direction: row;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: auto;
  }

  & [data-sidebar="true"] .chat-sidebar {
    left: 0;
    display: block;
    width: clamp(240px, var(--sidebar-width, 320px), 100%);
    max-width: 100vw;
    position: absolute;
    top: calc(2.5rem + 1px);
    bottom: 0;
    z-index: 25;
    display: grid;
    grid-template-rows: 1fr auto;
  }

  @media (min-width: 48rem) {
    &  [data-resize-sidebar] {
      display: block !important;
    }

    & .chat-realm {
      grid-template-columns: clamp(240px, var(--sidebar-width, 320px), 100%) 1fr;
    }

    & .chat-sidebar {
      position: static !important;
      display: grid;
    }
  }

  & .search-and-filter {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: .5rem;
  }

  & .search-and-filter input {
    width: 100%;
  }
  & [data-toggle-metadata="on"] {
    filter: invert(1);
  }

  & .wizard {
    margin: 0 auto;
    max-width: 480px;
    padding: 3rem .5rem 1rem;
  }
`)

setInterval(() => {
  $.teach({ now: new Date() })
}, 1000 * 60)

function query(target) {
  if(target.queried) return
  target.queried = true
  fate()
}

fate()

async function fate() {
  const signer = await getSigner()
  const storage = getStorage()
  const keycard = getKeycard()
  const space = storage.space({
    signer,
    id: `urn:uuid:${keycard.id}`
  })

  const { cache } = $.learn()

  async function addData(response) {
    try {
      const data = await response.text()
      const { paths } = JSON.parse(data)
      if(!paths) return

      const resources = paths.map(x => space.resource(x))

      const events = await resources
        .filter(x => !cache.includes(x.path))
        .map((resource, i) => resource.get({ signer }).then(res => res.json())
        .then(data => {
          const parts = paths[i].split('/')
          const name = parts[parts.length - 1]
          const event = {
            handle: { path: paths[i], name },
            data
          }
          $.teach(event, mergeEvent)
          return event
        }).catch(e => {
          return {
            error: e,
          }
        }))

      return await Promise.all(events)
    } catch(e) {
      console.error(e)
    }
  }

  const events = await get(`time-machine`).then(addData).catch(async (error) => {
    await touch('time-machine')
    get('time-machine').then(addData)
  })

  reIndex(events)
}

function mergeEvent(state, payload) {
  const buckets = { ...state.buckets }
  const cache = [ ...state.cache ]
  const file = payload
  try {
    const [timeKey] = file.handle.name.split('.json')
    const spaceKey = getSpaceFromTime(timeKey)
    buckets[spaceKey][timeKey] = timeMachine(spaceKey, timeKey, file)
    cache[file.handle.path] = true
  } catch (_e) {
    console.warn(`Skipping invalid filename: ${file.handle.name}`);
  }

  return {
    ...state,
    cache,
    buckets,
  }
}

function getSpaceTimeFromEventPath(path) {
  const segments = path.split('/')
  const name = segments[segments.length - 1]
  const [timeKey] = name.split('.json')
  const spaceKey = getSpaceFromTime(timeKey)

  return { timeKey, spaceKey }
}

function getSpaceFromTime(timeKey) {
  const fileDate = new Date(timeKey);
  const fileDateOnly = new Date(fileDate.getFullYear(), fileDate.getMonth(), fileDate.getDate());

  if (fileDateOnly.getTime() < lastWeek.getTime()) {
    return bucketKeys.lastWeek
  } else if (fileDateOnly.getTime() < yesterday.getTime()) {
    return bucketKeys.yesterday
  } else if (fileDateOnly.getTime() < today.getTime()) {
    return bucketKeys.today
  } else if (fileDateOnly.getTime() > nextWeek.getTime()) {
    return bucketKeys.future
  } else if (fileDateOnly.getTime() < tomorrow.getTime()) {
    return bucketKeys.tomorrow
  } else if (fileDateOnly.getTime() <= thisWeek.getTime()) {
    return bucketKeys.thisWeek
  } else if (fileDateOnly.getTime() <= nextWeek.getTime()) {
    return bucketKeys.nextWeek
  } else {
    return bucketKeys.past
  }
}

function timeMachine(spaceKey, timeKey, file) {
  return {
    spaceKey,
    timeKey,
    ...file
  }
}

let idx

export function getSearchResults(query, options={}) {
  const defaultOptions = {
     sortBy: 'title' 
  }

  const config = {
    ...defaultOptions,
    options
  }
  return new Promise((resolve, reject) => {
    // timeout after 30 seconds
    const timeout = setTimeout(reject, 30*1000);

    (function loop() {
      if(idx) {
        clearTimeout(timeout)
        const results = idx.search(query)
        resolve(results.map(x => {
          const data = $.learn()[x.ref]

          return data
        }).sort((a, b) => {
          return a.data[config.sortBy].localeCompare(b.data[config.sortBy])
        }))
      } else {
        requestAnimationFrame(loop)
      }
    })()
  })
}

function reIndex(events=[]) {
  idx = lunr(function () {
    this.ref('id')
    this.field('title')
    this.field('path')
    this.field('keywords')
    this.field('type')

    events.forEach(event => {
      if(event.data) {
        const node = {
          id: event.data.id,
          title: event.data.title,
          keywords: event.handle.path.split('/').join(' '),
          type: event.data.type,
        }

        $.teach({ [event.data.id]: event })

        this.add(node)
      }
    }, this)
  })
}

function editBanner(context) {
  return `
    <div class="edit-banner">${context?`
      <span class="edit-label">
        ${context.name}
      </span>

      <button class="standard-button -smol bias-negative" data-destroy="${context.path}">
        Delete
      </button>
    `:''}</div>
  `
}

export const creationForms = {
  [eventTypes.note]: function(draft) {
    return `
      ${editBanner(this)}
    `
  },
  [eventTypes.memo]: function(draft) {
    return `
      ${editBanner(this)}
    `
  },
  [eventTypes.image]: function(draft) {
    return `
      ${editBanner(this)}
      <label class="field">
        <span class="label">Description</span>
        <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
      </label>
    `
  },
  [eventTypes.character]: function(draft) {
    return `
      ${editBanner(this)}
      <label class="field">
        <span class="label">Description</span>
        <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
      </label>
    `
  },
  [eventTypes.bulletin]: function(draft) {
    return `
      ${editBanner(this)}
      <label class="field">
        <span class="label">Description</span>
        <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
      </label>
    `
  },

  [eventTypes.sketch]: function(draft) {
    return `
      ${editBanner(this)}
      <label class="field">
        <span class="label">Description</span>
        <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
      </label>
    `
  },
  [eventTypes.audio]: function(draft) {
    return `
      ${editBanner(this)}
      <label class="field">
        <span class="label">Description</span>
        <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
      </label>
    `
  },
  [eventTypes.video]: function(draft) {
    return `
      ${editBanner(this)}
      <label class="field">
        <span class="label">Description</span>
        <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
      </label>
    `
  },
  [eventTypes.gallery]: function(draft) {
    return `
      ${editBanner(this)}
      <label class="field">
        <span class="label">Description</span>
        <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
      </label>
    `
  },
  [eventTypes.keycard]: function(draft) {

    const x = {
      ...schemas[views.keycard],
      ...draft,
    }

    return `
      ${editBanner(this)}
      <label class="field">
        <span class="label">title</span>
        <input data-bind="draft" name="title" value="${escapeHyperText(x.title || '')}" />
      </label>

      <label class="field">
        <span class="label">host</span>
        <input data-bind="draft" name="host" value="${escapeHyperText(x.host) || ''}" />
      </label>
      <label class="field">
        <span class="label">launch</span>
        <select data-bind="draft" name="src">
          <option disabled>--Select--</option>
          ${Object.keys(bios).map((key) => `
            <option value="${bios[key]}" ${bios[key] === x.src?'selected':''}>
              ${key}
            </button>
          `).join('')}
        </select>
      </label>
      <details>
        <summary class="standard-button bias-generic -small" style="margin: 0 0 1rem 0;">Advanced Options</summary>
        <div style="margin: 1rem 0 0;">
        ${settingsMenu('draft')}
        </div>
      </details>
    `
  },

  [eventTypes.product]: function(draft) {

    const x = {
      ...schemas[views.product],
      ...draft,
    }

    return `
      ${editBanner(this)}
      <div style="display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
        <label class="field">
          <span class="label">Title</span>
          <input data-bind="draft" name="title" value="${escapeHyperText(x.title)}" type="text"/>
        </label>
        <label class="field">
          <span class="label">URL</span>
          <input data-bind="draft" name="url" value="${escapeHyperText(x.url)}" type="text"/>
        </label>
      </div>
      <label class="field">
        <span class="label">Description</span>
        <input data-bind="draft" name="description" value="${escapeHyperText(x.description)}" type="text"/>
      </label>

      ${x.tags?.map(x => {
        return `
          <button class="standard-button" data-tag="${x}">
            ${x}
          </button>
        `
      }).join('')}
    `
  },
  [eventTypes.sheet]: function(draft) {
    return `
      ${editBanner(this)}
      <label class="field">
        <span class="label">Description</span>
        <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
      </label>
    `
  },
  [eventTypes.agent]: function(draft) {

    const x = {
      ...schemas[views.agent],
      ...draft,
    }

    const { agentBaseModels } = $.learn()

    return `
      ${editBanner(this)}
      <div class="wizard">
        <label class="field">
          <span class="label">Base Model</span>
          <select data-bind="draft" name="agentModel">
            <option disabled>--Select--</option>
            ${Object.keys(agentBaseModels).map((key, i) => `
              <option value="${agentBaseModels[key]}" ${agentBaseModels[key] === x.agentModel?'selected':''}>
                ${agentBaseModels[key]}
              </option>
            `).join('')}

          </select>
        </label>

        <label class="field">
          <span class="label">Keep Alive</span>
          <input data-bind="draft" name="keep_alive" value="${escapeHyperText(x.keep_alive)}" type="text"/>
        </label>

        <hr>

        <p>
          These settings influence the agent in chat mode
        </p>

        <label class="field">
          <span class="label">Format</span>
          <textarea data-bind="draft" placeholder="${escapeHyperText(JSON.stringify(agenticFormatPlaceholder, '', 2))}" name="format" style="height: 24rem;" value="${escapeHyperText(x.format)}"></textarea>
        </label>

        <label class="field">
          <span class="label">Options</span>
          <textarea data-bind="draft" placeholder="${escapeHyperText(JSON.stringify(agenticOptionsPlaceholder, '', 2))}" name="options" style="height: 48rem;" value="${escapeHyperText(x.options)}"></textarea>
        </label>

        <label class="field">
          <span class="label">Tools</span>
          <textarea data-bind="draft" placeholder="${escapeHyperText(JSON.stringify(agenticToolsPlaceholder, '', 2))}" name="tools" style="height: 92rem;" value="${escapeHyperText(x.tools)}"></textarea>
        </label>


        ${x.tags?.map(x => {
          return `
            <button class="standard-button" data-tag="${x}">
              ${x}
            </button>
          `
        }).join('')}
      </div>
    `
  },


  [eventTypes.tommi]: function(draft) {

    const x = {
      ...schemas[views.tommi],
      ...draft,
    }

    return `
      ${editBanner(this)}
      <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <label class="field">
          <span class="label">URL</span>
          <input data-bind="draft" name="url" value="${escapeHyperText(x.url)}" type="text"/>
        </label>
      </div>
      <label class="field">
        <span class="label">Description</span>
        <input data-bind="draft" name="description" value="${escapeHyperText(x.description)}" type="text"/>
      </label>

      ${x.tags?.map(x => {
        return `
          <button class="standard-button" data-tag="${x}">
            ${x}
          </button>
        `
      }).join('')}

      <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <label class="field">
          <span class="label">City</span>
          <input data-bind="draft" name="city" value="${escapeHyperText(x.city)}" type="text" />
        </label>

        <label class="field">
          <span class="label">Country</span>
          <input data-bind="draft" name="country" value="${escapeHyperText(x.country)}" type="text" />
        </label>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <label class="field">
          <span class="label">Longitude</span>
          <input data-bind="draft" name="longitude" value="${escapeHyperText(x.longitude)}" type="text" />
        </label>
        <label class="field">
          <span class="label">Latitude</span>
          <input data-bind="draft" name="latitude" value="${escapeHyperText(x.latitude)}" type="text" />
        </label>
      </div>
    `
  },
  [eventTypes.archive]: function(draft) {

    const x = {
      ...schemas[views.archive],
      ...draft,
    }

    return `
      ${editBanner(this)}
      <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <label class="field">
          <span class="label">URL</span>
          <input data-bind="draft" name="url" value="${escapeHyperText(x.url)}" type="text" />
        </label>
      </div>
      <label class="field">
        <span class="label">Description</span>
        <input data-bind="draft" name="description" value="${escapeHyperText(x.description)}" type="text" />
      </label>

      ${x.tags?.map(x => {
        return `
          <button class="standard-button" data-tag="${x}">
            ${x}
          </button>
        `
      }).join('')}

      <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <label class="field">
          <span class="label">Creator</span>
          <input data-bind="draft" name="creator" value="${escapeHyperText(x.creator)}" type="text" />
        </label>

        <label class="field">
          <span class="label">Collection</span>
          <input data-bind="draft" name="collection" value="${escapeHyperText(x.collection)}" type="text" />
        </label>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <label class="field">
          <span class="label">Language</span>
          <input data-bind="draft" name="language" value="${escapeHyperText(x.language)}" type="text" />
        </label>
        <label class="field">
          <span class="label">License</span>
          <input data-bind="draft" name="license" value="${escapeHyperText(x.license)}" type="text" />
        </label>
      </div>
    `
  },
  [eventTypes.dwebcamp]: function(draft) {

    const x = {
      ...schemas[views.dwebcamp],
      ...draft,
    }

    return `
      ${editBanner(this)}
      <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <label class="field">
          <span class="label">URL</span>
          <input data-bind="draft" name="url" value="${escapeHyperText(x.url)}" type="text" />
        </label>
      </div>
      <label class="field">
        <span class="label">Description</span>
        <input data-bind="draft" name="description" value="${escapeHyperText(x.description)}" type="text" />
      </label>
      <label class="field">
        <span class="label">Location</span>
        <select data-bind="draft" name="location">
          <option disabled>--Select--</option>
          ${x.locations.map((location, i) => `
            <option value="${location}" ${location === x.location?'selected':''}>
              ${x.locations[i]}
            </button>
          `).join('')}

        </select>

      </label>


      ${x.tags?.map(x => {
        return `
          <button class="standard-button" data-tag="${x}">
            ${x}
          </button>
        `
      }).join('')}

      <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <label class="field">
          <span class="label">Creator</span>
          <input data-bind="draft" name="creator" value="${escapeHyperText(x.creator)}" type="text" />
        </label>

        <label class="field">
          <span class="label">Collection</span>
          <input data-bind="draft" name="collection" value="${escapeHyperText(x.collection)}" type="text" />
        </label>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <label class="field">
          <span class="label">Language</span>
          <input data-bind="draft" name="language" value="${escapeHyperText(x.language)}" type="text" />
        </label>
        <label class="field">
          <span class="label">License</span>
          <input data-bind="draft" name="license" value="${escapeHyperText(x.license)}" type="text" />
        </label>
      </div>
    `
  }
}

function renderCreationFormByType(draft) {
  return creationForms[draft.type] ? creationForms[draft.type].call(this, draft) : ''
}

const studios = {
  [eventTypes.note]: function(draft) {
    return `
      <textarea
        class="full-textarea"
        name="text"
        data-bind="draft"
        placeholder="Today, I ..."
      >${escapeHyperText(draft.text)}</textarea>
    `
  },
  [eventTypes.memo]: function(draft) {
    let src = draft.src
    if(!src) {
      src = `/private/${$.link}/memos/${new Date().toISOString()}.txt`
      updateDraft({ src })
    }
    return `
      <pro-teleprompter id="${draft.id}" src="${src}"></pro-teleprompter>
    `
  },
  [eventTypes.image]: function(draft) {
    const src = draft && draft ? `src="${draft.src}"` : ''
    return `
      <was-camera id="${draft.id}"></was-camera>
    `
  },
  [eventTypes.character]: function(draft) {
    const src = this && this.path ? `src="${this.path}"` : ''
    return `
      <path-finder id="${draft.id}" ${src}></path-finder>
    `
  },

  [eventTypes.bulletin]: function(draft) {
    const src = this && this.path ? `src="${this.path}"` : ''
    return `
      <bulletin-board id="${draft.id}" ${src}></bulletin-board>
    `
  },
  [eventTypes.sketch]: function(draft) {
    const src = this && this.path ? `src="${this.path}"` : ''
    return `
      <sketch-pad id="${draft.id}" ${src}></sketch-pad>
    `
  },
  [eventTypes.audio]: function(draft) {
    const src = draft && draft ? `src="${draft.src}"` : ''
    return `
      <audio-notes id="${draft.id}" ${src}></audio-notes>
    `
  },
  [eventTypes.video]: function(draft) {
    const src = draft && draft ? `src="${draft.src}"` : ''
    return `
      <video-notes id="${draft.id}" ${src}></video-notes>
    `
  },
  [eventTypes.gallery]: function(draft) {
    return `
    `
  },
  [eventTypes.keycard]: function(draft) {

    const x = {
      ...schemas[views.keycard],
      ...draft,
    }
    return `
      <plan98-wallet id="${draft.id}"></plan98-wallet>
    `
  },

  [eventTypes.product]: function(draft) {

    const x = {
      ...schemas[views.product],
      ...draft,
    }
    return `
      <buy-sell></buy-sell>
    `
  },
  [eventTypes.sheet]: function(draft) {
    const src = this && this.path ? `src="${this.path}"` : ''
    return `
      <react-sheets id="${draft.id}" ${src}></react-sheets>
    `
  },
  [eventTypes.agent]: function(draft) {

    const x = {
      ...schemas[views.agent],
      ...draft,
    }

    return `
      <div class="wizard">
        <p>
          To create an agent, give it a name and tell it what to do using the system message. For advanced tuning, open Settings <span><sl-icon name="gear-fill"></sl-icon></span>.
        </p>
        <label class="field">
          <span class="label">System Message</span>
          <textarea data-bind="draft" name="systemMessage" style="height: 16rem;" value="${escapeHyperText(x.systemMessage)}"></textarea>
        </label>
      </div>
    `
  },

  [eventTypes.tommi]: function(draft) {

    const x = {
      ...schemas[views.tommi],
      ...draft,
    }

    return `
      ??? What type of custom tommi wizard app should go here
    `
  },
  [eventTypes.archive]: function(draft) {

    const x = {
      ...schemas[views.archive],
      ...draft,
    }

    return `
      ??? What type of custom archive wizard app should go here
    `
  },
  [eventTypes.dwebcamp]: function(draft) {

    const x = {
      ...schemas[views.dwebcamp],
      ...draft,
    }

    return `
      ??? What type of custom archive wizard app should go here
    `
  }
}


function renderStudioByType(draft) {
  const context = this ? this : {
    path: newEventPath(draft)
  }
  return studios[draft.type] ? studios[draft.type].call(context, draft) : ''
}


function typeSelector(selected) {
  return `
    <select class="standard-button -smol" name="type" data-bind="draft">
      ${Object.keys(eventTypes).map((key) => `
        <option value="${key}" ${key===selected?'selected':''}>${key}</option>
      `)}
    </select>
  `
}

$.when('changed', '[name="type"]', (event) => {
  $.teach({ draft: newDraft(event.target.value) })
})

const years = []

for(let i = today.getFullYear() - 50; i < today.getFullYear() + 50; i++) {
  years.push(i)
}

function yearSelector(selected) {
  return `
    <select class="standard-button -smol" name="year" data-bind="draft">
      ${years.map(value => `
        <option value="${value}" ${value===selected?'selected':''}>${value}</option>
      `)}
    </select>
  `
}

function monthSelector(selected) {
  return `
    <select class="standard-button -smol"  name="month" data-bind="draft">
      ${months.map((_value, index) => `
        <option value="${index}" ${index===selected?'selected':''}>${index+1}</option>
      `)}
    </select>
  `
}

function daysInMonth (month, year) {
  return new Date(year, month+1, 0).getDate();
}

function daySelector(day, month, year) {
  const maxDays = daysInMonth(month, year)
  const days = []
  for(let i = 1; i <= maxDays; i++) {
    days.push(i)
  }
  return `
    <select class="standard-button -smol"  name="day" data-bind="draft">
      ${days.map(value => `
        <option value="${value}" ${value===day?'selected':''}>${value}</option>
      `)}
    </select>
  `
}

function hourSelector(selected) {
  const hours = []
  for(let i = 0; i <= 23; i++) {
    hours.push(i)
  }
  return `
    <select class="standard-button -smol"  name="hour" data-bind="draft">
      ${hours.map(value => `
        <option value="${value}" ${value===selected?'selected':''}>${value}</option>
      `)}
    </select>
  `
}

function minuteSelector(selected) {
  const minutes = []
  for(let i = 0; i < 60; i++) {
    minutes.push(i)
  }

  return `
    <select class="standard-button -smol"  name="minute" data-bind="draft">
      ${minutes.map(value => `
        <option value="${value}" ${value===selected?'selected':''}>${value}</option>
      `)}
    </select>
  `
}

function viewTemplate(x, child) {
  const { viewMetadata } = $.learn()
  return `
    <div class="overlay-background">
      <div class="form-card">
        <div method="post" class="draft-template">
          <div class="draft-header">
            <button data-action="edit" data-view="${views.create}" data-space="${x.space}" data-time="${x.time}" class="standard-button -small  bias-positive" type="submit">
              <sl-icon name="pencil-fill"></sl-icon>
            </button>
            <button class="standard-button bias-generic -small" data-toggle-metadata="${viewMetadata ? 'on':'off'}">
              <sl-icon name="gear-fill"></sl-icon>
            </button>
          </div>
          <div class="draft-body child-well">
            ${child}
          </div>
          ${stamp(x)}
        </div>
      </div>
    </div>
  `

}

const viewRenderers = {
  [views.wallet]: (target) => {
    return `
      <div class="overlay-background">
        <div class="form-card">
          <div class="draft-template">
            <div class="draft-header">
            </div>
            <div class="wallet-body draft-body">
              <my-wallet></my-wallet>
            </div>
            <div class="draft-footer">
              <button data-cancel-draft class="standard-button bias-generic -small -round" type="reset">
                <sl-icon name="x-circle"></sl-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  },
  [views.thinking]: (target) => {
    return `
      <thinking class="overlay-background">
        <div class="form-card">
          <div style="display: grid; place-content: center; position: relative; grid-template-areas: 'stack';">
            <div style="width: 280px; height: 280px; margin: auto; position: absolute; inset: 0;">
              <plan98-icon style="width: 100%; height: 100%;"></plan98-icon>
            </div>
            <div style="width: 2rem; height: 2rem; grid-area: stack;">
              <flying-disk></flying-disk>
            </div>
          </div>
        </div>
      </thinking>
    `
  },
  [views.create]: (target) => {
    const { draft, viewMetadata, context } = $.learn()
    const form = renderCreationFormByType.call(context, draft)
    const studio = renderStudioByType.call(context, draft)
    return `
      <div class="overlay-background">
        <div class="form-card">
          <div class="draft-template">
            <div class="draft-header">
              <button data-action="post" class="standard-button bias-positive -small" type="submit">
                <sl-icon name="cloud-arrow-up-fill"></sl-icon>
              </button>
              <div class="standard-button bias-generic -small" data-toggle-metadata="${viewMetadata ? 'on':'off'}">
                <sl-icon name="gear-fill"></sl-icon>
              </div>
            </div>
            <div class="draft-body child-well">
              ${studio}
            </div>
            <div class="draft-footer">
              <button data-cancel-draft class="standard-button bias-generic -small -round" type="reset">
                <sl-icon name="x-circle"></sl-icon>
              </button>
              <input class="standard-input -small" data-bind="draft"  name="title" value="${escapeHyperText(draft.title)}" type="text"/>
            </div>
            <div class="draft-metadata ${viewMetadata ? 'show-metadata':''}">
              <div class="time-form">
                <div class="time-form-section">
                  ${typeSelector(draft.type)}
                </div>
                <div class="time-form-section" style="margin-left: auto;">
                  ${yearSelector(parseInt(draft.year))}
                  /
                  ${monthSelector(parseInt(draft.month))}
                  /
                  ${daySelector(parseInt(draft.day), parseInt(draft.month), parseInt(draft.year))}
                </div>
                <div class="time-form-section">
                  @
                  ${hourSelector(parseInt(draft.hour))}
                  <span>:</span>
                  ${minuteSelector(parseInt(draft.minute))}
                </div>
              </div>

              ${form}
            </div>
          </div>
        </div>
      </div>
    `
  },
  [views.note]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.note],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <div class="textarea">${escapeHyperText(x.text)}</div>
    `)
  },
  [views.memo]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.memo],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <pro-teleprompter src="${x.src}"></pro-teleprompter>
    `)
  },
  [views.character]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.character],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <path-finder id=${x.id}"" src="${x.src}"></path-finder>
    `)
  },

  [views.bulletin]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.bulletin],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <bulletin-board id=${x.id}"" src="${x.src}"></bulletin-board>
    `)
  },
  [views.sketch]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.sketch],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <was-image src="${x.src}"></was-image>
    `)
  },
  [views.image]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.image],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <was-image src="${x.src}"></was-image>
    `)
  },
  [views.video]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.video],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <was-video src="${x.src}"></was-video>
    `)
  },
  [views.audio]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.audio],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <was-audio src="${x.src}"></was-audio>
    `)
  },

  [views.keycard]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]
    const x = {
      ...schemas[views.keycard],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <div class="keycard">
        <div class="keycard-title">
          <a href="${x.src || ''}" class="keycard-url">${x.name || x.src}</a>
        </div>
        <div class="keycard-host">
          ${x.host}
        </div>

        <div class="attachments">
          ${x.attachments?.map(x => {
            return `
              ${x.name}
              ${x.type}
              ${x.size}
            `
          }).join('')}
          ${x.attachments?.length > 0 ? `
            <button data-download-attachments data-space="${space}" data-time="${time}">
              Download
            </button>
          `:''}
        </div>
      </div>
    `)
  },

  [views.product]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]
    const x = {
      ...schemas[views.product],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <div class="product">
        <div class="product-title">
          <a href="${x.url || ''}" class="tommi-url">${x.title || x.url}</a>
        </div>
        <div class="attachments">
          ${x.attachments?.map(x => {
            return `
              ${x.name}
              ${x.type}
              ${x.size}
            `
          }).join('')}
          ${x.attachments?.length > 0 ? `
            <button data-download-attachments data-space="${space}" data-time="${time}">
              Download
            </button>
          `:''}
        </div>
        <div class="product-description">
          ${x.description || ''}
        </div>
        <div class="tags">
          ${x.tags?.map(x => {
            return `
              <button class="standard-button" data-tag="${x}">
                ${x}
              </button>
            `
          }).join('')}
        </div>
      </div>
    `)
  },
  [views.sheet]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.sheet],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <react-sheets src="${x.src}"></react-sheets>
    `)
  },
  [views.agent]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]
    const x = {
      ...schemas[views.agent],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <agentic-nonsense agent="${x.agentId}"></agentic-nonsense>
    `)
  },

  [views.tommi]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]
    const x = {
      ...schemas[views.tommi],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <div class="tommi">
        <div class="tommi-title">
          <a href="${x.url || ''}" class="tommi-url">${x.title || x.url}</a>
        </div>
        <div class="tommi-description">
          ${x.description || ''}
        </div>
        <div class="tags">
          ${x.tags?.map(x => {
            return `
              <button class="standard-button" data-tag="${x}">
                ${x}
              </button>
            `
          }).join('')}
        </div>
        <div class="location">
          ${x.city || ''}, ${x.country || ''}
        </div>
        <div class="map">
          ${x.longitude || ''}, ${x.latitude || ''}
        </div>
      </div>
    `)
  },
  [views.archive]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]
    const x = {
      ...schemas[views.archive],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <div class="tommi">
        <div class="tommi-title">
          <a href="${x.url || ''}" class="tommi-url">${x.title || x.url}</a>
        </div>
        <div class="tommi-description">
          ${x.description || ''}
        </div>
        <div class="tags">
          ${x.tags?.map(x => {
            return `
              <button class="standard-button" data-tag="${x}">
                ${x}
              </button>
            `
          }).join('')}
        </div>
        <div class="creator">
          ${x.creator || ''}
        </div>
        <div class="collection">
          ${x.collection || ''}
        </div>
        <div class="language">
          ${x.language || ''}
        </div>
        <div class="license">
          ${x.license || ''}
        </div>
      </div>
    `)
  },
  [views.dwebcamp]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]
    const x = {
      ...schemas[views.dwebcamp],
      ...event.data,
      space,
      time
    }
    return viewTemplate(x, `
      <div class="tommi">
        <div class="tommi-title">
          <a href="${x.url || ''}" class="tommi-url">${x.title || x.url}</a>
        </div>
        <div class="tommi-description">
          ${x.description || ''}
        </div>
        <div class="tags">
          ${x.tags?.map(x => {
            return `
              <button class="standard-button" data-tag="${x}">
                ${x}
              </button>
            `
          }).join('')}
        </div>
        <div class="creator">
          ${x.creator || ''}
        </div>
        <div class="collection">
          ${x.collection || ''}
        </div>
        <div class="language">
          ${x.language || ''}
        </div>
        <div class="license">
          ${x.license || ''}
        </div>
      </div>
    `)
  },

  edge: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...event,
      space,
      time
    }

    return viewTemplate(x, `
      <div class="raw-json">${
        JSON.stringify(event.data, '', 2)
      }</div>
    `)
  }
}

function patch(target) {
  const { space, time, now, buckets, view, draft, grabbing, sidebar, viewMetadata } = $.learn()

  {
    const button = target.querySelector('[data-dom="create-button"]')
    if(draft.type !== button.dataset.tooltip) {
      button.dataset.tooltip = draft.type
    }
  }

  {
    const realm = target.querySelector('[data-dom="realm"]')
    if(realm.dataset.grabbing !== grabbing.toString()) {
      realm.dataset.grabbing = grabbing
    }
    if(realm.dataset.sidebar !== sidebar.toString()) {
      realm.dataset.sidebar = sidebar
    }
  }

  {
    if(now !== target.now) {
      target.now = now
      const time = target.querySelector('[data-dom="time"]')
      time.innerHTML = formatTime(now)
      time.dataset.tooltip = formatDate(now)
    }
  }

  {
    for(const key in bucketKeys) {
      const events = Object.keys(buckets[key])
      if(target[key] !== events.length) {
        target[key] = events.length
        const node = target.querySelector(`[data-dom="${key}"]`)
        if(node) {
          const html = renderBucket(key)
          innerHTML(node, html)
          //node.innerHTML = html
        }
      }
    }
  }

  {
    const content = target.querySelector('[data-dom="content"]')
    if(
      target.type !== draft.type ||
      target.view !== view ||
      (target.dataset.space && target.dataset.space !== space) ||
      (target.dataset.time && target.dataset.time !== time) ||
      target.viewMetadata !== viewMetadata
    ) {
      target.viewMetadata = viewMetadata
      target.view = view
      target.type = draft.type
      if(!space && target.dataset.space) {
        delete target.dataset.space
      } else {
        target.dataset.space = space
      }

      if(!time && target.dataset.time) {
        delete target.dataset.time
      } else {
        target.dataset.time = time
      }

      if(content) {
        const html = viewRenderers[view] ? viewRenderers[view](target) : ''
        innerHTML(content, html)
        //content.innerHTML = html
      }
    }
  }

  {
    const identity = target.querySelector('.identity-selector')
    const list = listKeycards()

    const activeKeycard = getKeycard()

    if(activeKeycard) {
      if(target.keycardsLength !== list.length || activeKeycard.id !== target.activeKeycardId) {
        target.activeKeycardId = activeKeycard.id
        target.keycardsLength = list.length
        identity.innerHTML = `
          <select name="keycard" class="standard-button -smol">
            ${list.map(keycard => {
              return `
                <option value="${keycard.id}" ${activeKeycard.id === keycard.id ? 'selected':''}>${keycard.title}</option>
              `
            }).join('')}
          </select>
        `
      }
    }
  }
}


// you are my diary
$.draw((target)=> {
  const activeKeycard = getKeycard()
  if(!activeKeycard) return
  query(target)
  if(target.innerHTML) return

  return `
    <div class="creation-container">
      <button data-dom="create-button" class="create-item standard-button" data-new>
        <sl-icon name="plus-lg"></sl-icon>
      </button>
      <div class="menu-item">
        <button data-os-target="edit" class="more-item standard-button">
          <sl-icon name="list"></sl-icon>
        </button>
        <div class="dropdown-items" data-menu="edit">
          <button data-new="${eventTypes.character}">Character</button>
          <button data-new="${eventTypes.bulletin}">Bulletin</button>
          <button data-new="${eventTypes.sheet}">Sheet</button>
          <button data-new="${eventTypes.agent}">Agent</button>
          <button data-new="${eventTypes.keycard}">Keycard</button>
          <button data-new="${eventTypes.video}">Video</button>
          <button data-new="${eventTypes.image}">Photo</button>
          <button data-new="${eventTypes.sketch}">Sketch</button>
          <button data-new="${eventTypes.audio}">Audio</button>
          <button data-new="${eventTypes.memo}">Memo</button>
          <button data-new="${eventTypes.note}">Note</button>
          <hr>
          <button data-quit>Quit</button>
        </div>
      </div>
    </div>
    <div data-dom="realm" class="chat-realm">
      <div class="now">
        <button class="logo-gradient" data-assistant>
          Plan98
        </button>
        <div class="identity-selector">
        </div>
        <div data-dom="time" class="now-time"></div>
        <button class="logo-area" data-assistant>
          <plan98-icon style="height: 1.5rem; width: 1.5rem;"></plan98-icon>
        </button>
      </div>

      <div class="chat-sidebar">
        <div data-resize-sidebar></div>
        <div class="chat-sidebar-inner">
          <div class="time-feed-nom-nom-nom-nom">
             <div class="era">
              <div class="era-header">
                <div class="era-label">
                  Past
                </div>
              </div>
              <div data-dom="${bucketKeys.past}" class="era-events"></div>
            </div>

            <div class="era">
              <div class="era-header">
                <div class="era-label">
                  Last Week
                </div>
              </div>
              <div data-dom="${bucketKeys.lastWeek}" class="era-events"></div>
            </div>
            <div class="era">
              <div class="era-header">
                <div class="era-label">
                  Yesterday
                </div>
              </div>
              <div data-dom="${bucketKeys.yesterday}" class="era-events"></div>
            </div>
            <div class="era the-present">
              <div class="era-header">
                <div class="era-label">
                  Today
                </div>
              </div>
              <div data-dom="${bucketKeys.today}" class="era-events"></div>
            </div>

            <div class="era">
              <div class="era-header">
                <div class="era-label">
                  Tomorrow
                </div>
              </div>
              <div data-dom="${bucketKeys.tomorrow}" class="era-events"></div>
            </div>

            <div class="era">
              <div class="era-header">
                <div class="era-label">
                  This Week
                </div>
              </div>
              <div data-dom="${bucketKeys.thisWeek}" class="era-events"></div>
            </div>

            <div class="era">
              <div class="era-header">
                <div class="era-label">
                  Next Week
                </div>
              </div>
              <div data-dom="${bucketKeys.nextWeek}" class="era-events"></div>
            </div>

            <div class="era">
              <div class="era-header">
                <div class="era-label">
                  Future
                </div>
              </div>
              <div data-dom="${bucketKeys.future}" class="era-events"></div>
            </div>
          </div>
        </div>
        <div class="chat-footer">
          <div class="search-and-filter">
            <button class="standard-button -small">
              <sl-icon name="funnel"></sl-icon>
            </button>
            <input class="standard-input -small" placeholder="Search..." type="text">
          </div>
        </div>
      </div>
      <div data-dom="content" class="content-area"></div>
      <div class="fallback">
        <ur-shell></ur-shell>
      </div>
    </div>
  `
}, {
  beforeUpdate(target) {
    {
      const activeKeycard = getKeycard()

      if(!activeKeycard) {
        window.location.href = '/app/welcome-onboarding'
        return
      }
    }

    {
      //saveCursor(target)
    }

    const q = target.getAttribute('q')
    const src = target.getAttribute('src') || '/app/plan98-wallet'
    const view = target.getAttribute('view')
    if(!target.initialized) {
      target.initialized = true
      if(q) {
        $.teach({ view: views.create, src })
        $.teach({
          type: eventTypes.note,
          text: decodeURIComponent(q)
        }, (state, payload) => {
          return {
            ...state,
            draft: {
              ...state.draft,
              ...payload
            }
          }
        })
      } else if(view) {
        $.teach({ view, src })
      }
    }
  },
  afterUpdate(target) {
    {
      const activeKeycard = getKeycard()
      if(!activeKeycard) {
        return
      }
    }
    {
      requestAnimationFrame(() => {
        patch(target)
        recoverElves(target, 'sl-icon')
      })
    }

    {
      //replaceCursor(target)
    }

    {
      afterUpdateTheme($paperPocket, target)
    }

    { // menu items
      const { activeMenu } = $.learn()
      const currentlyActive = target.querySelector('[data-os-target].active')
      if(currentlyActive) {
        currentlyActive.classList.remove('active')
      }
      const activeItem = target.querySelector(`[data-os-target="${activeMenu}"]`)
      if(activeItem) {
        activeItem.classList.add('active')
      }
    }
  }
})

const eventRenderers = {
  [eventTypes.note]: function (event) {
    const data = {
      ...schemas[views.note],
      ...event.data
    }
    const [firstLine='', secondLine=''] = data.text.split('\n')
    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.note}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="input-cursor-text"></sl-icon>
        </span>
        <div>
          <div class="note-preview-1">
            ${firstLine}
          </div>
          <div class="note-preview-2">
            ${secondLine}
          </div>
        </div>
      </button>
    `
  },
  [eventTypes.memo]: function (event) {
    const data = {
      ...schemas[views.memo],
      ...event.data
    }

    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.memo}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="paperclip"></sl-icon>
        </span>
        ${data.title}
      </button>
    `
  },
  [eventTypes.keycard]: function (event) {
    const data = {
      ...schemas[views.keycard],
      ...event.data
    }
    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.keycard}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="person-badge"></sl-icon>
        </span>
        ${data.title}
      </button>
    `
  },
  [eventTypes.product]: function (event) {
    const data = {
      ...schemas[views.product],
      ...event.data
    }
    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.product}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="box2-heart"></sl-icon>
        </span>
        ${data.title}
      </button>
    `
  },

  [eventTypes.sheet]: function (event) {
    const data = {
      ...schemas[views.sheet],
      ...event.data
    }
    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.sheet}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="table"></sl-icon>
        </span>
        ${data.title}
      </button>
    `
  },
  [eventTypes.agent]: function (event) {
    const data = {
      ...schemas[views.agent],
      ...event.data
    }
    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.agent}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="robot"></sl-icon>
        </span>
        ${data.title}
      </button>
    `
  },

  [eventTypes.tommi]: function (event) {
    const data = {
      ...schemas[views.tommi],
      ...event.data
    }
    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.tommi}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="battery-charging"></sl-icon>
        </span>
        ${data.title}
      </button>
    `
  },
  [eventTypes.character]: function (event) {
    const data = {
      ...schemas[views.tommi],
      ...event.data
    }

    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.character}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="copy"></sl-icon>
        </span>
        ${data.title}
      </button>
    `
  },

  [eventTypes.bulletin]: function (event) {
    const data = {
      ...schemas[views.tommi],
      ...event.data
    }

    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.bulletin}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="copy"></sl-icon>
        </span>
        ${data.title}
      </button>
    `
  },
  [eventTypes.sketch]: function (event) {
    const data = {
      ...schemas[views.tommi],
      ...event.data
    }

    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.sketch}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="pencil"></sl-icon>
        </span>
        <was-image src="${data.src}" alt="${data.title}"></was-image>
      </button>
    `
  },
  [eventTypes.image]: function (event) {
    const data = {
      ...schemas[views.tommi],
      ...event.data
    }

    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.image}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="camera"></sl-icon>
        </span>
        <was-image src="${data.src}" alt="${data.title}"></was-image>
      </button>
    `
  },
  [eventTypes.audio]: function (event) {
    const data = {
      ...schemas[views.tommi],
      ...event.data
    }

    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.audio}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="speaker"></sl-icon>
        </span>
        ${data.title}
      </button>
    `
  },
  [eventTypes.video]: function (event) {
    const data = {
      ...schemas[views.tommi],
      ...event.data
    }

    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.video}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="camera-reels"></sl-icon>
        </span>
        ${data.title}
      </button>
    `
  },


  [eventTypes.archive]: function (event) {
    const data = {
      ...schemas[views.archive],
      ...event.data
    }
    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.archive}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="file-zip"></sl-icon>
        </span>
        ${data.title}
      </button>
    `
  },
  [eventTypes.dwebcamp]: function (event) {
    const data = {
      ...schemas[views.dwebcamp],
      ...event.data
    }
    return `
      <button class="view-event standard-button -small" data-show="${eventTypes.dwebcamp}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="fire"></sl-icon>
        </span>
        ${data.title}
      </button>
    `
  },
  edge: function (event) {
    const data = {
      ...schemas[views.tommi],
      ...event.data
    }
    return `
      <button class="view-event standard-button -small" data-show="edge" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <span>
          <sl-icon name="asterisk"></sl-icon>
        </span>
        ${data.title}
      </button>
    `
  }
}

function renderBucket(spaceKey) {
  const { buckets } = $.learn()
  return Object.keys(buckets[spaceKey]).map(key => {
    const event = buckets[spaceKey][key]
    return `
      <div class="event">
        ${
          eventRenderers[event.data.type]
            ? eventRenderers[event.data.type](event)
            : eventRenderers.edge(event)
        }
      </div>
    `
  }).join('')
}

$.when('click', '[data-assistant]', (event) => {
  launch()
})


$.when('click', '[data-toggle-metadata]', (event) => {
  const { viewMetadata } = $.learn()
  $.teach({ viewMetadata: !viewMetadata })
})


$.when('click', '[data-action="edit"]', async (event) => {
  event.preventDefault()
  $.teach({ view: views.create })
})

export async function saveKeycard(draft, context) {
  return await save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.keycard,
  }, context)
}

export async function saveProduct(draft, context) {
  return await save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.product,
  }, context)
}

export async function saveAgent(draft, context) {
  const models = getModels()
  const someModel = models[Object.keys(models)[0]]
  const title = draft.title || 'Untitled'
  return await save({
    title,
    agentModel: someModel,
    ...timeFields(),
    ...draft,
    name: title,
    agentId: draft.agentId ? draft.agentId : self.crypto.randomUUID(),
    type: eventTypes.agent,
  }, context)
}

export async function savePhoto(draft, context) {
  return await save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.image,
  }, context)
}

export async function saveCharacter(draft, context) {
  return await save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.character,
  }, context)
}

export async function saveBulletin(draft, context) {
  return await save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.bulletin,
  }, context)
}

export async function saveSketch(draft, context) {
  return await save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.sketch,
  }, context)
}

export async function saveAudio(draft, context) {
  return await save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.audio,
  }, context)
}

export async function saveVideo(draft, context) {
  return await save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.video,
  }, context)
}

function newEventPath(draft) {
  const now = new Date(draft.year, draft.month, draft.day, draft.hour, draft.minute, draft.second);
  const timestamp = now.toJSON()
  return `/private/time-machine/${timestamp}.json`
}

export async function save(draft, context={}) {
  let path
  if(context.path) {
    path = context.path
  } else {
    path = newEventPath(draft)
  }

  const event = {
    ...(schemas[draft.type] || {}),
    ...draft
  }

  // Attempt to upload to server
  await put(path, JSON.stringify(event), { type: 'application/json' }).then(response => {
  }).catch(error => {
    console.warn(error);
  });

  await appendPath(path)

  const { spaceKey, timeKey } = getSpaceTimeFromEventPath(path)
  return { path, spaceKey, timeKey }
}

const saveHandlers = {
  [eventTypes.note]: save,
  [eventTypes.memo]: save,
  [eventTypes.tommi]: save,
  [eventTypes.instrument]: save,
  [eventTypes.character]: saveCharacter,
  [eventTypes.bulletin]: saveBulletin,
  [eventTypes.sketch]: saveSketch,
  [eventTypes.gallery]: save,
  [eventTypes.image]: savePhoto,
  [eventTypes.audio]: saveAudio,
  [eventTypes.video]: saveVideo,
  [eventTypes.archive]: save,
  [eventTypes.keycard]: saveKeycard,
  [eventTypes.product]: saveProduct,
  [eventTypes.agent]: saveAgent,
  [eventTypes.dwebcamp]: save,
}

export async function saveByType(draft, context) {
  if(saveHandlers[draft.type]) {
    return await saveHandlers[draft.type](draft, context)
  } else {
    return await save(draft, context)
  }
}

async function appendPath(path) {
  await get('time-machine').then(async response => {
    const obj = await response.text().then(str => JSON.parse(str))
    const existing = (obj.paths || [])
    if(!existing.includes(path)) {
      const paths = [...existing]
      paths.push(path)
      await put('time-machine', JSON.stringify({ ...obj, paths }), { type: 'application/json' })
    }
  })

  fate()
}

export function destroy(context) {
  if(!context) return
  // Attempt to upload to server
  del(context.path).then(response => {
    if (!response.ok) {
      // Explicitly throw for non-200 responses
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    fate()
  }).catch(error => {
    console.warn(error);
  });
}


$.when('click', '[data-action="post"]', async (event) => {
  event.preventDefault()

  // Get current date and time for filename
  const { draft, context } = $.learn()

  if(draft) {
    $.teach({ view: views.thinking })

    const data = await saveByType(draft, context).catch(e => {
      console.error(e)
      toast(e.message, { type: 'error' })
      $.teach({ view: views.create })
    })
    if(data) {
      toast('Saved!', { type: 'success' })
      await fate()
      $.teach({ view: draft.type, space: data.spaceKey, time: data.timeKey })
    }

  } else {
    $.teach({ view: views.create })
    toast('Incomplete information, please try again.', { type: 'error' })
  }
})

$.when('click', '[data-destroy]', async (event) => {
  event.preventDefault()
  try {
    destroy({ path: event.target.dataset.destroy })
    toast('Destroyed!', { type: 'info' })
    $.teach({ view: null, sidebar: true, context: null, viewMetadata: false })
  } catch(e) {
    toast('Error!' + e.message, { type: 'error' })
  }
})


$.when('click', '[data-view]', (event) => {
  event.preventDefault()
  const { view, space, time } = event.target.dataset
  $.teach({ view, space, time })

  const h = $.learn().buckets[space][time] || { data: {} }
  $.teach({ draft: h.data, context: h.handle })
})

$.when('click', '[data-download-attachments]', async (event) => {
  event.preventDefault()
  const { space, time } = event.target.dataset
  $.teach({ space, time })
  const { data } = $.learn().buckets[space][time]
  if(data.attachments) {

    const zip = new JSZip();
    const collection = await Promise.all(data.attachments.map(async file => {
      const blob = await get(file.url).catch(console.error)

      if(blob) {
        zip.file(file.name, blob);
        return {
          name: file.name,
          url: file.url,
          blob
        }
      }
    }))

    zip.generateAsync({type:"blob"})
      .then(function(content) {
        const name = "example.zip"
        const downloadURL = (data) => {
          const a = document.createElement('a')
          a.href = data
          document.body.appendChild(a)
          a.style.display = 'none'
          a.download = name
          a.click()
          a.remove()
        }

        const blob = new Blob([content])

        const url = window.URL.createObjectURL(blob)

        downloadURL(url)
      });

    console.log(collection)
  } else {
    toast('No attachments to download', { type: 'error' })
  }
})


$.when('click', '[data-show]', (event) => {
  const { show, space, time } = event.target.dataset

  $.teach({ view: views[show], space, time, viewMetadata: false, activeMenuItem: null, sidebar: false })
})

$.when('click', '[data-new]', (event) => {
  const type = event.target.dataset.new || $.learn().draft.type

  if(eventTypes[type]) {
    $.teach({
      name: 'type',
      value: type
    }, bound('draft'))
  }

  const draft = newDraft(type || 'note')
  const path = newEventPath(draft)
  $.teach({
    view: views.create,
    draft,
    activeMenu: null,
    sidebar: false,
    context: { path }
  })
})

$.when('click', '[data-quit]', (event) => {
  window.location.href = '/app/plan98-wallet'
})

$.when('click', '[data-cancel-draft]', () => {
  $.teach({ view: null, sidebar: true, context: null, viewMetadata: false })
})

$.when('click', '[data-close-draft]', () => {
  $.teach({ view: null, sidebar: true, context: null, viewMetadata: false })
})

function formatDate(date) {
  const options = {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  };

  return date.toLocaleString('en-US', options);
}

function formatTime(date, options = {
  hour: '2-digit',
  minute: '2-digit',
}) {
  return date.toLocaleString('en-US', options);
}

function stamp(x) {
  const { viewMetadata } = $.learn()
  const date = new Date(x.year, x.month, x.day, x.hour, x.minute)
  return `
    <div class="draft-footer">
      <button data-close-draft class="standard-button bias-generic -small -round" type="reset">
        <sl-icon name="x-circle"></sl-icon>
      </button>

      <div class="draft-title">
        ${escapeHyperText(x.title)}
      </div>
    </div>
    <div class="view-metadata ${viewMetadata ? 'show-metadata':''}">
      ${formatDate(date)} @ ${formatTime(date)}
    </div>

  `
}

$.when('input', '[name="keycard"]', (event) => {
  const { value } = event.target
  setKeycard(value)

  const keycard = getKeycard()

  reset(event.target.closest($.link))
  fate()
})

function reset(target) {
  for(const key in bucketKeys) {
    target[key] = 0
  }

  target.innerHTML = ''
  target.queried = false

  $.teach({ buckets: emptyBuckets() })
}

const formats = {
  'stringify': (value) => {
    return JSON.stringify(value)
  }
}

function formatify(format, value) {
  if(formats[format]) {
    return formats[format](value)
  }

  return value
}

$.when('input', '[data-bind]', (event) => {
  const { bind, format } = event.target.dataset
  $.teach({
    name: event.target.name,
    value: formatify(format, event.target.value)
  }, {
    mergeHandler: bound,
    parameters: [bind]
  })
})

function bound(bind) {
  return (state, payload) => {
    return {
      ...state,
      [bind]: {
        ...state[bind],
        [payload.name]: payload.value
      }
    }
  }
}

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

$.when('json-rpc', 'my-wallet', (event) => {
  if(event.detail.method === 'updated') {
    $.teach({ cards: event.detail.params.cards })
  }
})

$.when('pointerdown', '*', (event) => {
  if(event.target.closest('.menu-item')) {
    // child of a menu item
    return
  }
  $.teach({ activeMenu: null })
})

$.when('click', '[data-os-target]', (event) => {
  event.preventDefault()
  const { activeMenu } = $.learn()
  const { osTarget } = event.target.dataset
  const same = activeMenu === osTarget
  $.teach({ activeMenu: same ? null : osTarget, sidebar: !same })
  event.stopImmediatePropagation()
})

$.when('pointerdown', '[data-resize-sidebar]', event => {
  $.teach({ grabbing: true })
  document.addEventListener("pointermove", resizeSidebar, false);
  document.addEventListener("pointerup", () => {
    $.teach({ grabbing: false })
    document.removeEventListener("pointermove", resizeSidebar, false);
  }, false);
})

function resizeSidebar(event) {
  let width
  if (event.touches && event.touches[0] && typeof event.touches[0]["force"] !== "undefined") {
    width = event.touches[0].clientX
  } else {
    width = event.clientX
  }

  const size = `${width}px`;
  const root = event.target.closest($.link)
  root.style.setProperty("--sidebar-width", size);
}

let sel = []
const tags = ['TEXTAREA', 'INPUT']
function saveCursor(target) {
  if(target.contains(document.activeElement)) {
    target.dataset.field = document.activeElement.name
    if(tags.includes(document.activeElement.tagName)) {
      const textarea = document.activeElement
      sel = [textarea.selectionStart, textarea.selectionEnd];
    }
  }
}

function replaceCursor(target) {
  const field = target.querySelector(`[name="${target.dataset.field}"]`)
  
  if(field) {
    field.focus()

    if(tags.includes(field.tagName)) {
      field.selectionStart = sel[0];
      field.selectionEnd = sel[1];
    }
  }
}

function clearCursor(target) {
  target.dataset.field = null
  sel = []
}

function recoverElves(target, tag) {
  [...target.querySelectorAll(tag)].map(node => {
    const nodeParent = node.parentNode
    const newNode = document.createElement(tag)
    for (const attr of node.attributes) {
      newNode.setAttribute(attr.name, attr.value)
    }
    node.remove()
    nodeParent.appendChild(newNode)
  })
}


