import elf from '@silly/elf'

const $ = elf('multiplayer-template')

const rpcHandlers = {
  inputFrame(params) {
    console.log(params)
    $.teach({ rawInputs: params })
  }
}

$.draw(() => {
  const { rawInputs } = $.learn()
  return `
    ${JSON.stringify(rawInputs)}
  `
})

$.when('json-rpc', (event) => {
  const { method, params } = event.detail

  if(rpcHandlers[method]) {
    rpcHandlers[method](params)
  }
})


