import module from '@sillonious/module'
import { Grid } from 'gridjs'
import { connect, getBase, whenLogout } from "./pocket-authentication.js"

const linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "https://unpkg.com/gridjs/dist/theme/mermaid.min.css";
document.head.appendChild(linkElement);

const $ = module('my-admin')

function table(id, results) {
  // big moment for me using this operator in this context.
  if(results?.items.length > 0) {
    const columns = Object.keys(results.items[0])
    const data = results.items.map(item => columns.map(x => item[x]))

    const grid = new Grid({
      columns,
      data
    })

    return {
      slot: `<div id="${id}"></div>`,
      grid
    }
  }

  return {}
}


$.draw(target => {
  const account = state['ls/~']
  connect(target)
  query(target, account)
  const { results } = $.learn()

  const tableId = `${target.id}-table`
  const { slot, grid } = table(tableId, results)

  const app = results ? `
    ${slot}
  ` : `
    and when one is clicked show the biography below
    <my-biography player=""></my-biography>
  `

  target.innerHTML = `
    <pocket-authentication></pocket-authentication>
    ${app}
  `
  slot && grid.render(target.querySelector(`[id="${tableId}"]`));
})

async function query(target, account) {
  if(target.dataset.account === account) return
  target.dataset.account = account
  const base = getBase(target)
  const results = await base.collection('my_namespace').getList(1, 30, {});

  $.teach({ results })
}

whenLogout(() => {
  $.teach({ results: null })
})
