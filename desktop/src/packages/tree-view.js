import module from '../module.js'

const $ = module('tree-view')


$.draw(target => {
  const tokens = target.getAttribute('tokens')
  const config = state[tokens] || {}
  readTree(config)
  return `
    <details>
      <summary>Cool</summary>
       Uncool
    </details>
  `
})

function authenticationToken(config) {
  return {
    key: config.token,
    secret: config.secret,
  };
}

async function fetchUser(config) {
  const { Response, Code } = await fetch('/proxy', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: 'https://api.smugmug.com/api/v2!authuser',
      provider: config.provider,
      token: authenticationToken(config)
    }),
  }).then(res => res.json());

  if(Code === 200) {
    bus.state['smugmug/user'] = Response.User
  }
}

async function fetchTree(config) {
  const { NickName } = bus.state['smugmug/user']
  console.log(NickName)
  const url = `https://api.smugmug.com/api/v2/user/${NickName}?_expand=Node.ChildNodes`;
  const { Response, Code } = await fetch('/proxy', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      provider: config.provider,
      token: authenticationToken(config)
    }),
  }).then(res => res.json());

  if(Code === 200) {
  }
}

async function readTree(config) {
  await fetchUser(config)
  console.log(bus.state['smugmug/user'])
  await fetchTree(config)
}
