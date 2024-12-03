import module from '@silly/tag'
import $user, { web, currentUser, getSession } from '@sillonious/solid/user'

import initialTodoList from './e2ee-todolist/data/initialTodoList.js'
import flags from './e2ee-todolist/data/flags.js'

import showListItems from './e2ee-todolist/features/showListItems.js'
import showNewItemForm from './e2ee-todolist/features/showNewItemForm.js'
import showFilters from './e2ee-todolist/features/showFilters.js'
import showIncompleteCount from './e2ee-todolist/features/showIncompleteCount.js'
import showClearCompletedAction from './e2ee-todolist/features/showClearCompletedAction.js'
import showCompletenessToggle from './e2ee-todolist/features/showCompletenessToggle.js'

import performItemsRequest from './e2ee-todolist/features/performItemsRequest.js'

const interactives = [
  './e2ee-todolist/features/onClearCompletedAction.js',
  './e2ee-todolist/features/onFilterChange.js',

  './e2ee-todolist/features/onNewItemInput.js',
  './e2ee-todolist/features/onItemEdit.js',
  './e2ee-todolist/features/onItemChange.js',
  './e2ee-todolist/features/onItemToggle.js',
  './e2ee-todolist/features/onItemDelete.js',

  './e2ee-todolist/features/onCompletenessToggle.js'
];

// create a new tag: <e2ee-todolist>
// define the initial state and shape of the data
const $ = module('e2ee-todolist', initialTodoList)

new Promise((resolve) => {
  (function check(time, handle) {
		const { user } = handle()
    if(user) {
      resolve(user) 
      $.teach({ loading: false });
      return
    }
    requestAnimationFrame((time) => check(time, currentUser))
  })(0, currentUser)
}).then(async (user) => {
  const { itemsContainerUrl } = $.learn();

  if(!itemsContainerUrl) {
    const url = await web.createContainer(
      `${user.storageUrl}e2ee-items/`
    );

    $.teach({ itemsContainerUrl: url });
  }

  const items = await performItemsRequest($);
  $.teach({ items });
}).catch(console.error)

// html is a render function; if a string is returned, it is rendered
// whenever state changes, the render function will be called on each target
$.draw((target) => {
  const { sessionId } = getSession()
  if(!sessionId) {
    if(!target.innerHTML) {
      return `
        <bayun-wizard src="/app/e2ee-todolist"></bayun-wizard>
      `
    }

    return
  }

  const { user } = currentUser()

  if(!user) {
    return `<div><solid-user></solid-user></div>`
  }

  return `
    <div>
    <solid-user></solid-user>
    </div>
    <header class="header">
      <h1>todos</h1>
      ${showNewItemForm($)}
    </header>
    <section class="main">
      ${showCompletenessToggle($)}
      <ul class="todo-list">
        ${showListItems($, flags)}
      </ul>
      <footer class="footer">
        ${showIncompleteCount($)}
        <ul class="filters">
          ${showFilters($, flags)}
        </ul>
        ${showClearCompletedAction($)}
      </footer>
    </section>
  `
}, { afterUpdate })

function afterUpdate(target) {
  { // recover icons from the virtual dom
    [...target.querySelectorAll('solid-user')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('solid-user')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
  }

}

interactives.forEach(async (url) => {
  const { default: start } = await import(url)  
  start($, flags)
})

