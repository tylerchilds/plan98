import { Self, Expect, Describe, Dashboard, Bug } from '@plan98/types'
import Cache from '@silly/cache'
const cache = Cache('env')

export async function set(key, value, mime) {
  return await (this||cache).put(key, value, mime).catch(Bug)
}

export async function get(key) {
  return await (this||cache).get(key).catch(Bug)
}

export async function tests() {
  const testCache = Cache(self.crypto.randomUUID())

  await Describe('get a value that does not exist', async (done) => {
    const result = await get.call(testCache, 'key')
    Expect(result, null)

    return done()
  }).catch(Bug)

  await Describe('set a value to exist', async (done) => {
    const setResult = await set.call(testCache, 'key', {
      hello: 'world'
    }, { type: 'application/json' })

    Expect(setResult.ok, true)

    return done()
  }).catch(Bug)

  await Describe('get a value that does exist', async (done) => {
    const getResult = await get.call(testCache, 'key')

    Expect(getResult.data.hello, 'world2')

    return done()
  }).catch(Bug)
}

const {
  model,
  view,
  controller,
} = Self('plan98-env', {
  data: null
})

view((target) => {
  if(target.mounted) {
    const { logs, bugs } = model().data
    target.innerHTML = `
      <div style="color: mediumseagreen">
        ${logs.join('<br>')}
      </div>
      <div style="color: firebrick">
        ${Dashboard().bugs.join('<br>')}
      </div>
    `
  } else {
    target.mounted = true
    tests().then(() => {
      const { logs, bugs } = Dashboard()
      controller({
        data: {
          logs,
          bugs
        }
      })
    })
  }
})
