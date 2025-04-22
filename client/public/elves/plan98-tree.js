import elf from '@silly/elf'

const $ = elf('plan98-tree')

const noop = () => null
$.draw(noop, afterUpdate)

function afterUpdate(target) {

}

$.when('click', (event) => {
  event.stopPropagation()
  const { expanded } = event.target.dataset

  event.target.dataset.expanded = expanded !== "true"
})

$.style(`
  & {
    display: block;
    padding: .1rem 1rem;
    cursor: pointer;
    white-space: nowrap;
  }

  &[data-directory] {
    color: #83a598;
  }

  & plan98-tree {
    display: none;
    font-weight: normal;
    color: #ebdbb2;
  }

  &[data-expanded="true"] > plan98-tree{
    display: block;
  }
`)
