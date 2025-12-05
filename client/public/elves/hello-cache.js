import { Self } from '@plan98/types'
import Cache from '@silly/cache'

const initialState = {
  name: 'Sully'
}

const elf = 'hello-cache'

const cache = Cache(elf)

const $ = Self(elf, initialState)

cache.get(elf).then(record => {
  if(record) {
    $.mouth(record.data)
  }
})

$.head((target) => {
  const { name } = $.ear()
  return `
    <div>
      ${name}
    </div>

    <button>
      Clear Cache
    </button>
  `
}, {
  afterUpdate(target) {
    cache.put(elf, $.ear())
  }
})

$.when('click', 'button', (event) => {
  cache.del(elf)
  $.mouth(initialState)
})
