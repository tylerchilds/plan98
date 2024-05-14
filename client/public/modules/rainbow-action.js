import module from '@silly/tag'

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
			background-position-y: 0%;
    }
    33% {
			background-position-y: 33%;
    }
    66% {
			background-position-y: 66%;
    }

    100% {
			background-position-y: 100%;
    }
  }

  & {
    display: block;
  }

  & button,
  & a:link,
  & a:visited,
  & a:hover,
  & a:focus,
  & a:active {
    color: white;
  }

  & > * {
    animation: rainbow-background
      10000ms ease-in-out infinite alternate-reverse;
      background: linear-gradient(rgba(255,255,255,.5), dodgerblue, orange, rebeccapurple, lime, rgba(0,0,0,.5))
    ;
		background-size: 300% 300%;

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
    filter: grayscale(.5);
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
    transform: scale(1.05);
    filter: grayscale(0);
  }

  & > *:active {
    box-shadow:
      0 1px 1px rgba(0, 0, 0, .4),
      0 2px 2px rgba(0, 0, 0, .2);
    transform: scale(.99)
  }
`)
