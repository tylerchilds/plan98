import module from '@silly/tag'
import 'aframe'

const orientation = {
	x: '0', y: '0', z: '0', roll: '0', pitch: '0', yaw: '0'
}

const $ = module('side-quest', {
	celestials: ['silly', 'sally', 'sully','shelly','sol'],
	silly: aBox({x: '-1', y: '.5', z: '-3', pitch: '45' }, { color: '#4CC3D9' }),
	sally: aSphere({y: '1.25', z: '-5'}, { color: '#EF2D5E', radius: '1.25' }),
	sully: aCylinder({x: '1', y: '.75', z: '-3', }, { color: '#FFC65D', radius: '.5', height: '1.5' }),
	shelly: aPlane({z: '-4', yaw: '-90'}, { color: '#7BC8A4',  width: '10', height: '10' }),
	sol: aSky({}, { color: 'lemonchiffon' }),
})

function position(priority) {
	return Object.keys(orientation).reduce((clean, key) => {
		if(priority[key]) {
			clean[key] = priority[key]
		}
		return clean
	}, {})
}

function reduceConflicts(conflicts) {
	return Object.keys(conflicts)
		.reduce((str, key) => {
			return `${str} ${key}="${conflicts[key]}"`
		}, '')
}

function aBox(priority, conflicts) {
	return {
		avatar: 'a-box',
		...orientation,
		...position(priority),
		args: reduceConflicts(conflicts)
	}
}

function aSphere(priority, conflicts) {
	return {
		avatar: 'a-sphere',
		...orientation,
		...position(priority),
		args: reduceConflicts(conflicts)
	}
}

function aCylinder(priority, conflicts) {
	return {
		avatar: 'a-cylinder',
		...orientation,
		...position(priority),
		args: reduceConflicts(conflicts)
	}
}

function aPlane(priority, conflicts) {
	return {
		avatar: 'a-plane',
		...orientation,
		...position(priority),
		args: reduceConflicts(conflicts)
	}
}

function aSky(priority, conflicts) {
	return {
		avatar: 'a-sky',
		...orientation,
		...position(priority),
		args: reduceConflicts(conflicts)
	}
}

// you'd rather use request animation frame but lets go 24fps
setInterval(() => {
	//celestials().map(randomOrientation)
}, 1000/24)

function randomOrientation(avatar) {
	const data = $.learn()[avatar]
	const keys = Object.keys(orientation)

	const randomKey = keys[Math.floor(Math.random()*keys.length)]
	const value = parseFloat(data[randomKey])
	const boundedRandomValue = `${remix(value)}`

	const payload = { [randomKey]: boundedRandomValue }

	$.teach(payload, (s, p) => {
		return {...s, [avatar]: { ...s[avatar], ...p}}
	})
}

function remix(value) {
	return Math.random()>.5?value-.01:value+.01
}

function celestials(name) {
	return name ? $.learn()[name] : $.learn().celestials
}

function nested(target) {
  return target.parentNode.closest($.link)
}

$.draw((target) => {
  if(!plan98.parameters.get('side-quest')) {
    const random = self.crypto.randomUUID() 
    const query = plan98.parameters.toString()
    window.location.href = window.location.origin+window.location.pathname+`${query? '?'+query+'&': '?'}side-quest=${random}`
    return 'loading'
  }


  if(nested(target)) return 'Please, no side quests on your side quest'
	if(target.mounted) return increment(target)
	target.mounted = true

	const scene = celestials().map(component)

	return `
		<a-scene>
			${scene.join('')}
		</a-scene>
    <story-chat src="${plan98.parameters.get('side-quest')}"></story-chat>
	`
})

function component(name) {
	const {
		avatar,
		x, y, z,
		yaw, pitch, roll,
		args
	} = celestials(name)
	return `
		<${avatar}
			id="${name}"
			position="${x} ${y} ${z}"
			rotation="${yaw} ${pitch} ${roll}"
			${args}
		></${avatar}>
	`
}

function increment(target) {
	celestials().map(name => {
		target.querySelector(`[id="${name}"]`).outerHTML = component(name)
	})
}

$.style(`
  & {
    position: fixed;
    inset: 0;
  }

  & story-chat {
    position: absolute;
    inset: 0;
    max-width: 6in;
    margin: 0 auto;
  }
`)
