const NORMAL_MODE = Symbol('normal')
const KEY_VALUE_MODE = Symbol('key-value')
const DYNAMIC_MODE = Symbol('dynamic')

export const compile = (script) => {
  const HyperText = {
    '#': append.bind({}, 'hypertext-address'),
    '@': append.bind({}, 'hypertext-character'),
    '"': append.bind({}, 'hypertext-quote'),
    '(': append.bind({}, 'hypertext-parenthetical'),
    '!': append.bind({}, 'hypertext-information'),
    '^': append.bind({}, 'hypertext-effect'),
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

  const symbols = Object.keys(HyperText)

  const modes = {
    [NORMAL_MODE]: normalMode,
    [KEY_VALUE_MODE]: kvMode,
    [DYNAMIC_MODE]: dynamicMode,
  }

  const isolate = {
    scope: 'global',
    plugin: '',
    mode: NORMAL_MODE,
    result: ``
  }

  const lines = script.split('\n')

  for (const line of lines) {
    (modes[isolate.mode] || noop)(line)
  }

  return isolate.result

  function normalMode(line) {
    if(!line) return blank()

    const symbol = line[0]

    if(symbols.includes(symbol)) {
      const [_, text] = line.split(symbol)
      return HyperText[symbol](text.trim())
    }

    return freetext(line)
  }

  function kvMode(line, separator=':') {
    const index = line.indexOf(separator)
    const key = line.substring(0, index)
    const value = line.substring(index+1)

    if(!value) {
      if(isolate.scope === 'screenplay') {
        headers()
        title()
      }
      return setMode(NORMAL_MODE)
    }

    state[isolate.scope][key.trim()] = value.trim()
  }

  function dynamicMode(line, separator=':') {
    const index = line.indexOf(separator)
    const key = line.substring(0, index)
    const value = line.substring(index+1)

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

  function headers() {
    const {
      title,
      author,
    } = state[isolate.scope]

    const html = `
      <style>
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

body {
	font-size: 12pt;
	font-family: courier;
	margin: 0 auto;
}

@media print {
  html, body {
    height: 100%;
		padding: 0;
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

title-cover {
  display: grid;
  grid-template-areas:
    "main main"
    "contact agent";
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto;
  width: 100%;
  height: 100%;
}

title-main {
  place-self: center;
  grid-area: main;
  text-align: center;
}

title-title {
  margin-bottom: 1rem;
}

title-title,
title-author {
  display: block;
}

title-contact {
  grid-area: contact;
}

title-agent {
  grid-area: agent;
}

  hypertext-title {
    display: block;
    height: 100vh;
    width: 100%;
  }

  hypertext-freetext,
  hypertext-blank {
    display: block;
  }

  hypertext-freetext {
    margin: 1rem 0;
  }

      </style>
    `

    isolate.result += html
  }

  function title() {
    const {
      title,
      author,
      contact,
      agent
    } = state[isolate.scope]

    append('hypertext-title', `
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
    append('hypertext-freetext', line)
  }

  function blank() {
    append("hypertext-blankline", "")
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

const $ = module('hyper-script', { file: 'booting...' })

function source(target) {
  return target.closest('[src]').getAttribute('src')
}

function sourceFile(target) {
  const src = source(target)
  return state[src]
    ? state[src]
    : (function initialize() {
      state[src] = {
        file: hello(),
				html: '&hearts;',
        embed: ';)'
      }
      return state[src]
    })()
}

$.when('input', 'textarea', (event) => {
  const src = source(event.target)
  const { value } = event.target
  state[src].file = value
  const html = compile(value)
	state[src].html = html
  state[src].embed = `<iframe src="${window.location.href}&readonly=true" title="embed"></iframe>`
})

$.when('click', '.print', (event) => {
  const node = event.target.closest($.link)
  const preview = node.querySelector('[name="preview"] iframe').contentWindow
  preview.focus()
	preview.print()
})

$.draw(target => {
  const { file, html, embed } = sourceFile(target)
	const readonly = target.getAttribute('readonly')

	if(readonly) {
		return html
	}

  return `
		<div class="grid">
			<div name="transport">
				<button class="print">print</button>
			</div>
			<div name="view">
				<div name="card">
					${html}
				</div>
			</div>
			<textarea>${file}</textarea>
			<div name="preview">
				${embed}
			</div>
		</div>
  `
})

$.style(`
  & .grid {
    display: grid;
    grid-template-rows: auto 1fr 10rem;
    height: 100vh;
  }

  & [name="transport"] {
    display: flex;
    justify-content: flex-end;
  }

  & [name="card"] {
		background: white;
		height: 100%;
		max-width: 8.5in;
		margin: 0 auto;
		padding: 0 1in;
		overflow: auto;
	}

  & [name="view"] {
    overflow: auto;
  }

  & [name="preview"] {
		display: none;
  }

	& iframe {
		display: block;
		border: none;
		width: 100%;
		height: 100%;
	}

  & textarea {
    width: 100%;
    height: 100%;
		z-index: 1;
		position: relative;
  }

  @media print {
    & [name="view"] {
      display: block;
    }

    & [name="transport"],
    & textarea {
      display: none;
    }
  }
`)

function hello() {
  return `{ screenplay
title: In the Computer
author: Ty

! This feels like a fuzzy dream sequence with everything over exposed except the colors red, blue, and green.

^ fade in
# Int. Computer
In the computer. Like Zoolander. Like Owen Wilson's character's understanding of in the computer. Ty wears three shirts and three hats. Left wears a blue shirt and hat. Right wears a red shirt and hat. Front wears a green shirt and hat.

@ Ty
" Welcome.

@ Left
" See. I said it could.

@ Right
" It wasn't easy.

@ Front
" Whatever, I can sell it.

<hello-world`
}
