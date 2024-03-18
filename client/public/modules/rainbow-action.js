import module from '@sillonious/module'

const $ = module('rainbow-action')

$.draw(target => {
  const text = target.getAttribute('text')
  const prefix = target.getAttribute('prefix')
  const suffix = target.getAttribute('suffix')

  if(text && prefix && suffix) {
    return `${prefix}${text}${suffix}`
  }
})

$.style(`
  @keyframes rainbow-background {
    0% {
      background: dodgerblue;
    }
    33% {
      background: orange;
    }
    66% {
      background: rebeccapurple;
    }

    100% {
      background: lime;
    }
  }

  & {
    display: block;
  }

  & button {
    color: white;
  }


  & > * {
    animation: rainbow-background
      10000ms linear infinite alternate-reverse;
    box-shadow:
      0 2px 2px rgba(0, 0, 0, .25),
    0 4px 4px rgba(0, 0, 0, .15),
    0 8px 8px rgba(0, 0, 0, .05);

    border: none;
    border-radius: 2rem;
    color: white;
    cursor: pointer;
    display: inline-block;
    font-weight: bold;
    padding: 1rem;
    text-shadow:
      0 1px rgba(0, 0, 0, .85),
      0 1px 2px rgba(0, 0, 0, .65);
    text-decoration: none;
    transition: all 100ms ease-in-out;
  }

  & > *:visited {
    color: white;
  }

  & > *:hover,
  & > *:focus {
    box-shadow:
      0 4px 4px rgba(0, 0, 0, .15),
      0 8px 8px rgba(0, 0, 0, .10),
      0 16px 16px rgba(0, 0, 0, .05);
    transform: scale(1.05)
  }

  & > *:active {
    box-shadow:
      0 1px 1px rgba(0, 0, 0, .4),
      0 2px 2px rgba(0, 0, 0, .2);
    transform: scale(.99)
  }
`)
