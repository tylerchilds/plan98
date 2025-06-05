import elf from '@silly/elf'
import { toast } from './plan98-toast.js'
import { showModal, hideModal } from './plan98-modal.js'
import $paperPocket, { afterUpdateTheme } from './paper-pocket.js'
import { launch } from './plan98-synthia.js'

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
  photo: 'photo',
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
  [eventTypes.photo]: eventTypes.photo,
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
    ...timeFields(),
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
    ...timeFields(),
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
    ...timeFields(),
    type: eventTypes.instrument,
  },
  [eventTypes.sketch]: {
    ...timeFields(),
    type: eventTypes.sketch,
    title: null,
  },
  [eventTypes.journal]: {
    ...timeFields(),
    type: eventTypes.journal,
    text: '',
  },
  [eventTypes.gallery]: {
    ...timeFields(),
    type: eventTypes.gallery,
    title: null,
    description: null,
    tags: [],
  },
  [eventTypes.photo]: {
    ...timeFields(),
    type: eventTypes.gallery,
    title: null,
    description: null,
    tags: [],
  },
  [eventTypes.dwebcamp]: {
    ...timeFields(),
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
  return schemas[type] || {}
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
  const { plan98 } = await fetch(`/plan98/about?cwd=/private/time-machine`)
    .then(res => res.json()).catch(console.error)

  try {
    const handles = plan98.children[0].children

    if(!handles) return

    const paths = handles.map(x => `/private/time-machine/${x.name}`)

    const events = await Promise.all(
      paths.map((x, i) => fetch(x).then(res => res.json()).then(data => {
        return {
          handle: handles[i],
          data
        }
      }))
    )

    $.teach(events, mergeEvents)
  } catch(e) {
    console.error(e)
  }
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

const creationForms = {
  [eventTypes.journal]: function(draft) {
    return `
      <div class="tychi-form">
        <div class="edit-banner">${this?`
          Editing: ${this.name}
        `:''}</div>
        <textarea
          name="text"
          data-bind="draft"
          placeholder="Say it, don't spray it."
          value="${escapeHyperText(draft.text)}"
        ></textarea>
      </div>
    `
  },
  [eventTypes.photo]: function(draft) {
    return `
      <div class="photo-form">
        <div class="edit-banner">${this?`
          Editing: ${this.name}
        `:''}</div>
        <label class="field">
          <span class="label">Title</span>
          <input data-bind="draft"  name="title" value="${escapeHyperText(draft.title)}" type="text" required/>
        </label>

        <label class="field">
          <span class="label">Description</span>
          <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text" required/>
        </label>
      </div>
    `
  },
  [eventTypes.gallery]: function(draft) {
    return `
      <div class="gallery-form">
        <div class="edit-banner">${this?`
          Editing: ${this.name}
        `:''}</div>
        <label class="field">
          <span class="label">Title</span>
          <input data-bind="draft"  name="title" value="${escapeHyperText(draft.title)}" type="text" required/>
        </label>

        <label class="field">
          <span class="label">Description</span>
          <input data-bind="draft" name="description" value="${escapeHyperText(draft.description)}" type="text" required/>
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
        <div class="edit-banner">${this?`
          Editing: ${this.name}
        `:''}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr;">
          <label class="field">
            <span class="label">Title</span>
            <input data-bind="draft"  name="title" value="${escapeHyperText(x.title)}" type="text" required/>
          </label>

          <label class="field">
            <span class="label">URL</span>
            <input data-bind="draft" name="url" value="${escapeHyperText(x.url)}" type="text" required/>
          </label>
        </div>
        <label class="field">
          <span class="label">Description</span>
          <input data-bind="draft" name="description" value="${escapeHyperText(x.description)}" type="text" required/>
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
            <input data-bind="draft" name="city" value="${escapeHyperText(x.city)}" type="text" required/>
          </label>

          <label class="field">
            <span class="label">Country</span>
            <input data-bind="draft" name="country" value="${escapeHyperText(x.country)}" type="text" required/>
          </label>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr;">
          <label class="field">
            <span class="label">Longitude</span>
            <input data-bind="draft" name="longitude" value="${escapeHyperText(x.longitude)}" type="text" required/>
          </label>
          <label class="field">
            <span class="label">Latitude</span>
            <input data-bind="draft" name="latitude" value="${escapeHyperText(x.latitude)}" type="text" required/>
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
        <div class="edit-banner">${this?`
          Editing: ${this.name}
        `:''}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr;">
          <label class="field">
            <span class="label">Title</span>
            <input data-bind="draft"  name="title" value="${escapeHyperText(x.title)}" type="text" required/>
          </label>

          <label class="field">
            <span class="label">URL</span>
            <input data-bind="draft" name="url" value="${escapeHyperText(x.url)}" type="text" required/>
          </label>
        </div>
        <label class="field">
          <span class="label">Description</span>
          <input data-bind="draft" name="description" value="${escapeHyperText(x.description)}" type="text" required/>
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
            <input data-bind="draft" name="creator" value="${escapeHyperText(x.creator)}" type="text" required/>
          </label>

          <label class="field">
            <span class="label">Collection</span>
            <input data-bind="draft" name="collection" value="${escapeHyperText(x.collection)}" type="text" required/>
          </label>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr;">
          <label class="field">
            <span class="label">Language</span>
            <input data-bind="draft" name="language" value="${escapeHyperText(x.language)}" type="text" required/>
          </label>
          <label class="field">
            <span class="label">License</span>
            <input data-bind="draft" name="license" value="${escapeHyperText(x.license)}" type="text" required/>
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
        <div class="edit-banner">${this?`
          Editing: ${this.name}
        `:''}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr;">
          <label class="field">
            <span class="label">Title</span>
            <input data-bind="draft"  name="title" value="${escapeHyperText(x.title)}" type="text" required/>
          </label>

          <label class="field">
            <span class="label">URL</span>
            <input data-bind="draft" name="url" value="${escapeHyperText(x.url)}" type="text" required/>
          </label>
        </div>
        <label class="field">
          <span class="label">Description</span>
          <input data-bind="draft" name="description" value="${escapeHyperText(x.description)}" type="text" required/>
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
            <input data-bind="draft" name="creator" value="${escapeHyperText(x.creator)}" type="text" required/>
          </label>

          <label class="field">
            <span class="label">Collection</span>
            <input data-bind="draft" name="collection" value="${escapeHyperText(x.collection)}" type="text" required/>
          </label>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr;">
          <label class="field">
            <span class="label">Language</span>
            <input data-bind="draft" name="language" value="${escapeHyperText(x.language)}" type="text" required/>
          </label>
          <label class="field">
            <span class="label">License</span>
            <input data-bind="draft" name="license" value="${escapeHyperText(x.license)}" type="text" required/>
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
  const { now, pastEnabled, buckets } = $.learn()
  return `
    <div class="banner-bar">
      <div class="left-bar">
        <button class="standard-button -outlined" data-new>
          New
        </button>
      </div>
      <div class="right-area">
        <button class="standard-button" data-wallet>
          You
        </button>
      </div>
    </div>

    <div class="past-toggle-wrapper">
      <button class="link-button" data-past-toggle>
        ${pastEnabled?'Hide Past':'View Past'}
      </button>
    </div>
    <div class="the-past ${pastEnabled?'visible':'hidden'}">
      <div class="era">
        <div class="era-label">
          Past
        </div>
        <div class="era-events">
          ${renderBucket(bucketKeys.past)}
        </div>
      </div>

      <div class="era">
        <div class="era-label">
          Last Week
        </div>
        <div class="era-events">
          ${renderBucket(bucketKeys.lastWeek)}
        </div>
      </div>
      <div class="era">
        <div class="era-label">
          Yesterday
        </div>
        <div class="era-events">
          ${renderBucket(bucketKeys.yesterday)}
        </div>
      </div>
    </div>

    <div class="now">
      <div class="now-date">
        ${formatDate(now)}
      </div>
      <div class="now-time">
        ${formatTime(now)}
      </div>
    </div>

    <div class="era">
      <div class="era-label">
        Today
      </div>
      <div class="era-events">
        ${renderBucket(bucketKeys.today)}
      </div>
    </div>

    <div class="era">
      <div class="era-label">
        Tomorrow
      </div>
      <div class="era-events">
        ${renderBucket(bucketKeys.tomorrow)}
      </div>
    </div>

    <div class="era">
      <div class="era-label">
        This Week
      </div>
      <div class="era-events">
        ${renderBucket(bucketKeys.thisWeek)}
      </div>
    </div>

    <div class="era">
      <div class="era-label">
        Next Week
      </div>
      <div class="era-events">
        ${renderBucket(bucketKeys.nextWeek)}
      </div>
    </div>

    <div class="era">
      <div class="era-label">
        Future
      </div>
      <div class="era-events">
        ${renderBucket(bucketKeys.future)}
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
        <img src="${data.src}" alt="${data.title}">
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


$.when('click', '[data-past-toggle]', (event) => {
  $.teach({ pastEnabled: !$.learn().pastEnabled })
})

$.when('submit', '[action="edit"]', async (event) => {
  event.preventDefault()
})


export function saveSketch(draft, context) {
  save({
    title: 'Untitled',
    ...timeFields(),
    ...draft,
    type: eventTypes.sketch,
  }, context)
}

export function save(draft, context) {
  const now = new Date(draft.year, draft.month, draft.day, draft.hour, draft.minute, draft.second);
  const timestamp = now.toJSON()
  let path = `/${timestamp}.json`
  if(context) {
    path = context.path
  }

  const authorization = btoa(plan98.env.PLAN98_USERNAME + ':' + plan98.env.PLAN98_PASSWORD);

  // Attempt to upload to server
  fetch(`/private/time-machine${path}`, {
      method: 'POST',
      body: JSON.stringify(draft),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authorization}`
      }
  }).then(response => {
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
  showModal(`
    <time-machine view="${views.create}"></time-machine>
  `, {
    transparent: true
  })
})

$.when('click', '[data-wallet]', (event) => {
  launch()
})

$.style(`
  & {
    display: block;
    height: 100%;
    overflow: auto;
    background: white;
  }

  & .edit-banner {
    background: lemonchiffon;
    color: saddlebrown;
    text-align: right;
    padding: .5rem;
  }

  & .edit-banner:empty {
    display: none;
  }

  & .banner-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: .5rem;
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255,255,255,.85);
    backdrop-filter: blur(10px);
  }

  & .left-area {

  }

  & .right-area {
    text-align: right;
  }

  & .era {
    padding: 1rem;
  }

  & .era-label {
    text-align: center;
    color: rgba(0,0,0,.65);
    text-transform: uppercase;
    font-weight: 100;
    margin-bottom: 1rem;
  }

  & .era-events {
    max-width: 55ch;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  & .now {
    padding: 3rem 1rem;
    text-align: center;
    background:
      linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.25)),
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
  }

  & .now-date {
    font-size: 3rem;
    font-weight: bold;
    color: rgba(255,255,255,.65);
  }


  & .now-time {
    font-size: 2rem;
    color: rgba(255,255,255,.45);
  }

  & .past-toggle-wrapper {
    text-align: center;
    padding: 1rem;
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
  }

  & .overlay-background {
    padding: 2rem 0 0;
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
    max-width: 55ch;
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


  & .view-event {
    border: none;
    border-radius: 3px;
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(255,255,255,.95) 20%, rgba(255,255,255,.85)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
    color: rgba(0,0,0,.85);
    padding: .5rem;
    font-weight: bold;
    display: block;
    text-align: left;
    width: 100%;
  }

  & .view-event:hover,
  & .view-event:focus {
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(255,255,255,.75) 20%, rgba(255,255,255,.45)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
    color: rgba(0,0,0,.85);
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

  & .photo-form {
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
  }, (state, payload) => {
    return {
      ...state,
      [bind]: {
        ...state[bind],
        [payload.name]: payload.value
      }
    }
  })
})

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
