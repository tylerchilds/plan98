import module from '@sillonious/module'
import { getBase } from './pocket-authentication.js'

const $ = module('my-biography')

$.draw(target => {
  const playerId = target.getAttribute('player')
  // do not use the implcit return virtual dom
  target.innerHTML =  `
    <div class="column">
      <my-name player="${playerId}"></my-name>
      <my-profile player="${playerId}"></my-profile>
      <my-contact player="${playerId}"></my-contact>
      <my-details player="${playerId}"></my-details>
    </div>
    <div class="column">
      <my-friendliness player="${playerId}"></my-friendliness>
      <my-thoughts player="${playerId}"></my-thoughts>
      <my-blurbs player="${playerId}"></my-blurbs>
      <my-top player="${playerId}"></my-top>
      <my-love player="${playerId}"></my-love>
    </div>
  `
})

$.style(`
  & {
    display: block;
  }

  @media screen and (min-width: 768px) {
    & {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
  }

  & .column > * {
    display: block;
    border: 2px solid var(--wheel-0-3);
    border-radius: 2px;

    background: white;
    margin: 1rem 0;
    padding: 16px 9px;
  }
`)
