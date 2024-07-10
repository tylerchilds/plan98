import module from '@silly/tag'
import { connect, getBase, whenLogout } from "./potluck-authentication.js"
import { currentBusiness } from './sillonious-brand.js'

const linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "https://unpkg.com/gridjs/dist/theme/mermaid.min.css";
document.head.appendChild(linkElement);

const $ = module('potluck-list')

$.draw(target => {
  const account = state['ls/~']
  connect(target)
  query(target, account)
  const { potlucks } = $.learn()

  const potlucksView = potlucks ? potlucks.items.map((potluck) => {
    return `
      <button data-id="${potluck.id}">
        ${potluck.name}<br>
        <em>${new Date(potluck.updated).toDateString()}</em>
      </button>
    `
  }).join('') : 'Create a potluck?'

  const app = account ? `
    <potluck-authentication class="authenticated"></potluck-authentication>
    <div class="list">
      ${potlucksView}
    </div>
  ` : `
    <potluck-authentication></potluck-authentication>
  `

  const { image, color } = currentBusiness()
  target.style.setProperty("--image", `url(${image})`);
  target.style.setProperty("--color", color);

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
  const potlucks = await base.collection('potlucks').getList(1, 30, {});

  $.teach({
    potlucks
  })
}

whenLogout(() => {
  $.teach({ users: null, space: null })
})

$.when('click', '.list button', (event) => {
  const { id } = event.target.dataset
  showModal(`
    <potluck-view data-id="${id}"></potluck-view>
  `)
})

$.style(`
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

  & .list {
    margin: 1rem 0;
  }

  & .list button {
    border: none;
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    color: rgba(255,255,255,.85);
    display: block;
    width: 100%;
  }

  & .list button em {
    color: rgba(255,255,255,.65);
  }

  & .list button:hover,
  & .list button:focus {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: goldenrod;
  }
`)
