import "@pyscript/core"
import module from '@silly/tag'

const $ = module('python-pirate')

$.draw((target) => {
  target.innerHTML = `
    <h1>Polyglot 🦜 💬 🇬🇧 ➡️ 🏴‍☠️</h1>
    <p>Translate English into Pirate speak...</p>
    <input type="text" id="english" placeholder="Type English here..." />
    <button py-click="translate_english">Translate</button>
    <div id="output"></div>
  `

  const s = document.createElement("script");
  s.type = "py";
  s.src = "/public/python/pirate.py";
  document.body.appendChild(s)
})
