import elf from '@silly/elf'
import { DocHandle, Repo, isValidAutomergeUrl } from "@automerge/automerge-repo"
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb"
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import { init } from "@automerge/prosemirror"

const repo = new Repo({
  storage: new IndexedDBStorageAdapter("automerge"),
  network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")],
})

// Get the document ID from the URL fragment if it's there. Otherwise, create
// a new document and update the URL fragment to match.
const docUrl = window.location.hash.slice(1)
if (docUrl && isValidAutomergeUrl(docUrl)) {
  handle = repo.find(docUrl)
} else {
  handle = repo.create({ text: "" })
  window.location.hash = handle.url
}
// Wait for the handle to be available
await handle.whenReady()

// This is the integration with automerge.
const { schema, doc, plugin } = init(handle, ["text"])
const editorConfig = {
  schema,
  plugins: [plugin],
}
// This is the prosemirror editor.
const view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc, // Note that we initialize using the mirror
    plugins: exampleSetup({ schema, plugins: [plugin] }),
  }),
})

console.log(view)
