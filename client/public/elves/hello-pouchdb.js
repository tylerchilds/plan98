import module from '@silly/tag'
import PouchDB from 'pouchdb'

const db = new PouchDB('my_database')

const $ = module('hello-pouchdb', {rows: []})

showTodos()

var remoteCouch = false;

db.changes({
  since: 'now',
  live: true
}).on('change', showTodos);

function addTodo(text) {
  var todo = {
    _id: new Date().toISOString(),
    title: text,
    completed: false
  };
  db.put(todo, function callback(err, result) {
    if (!err) {
      console.log('Successfully posted a todo!');
    }
  });
}

function showTodos() {
  db.allDocs({include_docs: true, descending: true}, function(err, doc) {
  console.log({doc})
    $.teach({ rows: doc.rows })
  });
}

function checkboxChanged(todo, event) {
  todo.completed = event.target.checked;
  db.put(todo);
}

function deleteButtonPressed(todo) {
  db.remove(todo);
}

function todoBlurred(todo, event) {
  var trimmedText = event.target.value.trim();
  if (!trimmedText) {
    db.remove(todo);
  } else {
    todo.title = trimmedText;
    db.put(todo);
  }
}

$.when('change', 'input', (event) => {
  const { value } = event.target
  addTodo(value)
})

$.when('dblclick', 'li', (event) => {
  const { id } = event.target
  const { rows } = $.learn()
  const todo = rows.find(x => x.doc._id === id)
  todo.doc.completed = !todo.doc.completed
  db.put(todo)
})

$.draw(( target ) => {
  const { rows } = $.learn()
  return `
    <input>
    <ul>
      ${rows.map((row) => `
        <li id="${row.doc._id}" class="${row.doc.completed ? 'done':'' }">
          ${row.doc.title}
        </li>
      `).join('')}
    </ul>
  `
})

$.style(`
  & .done {
    text-decoration: line-through;
  }
`)

