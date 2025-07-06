import elf from '@silly/elf'
import { innerHTML } from 'diffhtml'
import { toast } from './plan98-toast.js'
import $paperPocket, { afterUpdateTheme, replaceElves } from './paper-pocket.js'
import { getKeycard, listKeycards, setKeycard, getStorage, getSigner, get, del, put, touch } from './plan98-wallet.js'
import { launch } from './plan98-synthia.js'
import JSZip from 'jszip'

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

const emptyBuckets = {
  [bucketKeys.past]: {},
  [bucketKeys.lastWeek]: {},
  [bucketKeys.yesterday]: {},
  [bucketKeys.today]: {},
  [bucketKeys.tomorrow]: {},
  [bucketKeys.thisWeek]: {},
  [bucketKeys.nextWeek]: {},
  [bucketKeys.future]: {},
}

const today = new Date();
const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
const nextWeek = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

export const eventTypes = {
  note: 'note',
  tommi: 'tommi',
  instrument: 'instrument',
  sketch: 'sketch',
  gallery: 'gallery',
  image: 'image',
  audio: 'audio',
  video: 'video',
  archive: 'archive',
  product: 'product',
  dwebcamp: 'dwebcamp'
}

export const views = {
  wallet: 'wallet',
  create: 'create',
  [eventTypes.note]: eventTypes.note,
  [eventTypes.tommi]: eventTypes.tommi,
  [eventTypes.product]: eventTypes.product,
  [eventTypes.instrument]: eventTypes.instrument,
  [eventTypes.sketch]: eventTypes.sketch,
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
    title: 'Untitled',
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
    title: 'Untitled',
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
    title: 'Untitled',
    description: null,
    tags: [],
    city: null,
    country: null,
    longitude: null,
    latitude: null,
  },
  [eventTypes.instrument]: {
    type: eventTypes.instrument,
    title: 'Untitled',
  },
  [eventTypes.sketch]: {
    type: eventTypes.sketch,
    title: 'Untitled',
  },
  [eventTypes.note]: {
    type: eventTypes.note,
    title: 'Untitled',
    text: '',
  },
  [eventTypes.gallery]: {
    type: eventTypes.gallery,
    title: 'Untitled',
    description: null,
    tags: [],
  },
  [eventTypes.image]: {
    type: eventTypes.image,
    title: 'Untitled',
    description: null,
    tags: [],
  },
  [eventTypes.audio]: {
    type: eventTypes.audio,
    title: 'Untitled',
    description: null,
    tags: [],
  },
  [eventTypes.video]: {
    type: eventTypes.video,
    title: 'Untitled',
    description: null,
    tags: [],
  },

  [eventTypes.dwebcamp]: {
    type: eventTypes.dwebcamp,
    location: null,
    locations: ['Wayback Wheel', 'Hackers Hall', 'Migration Library', 'Treehouse', 'Cultivation Station', 'Access to Knowledge Amphitheater', 'Campfire', 'Stages', 'AI Think Tank', 'Art Barn', 'Volunteers HQ', 'Nest', 'Impact Island', 'Heartwood Chapel', 'Lightning Salon', 'Tea Tent', 'Redwood Cathedral'],
    title: 'Untitled',
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

// dear diary
const $ = elf('time-machine', {
  cards: [],
  grabbing: false,
  sidebar: true,
  space: null,
  time: null,
  now: new Date(),
  buckets: emptyBuckets,
  draft: newDraft(eventTypes.note),
  meta: {},
  context: null
})

$.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
    position: relative;
    animation: &-fade-in 1000ms ease-in-out forwards;
    background: black;
    opacity: 0;
  }

  @keyframes &-fade-in {
    0% {
      opacity: 0;
      background: black;
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
    text-align: right;
    padding: .5rem;
    grid-template-columns: auto 1fr;
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
    bottom: 1rem;
    right: 1rem;
    display: inline-grid;
    grid-template-columns: auto auto;
    z-index: 1000;
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
    border-bottom: 1px solid rgba(0, 0, 0,.2);
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

  & .content-area:empty {
    display: none;
  }

  & .fallback {
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
    font-weight: bold;
    color: rgba(0,0,0,.45);
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
    grid-template-rows: auto 1fr;
    overflow: hidden;
    max-height: 100%;
    grid-template-areas: "footer header" "body body";
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

  & .text-well {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  & .text-well .textarea {
    padding: .5rem;
    white-space: preserve;
    overflow: auto;
    line-height: 1;
  }

  & .text-well textarea {
    padding: .5rem;
    resize: none;
    border: none;
    width: 100%;
    height: 100%;
    overflow: auto;
    line-height: 1;
  }

  & .text-well .edit-banner:empty + textarea {
    grid-row: -1 / 1;
  }

  & .draft-header {
    display: grid;
    grid-template-columns: auto auto;
    grid-area: header;
    background: rgba(0,0,0,.1);
    padding: .5rem;
    gap: .5rem;
  }

  & .draft-body {
    grid-area: body;
  }

  & .draft-metadata {
    display: none;
    grid-area: body;
    z-index: 1;
    background: white;
  }

  & .view-metadata {
    display: none;
    padding: .5rem;
    height: 100%;
    z-index: 1;
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
    padding: .5rem;
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
    border: none;
    background: white;
    border-radius: 0;
    padding: .5rem;
    color: rgba(0,0,0,.65);
    display: block;
    text-align: left;
    transition: transform ease-in-out 100ms;
    width: 100%;
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

  & .view-event:hover,
  & .view-event:focus {
    color: rgba(0,0,0,.85);
    background: rgba(0,0,0,.2);
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
  }

  & .note-preview-2 {
    color: rgba(0,0,0,.35);
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
    bottom: 0px;
    left: 0;
    max-height: calc(100vh);
    max-width: calc(100vw - 40px);
    overflow: auto;
    transform: translate(calc(-100% + 1.25rem), 1rem);
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
  const space = storage.space({
    signer,
    id: `urn:uuid:${keycard.id}`
  })

  async function addData(response) {
    try {
      const data = await response.text()
      const { paths } = JSON.parse(data)
      if(!paths) return

      const resources = paths.map(x => space.resource(x))

      const events = await Promise.all(
        resources.map((resource, i) => resource.get({ signer }).then(res => res.json()).then(data => {
          const parts = paths[i].split('/')
          const name = parts[parts.length - 1]
          return {
            handle: { path: paths[i], name },
            data
          }
        }).catch(e => {
          return {
            error: e,
          }
        }))
      )

      $.teach(events, mergeEvents)
    } catch(e) {
      console.error(e)
    }
  }


  const res = await get(`time-machine`).then(addData).catch(async (error) => {
    await touch('time-machine')
    get('time-machine').then(addData)
  })
}

function mergeEvents(state, payload) {
  const buckets = {
    past: {},
    lastWeek: {},
    yesterday: {},
    today: {},
    tomorrow: {},
    thisWeek: {},
    nextWeek: {},
    future: {}
  };

  payload.filter(x => {
    return !x.error
  }).forEach(file => {
    try {
      const [timeKey] = file.handle.name.split('.json')
      const fileDate = new Date(timeKey);
      const fileDateOnly = new Date(fileDate.getFullYear(), fileDate.getMonth(), fileDate.getDate());

      if (fileDateOnly.getTime() < lastWeek.getTime()) {
        const spaceKey = bucketKeys.lastWeek
        buckets[spaceKey][timeKey] = timeMachine(spaceKey, timeKey, file);
      } else if (fileDateOnly.getTime() < yesterday.getTime()) {
        const spaceKey = bucketKeys.yesterday
        buckets[spaceKey][timeKey] = timeMachine(spaceKey, timeKey, file);
      } else if (fileDateOnly.getTime() < today.getTime()) {
        const spaceKey = bucketKeys.today
        buckets[spaceKey][timeKey] = timeMachine(spaceKey, timeKey, file);
      } else if (fileDateOnly.getTime() > nextWeek.getTime()) {
        const spaceKey = bucketKeys.future
        buckets[spaceKey][timeKey] = timeMachine(spaceKey, timeKey, file);
      } else if (fileDateOnly.getTime() < tomorrow.getTime()) {
        const spaceKey = bucketKeys.tomorrow
        buckets[spaceKey][timeKey] = timeMachine(spaceKey, timeKey, file);
      } else if (fileDateOnly.getTime() <= thisWeek.getTime()) {
        const spaceKey = bucketKeys.thisWeek
        buckets[spaceKey][timeKey] = timeMachine(spaceKey, timeKey, file);
      } else if (fileDateOnly.getTime() <= nextWeek.getTime()) {
        const spaceKey = bucketKeys.nextWeek
        buckets[spaceKey][timeKey] = timeMachine(spaceKey, timeKey, file);
      } else {
        const spaceKey = bucketKeys.past
        buckets[bucketKeys.past][timeKey] = timeMachine(spaceKey, timeKey, file);
      }
    } catch (_e) {
      console.warn(`Skipping invalid filename: ${file.handle.name}`);
    }
  });

  return {
    ...state,
    buckets,
  }
}

function timeMachine(spaceKey, timeKey, file) {
  return {
    spaceKey,
    timeKey,
    ...file
  }
}

function editBanner(context) {
  return `
    <div class="edit-banner">${context?`
      <button class="standard-button -smol bias-negative" data-destroy="${context.path}">
        Delete
      </button>
      <span class="edit-label">
        Editing: ${context.name}
      </span>
    `:''}</div>
  `
}

export const creationForms = {
  [eventTypes.note]: function(draft) {
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
  [eventTypes.product]: function(draft) {

    const x = {
      ...schemas[views.product],
      ...draft,
    }

    return `
      ${editBanner(this)}
      <div style="display: grid; grid-template-columns: 1fr 1fr;">
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
        name="text"
        data-bind="draft"
        placeholder="This is a space for you."
      >${escapeHyperText(draft.text)}</textarea>
    `
  },
  [eventTypes.image]: function(draft) {
    return `
      <was-camera id="${draft.id}"></was-camera>
    `
  },
  [eventTypes.sketch]: function(draft) {
    return `
      <sketch-pad id="${draft.id}"></sketch-pad>
    `
  },
  [eventTypes.audio]: function(draft) {
    return `
      <audio-notes id="${draft.id}"></audio-notes>
    `
  },
  [eventTypes.video]: function(draft) {
    return `
      <video-notes id="${draft.id}"></video-notes>
    `
  },
  [eventTypes.gallery]: function(draft) {
    return `
    `
  },
  [eventTypes.product]: function(draft) {

    const x = {
      ...schemas[views.product],
      ...draft,
    }

    return `
      ??? What type of custom product should go here
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
  return studios[draft.type] ? studios[draft.type].call(this, draft) : ''
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

const viewRenderers = {
  [views.wallet]: (target) => {
    return `
      <div class="overlay-background">
        <div class="form-card">
          <div class="draft-template">
            <div class="draft-header">
              <button data-cancel-draft class="standard-button bias-generic -clear" style="place-self: start;" type="reset">
                Cancel
              </button>
            </div>
            <div class="wallet-body draft-body">
              <my-wallet></my-wallet>
            </div>
            <div class="draft-footer">
              :)
            </div>
          </div>
        </div>
      </div>
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
              <button data-cancel-draft class="standard-button bias-generic -small -outlined" style="place-self: start;" type="reset">
                Cancel
              </button>
              <button data-action="post" class="standard-button bias-positive -small" style="place-self: start end;" type="submit">
                Save
              </button>
            </div>
            <div class="draft-body text-well">
              ${studio}
            </div>
            <div class="draft-footer">
              <div class="standard-button bias-generic -small" data-toggle-metadata="${viewMetadata ? 'on':'off'}">
                <sl-icon name="gear-fill"></sl-icon>
              </div>
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
    }

    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="edit" method="post" class="draft-template">
            <div class="draft-header">
              <button data-close-draft class="standard-button bias-generic -small" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button -small  bias-positive" style="place-self: start end;" type="submit">
                Edit
              </button>
            </div>
            <div class="draft-body text-well">
              <div class="textarea">${escapeHyperText(x.text)}</div>
            </div>
            ${stamp(x)}
          </form>
        </div>
      </div>
    `
  },
  [views.sketch]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.sketch],
      ...event.data,
    }

    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="edit" method="post" class="draft-template">
            <div class="draft-header">
              <button data-close-draft class="standard-button bias-generic -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button bias-positive -small" style="place-self: start end;" type="submit">
                Edit
              </button>
            </div>
            <div class="draft-body image-well">
              <was-image src="${x.src}"></was-image>
            </div>
            ${stamp(x)}
          </form>

        </div>
      </div>
    `
  },
  [views.image]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.image],
      ...event.data,
    }

    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="edit" method="post" class="draft-template">
            <div class="draft-header">
              <button data-close-draft class="standard-button bias-generic -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button bias-positive -small" style="place-self: start end;" type="submit">
                Edit
              </button>
            </div>
            <div class="draft-body image-well">
              <was-image src="${x.src}"></was-image>
            </div>
            ${stamp(x)}
          </form>
        </div>
      </div>
    `
  },
  [views.video]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.video],
      ...event.data,
    }

    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="edit" method="post" class="draft-template">
            <div class="draft-header">
              <button data-close-draft class="standard-button bias-generic -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button bias-positive -small" style="place-self: start end;" type="submit">
                Edit
              </button>
            </div>
            <div class="draft-body image-well">
              <was-video src="${x.src}"></was-video>
            </div>
            ${stamp(x)}
          </form>
        </div>
      </div>
    `
  },
  [views.audio]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.audio],
      ...event.data,
    }

    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="edit" method="post" class="draft-template">
            <div class="draft-header">
              <button data-close-draft class="standard-button bias-generic -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button bias-positive -small" style="place-self: start end;" type="submit">
                Edit
              </button>
            </div>
            <div class="draft-body image-well">
              <was-audio src="${x.src}"></was-audio>
            </div>
            ${stamp(x)}
          </form>
        </div>
      </div>
    `
  },

  [views.product]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]
    const x = {
      ...schemas[views.product],
      ...event.data,
    }
    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="edit" method="post" class="draft-template">
            <div class="draft-header">
              <button data-close-draft class="standard-button bias-generic -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button bias-positive -small" style="place-self: start end;" type="submit">
                Edit
              </button>
            </div>
            <div class="draft-body text-well">
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
                <div class="location">
                  ${x.city || ''}, ${x.country || ''}
                </div>
                <div class="map">
                  ${x.longitude || ''}, ${x.latitude || ''}
                </div>
              </div>
            </div>
            ${stamp(x)}
          </form>
        </div>
      </div>
    `
  },


  [views.tommi]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]
    const x = {
      ...schemas[views.tommi],
      ...event.data,
    }
    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="edit" method="post" class="draft-template">
            <div class="draft-header">
              <button data-close-draft class="standard-button bias-generic -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button bias-positive -small" style="place-self: start end;" type="submit">
                Edit
              </button>
            </div>
            <div class="draft-body text-well">
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
            </div>
            ${stamp(x)}
          </form>
        </div>
      </div>
    `
  },
  [views.archive]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]
    const x = {
      ...schemas[views.archive],
      ...event.data,
    }
    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="edit" method="post" class="draft-template">
            <div class="draft-header">
              <button data-close-draft class="standard-button bias-generic -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button bias-positive -small" style="place-self: start end;" type="submit">
                Edit
              </button>
            </div>
            <div class="draft-body text-well">
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
            </div>
            ${stamp(x)}
          </form>
        </div>
      </div>
    `
  },
  [views.dwebcamp]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]
    const x = {
      ...schemas[views.dwebcamp],
      ...event.data,
    }
    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="edit" method="post" class="draft-template">
            <div class="draft-header">
              <button data-close-draft class="standard-button bias-generic -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button bias-positive -small" style="place-self: start end;" type="submit">
                Edit
              </button>
            </div>
            <div class="draft-body text-well">
              <div class="tommi">
                <div class="tommi-title">
                  <a href="${x.url || ''}" class="tommi-url">${x.title || x.url}</a>
                </div>
                <div class="tommi-location">
                  ${x.location || ''}
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
            </div>
            ${stamp(x)}
          </form>
        </div>
      </div>
    `
  },

  edge: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]
    return `
      <div class="overlay-background">
        <div class="form-card">
          <div class="draft-template">
            <div class="draft-header">
              <button data-close-draft class="standard-button bias-generic -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button bias-positive -small" style="place-self: start end;" data-action="edit" type="submit">
                Edit
              </button>
            </div>
            <div class="draft-body text-well">
              <div class="raw-json">${
                JSON.stringify(event.data, '', 2)
              }</div>
            </div>
            ${stamp(event)}
          </div>
        </div>
      </div>
    `
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
      const date = target.querySelector('[data-dom="date"]')
      const time = target.querySelector('[data-dom="time"]')
      date.innerHTML = formatDate(now)
      time.innerHTML = formatTime(now)
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

    if(target.keycardsLength !== list.length || activeKeycard.id !== target.activeKeycardId) {
      target.activeKeycardId = activeKeycard.id
      target.keycardsLength = list.length
      identity.innerHTML = `
        <select name="keycard" class="standard-button -smol">
          ${list.map(keycard => {
            return `
              <option value="${keycard.id}" ${activeKeycard.id === keycard.id ? 'selected':''}>${keycard.name}</option>
            `
          }).join('')}
        </select>
      `
    }
  }
}


// you are my diary
$.draw((target)=> {
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
          <button data-new="${eventTypes.product}">Product</button>
          <button data-new="${eventTypes.video}">Video</button>
          <button data-new="${eventTypes.image}">Photo</button>
          <button data-new="${eventTypes.sketch}">Sketch</button>
          <button data-new="${eventTypes.audio}">Audio</button>
          <button data-new="${eventTypes.note}">Note</button>
          <hr>
          <button data-quit>Quit</button>
        </div>
      </div>
    </div>
    <div data-dom="realm" class="chat-realm">
      <div class="now">
        <button class="logo-area" data-assistant>
          <plan98-icon style="height: 1.5rem; width: 1.5rem;"></plan98-icon>
        </button>
        <div class="identity-selector">
        </div>
        <div data-dom="date" class="now-date"></div>
        <div data-dom="time" class="now-time"></div>
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
            <button class="standard-button">
              <sl-icon name="funnel"></sl-icon>
            </button>
            <input class="standard-button" placeholder="?" type="text">
          </div>
        </div>
      </div>
      <div data-dom="content" class="content-area"></div>
      <div class="fallback">
        <world-map></world-map>
      </div>
    </div>
  `
}, {
  beforeUpdate(target) {
    {
      saveCursor(target)
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
      requestAnimationFrame(() => {
        patch(target)
        recoverElves(target, 'sl-icon')
      })
    }

    {
      replaceCursor(target)
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
      <button class="view-event" data-show="${eventTypes.note}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <div class="note-preview-1">
          ${firstLine}
        </div>
        <div class="note-preview-2">
          ${secondLine}
        </div>
      </button>
    `
  },
  [eventTypes.product]: function (event) {
    const data = {
      ...schemas[views.product],
      ...event.data
    }
    return `
      <button class="view-event" data-show="${eventTypes.product}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
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
      <button class="view-event" data-show="${eventTypes.tommi}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
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
      <button class="view-event" data-show="${eventTypes.sketch}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
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
      <button class="view-event" data-show="${eventTypes.image}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
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
      <button class="view-event" data-show="${eventTypes.audio}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        Audio: ${data.title}
      </button>
    `
  },
  [eventTypes.video]: function (event) {
    const data = {
      ...schemas[views.tommi],
      ...event.data
    }

    return `
      <button class="view-event" data-show="${eventTypes.video}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        Video: ${data.title}
      </button>
    `
  },


  [eventTypes.archive]: function (event) {
    const data = {
      ...schemas[views.archive],
      ...event.data
    }
    return `
      <button class="view-event" data-show="${eventTypes.archive}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
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
      <button class="view-event" data-show="${eventTypes.dwebcamp}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
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
      <button class="view-event" data-show="edge" data-space="${event.spaceKey}" data-time="${event.timeKey}">
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
  $.teach({ view: views.create, sidebar: true })
})

export function saveProduct(draft, context) {
  save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.product,
  }, context)
}


export function savePhoto(draft, context) {
  save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.image,
  }, context)
}

export function saveSketch(draft, context) {
  save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.sketch,
  }, context)
}

export function saveAudio(draft, context) {
  save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.audio,
  }, context)
}

export function saveVideo(draft, context) {
  save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.video,
  }, context)
}


export function save(draft, context) {
  const now = new Date(draft.year, draft.month, draft.day, draft.hour, draft.minute, draft.second);
  const timestamp = now.toJSON()
  let path = `/${timestamp}.json`
  if(context) {
    path = context.path
  }

  const filePath = `/private/time-machine${path}`
  // Attempt to upload to server
  put(filePath, JSON.stringify(draft), { type: 'application/json' }).then(response => {
    fate()
  }).catch(error => {
    console.warn(error);
  });

  appendPath(filePath)
}

function appendPath(path) {
  get('time-machine').then(async response => {
    const obj = await response.text().then(str => JSON.parse(str))
    const paths = [...(obj.paths || [])]
    paths.push(path)
    put('time-machine', JSON.stringify({ ...obj, paths }), { type: 'application/json' }).then(() => {
      fate()
    })
  })
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
    save(draft, context)
    toast('Created!', { type: 'success' })
    $.teach({ sidebar: true, view: null, space: null, time: null })
  } else {
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
  $.teach({ draft: h.data, viewMetadata: false, context: h.handle })
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
  const { draft } = $.learn()
  const type = event.target.dataset.new || draft.type

  if(eventTypes[type]) {
    $.teach({
      name: 'type',
      value: type
    }, bound('draft'))
  }

  $.teach({ view: views.create, draft: newDraft(type || 'note'), activeMenu: null, sidebar: false })
})

$.when('click', '[data-quit]', (event) => {
  window.location.href = '/app/plan98-wallet'
})

$.when('click', '[data-cancel-draft]', () => {
  const { draft, context } = $.learn()

  if(!context) {
    $.teach({ view: null, sidebar: true, context: null, viewMetadata: false })
  } else {
    $.teach({ view: draft.type })
  }
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
      <div class="standard-button bias-generic -small" data-toggle-metadata="${viewMetadata ? 'on':'off'}">
        <sl-icon name="gear-fill"></sl-icon>
      </div>
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
  $.teach({ buckets: emptyBuckets })

  for(const key in bucketKeys) {
    target[key] = 0
  }
}

$.when('input', '[data-bind]', (event) => {
  const { bind } = event.target.dataset
  $.teach({
    name: event.target.name,
    value: event.target.value
  }, bound(bind))
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


