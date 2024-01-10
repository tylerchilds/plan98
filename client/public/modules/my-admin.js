import module from '@sillonious/module'
import { Grid } from 'gridjs'
import { connect, getBase, whenLogout } from "./pocket-authentication.js"

const linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "https://unpkg.com/gridjs/dist/theme/mermaid.min.css";
document.head.appendChild(linkElement);

const $ = module('my-admin')

function table({ table, results}) {
  // big moment for me using this operator in this context.
  if(results?.items.length > 0) {
    const id = `admin-${table}`
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
    <h2>Everybody!</h2>
    ${tableSpace?.slot}
    <h2>Humans!</h2>
    ${tableUsers?.slot}
  ` : `
    <my-biography player=""></my-biography>
  `

  target.innerHTML = `
    <pocket-authentication></pocket-authentication>
    ${app}
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

whenLogout(() => {
  $.teach({ users: null, space: null })
})
