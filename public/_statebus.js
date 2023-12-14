import "./statebus/statebus.js"
import "./statebus/client-library.js"
import "./statebus/braidify-client.js"

const statebus = window.bus
export const state = statebus.state
export default statebus

statebus.libs.localstorage('ls/*')
statebus.libs.http_out('/*', '/')
window.braid_fetch = window.fetch
window.state = state
