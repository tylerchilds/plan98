import module from '@silly/tag'
import { connect, getBase, whenLogout } from "./potluck-authentication.js"

const $ = module('potluck-view')

$.draw(target => {
  const account = state['ls/~']
  connect(target)
  query(target, account)
  const { potluck } = $.learn()

  const app = account ? `
    <div class="list">
      ${potluck.name}
    </div>
  ` : `
    Not authenticated
  `

  target.innerHTML = `
    <div class="inner">
      ${app}
    </div>
  `
})

async function query(target, account) {
  if(target.dataset.account === account) return
  target.dataset.account = account
  const base = getBase(target)
  //const resultSpace = await base.collection('my_namespace').getList(1, 30, {});
  const potluck = await base.collection('potlucks').getOne(target.dataset.id);

  $.teach({
    potluck
  })
}


