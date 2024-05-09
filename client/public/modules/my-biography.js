import module from '@silly/tag'
import { connect, getBase, whenLogout } from "./pocket-authentication.js"

const $ = module('my-biography')

$.draw(target => {
  connect(target)
  query(target)

  const playerId = 'hi'

  // convert this all to one internal large file
  return `
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

async function query(target, account) {
  if(target.dataset.account === account) return
  target.dataset.account = account
  const base = getBase(target)
  const resultSpace = await base.collection('my_namespace').getList(1, 30, {});
  const resultUsers = await base.collection('users').getList(1, 30, {});

  $.teach({
    space: {
      results: resultSpace,
      table: 'my_namespace'
    },
    users: {
      results: resultUsers,
      table: 'users'
    }
  })
}

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
