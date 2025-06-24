import elf from '@silly/elf'
import { toast } from './plan98-toast.js'
import { showModal, hideModal } from './plan98-modal.js'
import $paperPocket, { afterUpdateTheme, replaceElves } from './paper-pocket.js'
import { getKeycard, getStorage, getSigner, get, del, put, touch } from './plan98-wallet.js'

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

const eventTypes = {
  journal: 'journal',
  tommi: 'tommi',
  instrument: 'instrument',
  sketch: 'sketch',
  gallery: 'gallery',
  image: 'image',
  audio: 'audio',
  video: 'video',
  archive: 'archive',
  dwebcamp: 'dwebcamp'
}

const views = {
  wallet: 'wallet',
  create: 'create',
  [eventTypes.journal]: eventTypes.journal,
  [eventTypes.tommi]: eventTypes.tommi,
  [eventTypes.instrument]: eventTypes.instrument,
  [eventTypes.sketch]: eventTypes.sketch,
  [eventTypes.gallery]: eventTypes.gallery,
  [eventTypes.image]: eventTypes.image,
  [eventTypes.audio]: eventTypes.video,
  [eventTypes.video]: eventTypes.audio,
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

const schemas = {
  [eventTypes.archive]: {
    type: eventTypes.archive,
    title: null,
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
    title: null,
    description: null,
    tags: [],
    city: null,
    country: null,
    longitude: null,
    latitude: null,
  },
  [eventTypes.instrument]: {
    type: eventTypes.instrument,
  },
  [eventTypes.sketch]: {
    type: eventTypes.sketch,
    title: null,
  },
  [eventTypes.journal]: {
    type: eventTypes.journal,
    text: '',
  },
  [eventTypes.gallery]: {
    type: eventTypes.gallery,
    title: null,
    description: null,
    tags: [],
  },
  [eventTypes.image]: {
    type: eventTypes.gallery,
    title: null,
    description: null,
    tags: [],
  },
  [eventTypes.dwebcamp]: {
    type: eventTypes.dwebcamp,
    location: null,
    locations: ['Wayback Wheel', 'Hackers Hall', 'Migration Library', 'Treehouse', 'Cultivation Station', 'Access to Knowledge Amphitheater', 'Campfire', 'Stages', 'AI Think Tank', 'Art Barn', 'Volunteers HQ', 'Nest', 'Impact Island', 'Heartwood Chapel', 'Lightning Salon', 'Tea Tent', 'Redwood Cathedral'],
    title: null,
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

function newDraft(type) {
  return {
    ...(schemas[type] || {}),
    ...timeFields()
  }
}

// dear diary
const $ = elf('time-machine', {
  cards: [],
  now: new Date(),
  buckets: emptyBuckets,
  draft: newDraft(eventTypes.journal),
  context: null
})

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
            handle: { path: resources[i].path, name },
            data
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
  /*
  const { plan98 } = await fetch(`/plan98/about?cwd=/private/time-machine`)
    .then(res => res.json()).catch(console.error)
    */


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

  payload.forEach(file => {
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
      <button data-destroy="${context.path}">
        Delete
      </button>
      <span class="edit-label">
        Editing: ${context.name}
      </span>
    `:''}</div>
  `
}

const creationForms = {
  [eventTypes.journal]: function(draft) {
    return `
      <div class="tychi-form">
        ${editBanner(this)}
        <textarea
          name="text"
          data-bind="draft"
          placeholder="This is a space for you."
          value="${escapeHyperText(draft.text)}"
        ></textarea>
      </div>
    `
  },
  [eventTypes.image]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="image-form">
        <label class="field">
          <span class="label">Title</span>
          <input data-bind="draft"  name="title" value="${escapeHyperText(draft.title)}" type="text"/>
        </label>

        <label class="field">
          <span class="label">Description</span>
          <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
        </label>
      </div>
    `
  },
  [eventTypes.sketch]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="image-form">
        <label class="field">
          <span class="label">Title</span>
          <input data-bind="draft"  name="title" value="${escapeHyperText(draft.title)}" type="text"/>
        </label>

        <label class="field">
          <span class="label">Description</span>
          <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
        </label>
      </div>
    `
  },
  [eventTypes.audio]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="audio-form">
        <label class="field">
          <span class="label">Title</span>
          <input data-bind="draft"  name="title" value="${escapeHyperText(draft.title)}" type="text"/>
        </label>

        <label class="field">
          <span class="label">Description</span>
          <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
        </label>
      </div>
    `
  },
  [eventTypes.video]: function(draft) {
    return `
      ${editBanner(this)}
      <div class="video-form">
        <label class="field">
          <span class="label">Title</span>
          <input data-bind="draft"  name="title" value="${escapeHyperText(draft.title)}" type="text"/>
        </label>

        <label class="field">
          <span class="label">Description</span>
          <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
        </label>
      </div>
    `
  },
  [eventTypes.gallery]: function(draft) {
    return `
      <div class="gallery-form">
        ${editBanner(this)}
        <label class="field">
          <span class="label">Title</span>
          <input data-bind="draft"  name="title" value="${escapeHyperText(draft.title)}" type="text"/>
        </label>

        <label class="field">
          <span class="label">Description</span>
          <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text"/>
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
      <div class="tommi-form">
        ${editBanner(this)}
        <div style="display: grid; grid-template-columns: 1fr 1fr;">
          <label class="field">
            <span class="label">Title</span>
            <input data-bind="draft"  name="title" value="${escapeHyperText(x.title)}" type="text"/>
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
      </div>
    `
  },
  [eventTypes.archive]: function(draft) {

    const x = {
      ...schemas[views.archive],
      ...draft,
    }

    return `
      <div class="archive-form">
        ${editBanner(this)}
        <div style="display: grid; grid-template-columns: 1fr 1fr;">
          <label class="field">
            <span class="label">Title</span>
            <input data-bind="draft"  name="title" value="${escapeHyperText(x.title)}" type="text" />
          </label>

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
      <div class="dwebcamp-form">
        ${editBanner(this)}
        <div style="display: grid; grid-template-columns: 1fr 1fr;">
          <label class="field">
            <span class="label">Title</span>
            <input data-bind="draft"  name="title" value="${escapeHyperText(x.title)}" type="text" />
          </label>

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

function typeSelector(selected) {
  return `
    <select name="type" data-bind="draft">
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
    <select name="year" data-bind="draft">
      ${years.map(value => `
        <option value="${value}" ${value===selected?'selected':''}>${value}</option>
      `)}
    </select>
  `
}

function monthSelector(selected) {
  return `
    <select name="month" data-bind="draft">
      ${months.map((_value, index) => `
        <option value="${index}" ${index===selected?'selected':''}>${index+1}</option>
      `)}
    </select>
  `
}

function daysInMonth (month, year) {
  return new Date(year, month, 0).getDate();
}

function daySelector(selected, month, year) {
  const maxDays = daysInMonth(month, year)
  const days = []
  for(let i = 1; i <= maxDays; i++) {
    days.push(i)
  }
  return `
    <select name="day" data-bind="draft">
      ${days.map(value => `
        <option value="${value}" ${value===selected?'selected':''}>${value}</option>
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
    <select name="hour" data-bind="draft">
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
    <select name="minute" data-bind="draft">
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
              <button data-cancel-draft class="standard-button -clear" style="place-self: start;" type="reset">
                Cancel
              </button>
            </div>
            <div class="draft-body">
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
    const { draft, context } = $.learn()
    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="post" method="post" class="draft-template">
            <div class="draft-header">
              <button data-cancel-draft class="standard-button -small -outlined" style="place-self: start;" type="reset">
                Cancel
              </button>
              <button class="standard-button -small" style="place-self: end;" type="submit">
                Save
              </button>
            </div>
            <div class="text-well">
              ${renderCreationFormByType.call(context, draft)}
            </div>
            <div class="draft-footer">
              <div class="time-form">
                <div class="time-form-section">
                  $
                  ${typeSelector(draft.type)}
                </div>
                <div class="time-form-section">
                  ${yearSelector(draft.year)}
                  /
                  ${monthSelector(draft.month)}
                  /
                  ${daySelector(draft.day, draft.month, draft.year)}
                </div>
                <div class="time-form-section">
                  @
                  ${hourSelector(draft.hour)}
                  <span>:</span>
                  ${minuteSelector(draft.minute)}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    `
  },
  [views.journal]: (target) => {
    const { space, time } = target.dataset

    const event = $.learn().buckets[space][time]

    const x = {
      ...schemas[views.journal],
      ...event.data,
    }

    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="edit" method="post" class="draft-template">
            <div class="draft-header">
              <button data-cancel-draft class="standard-button -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button -small" style="place-self: end;" type="submit">
                Edit
              </button>
            </div>
            <div class="text-well">
              <div class="textarea">${escapeHyperText(x.text)}</div>
            </div>
            <div class="draft-footer">
              ${stamp(x)}
            </div>
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
              <button data-cancel-draft class="standard-button -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button -small" style="place-self: end;" type="submit">
                Edit
              </button>
            </div>
            <div class="image-well">
              <was-image src="${x.src}"></was-image>
              <div class="title">${escapeHyperText(x.title)}</div>
            </div>
            <div class="draft-footer">
              ${stamp(x)}
            </div>
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
              <button data-cancel-draft class="standard-button -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button -small" style="place-self: end;" type="submit">
                Edit
              </button>
            </div>
            <div class="image-well">
              <was-image src="${x.src}"></was-image>
              <div class="title">${escapeHyperText(x.title)}</div>
            </div>
            <div class="draft-footer">
              ${stamp(x)}
            </div>
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
              <button data-cancel-draft class="standard-button -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button -small" style="place-self: end;" type="submit">
                Edit
              </button>
            </div>
            <div class="image-well">
              <was-video src="${x.src}"></was-video>
              <div class="title">${escapeHyperText(x.title)}</div>
            </div>
            <div class="draft-footer">
              ${stamp(x)}
            </div>
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
              <button data-cancel-draft class="standard-button -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button -small" style="place-self: end;" type="submit">
                Edit
              </button>
            </div>
            <div class="image-well">
              <was-audio src="${x.src}"></was-audio>
              <div class="title">${escapeHyperText(x.title)}</div>
            </div>
            <div class="draft-footer">
              ${stamp(x)}
            </div>
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
              <button data-cancel-draft class="standard-button -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button -small" style="place-self: end;" type="submit">
                Edit
              </button>
            </div>
            <div class="text-well">
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
            <div class="draft-footer">
              ${stamp(x)}
            </div>
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
              <button data-cancel-draft class="standard-button -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button -small" style="place-self: end;" type="submit">
                Edit
              </button>
            </div>
            <div class="text-well">
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
            <div class="draft-footer">
              ${stamp(x)}
            </div>
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
              <button data-cancel-draft class="standard-button -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button -small" style="place-self: end;" type="submit">
                Edit
              </button>
            </div>
            <div class="text-well">
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
            <div class="draft-footer">
              ${stamp(x)}
            </div>
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
          <form action="edit" method="post" class="draft-template">
            <div class="draft-header">
              <button data-cancel-draft class="standard-button -small -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button data-view="${views.create}" data-space="${space}" data-time="${time}" class="standard-button -small" style="place-self: end;" type="submit">
                Edit
              </button>
            </div>
            <div class="text-well">
              <div class="raw-json">${
                JSON.stringify(event.data, '', 2)
              }</div>
            </div>
            <div class="draft-footer">
              ${stamp(x)}
            </div>
          </form>
        </div>
      </div>
    `
  }

}


// you are my diary
$.draw((target)=> {
  const { cards } = $.learn()
  const view = target.getAttribute('view')

  /*
  if(cards.length === 0) {
    return `
      <div2 class="anonymous">
        <my-wallet></my-wallet>
      </div2>
    `
  }
  */

  if(viewRenderers[view]) {
    return viewRenderers[view](target)
  }

  query(target)
  const { now, buckets, draft } = $.learn()
  return `
    <div class="creation-container">
      <button class="create-item" data-new data-tooltip="${draft.type}">
        <sl-icon name="plus-lg"></sl-icon>
      </button>
      <div class="menu-item">
        <button data-menu-target="edit" class="more-item">
          <sl-icon name="list"></sl-icon>
        </button>
        <div class="dropdown-items" data-menu="edit">
          <button data-new="${eventTypes.video}">Video</button>
          <button data-new="${eventTypes.audio}">Audio</button>
          <button data-new="${eventTypes.image}">Image</button>
          <button data-new="${eventTypes.sketch}">Sketch</button>
          <button data-new="${eventTypes.journal}">Journal</button>
          <hr>
          <button data-journal>Quit</button>
        </div>
      </div>
    </div>

    <div class="time-feed-nom-nom-nom-nom">
      <div class="now">
        <div class="now-date">
          ${formatDate(now)}
        </div>
        <div class="now-time">
          ${formatTime(now)}
        </div>
      </div>

      <div class="era">
        <div class="era-header">
          <div class="era-label">
            Past
          </div>
        </div>
        <div class="era-events">
          ${renderBucket(bucketKeys.past)}
        </div>
      </div>

      <div class="era">
        <div class="era-header">
          <div class="era-label">
            Last Week
          </div>
        </div>
        <div class="era-events">
          ${renderBucket(bucketKeys.lastWeek)}
        </div>
      </div>
      <div class="era">
        <div class="era-header">
          <div class="era-label">
            Yesterday
          </div>
        </div>
        <div class="era-events">
          ${renderBucket(bucketKeys.yesterday)}
        </div>
      </div>
      <div class="era the-present">
        <div class="era-header">
          <div class="era-label">
            Today
          </div>
        </div>
        <div class="era-events">
          ${renderBucket(bucketKeys.today)}
        </div>
      </div>

      <div class="era">
        <div class="era-header">
          <div class="era-label">
            Tomorrow
          </div>
        </div>
        <div class="era-events">
          ${renderBucket(bucketKeys.tomorrow)}
        </div>
      </div>

      <div class="era">
        <div class="era-header">
          <div class="era-label">
            This Week
          </div>
        </div>
        <div class="era-events">
          ${renderBucket(bucketKeys.thisWeek)}
        </div>
      </div>

      <div class="era">
        <div class="era-header">
          <div class="era-label">
            Next Week
          </div>
        </div>
        <div class="era-events">
          ${renderBucket(bucketKeys.nextWeek)}
        </div>
      </div>

      <div class="era">
        <div class="era-header">
          <div class="era-label">
            Future
          </div>
        </div>
        <div class="era-events">
          ${renderBucket(bucketKeys.future)}
        </div>
      </div>
    </div>
  `
}, {
  beforeUpdate(target) {
    const q = target.getAttribute('q')
    const view = target.getAttribute('view')
    if(!target.initialized) {
      target.initialized = true
      if(q && view !== views.create) {
        showModal(`
          <time-machine view="${views.create}" q="${q}"></time-machine>
        `, {
          transparent: true
        })
      } else if(q) {
        $.teach({
          type: eventTypes.journal,
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
      }
    }
  },
  afterUpdate(target) {
    {
      afterUpdateTheme($paperPocket, target)
    }

    { // menu items
      const { activeMenu } = $.learn()
      const currentlyActive = target.querySelector('[data-menu-target].active')
      if(currentlyActive) {
        currentlyActive.classList.remove('active')
      }
      const activeItem = target.querySelector(`[data-menu-target="${activeMenu}"]`)
      if(activeItem) {
        activeItem.classList.add('active')
      }
    }


    {
      replaceElves(target, 'sketch-pad')
      replaceElves(target, 'plan98-camera')
      replaceElves(target, 'plan98-icon')
      replaceElves(target, 'was-image')
      replaceElves(target, 'was-audio')
      replaceElves(target, 'was-video')
      replaceElves(target, 'sl-icon')
    }
  }
})

const eventRenderers = {
  [eventTypes.journal]: function (event) {
    const data = {
      ...schemas[views.journal],
      ...event.data
    }
    const [firstLine='', secondLine=''] = data.text.split('\n')
    return `
      <button class="view-event" data-show="${eventTypes.journal}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        <div class="journal-preview-1">
          ${firstLine}
        </div>
        <div class="journal-preview-2">
          ${secondLine}
        </div>
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



$.when('submit', '[action="edit"]', async (event) => {
  event.preventDefault()
})

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
  del(`/private/time-machine${context.path}`).then(response => {
    if (!response.ok) {
      // Explicitly throw for non-200 responses
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    fate()
  }).catch(error => {
    console.warn(error);
  });
}


$.when('submit', '[action="post"]', async (event) => {
  event.preventDefault()
  // Get current date and time for filename
  const { draft, context } = $.learn()

  if(draft) {
    save(draft, context)
    hideModal()
    toast('Created!', { type: 'success' })
    $.teach({ draft: newDraft(draft.type), content: null })
  } else {
    toast('Incomplete information, please try again.', { type: 'error' })
  }
})

$.when('click', '[data-destroy]', async (event) => {
  event.preventDefault()
  try {
    destroy({ path: event.target.dataset.destroy })
    hideModal()
    toast('Destroyed!', { type: 'success' })
  } catch(e) {
    toast('Error!' + e.message, { type: 'error' })
  }
})


$.when('click', '[data-view]', (event) => {
  event.preventDefault()
  const { view, space, time } = event.target.dataset
  event.target.closest($.link).setAttribute('view', view)

  const h = $.learn().buckets[space][time] || { data: {} }
  $.teach({ draft: h.data, context: h.handle })
})

$.when('click', '[data-show]', (event) => {
  const { show, space, time } = event.target.dataset
  showModal(`
    <time-machine view="${views[show]}" data-space="${space}" data-time="${time}"></time-machine>
  `, {
    transparent: true
  })
})


$.when('click', '[data-new]', (event) => {
  const type = event.target.dataset.new

  if(eventTypes[type]) {
    $.teach({
      name: 'type',
      value: type
    }, bound('draft'))
  }

  showModal(`
    <time-machine view="${views.create}"></time-machine>
  `, {
    transparent: true
  })
})

$.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
    background: white;
    position: relative;
  }

  & .time-feed-nom-nom-nom-nom {
    height: 100%;
    overflow: auto;
  }

  & [data-destroy] {
    cursor: pointer;
    color: firebrick;
    background: transparent;
    border: none;
    border-radius: 0;
  }

  & [data-destroy] {
    background: firebrick;
    color: white;
    display: grid;
    padding: .25rem;
    line-height: 1;
    place-content: center;
  }

  & .edit-banner {
    background: lemonchiffon;
    color: saddlebrown;
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
    padding: 1rem;
  }

  & .creation-container {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    display: inline-grid;
    grid-template-columns: auto auto;
  }

  & .create-item {
    font-size: 2rem;
    border: none;
    border-radius: 3px;
    border: 1px solid var(--root-theme, mediumseagreen);
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
    padding: .5rem;
    font-weight: bold;
    border-radius: 100%;
    display: grid;
    place-content: center;
    z-index: 27;
    position: relative;
    left: 1.25rem;
  }

  & .create-item:hover,
  & .create-item:focus {
    color: rgba(255,255,255,.85);
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(255,255,255,.15) 20%, rgba(255,255,255,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.35), rgba(255,255,255,.35)),
      var(--root-theme, mediumseagreen);
  }

  & .more-item {
    border: none;
    border-radius: 3px;
    border: 1px solid var(--root-theme, mediumseagreen);
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.45) 20%, rgba(0,0,0,.65)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
    padding: .5rem .5rem .5rem 1.5rem;
    font-weight: bold;
    border-radius: 0 .5rem .5rem 0;;
    display: grid;
    place-content: center;
    z-index: 23;
  }

  & .more-item:hover,
  & .more-item:focus {
    color: rgba(255,255,255,.85);
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.35), rgba(255,255,255,.35)),
      var(--root-theme, mediumseagreen);
  }


  & .era-header {
    position: sticky;
    top: 0;
    z-index: 21;
  }

  & .era-label {
    color: rgba(0,0,0,.85);
    text-transform: uppercase;
    font-weight: 100;
    margin-bottom: 1rem;
    margin: 0 auto;
    padding: .5rem 0;
    display: inline-block;
  }

  & .era-events {
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  & .now {
    padding: .5rem;
    background: white;
    text-align: center;
    border-bottom: 1px solid rgba(0, 0, 0,.2);
    position: sticky;
    top: 0;
    bottom: 0;
    z-index: 20;
    display: flex;
    justify-content: end;
    gap: .5rem;
  }

  & .now-date {
    color: rgba(0,0,0,.65);
    place-self: start;
  }


  & .now-time {
    font-weight: bold;
    color: rgba(0,0,0,.45);
    place-self: end;
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
    padding: 1rem 0 0;
    height: 100%;
    background: rgba(0,0,0,.15);
    backdrop-filter: blur(2px);
    overflow: hidden;
  }

  & .draft-header {
    background: rgba(0,0,0,.1);
    padding: .5rem;
  }

  & .draft-body {
    padding: .5rem;
    overflow: auto;
  }

  & .draft-footer {
    padding: .5rem;
    background:
      linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.25)),
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
    display: flex;
    align-items: end;
    justify-content: end;
  }

  & .draft-footer select {
    color: white;
    background: rgba(0,0,0,.85);
    border: none;
    border-radius: 3px;
    padding: 0 .5rem;
  }

  & .form-card {
    display: grid;
    background: white;
    max-width: 90ch;
    margin: 0 auto;

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
  }

  & .raw-json {
    white-space: preserve;
    padding: .5rem;
  }

  & .image-well {
    overflow: hidden;
    text-align: center;
    background: black;
    display: grid;
    place-content: center;
    position: relative;
  }

  & .image-well .title {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    padding: .5rem;
    color: white;
    background: linear-gradient(transparent, rgba(0,0,0,.85));
    text-align: left;
    text-shadow:
      0 0 3px rgba(0,0,0,.15),
      0 0 2px rgba(0,0,0,.25),
      1px 1px rgba(0,0,0,.45);
  }

  & [data-destroy] {
    display: grid;
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
  }

  & .text-well textarea {
    padding: .5rem;
    resize: none;
    border: none;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  & .text-well .edit-banner:empty + textarea {
    grid-row: -1 / 1;
  }

  & .draft-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  & .draft-footer {
    display: grid;
  }

  & .draft-content {
    width: 100%;
    resize: none;
    border: 1px solid rgba(0,0,0,.15);
    padding: .5rem;
  }

  & .time-form {
    display: flex;
    gap: .5rem;
    flex-wrap: wrap;
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
    border-radius: 3px;
    color: rgba(0,0,0,.85);
    padding: .5rem;
    font-weight: bold;
    display: inline-block;
    text-align: left;
    transform: scale(.95);
    transition: transform ease-in-out 100ms;
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
    transform: scale(1);
  }

  & .view-event[data-show="${eventTypes.journal}"] {
    background: lemonchiffon;
    color: saddlebrown;
  }

  & .view-event[data-show="${eventTypes.journal}"]:hover,
  & .view-event[data-show="${eventTypes.journal}"]:focus {
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(255,255,255,.75) 20%, rgba(255,255,255,.45)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
    color: rgba(0,0,0,.85);
  }


  & .view-event[data-show="${eventTypes.tommi}"] {

  }



  & .journal-preview-1 {
    color: rgba(0,0,0,.65);
  }

  & .journal-preview-2 {
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

  & [data-menu-target].active + .dropdown-items {
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
    transition: background 200ms ease-in-out;
  }

  & hr {
    border-top: 1px solid rgba(255,255,255, .15);
    margin: .25rem 0;
  }
`)

$.when('click', '[data-cancel-draft]', () => {
  $.teach({ draft: newDraft($.learn().draft.type), context: null })
  hideModal()
})

$.when('click', '.overlay-background', () => {
  hideModal()
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
  const date = new Date(x.year, x.month, x.day, x.hour, x.minute)
  return `${formatDate(date)} @ ${formatTime(date)}`
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

$.when('click', '[data-menu-target]', (event) => {
  event.preventDefault()
  const { activeMenu } = $.learn()
  const { menuTarget } = event.target.dataset
  $.teach({ activeMenu: activeMenu === menuTarget ? null : menuTarget })
  event.stopImmediatePropagation()
})
