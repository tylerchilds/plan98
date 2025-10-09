# Elvish

Elvish is a library for creating interactive content.

- Ty

# Lesson 1: Hello World

A "Hello World" program example MUST:

1. Respect the local dialect of Elvish
2. Declare an instance of a "Link"
3. Declare to draw "Hello World" in a target container, when needed.

A reference implementation in JavaScript

```
import elf from '@plan98/elvish'

const $ = elf("hello-world")

$.draw((target)) => {
  return "Hello World"
})
```

In this example, "target", is unused directly. The return value is inserted automatically.

## Interface Template

The draw function is responsible for binding data to a visual representation.

The draw method MUST

1. Call the compositor on initial render.
2. Call the compositor on state change.
3. Update the target with the compositor return.

The draw method MUST NOT

1. Update the target with a falsey return from the compositor

The draw method MAY

1. Call "beforeUpdate" and "afterUpdate" lifeCycle methods, when present, before and after the compositor respectively.

```
function draw(link, compositor, lifeCycle) {
  
}

export default function elf(link) {
  return {
    draw: draw.bind(this, link),
  }
}
```

# Lesson 2: Clock

A "Clock" program will count seconds since pageload.

1. Set seconds variable one bigger every second
2. Get seconds when updated

A reference implementation in JavaScript

```
import elf from '@plan98/elvish'

const $ = elf("clock-program", {
  seconds: 0
})

setTimeout(() => {
  const { seconds } = $.learn()
  $.teach({ seconds: seconds + 1 })
}, 1000)

$.draw((target)) => {
  const { seconds } = $.learn()

  return `
    Seconds elapsed: 0
  `
})
```

## Interface Template

The two primary operations of any programming environment is the concept of get/set, read/write, pull/push, take/give.

Elvish uses "learn" and "teach", which learns the current state of a node in a nueral network and teaches it new data, respectively.

The learn method MUST

1. Return the current state at a link

The teach method MUST

1. Not be expected to return anything

The teach method MAY

1. Use a handler to effectively reject data for any reason
2. Incorporate knowledge into the current link

```
export function learn(link) {
}

export function teach(link, data, handler) {
}

export default function elf(link, initialState) {
  teach(link, initialState)

  return {
    learn: learn.bind(this, link),
    draw: draw.bind(this, link),
    teach: teach.bind(this, link),
  }
}
```

# Lesson 3: Counter

A "Counter" program will render an interactive button that counts clicks.

1. Show click count in a button
2. Set count one bigger on button click

A reference implementation in JavaScript

```
import elf from '@plan98/elvish'

const $ = elf("counter-program", {
  count: 0
})

$.draw((target)) => {
  const { count } = $.learn()

  let string = '0 times'

  if(count === 1) {
    string = '1 time'
  } else if(count > 0) {
    string = count + ' times'
  }

  return `
    <button>
      I have been clicked ${string}!
    </button>
  `
})

$.when('click', 'button', (event) => {
  $.teach({
    count: $.learn().count + 1
  })
})
```

## Interface Template

In classical progamming, the mental model is "If something, then something"

In quantum progamming, the mental model is "When something, do something"

The when method MUST

2. Invoke the do, when the event is emitted, on all selections in a light cone

```
export function when(link, type, selector, do) {
}

export default function elf(link, initialState) {
  teach(link, initialState)

  return {
    learn: learn.bind(this, link),
    draw: draw.bind(this, link),
    teach: teach.bind(this, link),
    when: when.bind(this, link),
  }
}
```

References:
https://forum.solidproject.org/t/idea-launcher-app/3468
https://github.com/tylerchilds/plan98
https://thelanding.page
https://github.com/tylerchilds/self-transforming-elf-machines/
https://sillyz.computer/public/sagas/sillyz.computer/elvish-spec.md
