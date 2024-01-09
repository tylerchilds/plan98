import module from '@sillonious/module'
import { connect, getBase } from "./pocket-authentication.js"

const $ = module('my-admin')

$.draw(target => {
  connect(target)
  query(target)
  const { results } = $.learn()
  const app = results ? `
      ${results}
    ` : `
    and when one is clicked show the biography below
    <my-biography player=""></my-biography>
  `

  target.innerHTML = `
    <pocket-authentication></pocket-authentication>
    ${app}
  `
})

async function query(target) {
  if(target.dataset.queried) return
  target.dataset.queried = true
  const base = getBase(target)
  return await base.collection('my_namespace').getList(1, 30, {});
}
