const $ = module('sillonious-memex')

$.draw((target) => {
  const hosts = target.getAttribute('hosts').split('+')
  return `
    ${hosts.map((host) => `
      <sillonious-brand host="${host}" preview="true"></sillonious-brand>
    `).join('')}
  `
})

$.style(`
  & {
    display: block;
    margin: 1rem 0;
  }
`)
