import {
  Activities,
  Self
} from '@plan98/types'

const objectRenderers = {
  'Element': (object, root) => {
    return object.content
  },
  'Note': (object, root) => {
    return object.content
  }
}

function renderObject(object, root) {
  const r = objectRenderers[object.type]
  return r ? r(object, root) : ''
}

const activityRenderers = {
  'Narrate': (activity, root) => {
    const { actor, object, location, type } = activity
    return `
      <div class="narration" data-location="${location}" data-type="${type}">
        ${renderObject(object, root)}
      </div>
    `
  },
  'Create': (activity, root) => {
    const { actor, object, location, type } = activity
    return `
      <div class="creation" data-location="${location}" data-type="${type}">
        <strong>${actor.name}</strong>: ${renderObject(object, root)}
      </div>
    `
  },
}

function renderActivity(activity, root) {
  const r = activityRenderers[activity.type]
  return r ? r(activity, root) : ''
}

const {
  model,
  view,
  controller,
  skin
} = Self('hello-as2')

view((target) => {
  const src = target.getAttribute('src')
  const as2 = model()[src]

  if(!as2) {
    return `<lol2grrrr><flying-disk></flying-disk></lol2grrrr>`
  }

  console.log({ as2 })

  const log = as2.map((activity) => {
    return `
      <div class="activity">
        ${renderActivity(activity, target)}
      </div>
    `
  }).join('')

  return `
    <div class="activity-log">
      ${log}
    </div>
  `
}, {
  beforeUpdate(target) {
    if(target.mounted) return
    target.mounted = true

    const src = target.getAttribute('src')
    const encodedData = target.getAttribute('data')
    requestIdleCallback(() => {
      if(encodedData) {
        const file = atob(decodeURIComponent(encodedData))
        controller({
          [src]: Activities(file),
        })
      } else {
        let file = ''
        fetch(src).then(async res => {
          if(res.status === 404) {

            file = 'untitled'
          } else {
            file = await res.text()
          }
        }).catch((error) => {
          console.error(error)
        }).finally(() => {
          controller({
            [src]: Activities(file),
          })
        })
      }
    })
  },
  afterUpdate(target) {

  }
})

skin(`
  & {
    display: block;
    height: 100%;
    overflow: auto;
    background: white;
    color: black;
  }

  & .activity-log {
    max-width: 70ch;
    margin: 0 auto;
  }

  & .activity {
    margin: .5rem;
  }

  & .creation {
    text-indent: 1in;
    margin: 1rem 0;
  }

  & .narration {
    color: rgba(0,0,0,.65);
  }

  & .location {
    color: rgba(0,0,0,.5);
    font-style: italic;
  }
`)
