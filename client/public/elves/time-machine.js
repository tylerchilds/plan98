import app from '@plan98/app'
import { Horizon } from '@plan98/types'
import { innerHTML } from 'diffhtml'
import { toast } from './plan98-toast.js'
import {
  settingsMenu,
  walletDefaultHost,
  bios,
  provisionActiveKeycard,
  getKeycard,
  listKeycards,
  setKeycard,
  getStorage,
  getSigner,
  get,
  del,
  put,
  touch,
  KEYCARD_TYPES,
  requestKeycardInsertion,
  requestKeycardDeletion,
  requestKeycardPaste
} from './plan98-wallet.js'
import $paperPocket, { afterUpdateTheme, replaceElves } from './paper-pocket.js'

import { launch } from './plan98-synthia.js'
import { getModels, agenticToolsPlaceholder, agenticOptionsPlaceholder, agenticFormatPlaceholder } from './gg-synthia.js'
import JSZip from 'jszip'
import lunr from 'lunr'
import {
  getSession,
  clearSession,
  getCompanyName,
  getEmployeeId
} from './bayun-wizard.js'

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

const bucketTypeObjectClass = {
  [bucketKeys.past]: {
    label: 'Past'
  },
  [bucketKeys.lastWeek]: {
    label: 'Last Week'
  },
  [bucketKeys.yesterday]: {
    label: 'Yesterday'
  },
  [bucketKeys.today]: {
    label: 'Today'
  },
  [bucketKeys.tomorrow]: {
    label: 'Tomorrow'
  },
  [bucketKeys.thisWeek]: {
    label: 'This Week'
  },
  [bucketKeys.nextWeek]: {
    label: 'Next Week'
  },
  [bucketKeys.future]: {
    label: 'Future'
  },
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
  saga: 'saga',
  richtext: 'richtext',
  memo: 'memo',
  tommi: 'tommi',
  instrument: 'instrument',
  sketch: 'sketch',
  xanadoc: 'xanadoc',
  bulletin: 'bulletin',
  broblox: 'broblox',
  character: 'character',
  gallery: 'gallery',
  image: 'image',
  audio: 'audio',
  video: 'video',
  archive: 'archive',
  agent: 'agent',
  product: 'product',
  zipfile: 'zipfile',
  keycard: 'keycard',
  sheet: 'sheet',
  dwebcamp: 'dwebcamp'
}

export const views = {
  memex: 'memex',
  home: 'home',
  types: 'types',
  events: 'events',
  create: 'create',
  identity: 'identity',
  emergency: 'emergency',
  thinking: 'thinking',
  [eventTypes.note]: eventTypes.note,
  [eventTypes.saga]: eventTypes.saga,
  [eventTypes.memo]: eventTypes.memo,
  [eventTypes.richtext]: eventTypes.richtext,
  [eventTypes.tommi]: eventTypes.tommi,
  [eventTypes.product]: eventTypes.product,
  [eventTypes.zipfile]: eventTypes.zipfile,
  [eventTypes.keycard]: eventTypes.keycard,
  [eventTypes.agent]: eventTypes.agent,
  [eventTypes.sheet]: eventTypes.sheet,
  [eventTypes.instrument]: eventTypes.instrument,
  [eventTypes.sketch]: eventTypes.sketch,
  [eventTypes.xanadoc]: eventTypes.xanadoc,
  [eventTypes.bulletin]: eventTypes.bulletin,
  [eventTypes.broblox]: eventTypes.broblox,
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
    transcription: '',
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
    transcription: '',
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
    transcription: '',
    tags: [],
  },
  [eventTypes.zipfile]: {
    type: eventTypes.zipfile,
    url: null,
    title: 'Zipfile',
    description: null,
    tags: [],
  },
  [eventTypes.keycard]: {
    type: KEYCARD_TYPES.MEMEX,
    title: 'My Memex',
    description: 'A private space for my thoughts.',
    logoUrl: null,
    src: '/app/time-machine',
    host: walletDefaultHost,
    tags: [],
  },

  [eventTypes.sheet]: {
    type: eventTypes.sheet,
    url: null,
    title: 'Sheet',
    description: null,
    transcription: '',
    tags: [],
  },
  [eventTypes.agent]: {
    type: eventTypes.agent,
    title: 'Agent',
    description: null,
    transcription: '',
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
  [eventTypes.xanadoc]: {
    type: eventTypes.xanadoc,
    title: 'Xanadoc',
    src: ''
  },
  [eventTypes.broblox]: {
    type: eventTypes.broblox,
    title: 'Broblox',
  },
  [eventTypes.character]: {
    type: eventTypes.character,
    title: 'Character',
  },
  [eventTypes.bulletin]: {
    type: eventTypes.bulletin,
    title: 'Bulletin',
  },
  [eventTypes.note]: {
    type: eventTypes.note,
    title: 'Note',
    text: '',
  },
  [eventTypes.saga]: {
    type: eventTypes.saga,
    title: 'Saga',
    text: '',
  },
  [eventTypes.richtext]: {
    type: eventTypes.richtext,
    title: 'Richtext',
    rawHTML: '',
    delta: []
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
    transcription: '',
    tags: [],
  },
  [eventTypes.image]: {
    type: eventTypes.image,
    title: 'Image',
    description: null,
    transcription: '',
    tags: [],
  },
  [eventTypes.audio]: {
    type: eventTypes.audio,
    title: 'Audio',
    description: null,
    transcription: '',
    tags: [],
  },
  [eventTypes.video]: {
    type: eventTypes.video,
    title: 'Video',
    description: null,
    transcription: '',
    tags: [],
  },

  [eventTypes.dwebcamp]: {
    type: eventTypes.dwebcamp,
    location: null,
    locations: ['Wayback Wheel', 'Hackers Hall', 'Migration Library', 'Treehouse', 'Cultivation Station', 'Access to Knowledge Amphitheater', 'Campfire', 'Stages', 'AI Think Tank', 'Art Barn', 'Volunteers HQ', 'Nest', 'Impact Island', 'Heartwood Chapel', 'Lightning Salon', 'Tea Tent', 'Redwood Cathedral'],
    title: 'Session',
    url: null,
    description: null,
    transcription: '',
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

export function getDraft() {
  return $.learn().draft
}

// dear diary
const $ = app('time-machine', {
  activeTypes: {},
  suggestions: [],
  searchQuery: '',
  cards: [],
  cache: [],
  grabbing: false,
  space: null,
  time: null,
  now: new Date(),
  buckets: emptyBuckets(),
  draft: newDraft(eventTypes.note),
  memex: newDraft(eventTypes.keycard),
  agentBaseModels: {},
  meta: {},
  context: null,
  view: views.home
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
    background: white;
  }

  & .edit-banner {
    color: rgba(0,0,0,.65);
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

  & .abs-bottom-right {
    position: absolute;
    bottom: 0;
    right: 0;
    display: inline-grid;
    grid-template-columns: auto auto;
    z-index: 1000;
    pointer-events: none;
    padding: .5rem;
  }

  & .abs-bottom-right button {
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
    background: white;
    text-align: center;
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

  & [data-mode="memex"] {
    grid-template-rows: auto 1fr;
    height: 100%;
    overflow: hidden;
    display: grid;
    background: rgba(255,255,255,.65);
    backdrop-filter: blur(2px);
    border-bottom: 1px solid rgba(0, 0, 0,.2);
    position: relative;
    z-index: 30; 
  }

  & .memex-header {
    display: grid;
    padding: 4px .5rem;
    grid-template-columns: 1fr 1fr 1fr;
  }

  & .memex-header-left {
    text-align: left;
    display: grid;
    place-content: center start;
  }

  & .memex-header-mid {
    display: grid;
    text-align: center;
    place-content: center;
  }

  & .memex-header-right {
    text-align: right;
    display: grid;
    place-content: center end;
  }

  & .memex-body {
    height: 100%;
    overflow: auto;
    padding: 4px .5rem;
  }

  & .memex-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
  }

  & .memex-row button {
    width: 100%;
  }

  & .memex-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 55ch;
    margin: auto;
    padding-bottom: 3rem;
  }

  & [data-chat-mode="memex"] [data-mode="memex"] {
    display: block;
  }

  & .content-area {
    overflow: hidden;
    position: relative;
    z-index: 10;
  }

  & .content-area:empty {
    display: none;
  }

  & .now-date {
    color: rgba(0,0,0,.65);
    place-self: start;
  }

  & .now-time {
    color: rgba(0,0,0,.65);
    --v-font-mono: 0;
    --v-font-casl: 0;
    --v-font-wght: 100;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    place-self: start end;
    position: relative;
  }

  & .flip-clock {
    display: block;
  }

  & .flip-date {

  }

  & .flip-time {

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

  & .action-area {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 5;
    padding: .5rem;
    gap: .5rem;
    display: flex;
    flex-direction: column;
  }

  & .share-link-copyable-url {
    white-space: nowrap;
    overflow-x: auto;
    max-width: 320px;
    margin: 0 auto;
    display: block;
  }

  & .action-bar {
    text-align: center;
  }

  & .action-bar > button {
    pointer-events: all;
  }

  & .overlay-background {
    display: block;
    height: 100%;
    background: white;
    backdrop-filter: blur(2px);
    overflow: hidden;
  }

  & .memex-body {
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
    grid-template-rows: auto 1fr auto;
    overflow: hidden;
    max-height: 100%;
    height: 100%;
    grid-template-areas: "header" "body" "footer";
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
    background: rgba(0,0,0,.1);
  }

  & .text-well {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  & .media-margin,
  & .media-margin media-plexer {
    height: 100%;
  }

  & .note-margin {
    padding: 1rem;
    height: 100%;
  }

  & .child-well .textarea,
  & .text-well .textarea {
    padding: 1rem;
    white-space: preserve;
    overflow: auto;
    line-height: 1.25;
    max-width: 7.5in;
    margin: auto;
    display: block;
    background: white;
    height: 100%;
  }

  & .child-well .full-textarea {
    padding: 1rem;
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
    border-top: 1px solid rgba(0, 0, 0,.2);
    background: rgba(255,255,255,.85);
    padding: 4px;
    gap: .5rem;
    z-index: 10;
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

  &[data-show-metadata="true"] .draft-metadata,
  &[data-show-metadata="true"] .view-metadata {
    display: block;
  }

  &[data-show-metadata="true"] .action-area {
    display: none;
  }

  & .draft-footer {
    display: grid;
    grid-area: footer;
    padding: 4px .5rem;
    background: rgba(255,255,255,.85);
    color: rgba(0,0,0,.65);
    display: grid;
    gap: .5rem;
    z-index: 10;
    grid-template-columns: 1fr auto;
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & .time-form {
    display: flex;
    gap: .5rem;
    padding: .5rem;
    flex-wrap: wrap;
    place-content: end;
  }

  & .time-form-section {
    display: flex;
    gap: .25rem;
  }

  & .event {
    position: relative;
  }

  & .event.active {
    z-index: 2;
    height: auto;
    opacity: 1;
    max-height: 100vh;
    transition: opacity 100ms ease-in-out, max-height 250ms ease-in;
  }

  & .event.inactive {
    pointer-events: none;
    z-index: 1;
    max-height: 0;
    overflow: hidden;
    border-bottom: 1px solid rgba(0, 0, 0,.1);
    transition: opacity 100ms ease-in-out, max-height 250ms ease-out;
  }

  & .event-horizon {
    display: grid;
    gap: .5rem;
    grid-template-columns: auto 1fr;
    max-width: 55ch;
    margin: auto;
    opacity: 0;
    animation: &-fade-in 150ms ease-out forwards;
  }

  & .meta-column {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    padding: 4px;
  }

  & .event-type-icon {
    opacity: .5;
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
    opacity: .85;
    width: 100%;
    text-align: left;
  }

  & .note-preview-2 {
    opacity: .65;
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

  & .types-list {
    max-width: 55ch;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    padding: 1rem;
  }

  & .dropdown-item button {
    width: 100%;
  }

  & .dropdown-items button > * {
    pointer-events: none;
  }

  & hr {
    border-top: 1px solid rgba(255,255,255, .15);
    margin: .25rem 0;
  }

  & the-oasis {
    position: absolute;
    inset: 0;
    z-index: 10;
  }

  & .chat-realm {
    display: grid;
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

  & .chat-sidebar {
    height: 100%;
  }

  & .chat-sidebar-inner {
    position: relative;
    overflow: auto;
    height: 100%;
  }

  & [data-mode="events"] {
    border-right: 1px solid rgba(0, 0, 0,.2);
    background: rgba(255,255,255,.65);
    backdrop-filter: blur(2px);
    position: relative;
    display: grid;
    z-index: 21;
    grid-template-rows: auto 1fr auto;
    overflow-x: hidden;
  }

  & [data-sidebar="true"] .chat-sidebar-inner {
    display: block;
  }

  & .chat-header {
    padding: 4px;
  }

  & .app-launcher {
    width: 100%;
    overflow: auto;
    padding: 4px 4px .5rem;
  }

  & .data-types {
    display: flex;
    gap: 4px;
  }

  & .chat-realm .profile-actions {
    padding: .5rem .5rem .5rem calc(34px + 1.5rem);
    flex-direction: row;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: auto;
  }

  & [data-chat-mode="events"] [data-mode="events"] {
    display: grid;
  }

  & [data-mode="item"] {
    display: block;
    height: 100%;
  }

  & [data-chat-mode="item"] [data-mode="item"]:not(:empty) {
  }

  & .fallback {
    overflow: hidden;
    display: none;
  }

  & [data-chat-mode="item"] [data-mode="item"]:empty + .fallback {
    display: block;
    overflow: auto;
  }

  & .search-and-filter {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: .5rem;
  }

  & .search-and-filter input {
    width: 100%;
  }

  & .metadata-form {
    margin: 0 auto;
    max-width: 480px;
    padding: 1rem;
  }

  & welcome-onboarding .metadata-form {
    padding: 0;
  }

  & .filters {
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,.65);
    backdrop-filter: blur(6px);
    z-index: 100;
    overflow: auto;
    opacity: 1;
    transition: opacity 100ms ease-in-out;
  }

  & .filters:empty {
    opacity: 0;
    pointer-events: none;
  }

  & .abs-top-right {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 10;
  }

  & .search-filter {
    max-width: 55ch;
    margin: auto;
  }

  & .memex-keycard {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "title activity"
      "description activity";
    gap: .5rem;
  }

  & .memex-logo {
    grid-area: activity;
    aspect-ratio: 1;
    place-self: start;
    width: 3rem;
    border-radius: 4px;
    overflow: hidden;
  }

  & .memex-title {
    grid-area: title;
    place-self: start;
    text-align: left;
    color: rgba(0,0,0,.85);
    font-weight: bold;
    overflow: hidden;
    max-width: 100%;
  }

  & .memex-description {
    grid-area: description;
    place-self: start;
    text-align: left;
    color: rgba(0,0,0,.65);
    --v-font-mono: 1;
    --v-font-casl: 0;
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 1;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    overflow: hidden;
    max-width: 100%;
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

async function fate() {
  const signer = await getSigner()
  const storage = getStorage()
  const keycard = getKeycard()
  if(!keycard || !storage) return
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
        .filter(x => !cache[x.path])
        .map((resource, i) => resource.get({ signer }).then(res => res.json())
        .then(data => {
          const parts = paths[i].split('/')
          const name = parts[parts.length - 1]
          const [timeKey] = name.split('.json')
          const spaceKey = getSpaceFromTime(timeKey)

          $.teach({
            spaceKey,
            timeKey,
            path: paths[i],
            event: {
              spaceKey,
              timeKey,
              handle: { path: paths[i], name },
              data
            }
          }, mergeEvent)
          return { spaceKey, timeKey, handle: { path: paths[i], name }, data }
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
    return get('time-machine').then(addData)  // add return
  })

  reIndex(events)
}

function mergeEvent(state, payload) {
  const { spaceKey, timeKey, path, event } = payload

  return {
    ...state,
    cache: {
      ...state.cache,
      [path]: true
    },
    buckets: {
      ...state.buckets,
      [spaceKey]: {
        ...state.buckets[spaceKey],
        [timeKey]: event
      }
    }
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
    this.field('description')
    this.field('transcription')
    this.field('path')
    this.field('keywords')
    this.field('type')

    events.filter(Boolean).forEach(event => {
      if(event.data) {
        const node = {
          id: event.data.id,
          title: event.data.title,
          transcription: event.data.transcription,
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
      <div class="metadata-form">
        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },
  [eventTypes.saga]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },

  [eventTypes.richtext]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },
  [eventTypes.memo]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },
  [eventTypes.image]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },
  [eventTypes.broblox]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },
  [eventTypes.character]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },
  [eventTypes.bulletin]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },
  [eventTypes.sketch]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },
  [eventTypes.xanadoc]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },
  [eventTypes.audio]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <label class="field">
          <span class="label">Transcription</span>
          <textarea data-bind="draft" name="transcription" value="${escapeHyperText(draft.transcription)}"></textarea>
        </label>

        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },
  [eventTypes.video]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <label class="field">
          <span class="label">Transcription</span>
          <textarea data-bind="draft" name="transcription" value="${escapeHyperText(draft.transcription)}"></textarea>
        </label>

        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },
  [eventTypes.gallery]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },
  [eventTypes.keycard]: function(draft) {

    const x = {
      ...schemas[views.keycard],
      ...draft,
    }

    return `
      ${editBanner(this)}
      <div class="metadata-form">
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
        <details class="advanced-options">
          <summary class="standard-button bias-generic -small" style="margin: 0 0 1rem 0;">Advanced Options</summary>
          <div style="margin: 1rem 0 0;">
            ${settingsMenu('draft')}
            <label class="field">
              <span class="label">Description</span>
              <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
            </label>
          </div>
        </details>
      </div>
    `
  },

  [eventTypes.zipfile]: function(draft) {

    const x = {
      ...schemas[views.zipfile],
      ...draft,
    }

    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <div style="display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
          <label class="field">
            <span class="label">URL</span>
            <input data-bind="draft" name="url" value="${escapeHyperText(x.url)}" type="text"/>
          </label>
        </div>

        ${x.tags?.map(x => {
          return `
            <button class="standard-button" data-tag="${x}">
              ${x}
            </button>
          `
        }).join('')}

        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },

  [eventTypes.product]: function(draft) {

    const x = {
      ...schemas[views.product],
      ...draft,
    }

    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <div style="display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
          <label class="field">
            <span class="label">URL</span>
            <input data-bind="draft" name="url" value="${escapeHyperText(x.url)}" type="text"/>
          </label>
        </div>

        ${x.tags?.map(x => {
          return `
            <button class="standard-button" data-tag="${x}">
              ${x}
            </button>
          `
        }).join('')}

        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
    `
  },
  [eventTypes.sheet]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="metadata-form">
        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
        </label>
      </div>
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
      <div class="metadata-form">
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

        <label class="field">
          <span class="label">Description</span>
          <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
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
      <div class="metadata-form">
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
        <label class="field">
          <span class="label">Description</span>
          <textarea data-bind="draft" name="description" value="${escapeHyperText(draft.description)}"></textarea>
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
      <div class="metadata-form">
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
      <div class="metadata-form">
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
      <div class="note-margin">
        <textarea
          class="full-textarea standard-input"
          name="text"
          data-bind="draft"
          placeholder="Today, I ..."
        >${escapeHyperText(draft.text)}</textarea>
      </div>
    `
  },
  [eventTypes.saga]: function(draft) {
    let src = draft.src
    if(!src) {
      src = `/private/${$.link}/memos/${new Date().toISOString()}.saga`
      updateDraft({ src })
    }
    return `
      <hyper-script id="${draft.id}" src="${src}"></hyper-script>
    `

  },

  [eventTypes.richtext]: function(draft) {
    return `
      <rich-text id="${draft.id}"></rich-text>
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
  [eventTypes.broblox]: function(draft) {
    let src = draft.src
    if(!src) {
      const now = new Date();
      const timestamp = now.toJSON()
      src = `/private/${$.link}/${draft.type}/${timestamp}.json`

      updateDraft({ src })
    }

    return `
      <div3>
        <the-oasis id="${draft.id}" src="${src}"></the-oasis>
      </div3>
    `
  },
  [eventTypes.character]: function(draft) {
    return `
      <path-finder id="${draft.id}"></path-finder>
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
      <sketch-pad id="${draft.id}" ${src} view="normal"></sketch-pad>
    `
  },
  [eventTypes.xanadoc]: function(draft) {
    let src = draft.src
    if(!src) {
      const now = new Date();
      const timestamp = now.toJSON()
      src = `/private/${$.link}/${draft.type}/${timestamp}.json`

      updateDraft({ src })
    }

    return `
      <trans-clusions id="${draft.id}" src="${src}"></trans-clusions>
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

  [eventTypes.zipfile]: function(draft) {

    const x = {
      ...schemas[views.zipfile],
      ...draft,
    }
    return `
      <zip-file></zip-file>
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
    <select class="standard-input -smol" name="type" data-bind="draft">
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
    <select class="standard-input -smol" name="year" data-bind="draft">
      ${years.map(value => `
        <option value="${value}" ${value===selected?'selected':''}>${value}</option>
      `)}
    </select>
  `
}

function monthSelector(selected) {
  return `
    <select class="standard-input -smol"  name="month" data-bind="draft">
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
    <select class="standard-input -smol"  name="day" data-bind="draft">
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
    <select class="standard-input -smol"  name="hour" data-bind="draft">
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
    <select class="standard-input -smol"  name="minute" data-bind="draft">
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
            <div style="display: grid; place-content: start">
              <button class="standard-button bias-generic -small -round" data-toggle-metadata="${viewMetadata ? 'on':'off'}">
                <sl-icon name="gear-fill"></sl-icon>
              </button>
            </div>
            <div style="display: grid; place-content: end">
              <button data-close-draft class="standard-button bias-generic -small -round" type="reset">
                <sl-icon name="x-lg"></sl-icon>
              </button>
            </div>
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
  [views.memex]: (target) => {
    const { memex, viewMetadata } = $.learn()
    const encoded = btoa(
      JSON.stringify({
        jsonrpc: "2.0",
        method: 'import-memex',
        params: {
          type: 'memex',
          memex: {
            id: memex.id,
            type: memex.type,
            title: memex.title,
            src: memex.src,
            asJSON: memex.asJSON,
            host: memex.host,
          }
        }
      })
    )

    const memexExists = listKeycards().find(x => x.id === memex.id)
    const adminArea = memexExists ? `
      <hr>
      <div>
        Deleting a Memex is an irreversible decision. Be wise.
      </div>
      <button class="standard-button -smol bias-negative" data-delete-memex="${memex.id}">
        Delete
      </button>
    ` : ''


    const shareLink = `${window.location.origin}/app/time-machine?data=${encoded}`
    const copyId = self.crypto.randomUUID()

    const actionArea = memexExists ? `
      <div class="action-area">
        <div class="action-bar">
          <button data-copy="${copyId}" class="standard-button -round -large">
            <sl-icon name="copy"></sl-icon>
          </button>
        </div>
        <div id="${copyId}" class="share-link-copyable-url standard-input -small">${shareLink}</div>
      </div>
    ` : ''

    return `
      <div class="overlay-background">
        <div class="form-card">
          <div class="draft-template">
            <div class="draft-header">
              <div style="display: grid; place-content: start">
                <button class="standard-button bias-generic -small -round" data-toggle-metadata="${viewMetadata ? 'on':'off'}">
                  <sl-icon name="gear-fill"></sl-icon>
                </button>
              </div>
              ${actionArea}
              <div style="display: grid; place-content: end">
                <button data-root class="standard-button bias-generic -small -round" type="reset">
                  <sl-icon name="x-lg"></sl-icon>
                </button>
              </div>
            </div>

            <div class="memex-body draft-body">
              <div class="overlay-background">
                <div style="padding: 51px; height: 100%; display: flex;">
                  <qr-code src="${shareLink}" style="width: 75vmin; height: 75vmin;" target="_top"></qr-code>
                </div>
              </div>
            </div>
            <div class="draft-metadata">
              <div class="overlay-background" style="overflow: auto;">
                <div class="wizard">
                  <label class="field">
                    <span class="label">Description</span>
                    <textarea data-bind="memex" name="description" style="height: 12rem;" value="${escapeHyperText(memex.description)}"></textarea>
                  </label>
                  <label class="field">
                    <span class="label">Host</span>
                    <input data-bind="draft" name="host" value="${escapeHyperText(memex.host) || ''}" />
                  </label>
                  ${adminArea}
                </div>
              </div>
            </div>
            <div class="draft-footer">
              <input class="standard-input -small" data-bind="memex"  name="title" value="${escapeHyperText(memex.title)}" type="text"/>
              <button data-action="memex" class="standard-button bias-positive -small" type="submit">
                <sl-icon name="check-lg"></sl-icon>
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
  [views.identity]: (target) => {
    return `
      <div class="abs-top-right">
        <button class="standard-button bias-generic -small -round" data-root>
          <sl-icon name="x-lg"></sl-icon>
        </button>
      </div>
      <identity class="overlay-background" style="overflow: auto;">
        <div class="wizard">
          <cyber-security></cyber-security>
        </div>
      </identity>
    `
  },
  [views.emergency]: (target) => {
    const activeKeycard = getKeycard()
    return `
      <div class="abs-top-right">
        <button class="standard-button bias-generic -small -round" data-root>
          <sl-icon name="x-lg"></sl-icon>
        </button>
      </div>
      <live-help room="${activeKeycard.id}"></live-help>
    `
  },
  [views.events]: (target) => {
    const { searchQuery } = $.learn()
    const activeKeycard = getKeycard()
    return `
      <div class="chat-sidebar" data-mode="events">
        <div class="chat-header">
          <div class="search-and-filter">
            <button class="standard-button bias-generic -small -round" data-toggle-filters>
              <sl-icon name="funnel"></sl-icon>
            </button>
            <input class="standard-input -small search-filter" value="${searchQuery}" name="searchQuery" placeholder="Search..." type="text">
            <button class="standard-button bias-generic -small -round" data-root>
              <sl-icon name="x-lg"></sl-icon>
            </button>
          </div>
        </div>

        <div class="chat-sidebar-inner">
          <div data-dom="filters" class="filters"></div>
          <div class="time-feed-nom-nom-nom-nom">
            <div data-dom="${bucketKeys.past}" class="era"></div>
            <div data-dom="${bucketKeys.lastWeek}" class="era"></div>
            <div data-dom="${bucketKeys.yesterday}" class="era"></div>
            <div data-dom="${bucketKeys.today}" class="era"></div>
            <div data-dom="${bucketKeys.tomorrow}" class="era"></div>
            <div data-dom="${bucketKeys.thisWeek}" class="era"></div>
            <div data-dom="${bucketKeys.nextWeek}" class="era"></div>
            <div data-dom="${bucketKeys.future}" class="era"></div>
          </div>
        </div>
        <div class="abs-bottom-right">
          <button class="create-item standard-button" data-new-creation>
            <sl-icon name="plus-lg"></sl-icon>
          </button>
        </div>
      </div>

    `
  },
  [views.home]: (target) => {
    const activeKeycard = getKeycard()

    const list = `
      <div class="memex-list">
        ${listKeycards()
            .filter(x => x.type === KEYCARD_TYPES.MEMEX)
            .map(keycard => {
              const keycardIcon = keycard.logoUrl
                ? `<img src="${keycard.logoUrl}" />`
                : `<plan98-icon></plan98-icon>`
          return `
            <div class="memex-row">
              <div>
                <button data-show-memex="${keycard.id}" class="standard-button -stealth memex-keycard ${activeKeycard.id === keycard.id ? 'selected':''}">
                  <div class="memex-logo">
                    ${keycardIcon}
                  </div>
                  <div class="memex-title">
                    ${keycard.title}
                  </div>
                  <div class="memex-description">
                    ${keycard.description}
                  </div>
                </button>
              </div>
              <div>
                <button data-share="${keycard.id}" class="standard-button -round -stealth">
                  <sl-icon name="qr-code"></sl-icon>
                </button>
              </div>
            </div>
          `
        }).join('')}
      </div>
    `
    return `
      <div class="now" data-mode="memex">
        <div class="memex-header">
          <div class="memex-header-left">
            <button class="logo-gradient" data-plan98>
              Memex
            </button>
          </div>

          <div class="memex-header-mid">
            <div data-dom="time" class="now-time"></div>
          </div>

          <div class="memex-header-right">
            <button class="logo-area" data-assistant>
              <plan98-icon style="height: 1.5rem; width: 1.5rem;"></plan98-icon>
            </button>
          </div>
        </div>
        <div class="memex-body">
          ${list}
        </div>
      </div>
      <div class="abs-bottom-right">
        <button class="create-item standard-button" data-new-memex>
          <sl-icon name="plus-lg"></sl-icon>
        </button>
      </div>
    `
  },
  [views.types]: (target) => {
    return `
      <div class="overlay-background">
        <div class="form-card">
          <div class="draft-template">
            <div class="draft-header">
              <div style="display: grid; place-content: start">
              </div>

              <div style="display: grid; place-content: end">
                <button data-cancel-type-picker class="standard-button bias-generic -small -round" type="reset">
                  <sl-icon name="x-lg"></sl-icon>
                </button>
              </div>
            </div>
            <div class="draft-body child-well">
              <div class="types-list">
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.note}">Note</button>
                </div>
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.image}">Camera</button>
                </div>
                <!--
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.richtext}">Document</button>
                </div>
                -->
                <!--
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.memo}">Memo</button>
                </div>
                -->
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.audio}">Audio</button>
                </div>
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.sketch}">Sketch</button>
                </div>
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.xanadoc}">Xanadoc</button>
                </div>
                <div class="dropdown-item">
                  <!--<button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.keycard}">Keycard</button>-->
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.video}">Video</button>
                </div>
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.agent}">Agent</button>
                </div>
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.bulletin}">Bulletin</button>
                </div>
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.zipfile}">Zipfile</button>
                </div>
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.product}">Product</button>
                </div>
                <!--
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.sheet}">Sheet</button>
                </div>
                -->
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.character}">Character</button>
                </div>
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.broblox}">Broblox</button>
                </div>
                <div class="dropdown-item">
                  <button class="standard-button -large -stealth bias-generic" data-new="${eventTypes.saga}">Saga</button>
                </div>
              </div>
            </div>
            <div class="draft-footer">
              Pick something to create
            </div>
          </div>
        </div>
      </div>

      <div class="chat-footer">
        <div class="app-launcher">
          <div class="data-types">
          </div>
        </div>
      </div>
    `
  },
  [views.create]: (target) => {
    const { draft, viewMetadata, context } = $.learn()
    const studio = renderStudioByType.call(context, draft)
    return `
      <div class="overlay-background">
        <div class="form-card">
          <div class="draft-template">
            <div class="draft-header">
              <div style="display: grid; place-content: start">
                <div class="standard-button bias-generic -small -round" data-toggle-metadata="${viewMetadata ? 'on':'off'}">
                  <sl-icon name="gear-fill"></sl-icon>
                </div>
              </div>

              <div style="display: grid; place-content: end">
                <button data-cancel-draft class="standard-button bias-generic -small -round" type="reset">
                  <sl-icon name="x-lg"></sl-icon>
                </button>
              </div>
            </div>
            <div class="draft-body child-well">
              ${studio}
            </div>
            <div class="draft-footer">
              <input class="standard-input -small" data-bind="draft"  name="title" value="${escapeHyperText(draft.title)}" type="text"/>
              <button data-action="post" class="standard-button bias-positive -small" type="submit">
                <sl-icon name="check-lg"></sl-icon>
              </button>
            </div>
            <div class="draft-metadata">
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

              <div data-dom="metadata-fields"></div>
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
      <div class="note-margin">
        <div class="textarea">${escapeHyperText(x.text)}</div>
      </div>
    `)
  },
  [views.saga]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.saga],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <div class="media-margin">
        <media-plexer src="${x.src}"></media-plexer>
      </div>
    `)
  },

  [views.richtext]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.richtext],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <rich-text id="${x.id}"></rich-text>
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
  [views.broblox]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.broblox],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <div2>
        <the-oasis id="${x.id}" src="${x.src}"></the-oasis>
      </div2>
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
      <path-finder id="${x.id}"></path-finder>
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
  [views.xanadoc]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.xanadoc],
      ...event.data,
      space,
      time
    }

    return viewTemplate(x, `
      <xana-doc src="${x.src}"></xana-doc>
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

  [views.zipfile]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]
    const x = {
      ...schemas[views.zipfile],
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
      <agentic-dash agent="${x.agentId}"></agentic-dash>
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
  const {
    showFilters,
    searchQuery,
    activeTypes,
    space,
    time,
    now,
    buckets,
    view,
    draft,
    context,
    grabbing,
    viewMetadata
  } = $.learn()

  {
    const button = target.querySelector('[data-dom="create-button"]')
    if(button && draft.type !== button.dataset.tooltip) {
      button.dataset.tooltip = draft.type
    }
  }

  {
    const realm = target.querySelector('[data-dom="realm"]')
    if(realm.dataset.grabbing !== grabbing.toString()) {
      realm.dataset.grabbing = grabbing
    }
  }

  {
    const filters = target.querySelector('[data-dom="filters"]')
    if(filters && showFilters !== target.dataset.filters) {
      target.dataset.filters = showFilters
      innerHTML(filters, showFilters
        ? renderFilters()
        : '')
    }
  }


  {
    const content = target.querySelector('[data-dom="content"]')
    if(
      target.type !== draft.type ||
      target.view !== view ||
      (target.dataset.space && target.dataset.space !== space) ||
      (target.dataset.time && target.dataset.time !== time)
    ) {
      target.view = view
      target.type = draft.type
      if(!space && target.dataset.space) {
        delete target.dataset.space
      } else if(time) {
        target.dataset.space = space
      }

      if(!time && target.dataset.time) {
        delete target.dataset.time
      } else if(time) {
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
    for(const key in bucketKeys) {
      /*
      const events = Object.keys(buckets[key])
      if(target[key] !== events.length ||
        searchQuery !== target.searchQuery ||
        activeTypes !== target.activeTypes
      ) {
        target[key] = events.length
        */
        const node = target.querySelector(`[data-dom="${key}"]`)
        if(node) {
          const list = renderBucket(key)
          const config = bucketTypeObjectClass[key] || {}

          const html = list ? `
            <div class="era-header">
              <div class="era-label">
                ${config.label || 'Era'}
              </div>
            </div>
            <div class="era-events">${list}</div>
          ` : ''
          innerHTML(node, html)
          //node.innerHTML = html
        }
      //}
    }
    target.searchQuery = searchQuery 
    target.activeTypes = activeTypes 
  }
  {
    const time = target.querySelector('[data-dom="time"]')
    if(time && (now !== target.now || !time.innerHTML)) {
      target.now = now
      time.innerHTML = `
        <div class="flip-clock">
          <div class="flip-date">
            <!--${formatDate(now)}-->
          </div>
          <div class="flip-time">
            ${formatTime(now)}
          </div>
        </div>
      `
    }
  }



  {
    const fieldArea = target.querySelector('[data-dom="metadata-fields"]')
    if(view === views.create && fieldArea) {
      const form = renderCreationFormByType.call(context, draft)
      innerHTML(fieldArea, form)
    }
  }

  {
    if(target.dataset.showMetadata !== viewMetadata) {
      target.dataset.showMetadata = viewMetadata
    }
  }

}

// you are my diary
$.draw((target)=> {
  const { ready } = $.learn()
  if(!ready && !target.innerHTML) return `
    <welcome-onboarding></welcome-onboarding>
  `
  query(target)
  if(target.innerHTML) return

  return `
    <div data-dom="realm" class="chat-realm">
      <div data-dom="content" data-mode="item" class="content-area"></div>
      <div class="fallback">
        <div class="wizard">
          <div>
            <plan98-icon></plan98-icon>
          </div>
          <div class="form-title">
            Plan98: A Memex
          </div>
          <div class="form-description">
            a MEM-ory EX-pansion device.
          </div>
          <div class="form-description">
            With a Memex, teams can communicate across the globe, securely, in an instant.
          </div>

          <div class="form-subtitle">
            Healthcare
          </div>
          <div class="form-description">
            A doctor may use a Memex as a personal assistant that transcribes voice notes into searchable documents to more effectively scan patient interactions.
          </div>
          <div class="form-description">
            Their memex may highlight key insights that the doctor can customize and share with the patient, nurse, and pharmacist.
          </div>
          <div class="form-description">
            Their memex is capable of facilitating the communications securely, serving as a one stop bridge for the entire care team.
          </div>

          <div class="form-subtitle">
            Technology
          </div>
          <div class="form-description">
            A manager may use a Memex to track the history of a product through the lifecycle of scoping, budgeting, designing, developing, testing, and maintaining it.
          </div>
          <div class="form-description">
            This standard process involves collaboration with individuals across finance, marketing, science, quality, and operations.
          </div>
          <div class="form-description">
            The manager may have a memex per project, one where anyone on a project can transparently track work and another secured as "need to know".
          </div>

          <div class="form-subtitle">
            Education
          </div>
          <div class="form-description">
            Virtual learning allows students to learn and submit their homework from anywhere.
          </div>
          <div class="form-description">
            With their assigments and achievements in their memex, they can bring their success from grade school to university and ultimately into the workforce.
          </div>
          <div class="form-description">
            By consolidating the digital touchpoints of online learning into a Memex, more attention can be spent on topics that matter: subject matter.
          </div>

          <div class="form-subtitle">
            Use Cases
          </div>
          <div class="form-description">
            Are as simple as: "Multiple people over multiple days need to stay on the same page."
          </div>
          <div class="form-description">
            Which is only a problem since: "Nobody can agree on which link to use for 'the same page'."
          </div>
          <div class="form-description">
            And can be solved by deciding: "This page is a good of a page as any to be <strong>our same page</strong>."
          </div>
        </div>
      </div>
    </div>
  `
}, {
  beforeUpdate(target) {
    {
      //saveCursor(target)
    }

    const q = target.getAttribute('q')
    const src = target.getAttribute('src') || '/app/plan98-wallet'
    const view = target.getAttribute('view')
    if(!target.initialized) {
      target.initialized = true

      const activeKeycard = getKeycard()

      let hasKeycard = false
      if(activeKeycard) {
        hasKeycard = true
        $.teach({ ready: true })
      }

      const data = target.getAttribute('data')
      if(data) {
        const request = JSON.parse(atob(data))
        const { memex } = request.params

        if(memex) {
          requestKeycardInsertion(memex).then(() => {
            const activeKeycard = getKeycard()

            if(!hasKeycard && activeKeycard) {
              target.innerHTML = ''
              $.teach({ ready: true })
            }
          })
        }
      }


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
      const { ready } = $.learn()
      if(!ready) {
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

function renderFilters() {
  const { activeTypes } = $.learn()
  return `
    <div class="era">
      <div class="era-header">
        <div class="era-label">
          Types
        </div>
      </div>
      <div class="era-events">
        <div>
          ${Object.keys(eventTypes).map(key => {
            const value = eventTypes[key]
            return `
              <label class="field -inline">
                <input data-check="activeTypes" type="checkbox" name="filter-${key}" value="${value}" data-option="${value}" ${activeTypes['filter-'+key] ? 'checked="true"':''} />
                <span class="label">${value}</span>
              </label>
            `
          }).join('')}
        </div>
  
      </div>
    </div>
  `
}

const eventTypeObjectClass = {
  [eventTypes.note]: {
    label: 'Note',
    icon: '<sl-icon name="input-cursor-text"></sl-icon>',
  },
[eventTypes.saga]: {
    label: 'Saga',
    icon: '<sl-icon name="input-cursor-text"></sl-icon>',
  },

  [eventTypes.richtext]: {
    label: 'Document',
    icon: '<sl-icon name="file-earmark-richtext"></sl-icon>',
  },
  [eventTypes.memo]: {
    label: 'Memo',
    icon: '<sl-icon name="paperclip"></sl-icon>',
  },
  [eventTypes.keycard]: {
    label: 'Keycard',
    icon: '<sl-icon name="person-badge"></sl-icon>',
  },
  [eventTypes.zipfile]: {
    label: 'Zipfile',
    icon: '<sl-icon name="file-zip"></sl-icon>',
  },
  [eventTypes.product]: {
    label: 'Product',
    icon: '<sl-icon name="box2-heart"></sl-icon>',
  },
  [eventTypes.sheet]: {
    label: 'Sheet',
    icon: '<sl-icon name="table"></sl-icon>',
  },
  [eventTypes.agent]: {
    label: 'Agent',
    icon: '<sl-icon name="robot"></sl-icon>',
  },
  [eventTypes.tommi]: {
    label: 'Tommi',
    icon: '<sl-icon name="battery-charging"></sl-icon>',
  },
  [eventTypes.broblox]: {
    label: 'Broblox',
    icon: '<sl-icon name="joystick"></sl-icon>',
  },
  [eventTypes.character]: {
    label: 'Character',
    icon: '<sl-icon name="person-walking"></sl-icon>',
  },
  [eventTypes.bulletin]: {
    label: 'Bulletin',
    icon: '<sl-icon name="copy"></sl-icon>',
  },
  [eventTypes.sketch]: {
    label: 'Sketch',
    icon: '<sl-icon name="pencil"></sl-icon>',
  },
  [eventTypes.xanadoc]: {
    label: 'Xanadoc',
    icon: '<sl-icon name="circle-square"></sl-icon>',
  },
  [eventTypes.image]: {
    label: 'Image',
    icon: '<sl-icon name="camera"></sl-icon>',
  },
  [eventTypes.audio]: {
    label: 'Audio',
    icon: '<sl-icon name="speaker"></sl-icon>',
  },
  [eventTypes.video]: {
    label: 'Video',
    icon: '<sl-icon name="camera-reels"></sl-icon>',
  },
  [eventTypes.archive]: {
    label: 'Archive',
    icon: '<sl-icon name="file-zip"></sl-icon>',
  },
  [eventTypes.dwebcamp]: {
    label: 'Dweb Camp',
    icon: '<sl-icon name="fire"></sl-icon>',
  },
}


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
  [eventTypes.sketch]: function (event) {
    const data = {
      ...schemas[views.sketch],
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
      ...schemas[views.image],
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
  edge: function (event) {
    const data = {
      ...schemas[views.edge],
      ...event.data
    }
    const config = eventTypeObjectClass[event.data.type] || {}

    return `
      <div class="event-horizon">
        <div class="meta-column">
          <span class="event-type-icon">
            ${config.icon || `<sl-icon name="asterisk"></sl-icon>`}
          </span>
        </div>
        <div>
          <button class="view-event standard-button -small -stealth" data-show="${event.data.type}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
            ${data.title}
          </button>
        </div>
      </div>
    `
  }
}

function renderBucket(spaceKey) {
  const { buckets, suggestions, activeTypes } = $.learn()
  const typeKeys = Object.keys(activeTypes).map(x => x.split('filter-')[1])

  return Object.keys(buckets[spaceKey]).map(key => {
    const event = buckets[spaceKey][key]

    let active = true
    if(suggestions.length > 0 && typeKeys.length > 0) {
      active = suggestions.includes(event.data.id) && typeKeys.includes(event.data.type)
    } else if(suggestions.length > 0) {
      active = suggestions.includes(event.data.id)
    } else if(typeKeys.length > 0) {
      active = typeKeys.includes(event.data.type)
    }

    return `
      <div class="event ${active?'active':'inactive'}">
        ${eventRenderers.edge(event)}
      </div>
    `
  }).join('')
}

/*
 * https://stackoverflow.com/a/36640126
 */
function copyToClipboard(target) {
  if (document.selection) {
    const range = document.body.createTextRange();
    range.moveToElementText(target);
    range.select().createTextRange();
    document.execCommand("copy");
    toast("Copied to clipboard")
  } else if (window.getSelection) {
    const range = document.createRange();
    range.selectNode(target);
    window.getSelection().addRange(range);
    document.execCommand("copy");
    toast("Copied to clipboard")
  }
  window.getSelection().removeAllRanges()
}

$.when('click', '[data-copy]', (event) => {
  const { copy } = event.target.dataset
  const targetToCopy = event.target.closest($.link).querySelector(`[id="${copy}"]`)
  copyToClipboard(targetToCopy)
})


$.when('click', '[data-root]', (event) => {
  $.teach({ view: views.home, searchQuery: '', showFilters: false, suggestions: [] })
})



$.when('click', '[data-toggle-filters]', (event) => {
  $.teach({ showFilters: !$.learn().showFilters })
})

$.when('click', '[data-emergency]', (event) => {
  $.teach({ view: views.emergency })
})

$.when('click', '[data-plan98]', (event) => {
  $.teach({ view: views.identity })
})

$.when('click', '[data-assistant]', (event) => {
  launch()
})

$.when('input', '[name="searchQuery"]', (event) => {
  const { value } = event.target;
  const suggestions = idx.search(value).map(x => x.ref)
  $.teach({ suggestions, searchQuery: value  })
})

$.when('click', '[data-toggle-metadata]', (event) => {
  const { viewMetadata } = $.learn()
  $.teach({ viewMetadata: !viewMetadata })
})

$.when('click', '[data-action="memex"]', async (event) => {
  event.preventDefault()
  const { memex } = $.learn()

  const existing = listKeycards().find(x => x.id === memex.id)

  if(existing) {
    await requestKeycardPaste(memex)
  } else {
    await provisionActiveKeycard(memex)
  }
  $.teach({ view: views.home, searchQuery: '', suggestions: [] })
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

export async function saveZipfile(draft, context) {
  return await save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.zipfile,
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

export async function saveWorld(draft, context) {
  return await save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.broblox,
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

export async function saveXanadoc(draft, context) {
  return await save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.xanadoc,
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
  let path = context.path || newEventPath(draft)

  const event = {
    ...(schemas[draft.type] || {}),
    ...draft,
    persona: currentPersona()
  }

  await put(path, JSON.stringify(event), { type: 'application/json' })

  // Don't await fate() here — let caller handle it
  appendPath(path) // fire and forget

  const { spaceKey, timeKey } = getSpaceTimeFromEventPath(path)
  return { path, spaceKey, timeKey }
}

function currentPersona() {
  const { sessionId, companyEmployeeId, companyName } = getSession()

  if(!sessionId) {
    return null
  }

  return `${companyEmployeeId}@${companyName}`
}

const saveHandlers = {
  [eventTypes.note]: save,
  [eventTypes.saga]: save,
  [eventTypes.richtext]: save,
  [eventTypes.memo]: save,
  [eventTypes.tommi]: save,
  [eventTypes.instrument]: save,
  [eventTypes.broblox]: saveWorld,
  [eventTypes.character]: saveCharacter,
  [eventTypes.bulletin]: saveBulletin,
  [eventTypes.sketch]: saveSketch,
  [eventTypes.xanadoc]: saveXanadoc,
  [eventTypes.gallery]: save,
  [eventTypes.image]: savePhoto,
  [eventTypes.audio]: saveAudio,
  [eventTypes.video]: saveVideo,
  [eventTypes.archive]: save,
  [eventTypes.keycard]: saveKeycard,
  [eventTypes.zipfile]: saveZipfile,
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

export function destroy(target, context) {
  if(!context) return
  // Attempt to upload to server
  del(context.path).then(response => {
    if (!response.ok) {
      // Explicitly throw for non-200 responses
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    reset(target)
    removePath(context.path)
  }).catch(error => {
    console.warn(error);
  });

}

async function removePath(path) {
  await get('time-machine').then(async response => {
    const obj = await response.text().then(str => JSON.parse(str))
    const existing = (obj.paths || [])
    if(existing.includes(path)) {
      const paths = [...existing].filter(x => x !== path)
      await put('time-machine', JSON.stringify({ ...obj, paths }), { type: 'application/json' })
    }
  })

  fate()
}


$.when('click', '[data-action="post"]', async (event) => {
  event.preventDefault()

  const { draft, context } = $.learn()

  if(draft) {
    $.teach({ view: views.thinking })

    const data = await saveByType(draft, context).catch(e => {
      console.error(e)
      toast(e.message, { type: 'error' })
      $.teach({ view: views.create })
    })

    if(data) {
      // Optimistically update buckets so UI is instant
      const { spaceKey, timeKey, path } = data
      $.teach({
        spaceKey,
        timeKey,
        path,
        event: {
          spaceKey,
          timeKey,
          handle: { path, name: path.split('/').pop() },
          data: { ...schemas[draft.type], ...draft }
        }
      }, mergeEvent)

      toast('Saved!', { type: 'success' })
      $.teach({ view: draft.type, space: spaceKey, time: timeKey })

      // Re-index in background, don't block UI
      fate()
    }
  } else {
    $.teach({ view: views.create })
    toast('Incomplete information, please try again.', { type: 'error' })
  }
})


$.when('click', '[data-destroy]', async (event) => {
  event.preventDefault()
  try {
    destroy(event.target, { path: event.target.dataset.destroy })
    toast('Destroyed!', { type: 'info' })
    $.teach({ view: views.events, context: null, viewMetadata: false })
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

  $.teach({ view: views[show], space, time, viewMetadata: false, activeMenuItem: null })
})

$.when('click', '[data-new]', (event) => {
  const type = event.target.dataset.new || $.learn().draft.type

  if(eventTypes[type]) {
    $.teach({
      name: 'type',
      value: type
    }, {
      mergeHandler: bound,
      parameters: ['draft']
    })
  }

  const draft = newDraft(type || 'note')
  const path = newEventPath(draft)
  $.teach({
    view: views.create,
    draft,
    viewMetadata: false,
    activeMenu: null,
    context: { path }
  })
})

$.when('click', '[data-new-memex]', (event) => {
  $.teach({ view: views.memex, viewMetadata: false, memex: newDraft(eventTypes.keycard) })
})

$.when('click', '[data-new-creation]', (event) => {
  $.teach({ view: views.types })
})

$.when('click', '[data-quit]', (event) => {
  window.location.href = '/app/plan98-wallet'
})

$.when('click', '[data-cancel-draft]', () => {
  $.teach({ view: views.events, context: null, showFilters: false, viewMetadata: false })
})

$.when('click', '[data-cancel-type-picker]', () => {
  $.teach({ view: views.events })
})


$.when('click', '[data-close-draft]', () => {
  $.teach({ view: views.events, context: null, showFilters: false, viewMetadata: false })
})

$.when('click', '[data-home]', () => {
  $.teach({ view: views.home, searchQuery: '', suggestions: [] })
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
  return Horizon(date).toLocaleString('en-US', options);
}

function stamp(x) {
  const date = new Date(x.year, x.month, x.day, x.hour, x.minute)
  return `
    <div class="draft-footer">
      <div class="draft-title">
        ${escapeHyperText(x.title)}
      </div>
      <button data-action="edit" data-view="${views.create}" data-space="${x.space}" data-time="${x.time}" class="standard-button -small  bias-positive" type="submit">
        <sl-icon name="pencil-fill"></sl-icon>
      </button>
    </div>
    <div class="view-metadata">

      ${renderDraftMetadata(x, 'description')}
      ${renderDraftMetadata(x, 'transcription')}

      ${formatDate(date)} @ ${formatTime(date)}

      by ${x.persona || 'anonymous'}
    </div>
  `
}

function renderDraftMetadata(x, key) {
  return x[key] ? `
    <div class="draft-${key}">
      ${escapeHyperText(x[key])}
    </div>
  ` : ''
}

$.when('click', '[data-share]', (event) => {
  const { share } = event.target.dataset
  const keycards = listKeycards()
  const memex = keycards.find(x => x.id === share)

  if(memex) {
    $.teach({ view: views.memex, viewMetadata: false, memex })
  }
})

$.when('click', '[data-delete-memex]', (event) => {
  const { deleteMemex } = event.target.dataset
  requestKeycardDeletion(deleteMemex)
  $.teach({ view: views.home, memex: getKeycard() })
})


$.when('click', '[data-show-memex]', (event) => {
  const { showMemex } = event.target.dataset
  setKeycard(showMemex)

  reset(event.target.closest($.link))
  fate()
  $.teach({ view: views.events })
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

$.when('input', '[data-bind]', handleBind)

function handleBind(event) {
  const { bind, format } = event.target.dataset
  if(bind) {
    $.teach({
      name: event.target.name,
      value: formatify(format, event.target.value)
    }, {
      mergeHandler: bound,
      parameters: [bind]
    })
  } else {
    $.teach({ 
      name: event.target.name,
      value: formatify(format, event.target.value)
    })
  }
}

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

$.when('input', '[data-check]', handleCheck)

function handleCheck(event) {
  const { check } = event.target.dataset
  const { name, checked } = event.target
  $.teach({
    name: name,
    value: checked
  }, {
    mergeHandler: reduceCheckmark,
    parameters: [check]
  })
}

function reduceCheckmark(key) {
  return (state, payload) => {
    const newFields = {
      ...state[key],
      [payload.name]: payload.value
    }

    if(payload.value === false) {
      delete newFields[payload.name]
    }

    return {
      ...state,
      [key]: newFields
    }
  }
}

function reduceUncheck(key) {
  return (state, payload) => {
    return {
      ...state,
      [key]: {
        ...state[key],
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

$.when('json-rpc', 'welcome-onboarding', async (event) => {
  if(event.detail.method === 'done') {
    event.target.closest($.link).innerHTML = ''
    await fate()
    $.teach({ ready: true })
  }
})

$.when('click', '[data-os-target]', (event) => {
  event.preventDefault()
  const { activeMenu } = $.learn()
  const { osTarget } = event.target.dataset
  const same = activeMenu === osTarget
  $.teach({ activeMenu: same ? null : osTarget })
  event.stopImmediatePropagation()
})

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


