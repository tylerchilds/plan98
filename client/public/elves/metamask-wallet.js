import module from '@silly/tag'

const $ = module('hello-metamask', { providers: [] })
const providerMap = {}

function onAnnouncement(event) {
  const { providers } = $.learn()
  // Prevent adding a provider if it already exists in the list based on its uuid.
  if (providers.some(p => p.info.uuid === event.detail.info.uuid)) return;

  providerMap[event.detail.info.uuid] = event.detail.provider

  $.teach(event.detail.info, (state, info) => {
    return {
      ...state,
      providers: [...state.providers, info]
    }
  })

  window.removeEventListener("eip6963:announceProvider", onAnnouncement);
}

window.addEventListener("eip6963:announceProvider", onAnnouncement);
window.dispatchEvent(new Event("eip6963:requestProvider"));

$.draw((target) => {
  const { providers, userAccount, selectedWallet } = $.learn()
  return `
    <h2>Account</h2>
    ${userAccount?userAccount:'Not Logged In'}
    <h2>Providers</h2>
    ${providers.map(provider => {
      return `
        <button data-connect="${provider.uuid}">
          <img src=${provider.icon} alt=${provider.name} />
          <div>${provider.name}</div>
        </button>
      `
    }).join('')}
    <h2>Selected Wallet</h2>
    ${selectedWallet}
  `
})

$.when('click', '[data-connect]', async (event) => {
  const { connect } = event.target.dataset
  const provider = providerMap[connect]

  const accounts = await provider.request({ method: 'eth_requestAccounts' }).catch(console.error);

  if (accounts && accounts[0]) {
    $.teach({ userAccount: accounts[0], selectedWallet: connect})
  }
})
