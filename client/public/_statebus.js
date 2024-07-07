import "./statebus/statebus.js"
import "./statebus/client-library.js"
import "./statebus/braidify-client.js"
import * as braid from 'braid-http'

const statebus = window.bus
export const state = statebus.state
export default statebus

self.braid_fetch = braid.fetch
statebus.libs.localstorage('ls/*')
statebus.libs.http_out('/*', '/')
window.state = state
