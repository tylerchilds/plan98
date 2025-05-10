import elf from '@silly/elf'
import { toast } from './plan98-toast.js'
import { showModal, hideModal } from './plan98-modal.js'
import $paperPocket, { afterUpdateTheme } from './paper-pocket.js'

const bucketKeys = {
  today: 'today',
  yesterday: 'yesterday',
  tomorrow: 'tomorrow',
  nextWeek: 'nextWeek',
  lastWeek: 'lastWeek'
}

const emptyBuckets = {
  [bucketKeys.today]: {},
  [bucketKeys.tomorrow]: {},
  [bucketKeys.yesterday]: {},
  [bucketKeys.lastWeek]: {},
  [bucketKeys.nextWeek]: {}
}

const today = new Date();
const yesterday = new Date(today - 1);
const tomorrow = new Date(today + 1);
const nextWeek = new Date(today + 7);
const lastWeek = new Date(today - 7)

tomorrow.setDate(today.getDate() + 1)
yesterday.setDate(today.getDate() - 1)
nextWeek.setDate(today.getDay()+7)
lastWeek.setDate(today.getDay() - today.getDay()+7)

const eventTypes = {
  journal: 'journal',
  tommi: 'tommi',
}

const views = {
  wallet: 'wallet',
  create: 'create',
  [eventTypes.journal]: eventTypes.journal,
  [eventTypes.tommi]: eventTypes.tommi
}

const schemas = {
  [eventTypes.tommi]: {
    type: eventTypes.tommi,
    year: today.getFullYear(),
    month: today.getMonth(),
    day: today.getDate(),
    hour: today.getHours(),
    minute: today.getMinutes(),
    url: null,
    title: null,
    description: null,
    tags: [],
    city: null,
    country: null,
    longitude: null,
    latitude: null,
  },
  [eventTypes.journal]: {
    body: '',
    type: eventTypes.journal,
    year: today.getFullYear(),
    month: today.getMonth(),
    day: today.getDate(),
    hour: today.getHours(),
    minute: today.getMinutes(),
  }
}
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function newDraft(type) {
  return schemas[type] || {}
}

// dear diary
const $ = elf('time-machine', {
  now: new Date(),
  buckets: emptyBuckets,
  draft: newDraft(eventTypes.journal)
})

setInterval(() => {
  $.teach({ now: new Date() })
}, 1000 * 60)

async function query(target) {
  if(target.queried) return
  target.queried = true


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

const bucketPairs = [
  [today, bucketKeys.today],
  [tomorrow, bucketKeys.tomorrow],
  [yesterday, bucketKeys.yesterday],
  [lastWeek, bucketKeys.lastWeek],
  [nextWeek, bucketKeys.nextWeek],
]

function indexDate(timeKey) {
  return timeKey.split('T')[0]
}


function mergeEvents(state, payload) {
  const buckets = payload.reduce((buckets, event) => {
    const [timeKey] = event.handle.name.split('.json')
    let index = bucketPairs.findIndex(([date, key]) => {
      return date.toDateString() === new Date(timeKey).toDateString()
    })

    const spaceKey = index > -1 ? bucketPairs[index][1] : indexDate(timeKey)

    if(!buckets[spaceKey]) {
      buckets[spaceKey] = {}
    }

    buckets[spaceKey][timeKey] = {
      spaceKey,
      timeKey,
      ...event
    }

    return buckets

    /*
    const [timestamp] = event.handle.name.split('.json')
    if(today.toDateString() === new Date(timestamp).toDateString()) {
      all[bucketKeys.today][timestamp] = {
        spaceKey: bucketKeys.today,
        timeKey: timestamp,
        ...event
      }

      return all
    }


  const buckets = Object.keys(sorted).reduce((buckets, key) => {
    if(!buckets[key]) {
      buckets[key] = { ...(state.buckets[key] || {}) }
    }
    buckets[key] = [payload.key] = { ...buckets[key], ...payload[key] }
    return buckets
  }, {})

    return all
    */
  }, {
    ...emptyBuckets,
    ...state.buckets,
  })
  return {
    ...state,
    buckets,
  }
}

const creationForms = {
  [eventTypes.journal]: (draft) => {
    return `
      <textarea
        name="body"
        data-bind="draft"
        placeholder="Say it, don't spray it."
        value="${escapeHyperText(draft.body)}"
      ></textarea>
    `
  },
  [eventTypes.tommi]: (draft) => {

    const x = {
      ...schemas[views.tommi],
      ...draft,
    }


    return `
      <label class="field">
        <span class="label">Title</span>
        <input data-bind="draft"  name="title" value="${escapeHyperText(x.title)}" type="text" required/>
      </label>

      <label class="field">
        <span class="label">URL</span>
        <input data-bind="draft" name="url" value="${escapeHyperText(x.url)}" type="text" required/>
      </label>
      <label class="field">
        <span class="label">Description</span>
        <input data-bind="draft" name="description" value="${escapeHyperText(x.description)}" type="text" required/>
      </label>

      ${x.tags.map(x => {
        return `
          <button class="standard-button" data-tag="${x}">
            ${x}
          </button>
        `
      }).join('')}

      <label class="field">
        <span class="label">City</span>
        <input data-bind="draft" name="city" value="${escapeHyperText(x.city)}" type="text" required/>
      </label>

      <label class="field">
        <span class="label">Country</span>
        <input data-bind="draft" name="country" value="${escapeHyperText(x.country)}" type="text" required/>
      </label>
      <label class="field">
        <span class="label">Longitude</span>
        <input data-bind="draft" name="longitude" value="${escapeHyperText(x.longitude)}" type="text" required/>
      </label>
      <label class="field">
        <span class="label">Latitude</span>
        <input data-bind="draft" name="latitude" value="${escapeHyperText(x.latitude)}" type="text" required/>
      </label>
    `
  }
}

function renderCreationFormByType(draft) {
  return creationForms[draft.type] ? creationForms[draft.type](draft) : ''
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
          <form action="post" method="post" class="draft-template">
            <div class="draft-header">
              <button data-cancel-draft class="standard-button -clear" style="place-self: start;" type="reset">
                Cancel
              </button>
            </div>
            <div class="draft-body">
              <a href="/app/plan98-backpack">Backpack</a>
              <a href="/app/blue-sky">Bluesky</a>
              <a href="/app/e-mail">E-mail</a>
            </div>
            <div class="draft-footer">
              :)
            </div>
          </form>
        </div>
      </div>
    `
  },
  [views.create]: (target) => {
    const { draft } = $.learn()
    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="post" method="post" class="draft-template">
            <div class="draft-header">
              <button data-cancel-draft class="standard-button -outlined" style="place-self: start;" type="reset">
                Cancel
              </button>
              <button class="standard-button" style="place-self: end;" type="submit">
                Post
              </button>
            </div>
            <div class="text-well">
              ${renderCreationFormByType(draft)}
            </div>
            <div class="draft-footer">
              <div class="time-form">
                <div class="time-form-section">
                  .
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
              <button data-cancel-draft class="standard-button -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button class="standard-button" style="place-self: end;" type="submit">
                Edit
              </button>
            </div>
            <div class="text-well">
              <div class="textarea">${escapeHyperText(x.text)}</div>
            </div>
            <div class="draft-footer">
              :)
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
              <button data-cancel-draft class="standard-button -outlined" style="place-self: start;" type="reset">
                Close
              </button>
              <button class="standard-button" style="place-self: end;" type="submit">
                Edit
              </button>
            </div>
            <div class="text-well">
              <div class="section">
                <div class="section-header">Activities</div>
                  <div class="activities">
                    <div class="activity">
                      <div class="activity-title">
                        <a href="${x.url || ''}">${x.title || x.url}</a>
                      </div>
                      <div class="activity-description">
                        ${x.description || ''}
                      </div>
                      <div class="tags">
                        ${x.tags.map(x => {
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
                </div>
              </div>
            </div>
            </div>
            <div class="draft-footer">
              :)
            </div>
          </form>
        </div>
      </div>
    `
  }

}


// you are my diary
$.draw((target)=> {
  const view = target.getAttribute('view')

  if(viewRenderers[view]) {
    return viewRenderers[view](target)
  }

  query(target)
  const { now, futureEnabled, buckets } = $.learn()
  return `
    <div class="banner-bar">
      <div class="left-bar">
        <button class="standard-button" data-new>
          New
        </button>
      </div>
      <div class="right-area">
        <button class="standard-button" data-wallet>
          You
        </button>
      </div>
    </div>

    <div class="future-toggle-wrapper">
      <button class="link-button" data-future-toggle>
        ${futureEnabled?'Hide Future':'View Future'}
      </button>
    </div>
    <div class="the-future ${futureEnabled?'visible':'hidden'}">
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
          Tomorrow
        </div>
        <div class="era-events">
          ${renderBucket(bucketKeys.tomorrow)}
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
        Yesterday
      </div>
      <div class="era-events">
        ${renderBucket(bucketKeys.yesterday)}
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
  `
}, {
  afterUpdate(target) {
    {
      afterUpdateTheme($paperPocket, target)
    }
  }
})

const eventRenderers = {
  [eventTypes.journal]: function (event) {
    const [firstLine='', secondLine=''] = event.data.text.split('\n')
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
    return `
      <button class="view-event" data-show="${eventTypes.tommi}" data-space="${event.spaceKey}" data-time="${event.timeKey}">
        ${event.data.title}
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
        ${eventRenderers[event.data.type]
          ? eventRenderers[event.data.type](event)
          : JSON.stringify(event.data)}
      </div>
    `
  }).join('')
}


$.when('click', '[data-future-toggle]', (event) => {
  $.teach({ futureEnabled: !$.learn().futureEnabled })
})

$.when('submit', '[action="edit"]', async (event) => {
  event.preventDefault()
})
$.when('submit', '[action="post"]', async (event) => {
  event.preventDefault()
  // Get current date and time for filename
  const { draft } = $.learn()

  if(draft) {
    const now = new Date(draft.year, draft.month, draft.day, draft.hour, draft.minute);

    const timestamp = now.toJSON()

    const authorization = btoa(plan98.env.PLAN98_USERNAME + ':' + plan98.env.PLAN98_PASSWORD);

    // Attempt to upload to server
    fetch(`/private/time-machine/${timestamp}.json`, {
        method: 'POST',
        body: JSON.stringify(draft),
        headers: {
          'Content-Type': 'image/jpeg',
          "Authorization": `Basic ${authorization}`
        }
    }).then(response => {
      if (!response.ok) {
        // Explicitly throw for non-200 responses
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }).catch(error => {
      console.warn('Server upload failed, falling back to download', error);

      // Fallback: create a download link
      const link = document.createElement('a');
      link.download = `${timestamp}.jpg`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    hideModal()
    toast('Created!', { type: 'success' })
    $.teach({ draft: newDraft(draft.type) })
  } else {
    toast('Incomplete information, please try again.', { type: 'error' })
  }
})


$.when('click', '[data-create]', (event) => {
  // Get current date and time for filename
  const now = new Date();
  const timestamp = now.toJSON()

  const authorization = btoa(plan98.env.PLAN98_USERNAME + ':' + plan98.env.PLAN98_PASSWORD);

  // Attempt to upload to server
  fetch(`/private/time-machine/${timestamp}.json`, {
      method: 'POST',
      body: JSON.stringify({
        hello: 'world'
      }),
      headers: {
        'Content-Type': 'image/jpeg',
        "Authorization": `Basic ${authorization}`
      }
  }).then(response => {
    if (!response.ok) {
      // Explicitly throw for non-200 responses
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }).catch(error => {
    console.warn('Server upload failed, falling back to download', error);

    // Fallback: create a download link
    const link = document.createElement('a');
    link.download = `${timestamp}.jpg`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
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
  showModal(`
    <time-machine view="${views.wallet}"></time-machine>
  `, {
    transparent: true
  })
})



$.style(`
  & {
    display: block;
    height: 100%;
    overflow: auto;
  }

  & .banner-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: .5rem 1rem;
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
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

  & .future-toggle-wrapper {
    text-align: center;
    padding: 1rem;
  }

  & .the-future.visible {
    display: block;
  }

  & .the-future.hidden {
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

  & .text-well {
    overflow: auto;
    width: 100%;
    height: 100%;
  }

  & .text-well .textarea,
  & .text-well textarea {
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    padding: .5rem;
    white-space: preserve;
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

  & .journal-preview-1 {
    color: rgba(0,0,0,.65);
  }

  & .journal-preview-2 {
    color: rgba(0,0,0,.35);
  }
`)

$.when('click', '[data-cancel-draft]', () => {
  $.teach({ draft: newDraft($.learn().draft.type) })
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
