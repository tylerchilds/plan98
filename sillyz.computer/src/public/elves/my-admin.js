import module from '@silly/tag'
import { Grid } from 'gridjs'
import { connect, getBase, whenLogout } from "./pocket-authentication.js"
import { currentBusiness } from './sillonious-brand.js'

const linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "https://unpkg.com/gridjs/dist/theme/mermaid.min.css";
document.head.appendChild(linkElement);

const $ = module('my-admin')

function table(parameters = {}) {
  const { name, results } = parameters
  // big moment for me using this operator in this context.
  if(results?.items.length > 0) {
    const id = `admin-${name}`
    const getNode = (target) => target.querySelector(`[id="${id}"]`)
    const render = (target) => grid.render(getNode(target));
    const columns = Object.keys(results.items[0])
    const data = results.items.map(item => columns.map(x => item[x]))

    const grid = new Grid({
      columns,
      data
    })

    return {
      id,
      slot: `<div id="${id}"></div>`,
      grid,
      render
    }
  }
}

$.draw(target => {
  const account = state['ls/~']
  connect(target)
  query(target, account)
  const { space, users } = $.learn()

  const tableSpace = table(space)
  const tableUsers = table(users)

  const app = account ? `
    <pocket-authentication class="authenticated"></pocket-authentication>
    <h2>Everybody!</h2>
    ${tableSpace?.slot}
    <h2>Humans!</h2>
    ${tableUsers?.slot}
  ` : `
    <pocket-authentication></pocket-authentication>
  `

  const { image, color } = currentBusiness()
  target.style.setProperty("--image", `url(${image})`);
  target.style.setProperty("--color", color);

  target.innerHTML = `
    <div class="inner">
      ${app}
    </div>
  `

  // the seal
  tableSpace?.render(target)
  // is broken
  tableUsers?.render(target)
})

async function query(target, account) {
  if(target.dataset.account === account) return
  target.dataset.account = account
  const base = getBase(target)
  //const resultSpace = await base.collection('my_namespace').getList(1, 30, {});
  const resultUsers = await base.collection('users').getList(1, 30, {});
  $.teach({
    /*
    space: {
      results: resultSpace,
      name: 'my_namespace'
    },
    */
    users: {
      results: resultUsers,
      name: 'users'
    }
  })
}

whenLogout(() => {
  $.teach({ users: null, space: null })
})

$.style(`
  &::before {
    content: '';
    position: absolute;
    background: var(--image), var(--color, transparent);
    background-blend-mode: multiply;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    inset: 0;
    overflow: hidden;
  }

  & {
    display: grid;
    place-items: center;
    padding: 9px;
    height: 100%;
    width: 100%;
    position: relative;
  }

  & .inner {
    z-index: 1;
    position: relative;
    overflow: auto;
    width: 100%;
  }
`)
