// a render helper for returning a create task form
export default function showNewItemForm(_$) {
  return `
    <input data-new-item-input class="new-todo" placeholder="What needs to be done?" autofocus>
  `
}
