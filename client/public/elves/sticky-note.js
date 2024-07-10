import module from '@silly/tag'

const $ = module('sticky-note')

$.style(`
  & {
    padding: 16px 9px;
    width: 3.25in;
    aspect-ratio: 3.25 / 3.12;
    max-height: 100%;
    max-width: 100%;
    background: lemonchiffon;
    transform: perspective(1000px) rotateX(var(--rotate-x)) rotateY(var(--rotate-y));
    box-shadow: var(--shadow);
    position: relative;
    z-index: 4;
    overflow: auto;
    display: grid;
  }

  &.maximized {
    position: absolute;
    transform: none;
    width: 100%;
    height: 100%;
  }
`)
