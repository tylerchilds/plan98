import elf from '@plan98/elf'

const $ = elf('mikes-nap', {
  namespace: {
    'message': `
This is a custom computer that was written during Mike's nap. It contains the foundations of his literal dreams mere feet away from where he sleeps.

Grumbling dog.

@ ??
> Can he hear us?

@ ?
> Shh.

They muddle around in the computer.

@ ?
> Have you seen the de-coupler?

@ ??
> The de-what?

@ ?
> Makes the things disconnect, so you can connect them to other things.

@ ??
> Oh, the hot glue?

@ ?
> No, I mean the de-coupler.

@ ??
> The hot glue. Yeah, sticks things together without turning them off first?

@ ?
> After you de-couple. The thing that let's you split the seams of any reality.

@ ??
> Oh, You mean the DE-COUPLAH.

The elves take the braid and the plan98, parse them both through the de-couplER.

@ ??
> Does it always sound like that?

@ ?
> They get better over time, but this is the best they've ever been.

They each take one half of the braid and one half of the plan98 and they hot glue them together.

@ ??
> What do we do with it?

@ ?
> I don't know.

<iframe style="aspect-ratio: 1 / 1;" src="/app/ur-shell?rom=draw-term"></iframe>

@ ??
> Oh! You can swipe! This blue screen has life!
    `
  }
})

$.draw(() => {
  const { namespace } = $.learn()

  return `
    <div class="input">
      <label class="field">
        <span class="label">Input</span>
        <textarea data-bind="namespace" name="message" style="height: 8rem;" value="${escapeHyperText(namespace.message)}"></textarea>
      </label>
    </div>
    <div class="output">
      ${namespace.message}
    </div>
  `
})

$.when('input', '[data-bind]', (event) => {
  const { bind } = event.target.dataset
  $.teach({
    name: event.target.name,
    value: event.target.value
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

$.style(`
  & {
    display: block;
    margin: 0 auto;
    max-width: 55ch;
  }

  & .output {
    display: block;
    padding: 1rem;
    white-space: preserve;
  }

  & .input {
    padding: 1rem;
  }
`)

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


