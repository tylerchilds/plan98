import { tag } from "/deps.js"
const $ = tag('rainbow-button')

$.style(`
  @keyframes rainbow-background {
    0% {
      background: orange;
    }
    33% {
      background: rebeccapurple;
    }
    66% {
      background: lime;
    }
    100% {
      background: dodgerblue;
    }
  }

  & {
    display: inline-block;
  }

  & > * {
    animation: rainbow-background
      10000ms linear infinite alternate-reverse;
    box-shadow:
      0 2px 2px rgba(0, 0, 0, .25),
    0 4px 4px rgba(0, 0, 0, .15),
    0 8px 8px rgba(0, 0, 0, .05);

    border: none;
    border-radius: 2px;
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

  & > *:link,
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
