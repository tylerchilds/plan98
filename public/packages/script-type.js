import module from '../module.js'

import {
  EditorState,
  EditorView,
  basicSetup
} from "@codemirror/basic-setup"

const BIOS_MODE = Symbol('bios')
const NORMAL_MODE = Symbol('normal')
const KEY_VALUE_MODE = Symbol('key-value')
const DYNAMIC_MODE = Symbol('dynamic')

export const compile = (script) => {
  const ScriptType = {
    '#': append.bind({}, 'scripttype-address'),
    '@': append.bind({}, 'scripttype-character'),
    '"': append.bind({}, 'scripttype-quote'),
    '(': append.bind({}, 'scripttype-parenthetical'),
    '!': append.bind({}, 'scripttype-information'),
    '^': append.bind({}, 'scripttype-effect'),
    '<': plugin,
    '{': scope,
  }

  function scope(type) {
    setScope(type)
    resetAttributes(type)
    setMode(KEY_VALUE_MODE)
  }

  function plugin(x) {
    setPlugin(x)
    resetAttributes(x)
    setMode(DYNAMIC_MODE)
  }

  const symbols = Object.keys(ScriptType)

  const modes = {
    [BIOS_MODE]: biosMode,
    [NORMAL_MODE]: normalMode,
    [KEY_VALUE_MODE]: kvMode,
    [DYNAMIC_MODE]: dynamicMode,
  }

  const isolate = {
    scope: 'global',
    plugin: '',
    mode: BIOS_MODE,
    result: ``
  }

  const lines = script.split('\n')

  for (const line of lines) {
    (modes[isolate.mode] || noop)(line)
  }

  return isolate.result

  function biosMode(line) {
    console.log('todo: implement')
    console.log(line)
    return setMode(NORMAL_MODE)
  }

  function normalMode(line) {
    if(!line) return blank()

    const symbol = line[0]

    if(symbols.includes(symbol)) {
      const [_, text] = line.split(symbol)
      return ScriptType[symbol](text.trim())
    }

    return freetext(line)
  }

  function kvMode(line) {
    const [key, value] = line.split(':')

    if(!value) {
      if(isolate.scope === 'typewriter') {
        title()
      }
      return setMode(NORMAL_MODE)
    }

    state[isolate.scope][key.trim()] = value.trim()
  }

  function dynamicMode(line) {
    const [key, value] = line.split(':')

    if(!value) {
      embed()
      return setMode(NORMAL_MODE)
    }

    state[isolate.plugin][key.trim()] = value.trim()
  }

  function setMode(m) {
    isolate.mode = m
  }

  function setScope(s) {
    isolate.scope = s
  }

  function setPlugin(d) {
    isolate.plugin = d
  }

  function resetAttributes(x) {
    state[x] = {}
  }

  function title() {
    const {
      title,
      author,
      contact,
      agent
    } = state[isolate.scope]

    append('scripttype-title', `
      <title-cover>
        <title-main>
          <title-title>
            ${title}
          </title-title>
          by
          <title-author>
            ${author}
          </title-author>
        </title-main>
        <title-contact>
          ${markup(contact) || '' }
        </title-contact>
        <title-agent>
          ${markup(agent) || '' }
        </title-agent>
      </title-cover>
    `)
  }
  function embed() {
    const properties = state[isolate.plugin]

    const attributes = Object.keys(properties)
      .map(x => `${x}="${properties[x]}"`).join('')

    isolate.result += `<${isolate.plugin} ${attributes}></${isolate.plugin}>`
  }

  function markup(string) {
    return string && string.replaceAll('\\', '<br>')
  }

  function freetext(line) {
    append('scripttype-freetext', line)
  }

  function blank() {
    append("script-type-blankline", "")
  }

  function append(tag, content) {
    const html = `
      <${tag}>
        ${content}
      </${tag}>
    `
    isolate.result += html
  }

  function noop() {}
}

const $ = module('script-type', { file: hello() } )
const $editor = module('script-editor')
const $viewer = module('script-viewer')

$.draw(target => {
  return `
    <div name="transport">
      <button class="print">print</button>
    </div>
    <script-editor></script-editor>
    <script-viewer></script-viewer>
  `
})

$.flair(`
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  @media print {
    html, body {
      height: 100%;
    }
  }

  @page {
    size: 8.5in 11in;
    margin: 1in 1in 1in 1.5in;
  }

  @page {
    @top-right {
      content: counter(page) '.';
    }
  }

  @page:first {
    @top-right {
      content: '';
    }
  }


  & {
    display: grid;
    grid-template-areas:
    "transport transport"
    "editor viewer";
    grid-auto-columns: 1fr 1fr;
    grid-auto-rows: 2rem calc(100vh - 2rem);
  }

  & [name="transport"] {
    grid-area: transport;
  }

  & script-editor {
    grid-area: editor;
  }

  & script-viewer {
    grid-area: viewer;
  }

  @media print {
    & [name="transport"],
    & script-editor {
      display: none;
    }

    & { display: block }
    & script-viewer { display: block }
  }

`)

$.when('click', '.print', print)

$viewer.draw(target => {
  const source = target.closest($.link).getAttribute('source')
  const { formatted } = state[source] || {}
  return `
    <div class="shadowbox">
      ${formatted}
    </div>
  `
})

$editor.draw(target => {
  const { file } = $.learn()

  if(file && !target.view) {
    const config = {
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        EditorView.updateListener.of(
          persist(target, $, {})
        )
      ]
    }

    const state = EditorState.create({
      ...config,
      doc: file
    })

    target.view = new EditorView({
      parent: target,
      state
    })
  }
})

function persist(target, $, _flags) {
	return (update) => {
    if(update.changes.inserted.length < 0) return

		const file = update.view.state.doc.toString()
    const formatted = compile(file)

    const source = target.closest($.link).getAttribute('source')
    state[source] = { file, formatted }
	}
}

$editor.flair(`
  & {
    display: block;
  }
`)

$viewer.flair(`
  & {
    display: block;
    font-size: 12pt;
    font-family: courier;
    margin: 0 auto;
    max-width: 6in;
  }
  & scripttype-title {
    display: block;
    height: 100%;
    width: 100%;
  }

  & title-cover {
    display: grid;
    grid-template-areas:
      "main main"
      "contact agent";
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr auto;
    width: 100%;
    height: 100%;
  }

  & title-main {
    place-self: center;
    grid-area: main;
    text-align: center;
  }

  & title-title {
    margin-bottom: 1rem;
  }

  & title-title,
  & title-author {
    display: block;
  }

  & title-contact {
    grid-area: contact;
  }

  & title-agent {
    grid-area: agent;
  }

  & scripttype-address,
  & scripttype-character,
  & scripttype-quote,
  & scripttype-parenthetical,
  & scripttype-information,
  & scripttype-effect,
  & scripttype-freetext,
  & scripttype-blank {
    display: block;
  }

  & scripttype-address,
  & scripttype-information {
    text-transform: uppercase;
    margin: 1rem 0;
  }

  & scripttype-character,
  & scripttype-parenthetical {
    text-align: center;
  }

  & scripttype-character {
    text-align: center;
    text-transform: uppercase;
    margin: 1rem 0 0;
  }

  & scripttype-effect {
    margin: 1rem 0;
    text-align: right;
  }

  & scripttype-quote {
    margin: 0 1in;
  }

  & scripttype-quote:first-child::before {
    content: "(CONT'D)" !important;
    display: block;
    text-align: center;
  }

  & scripttype-parenthetical::before {
    content: '(';
  }

  & scripttype-parenthetical::after {
    content: ')';
  }

  & scripttype-freetext {
    margin: 1rem 0;
  }

`)

function hello() {
  return `#!/bin/sh sillonious

{ typewriter
title: The Journal of the War on Clowns
author: Tyler Childs

^ fade in
# The Studio - Day

NOTORIOUS SILLONIOUS, a puppet made of a blue sweatshirt, a red beanie, but mostly a pair of glasses.

@ Notorious Sillonious (V.O.)
" Welcome.

The puppet does not move while it speaks.

ORIGIN WILDCLOAK, is a pile of hawaiian and flannel shirts in a lump.

@ Origin Wildcloak (V.O.)
" We've, been waiting for you.

TY enters wearing black on black crew uniform.

@ Ty
" Don't everyone spring up at once.

Ty points finger guns at both his alternative personas.

@ Origin Wildcloak (V.O.)
" Funny.

@ Notorious Sillonious (V.O.)
" Lazy.

@ Ty
" You're calling me lazy?

Ty high fives himself with the sleeve of Sillonious.

@ Origin Wildcloak
" You set yourself up for that.

@ Ty
" Alright, enough joking around, what's the latest?

^ Cut to black
`
}
