import { Self } from '@plan98/types'
import { marked } from 'marked'
import { showModal, hideModal } from '@plan98/modal'
import $paperPocket, { sideEffects, systemMenu, getTheme, afterUpdateTheme } from './paper-pocket.js'
import { friends } from './plan98-synthia.js'
import { mpn } from './mpn-wizard.js'
import { whoami, logout, auth } from './secure-persona.js'
import { agent } from './agentic-dash.js'

function decodeHtmlEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

const renderer = new marked.Renderer();

renderer.codespan = (code) => {
  return `<code>${escapeHyperText(decodeHtmlEntities(code))}</code>`;
};

// Override code block rendering
renderer.code = (code, language) => {
  let decodedCode = decodeHtmlEntities(code); // First decode pass
  decodedCode = decodeHtmlEntities(decodedCode); // Second decode to fix double encoding

  const langClass = language ? ` class="language-${language}"` : "";
  return `<pre><code${langClass}>${escapeHyperText(decodedCode)}</code></pre>`;
};

marked.setOptions({
  renderer,
  gfm: true,        // Enable GitHub Flavored Markdown
  breaks: false,    // Keep standard line breaks
  smartypants: false, // Prevent automatic quote conversions
});

// helper for system settings
console.log(Object.keys(sideEffects).map((key) => {
  return [key, sideEffects[key], $paperPocket.learn().settings[key]]
}))

const defaultPath = {}
const paperPocketPath = Object.keys(sideEffects)
  .filter(key => {
    return $paperPocket.learn().settings[key]
  }).reduce((path, key) => {
    path[key] = sideEffects[key]
    return path
  }, defaultPath)

const paperPocketHelp = () => {
  return Object.keys(paperPocketPath).map(key => {
  const { label, description, options, value: _value } = $paperPocket.learn().settings[key]
  const value = $paperPocket.learn()[key]
  return `${key}

  ${label}: ${value}
  ${description}
  ${options.join(' ')}
`}).join('\n')
}

let fileSystem = null

const $ = Self('ur-shell', {
  messages: [],
  history: [],
  historyCursor: null,
  messageText: '',
  messageDraft: '',
  messageHeight: null,
  cwd: null,
})

export function sh(message) {
  $.teach({ messageText: message })
  hideModal()
}

export function update(message) {
  hideModal()
}

$.teach({ body: `Wake up, Eon...`, author: 'assistant' }, mergeMessage)

const endpoint = '/plan98/about'
fetch(window.location.origin + endpoint)
  .then(res => res.json())
  .then(({plan98}) => {
    fileSystem = plan98
    $.teach({ cwd: '/' })
  })
  .catch(e => console.error(e))

function history(state, payload) {
  return {
    ...state,
    history: [
      ...state.history,
      payload
    ]
  }
}


function mergeMessage(state, payload) {
  return {
    ...state,
    messages: [
      ...state.messages,
      payload
    ]
  }
}

const killCommands = ['exit', 'quit', 'escape']

function kill(program) {
  return killCommands.includes(program.toLowerCase())
}

const killCommandHandlers = {}

for(const command of killCommands) {
  killCommandHandlers[command] = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
  }
}

function disableSecureMode() {
  $.teach({ secureEntry: false })
}

function enableSecureMode() {
  $.teach({ secureEntry: true })
}

function normalMode() {
  $.teach({ modality: null, secureEntry: false })
}

function partial(response) {
  $.teach({ thinkingFace: response })
}

function done(response) {
  $.teach({ thinkingFace: null, thinking: false })
  $.teach({ body: response, author: 'assistant' }, mergeMessage)
}

const modalities = {
  async agent(program) {
    if((program === 'exit' || program === 'quit')) {
      $.teach({ modality: null })
      return 'Have a good one or two!'
    }
    $.teach({ thinking: true })
    const message = await agent(program, {
      partial,
      done
    })
    $.teach({ thinking: false })
    return message
  },

  async auth(program) {
    const { secureEntry } = $.learn()
    if(!secureEntry && (program === 'exit' || program === 'quit')) {
      $.teach({ modality: null, secureEntry: false })
      return 'Authentication aborted.'
    }
    return await auth(program, {
      enableSecureMode,
      disableSecureMode,
      normalMode
    })
  },
  luau(program) {
    if(kill(program)) {
      $.teach({ modality: null })
      return 'Exiting Luau modality.'
    }
    if(imports.haveLuau) {
      const logs = imports.haveLuau(program)

      return logs.join('\n')
    }
  },
  async js(program) {
    if(program === 'exit' || program === 'quit') {
      $.teach({ modality: null })
    return 'Exiting JS modality.'
    }
    if(imports.runJs) {
      return JSON.stringify(await imports.runJs(program), '', 2)
    }
  }

}

const commands = {
  ...paperPocketPath,
  'apply': () => {
    return 'Apply by emailing tellers@plan98.org with the subject "New Computer Teller: YOUR NAME - NEAREST LIBRARY URL" and a message that tells the tellers a little about yourself.'
  },
  'echo': (...args) => {
    return args.join(' ')
  },
  'map': () => {
    loadModule('<brokemon-go')
    return "Did you catch at least one or two?"
  },
  'cutestrap': () => {
    loadModule('<my-computer')
    return "Don't spend it all in one place!"
  },
  'color': () => {
    loadModule('<plan98-palette')
    return 'Success!'
  },
  'whoami': () => {
    const res = whoami()
    return res ? res : 'Not currently a secure deity, run `me` to authenticate'
  },
  'logout': () => {
    return logout()
  },
  'tamashika': () => {
    window.location.href = "steam://rungameid/2996080"
    return 'Ascending now...'
  },
  'stardew': () => {
    window.location.href = "steam://rungameid/413150"
    return 'Have fun, babe.'
  },
  'ide': () => {
    loadPath('/app/plan98-ide')
    return 'Success!'
  },
  'wallet': () => {
    loadPath('/app/plan98-wallet')
    return 'Success!'
  },
  'focus': () => {
    window.location.href = '/app/time-machine'
    return 'Success!'
  },
  'memex': () => {
    window.location.href = '/app/time-machine'
    return 'Success!'
  },
  'draw': () => {
    window.location.href = '/app/sketch-pad'
    return 'Success!'
  },
  'sillyz': () => {
    loadPath('/app/sillyz-computer')
    return 'Success!'
  },
  'sonic': () => {
    loadPath('/app/sonic-knuckles')
    return 'Success!'
  },
  'tv': () => {
    loadPath('/app/tiniest-violin')
    return 'Success!'
  },
  'journal': () => {
    loadPath('/app/time-machine')
    return 'Success!'
  },
  'desktop': () => {
    loadPath('/app/door-man')
    return 'Success!'
  },
  'mobile': () => {
    loadPath('/app/mobile-device')
    return 'Success!'
  },
  'music': () => {
    loadPath('/app/paper-pocket')
    return 'Success!'
  },
  'gaming': () => {
    loadPath('/app/couch-coop')
    return 'Success!'
  },
  'kiosk': () => {
    loadPath('/app/remote-control')
    return 'Success!'
  },
  'bluesky': () => {
    loadPath('/app/blue-sky')
    return 'Success!'
  },
  'mpn': (...args) => {
    return mpn.apply({loadModule}, args)
  },

  'error': (...args) => {
    throw new Error(args.map(x => JSON.stringify(x)).join(' '))
  },

  async me(...args) {
    const me = whoami()
    if(me) {
      return me
    } else {
      $.teach({ modality: 'auth' })
      return await auth()
    }
  },

  async agent(...args) {
    $.teach({ modality: 'agent' })
    return await agent()
  },

  async you(...args) {
    $.teach({ modality: 'agent' })
    return await agent()
  },

  luau(...args) {
    import('./luau-repl.js').then((module) => {
      imports.haveLuau = module.haveLuau
      const $luau = module.default

      function load() {
        if($luau.learn().ready) {
          $.teach({ modality: 'luau' })
        } else {
          requestAnimationFrame(load)
        }
      }

      requestAnimationFrame(load)
    }).catch(e => {
      console.error(e)
    })

    return 'Entering Luau modality'
  },
  js(...args) {
    import('./js-repl.js').then((module) => {
      imports.runJs = module.runJs
      $.teach({ modality: 'js' })
    }).catch(e => {
      console.error(e)
    })

    return `(function calculate(expression) {
  return 10
})('2*3+4')`
  },



  clear() {
    $.teach({ messages: [] })
    return null
  },

  cd(path) {
    const { cwd } = $.learn()

    if(!path) {
      $.teach({ cwd: '/' })
      return
    }

    if(path === '.') {
      return
    }

    if(path.startsWith('/')) {
      const folderNames = path === '/' ? [''] : path.split('/')

      const { error } = folderNames.reduce((tree, name) => {
        if(tree.error) return tree
        const subtree = tree.children.find(x => x.name === name)
        if(subtree) {
          return subtree
        } else {
          return { error: 'Unable to locate ' + path}
        }
      }, fileSystem)

      if(error) {
        return error
      }


      $.teach({ cwd: path })
      return
    }

    if(path.startsWith('./')) {
      const relativePath = path.slice(1)
      const folderNames = `${cwd}${relativePath}`.split('/')

      const { error } = folderNames.reduce((tree, name) => {
        if(tree.error) return tree
        const subtree = tree.children.find(x => x.name === name)
        if(subtree) {
          return subtree
        } else {
          return { error: 'Unable to locate ' + path}
        }
      }, fileSystem)

      if(error) {
        return error
      }

      $.teach({ cwd: cwd + relativePath })
      return
    }

    if(path.startsWith('../') || path.startsWith('..')) {
      const relativity = path.split('/').reduce((obj, x) => {
        if(x === '..') {
          obj.up.push(x)
        } else if(x !== '') {
          obj.down.push(x)
        }
        return obj
      }, { up: [], down: [] })
      const folderNames = cwd.split('/').slice(0, -relativity.up.length)

      const { error } = [...folderNames, ...relativity.down].reduce((tree, name) => {
        if(tree.error) return tree
        const subtree = tree.children.find(x => x.name === name)
        if(subtree) {
          return subtree
        } else {
          return { error: 'Unable to locate ' + path}
        }
      }, fileSystem)

      if(error) {
        return error
      }

      $.teach({ cwd: folderNames.join('/') })
      return
    }

    const newPath = `${cwd==='/'?cwd: `${cwd}/`}${path}`
    const folderNames = newPath.split('/')
    const { error } = folderNames.reduce((tree, name) => {
      if(tree.error) return tree
      const subtree = tree.children.find(x => x.name === name)
      if(subtree) {
        return subtree
      } else {
        return { error: 'Unable to locate ' + path}
      }
    }, fileSystem)

    if(error) {
      return error
    }

    $.teach({ cwd: newPath })
  },

  su(unix_id) {
    if(friends[unix_id]) {
      return loadPath(friends[unix_id].bios)
    } else {
      return 'User not found'
    }
  },

  ls() {
    const { cwd } = $.learn()
    const folderNames = cwd === '/' ? [''] : cwd.split('/')

    const { error, children } = folderNames.reduce((tree, name) => {
      const subtree = tree.children.find(x => x.name === name)
      if(subtree) {
        return subtree
      } else {
        return { error: 'Unable to print list current collection' }
      }
    }, fileSystem)
    return error ? error : children.map(x => `${x.name}`).join('\n')
  },

  pwd() {
    return $.learn().cwd
  },

  'printenv': (...args) => {
    const keys = args.length > 0
      ? args
      : Object.keys(plan98.env)
    return keys.map(key => {
      return `${key}: ${plan98.env[key]}`
    }).join('\n')
  },
  ...killCommandHandlers,
  'about': (...args) => {
    return `Earth Prime's Number One Lore Bible Platform Engine, lovingly mocking gnu/linux by building on it as sillyz/plan98, an irreverant take on social computing, by @tychi.`
  },
  'help': (...args) => {
    const help = paperPocketHelp()
    return `Welcome to ur-shell, the Universal Resource Shell!

PLAN98

help
  display help options

about
  an immersive reality game

${killCommands.join(' ')}
  quit playing around and go outside

color
  launch the color and sound palette

wallet
  launch the wallet to access keycards

draw
  launch the drawing app

journal
  launch the journal app

desktop
  launch the desktop app

mobile
  launch the mobile app

music
  launch the music app

gaming
  launch the gaming app

kiosk
  launch the kiosk app

bluesky
  launch the bluesky app

tv
  the tiniest violin



pwd
  print working directory

ls
  list stuff

cd path
  change directory

clear
  empty the screen

echo
  re-state the arguments

luau
  start repl powered by the luau language

error
  throw an error-- like echo, but for debugging the system


printenv [...args]
  display environment variables, none for all or one by one

shebang
  launch the whole #!shebang

ide
  change the whole #!shebang


Modes:

/* - load URL
     example: /app/remote-control

&lt;* - load ELF
     example: &lt;couch-coop

PAPER POCKET

${help}

For further assistance, enter &lt;cool-chat
`
  },

  shebang() {
    execute('/app/ur-shell?src=/app/door-man?src=/app/mobile-device?src=/app/file-surf?src=/app/paper-pocket?rom=couch-coop')
  }
}



function mount(target) {
  if(target.mounted) return
  target.mounted = true
  const command = target.getAttribute('command')
  const message = target.getAttribute('message')
  const src = target.getAttribute('src')
  const rom = target.getAttribute('rom')
  if(command) {
    execute(command)
  } else if(src) {
    execute(src)
  } else if(rom) {
    execute('<'+rom)
  } else if(message) {
    sh(message)
  }
}

$.draw((target) => {
  mount(target)
  const { secureEntry, messages, messageText, messageHeight, thinking, thinkingFace } = $.learn()

  const log = messages.map((message) => `
    <div class="message -${message.author}">${marked(message.body||'').trim()}</div>
  `).join('')

  return `
      <div class="scroll-back">
        <div class="messages">
          ${log}
          <div class="message -assistant">
            ${marked(thinkingFace || '').trim()}
          </div>
        </div>
      </div>
      <form>
        ${thinking ? `
          <div class="loading">
            <flying-disk></flying-disk>
          </div>
        ` : ''}

        ${secureEntry ? `
          <input
            type="password"
            data-bind
            name="messageText"
            placeholder="help"
            value="${escapeHyperText(messageText)}">
        ` : `
          <textarea
            data-bind
            name="messageText"
            placeholder="help"
            ${messageHeight ? `style="height: ${messageHeight}px"`:''}
            value="${escapeHyperText(messageText)}"
          ></textarea>
        `}
      </div>
    </div>
  `
}, {
  beforeUpdate,
  afterUpdate
})

function beforeUpdate(target) {
  { // convert a query string to new post
    const q = target.getAttribute('q')
    if(!target.initialized) {
      target.initialized = true

      if(q) {
        const message = decodeURIComponent(q)
        $.teach({ messageText: message })
      }
    }
  }

  //saveCursor(target)
}

function afterUpdate(target) {
  //replaceCursor(target)

  {
    const { messages } = $.learn()
    if(target.lastIndex !== messages.length -1) {
      target.lastIndex = messages.length - 1
      const lastChild = target.querySelector('.messages .message:last-child')
      if(lastChild) {
        const children = [...document.querySelector('.messages').children]
        document.querySelector('.scroll-back').scrollTop = children[children.length -1].offsetTop
      }
    }
  }

  {
    afterUpdateTheme($paperPocket, target)
  }
  {
    const theme = getTheme()
    if(target.theme !== theme) {
      target.theme = theme
      document.body.style.setProperty('--root-theme', theme)
    }
  }

  {
    const elem = document.querySelector('[name="messageText"]')
    if(elem) {
      elem.focus()
    }
  }
}

let sel = []
const tags = ['TEXTAREA', 'INPUT']
function saveCursor(target) {
  if(target.contains(document.activeElement)) {
    target.dataset.field = document.activeElement.name
    if(tags.includes(document.activeElement.tagName)) {
      const textarea = document.activeElement
      sel = [textarea.selectionStart, textarea.selectionEnd];
    }
  }
}

function replaceCursor(target) {
  const field = target.querySelector(`[name="${target.dataset.field}"]`)
  
  if(field) {
    field.focus()

    if(tags.includes(field.tagName)) {
      field.selectionStart = sel[0];
      field.selectionEnd = sel[1];
    }
  }
}

function clearCursor(target) {
  target.dataset.field = null
  sel = []
}


$.when('keypress', 'form [name="messageText"]', (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const message = event.target.value
    execute(message)
  }
})

$.when('submit', 'form', (event) => {
  event.preventDefault()
  const message = event.target.messageText.value
  execute(message)
})

const imports = {}

async function execute(message) {
  if(!message) return

  const { secureEntry } = $.learn()

  if(!secureEntry) {
    $.teach(message, history)
    $.teach({ body: message, author: 'human' }, mergeMessage)
  }

  $.teach({ historyCursor: null, messageHeight: null, messageText: '', messageDraft: '' })

  if(message.startsWith('<')) {
    $.teach({ body: 'load module', author: 'assistant' }, mergeMessage)
    loadModule(message)
    return
  }

  if(message.startsWith('/')) {
    $.teach({ body: 'load path', author: 'assistant' }, mergeMessage)
    loadPath(message)
    return
  }

  const { modality } = $.learn()

  if(modalities[modality]) {
    const result = await modalities[modality](message)
    if(result) {
      $.teach({ body: result, author: 'assistant' }, mergeMessage)
    }
    return
  }

  const [command, ...args] = message.split(' ')
  const program = commands[command] || commands[command.toLowerCase()]
  if(program) {
    try {
      const result = await program.apply($, args)
      if(result) {
        $.teach({ body: result || 'Success!', author: 'assistant' }, mergeMessage)
      }
    } catch(e) {
      $.teach({ body: `Error. Inspect Logs.<br><a href="${window.location.origin + window.location.pathname}?q=${message}&debug=true">Reload in debug mode</a>`, author: 'assistant' }, mergeMessage)
      console.error(e)
    }
    return
  } else {
    const body = 'Command not recognized. Ask for `help` if needed.'
    $.teach({ body, author: 'assistant' }, mergeMessage)
  }
}

export function loadPath(message) {
  // add some hype to our scene
  showModal(`
    <div style="display: grid; height: 100%; grid-template-rows: auto 1fr;">
      <div style="background: black;">
        <button data-modal-close class="branded-button">Back</button>
      </div>
      <iframe src="${message}"></iframe>
    </div>
  `, {
    blockExit: true,
    onHide: () => $.teach({ popped: false })
  })

  $.teach({ popped: true })
}

const elements = "a,abbr,address,area,article,aside,audio,b,base,bdi,bdo,blockquote,body,br,button,canvas,caption,cite,code,col,colgroup,data,datalist,dd,del,details,dfn,dialog,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,i,iframe,img,input,ins,kbd,label,legend,li,link,main,map,mark,menu,meta,meter,nav,noscript,object,ol,optgroup,option,output,p,param,picture,pre,progress,q,rp,rt,ruby,s,samp,script,section,select,slot,small,source,span,strong,style,sub,summary,sup,table,tbody,td,template,textarea,tfoot,th,thead,time,title,tr,track,u,ul,var,video,wbr"


export async function loadModule(message) {
  const [firstLine, ...lines] = message.split('\n')

  const elf = firstLine.slice(1)
  const url = `/public/elves/${elf}.js`
  const exists = (await fetch(url, { method: 'HEAD' })).ok
  if(!exists && !elements.includes(elf)) {
    $.teach({ body: 'ELF not found, ask "help" for assistance', author: 'assistant' }, mergeMessage)
    return
  }

  const properties = {}

  try {
    // loop over our lines one at a time
    for (const line of lines) {
      // where in the line is our break
      const index = line.indexOf(':')
      // before then is the attribute
      const key = line.substring(0, index)
      // after then is the data
      const value = line.substring(index+1)

      // no data?
      if(!key) {
        return
      }

      properties[key.trim()] = value.trim()
    }
    // collect the properties from our actor
    let innerHTML = ''
    let innerText = ''

    // convert them into hype attributes
    const attributes = Object.keys(properties)
      .map(x => {
        if(x === 'html') {
          innerHTML = properties[x]
          return ''
        }
        if(x === 'text') {
          innerText = properties[x]
          return ''
        }

        return `${x}="${properties[x]}" `
      }).join('')

    // add some hype to our scene
    showModal(`
      <div style="display: grid; height: 100%; grid-template-rows: auto 1fr;">
        <div style="background: black;">
          <button data-modal-close class="branded-button">Back</button>
        </div>
        <${elf} ${attributes}>${innerHTML || innerText}</${elf}>
      </div>
    `, {
      transparent: true,
      blockExit: true,
      onHide: () => $.teach({ popped: false })
    })

    $.teach({ popped: true })

  } catch(e) {
    $.teach({ body: 'ELF load failed, ask "help" for assistance', author: 'assistant' }, mergeMessage)
  }
}

$.style(`
  & {
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(335deg, rgba(0,0,0,.8), rgba(0,0,0,.9)), var(--root-theme, mediumseagreen);
  }

  /* scanlines */
  &::after {
    content: " ";
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(18, 16, 16, 0.05);
    opacity: 0;
    z-index: 2;
    pointer-events: none;
  }
  &::before {
    content: " ";
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(rgba(255, 255, 255, .05) 50%, rgba(0, 0, 0, 0) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
    z-index: 2;
    background-size: 100% 2px, 3px 100%;
    pointer-events: none;
  }

  & form input,
  & form textarea {
    width: 100%;
    display: block;
    border: none;
    border-radius: 0;
    padding: 8px;
    font-size: 1rem;
    background: linear-gradient(155deg, rgba(0,0,0,.7), rgba(0,0,0,.8)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.75);
  }

  & form textarea {
    resize: none;
    max-height: 35vh;
  }

  & textarea:focus {
    outline-offset: -2px;
    outline-color: transparent;
  }

  & .scroll-back {
    height: 100%;
    overflow: auto;
  }

  & .messages {
    padding: .5rem;
    display: flex;
    flex-direction: column;
    justify-content: end;
  }
  & .message {
    overflow: auto;
    position: relative;
    margin: 0;
    opacity: .85;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-wrap: break-word;
    max-width: 100%;
  }

  & .message.-human {
    color: rgba(255,255,255,.95);
  }

  & .message a:link,
  & .message a:visited {
    background: linear-gradient(180deg, rgba(0,0,0,.8), var(--root-theme, mediumseagreen), rgba(255,255,255,.8)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-decoration: none;
    border-bottom: 1px solid var(--root-theme, mediumseagreen);
  }
  & .message a:hover,
  & .message a:focus {
    background: linear-gradient(180deg, rgba(255,255,255,.3), rgba(255,255,255,.7)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  & .message.-assistant {
    background: linear-gradient(135deg, rgba(255,255,255,.25), rgba(255,255,255,.65)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  & .title {
    color: var(--root-theme, #E83FB8);
    --v-font-wght: 800;
    --v-font-slnt: -15;
    --v-font-crsv: 1;
    --v-font-casl: 1;
    --v-font-mono: 1;
    font-size: 2rem;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive" !important;
  }

  & .message p {
    margin: 0;
  }
`)

function escapeHyperText(text = '') {
  return text.replace(/[&<>'"]/g, 
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}

$.when('input', '[data-bind]', event => {
  const { name, value } = event.target;
  $.teach({ [name]: value })
})

$.when('focus', '[name="messageText"]', (event) => {
  $.teach({ messageHeight: event.target.scrollHeight })
});

$.when('keydown', '[name="messageText"]', (event) => {
  $.teach({ messageHeight: event.target.scrollHeight })
});


$.when('input', '[name="messageText"]', (event) => {
  const { value } = event.target;
  $.teach({ messageDraft: value, messageHeight: event.target.scrollHeight })
});

$.when('keydown', '[name="messageText"]', event => {
  const { history, historyCursor, messageText, messageDraft } = $.learn()
  if(event.key === 'Tab') {
    event.preventDefault()
    const command = Object.keys(commands).find(x => x.startsWith(messageText))
    if(command) {
      $.teach({ messageText: command })
    }

    return
  }

  if(event.key === 'ArrowDown') {
    if(!isLastLine(event.target)) return
    if(historyCursor === null) return
    event.preventDefault()
    const cursor = historyCursor + 1
    if(cursor >= history.length) {
      $.teach({ historyCursor: null, messageText: messageDraft })
    } else {
      $.teach({ historyCursor: cursor, messageText: history[cursor] })
    }
    return
  }

  if(event.key === 'ArrowUp') {
    if(!isFirstLine(event.target)) return
    event.preventDefault()
    const cursor = (historyCursor === null) ? history.length - 1 : historyCursor - 1
    if(cursor < 0) return
    $.teach({ historyCursor: cursor, messageText: history[cursor] })
    return
  }
})

function isFirstLine(textarea) {
  const cursorPosition = textarea.selectionStart;
  const fullText = textarea.value;
  const textBeforeCursor = fullText.substring(0, cursorPosition);
  return !textBeforeCursor.includes('\n');
}

function isLastLine(textarea) {
  const cursorPosition = textarea.selectionStart;
  const fullText = textarea.value;
  const textAfterCursor = fullText.substring(cursorPosition);
  return !textAfterCursor.includes('\n');
}

function interrupt() {
  normalMode()
  $.teach({ secureEntry: false, messageHeight: null, messageText: '', messageDraft: '' })
  $.teach({ body: 'Girl, interrupted.', author: 'assistant' }, mergeMessage)
}

const hotkeys = {}

$.when('keydown', '[name="messageText"]', (event) => {
  hotkeys[event.key] = true

  if(hotkeys['Control'] && (event.key === 'c' || event.key === 'C')) {
    interrupt()
  }
})

$.when('keyup', '[name="messageText"]', (event) => {
  hotkeys[event.key] = false
})
