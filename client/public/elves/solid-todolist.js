import module from '@silly/tag'
import $user, { web, currentUser } from '@sillonious/solid/user'

import initialTodoList from './todo-list/data/initialTodoList.js'
import flags from './todo-list/data/flags.js'

import showListItems from './todo-list/features/showListItems.js'
import showNewItemForm from './todo-list/features/showNewItemForm.js'
import showFilters from './todo-list/features/showFilters.js'
import showIncompleteCount from './todo-list/features/showIncompleteCount.js'
import showClearCompletedAction from './todo-list/features/showClearCompletedAction.js'
import showCompletenessToggle from './todo-list/features/showCompletenessToggle.js'

import performItemsRequest from './todo-list/features/performItemsRequest.js'
const interactives = [
  './todo-list/features/onClearCompletedAction.js',
  './todo-list/features/onFilterChange.js',

  './todo-list/features/onNewItemInput.js',
  './todo-list/features/onItemEdit.js',
  './todo-list/features/onItemChange.js',
  './todo-list/features/onItemToggle.js',
  './todo-list/features/onItemDelete.js',

  './todo-list/features/onCompletenessToggle.js'
];

// create a new tag: <todo-list>
// define the initial state and shape of the data
const $ = module('solid-todolist', initialTodoList)

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
      `${user.storageUrl}items/`
    );

    $.teach({ itemsContainerUrl: url });
  }

  const items = await performItemsRequest($);
  $.teach({ items });
})

// html is a render function; if a string is returned, it is rendered
// whenever state changes, the render function will be called on each target
$.draw((target) => {
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

