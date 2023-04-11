import module from '../module.js'
import * as focusTrap from 'focus-trap'

const ENUMS = [
  { command: 'escape' },
  { command: 'download' },
  { command: 'upload' },
]

function execute(command) {
  alert(`executed ${command}`)
}


const $ = module('console-module', {
  filter: ''
})

$.when('click', '.item', function update(event) {
  event.preventDefault();
  const args = attributes(event.target, $)

  const { command } = event.target.dataset
  execute(command)

  args.root.trap.deactivate();
})

$.when('click', '.bar', toggleActive);
$.when('keyup', '[name="filter"]', setFilter);

$.draw(target => {
	if(!target.trap) {
		target.trap = focusTrap.createFocusTrap(target, {
			onActivate: onActivate(target),
			onDeactivate: onDeactivate(target),
			clickOutsideDeactivates: true
		});
	}

  const { filter } = $.learn()
  const choices = []

  const list = ENUMS
    .filter(x => x.command.toLowerCase().indexOf(filter.toLowerCase()) > -1)
    .map(x => `
      <button class="item" data-command="${x.command}">
        ${x.command}
      </button>
    `).join('')

  const customOption = `
    <button class="item" data-id="${filter}">
      ${filter}
    </button>
  `

  return `
    <button class="bar">
      'run: ' ${choices.map(x => x.command).join(', ')}
    </button>

    <div class="filterable-list">
      <div class="filter-area">
        <input type="text" name="filter" placeholder="Search" value="${filter}" />
      </div>
      <div class="list">
        ${list}
        ${customOption}
      </div>
    </div>
  `
})

function attributes(node, $) {
  const root = node.closest($.selector)

  return { root }
}

function toggleActive(event) {
  const args = attributes(event.target, $)

	if(isActive(args.root)) {
		args.root.trap.deactivate();
	} else {
		args.root.trap.activate();
	}
}


function setFilter(event) {
	const { value } = event.target
	$.teach({ filter: value })
}

function onActivate(target){
  return () => {
    target.classList.add('is-active')
    target.querySelector('[name="filter"]').focus()
  }
}

function onDeactivate(target) {
  return () => {
    target.classList.remove('is-active')
		$.teach({ filter: '' })
  }
}

function isActive(target) {
  return target.matches('.is-active')
}

$.flair(`
	& {
		display: block;
		position: relative;
		z-index: 3;
    width: 100%;
	}

	& .filter-area {
    margin: .5rem;
	}

	& .bar {
		white-space: nowrap;
		background: rgba(255,255,255,.85);
    width: 100%;
	}

	&.is-active .bar {
	}
	& .bar:hover,
	& .bar:focus {
	}

	& [name="filter"] {
		background: white;
		border: none;
		width: 100%;
    display: block;
	}

	& .filterable-list {
    background: white;
		display: none;
		position: absolute;
    width: 100%;
	}

	&.is-active .filterable-list {
		display: flex;
    flex-direction: column;
	}

  & .filterable-list.above {
    top: 0;
    transform: translateY(-100%);
    flex-direction: column-reverse;
  }

	& .item {
		background: transparent;
		border: none;
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		min-height: 40px;
		margin: 0;
		text-align: left;
		width: 100%;
	}

	& .item * {
		pointer-events: none;
	}

	& .list {
		max-height: 80vh;
		overflow-y: auto;
	}

	& .item:hover,
	& .item:focus {
		background: linear-gradient(rgba(0,0,0,0) 75%, rgba(0,0,0,.25));
	}
`)
