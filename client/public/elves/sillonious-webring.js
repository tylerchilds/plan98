import module from '@silly/tag'
// i channel my runic knowledge to commune with the ancestors and establish contact with the animals
import { doingBusinessAs } from './sillonious-brand.js'

const protocol = 'https://'
const locale = 'en_US'

const $ = module('sillonious-webring', {
  diskette: 0,
  paused: false,
  nextDisk: 0,
  instances: {}
})

$.draw((target) => {
  const { id } = target
  const { instances } = $.learn()
  mount(target)
  if(!instances[target.id]) return
  const { diskette, nextDisk } = instances[target.id]
  const [sill,on,ious] = triforce(diskette)
  const fadeOut = diskette !== nextDisk
  return `
    <transition class="${fadeOut ? 'out' : ''}" data-id="${id}">
      <iframe src="/?world=${sill}" title="${sill}"></iframe>
      <iframe src="/?world=${on}" title="${on}"></iframe>
      <iframe src="/?world=${ious}" title="${ious}"></iframe>
    </transition>
  `
})

function mount(target) {
  if(target.mounted) return
  target.mounted = true
  const { diskette, nextDisk } = $.learn() || {}
  schedule(() => {
    const id = target.id
    updateInstance(id, { id, diskette, nextDisk, max: diskettes() })
  })
}

function diskettes() {
  return Object.keys(doingBusinessAs)
}

function updateInstance(id, payload) {
  $.teach({...payload}, (s, p) => {
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          ...p
        }
      }
    }
  })
}

function schedule(x, delay=1) { setTimeout(x, delay) }

function triforce(index) {
  const dba = diskettes()
  const alpha = dba[mod(index-1, dba.length)]
  const omega = dba[mod(index+1, dba.length)]
  return [alpha, dba[index], omega]
}

function mod(x, n) {
  return ((x % n) + n) % n;
}

$.style(`
  & {
    display: block;
		position: relative;
    height: 100%;
    max-height: 100%;
  }

	& button {
		border-radius: 0;
		border: none;
		background: black;
		color: dodgerblue;
    z-index: 1;
	}
`)
