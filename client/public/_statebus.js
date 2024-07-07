import "./statebus/statebus.js"
import "./statebus/client-library.js"
import { braid_fetch } from "./statebus/braidify-client.js"

const statebus = window.bus
export const state = statebus.state
export default statebus

self.braid_fetch = braid_fetch
statebus.libs.localstorage('ls/*')
statebus.libs.http_out('/*', '/')
window.state = state
