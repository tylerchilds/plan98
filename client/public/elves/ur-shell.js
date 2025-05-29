import elf from '@plan98/elf'
import { showModal, hideModal } from '@plan98/modal'
import $paperPocket, { sideEffects, systemMenu, getTheme, afterUpdateTheme } from './paper-pocket.js'

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
  return `Congratulations on your purchase of your new Paper Pocket!

You have options. To configure your settings, try the following:
\n` + Object.keys(paperPocketPath).map(key => {
  const { label, description, options, value: _value } = $paperPocket.learn().settings[key]
  const value = $paperPocket.learn()[key]
  return `${key}

  ${label}: ${value}
  ${description}
  ${options.join(' ')}
`}).join('\n')
}

const models = {
  'deepseek-r1:1.5b': 'Deepseek-r1 1.5b',
  'gemma3:1b': 'Gemma3 1b',
  'mistral:7b': 'Mistral 7b',
  'llama3.2:3b': 'Llama 3.2 3b',
}

let fileSystem = null

const $ = elf('ur-shell', {
  messages: [],
  history: [],
  historyCursor: null,
  messageText: '',
  messageDraft: '',
  messageHeight: null,
  cwd: null,
})


window.addEventListener('keydown', (event) => {
  const { popped, debug } = $.learn()
  if (event.key === 'Escape') {
    event.preventDefault()
    if(debug || popped) return
    $.teach({ debug:true })
    showModal(`
      <div style="width: 100%; height: 100%; overflow: hidden;">
        <source-code></source-code>
      </div>
    `, { centered: true, onHide: normalMode, suppressEscape: true })
  }

  function normalMode() {
    $.teach({ debug: false })
  }
});


$.teach({ body: `Silly, at your service.

    Do your thing or click "help" and type "help" and then press the "return" key on your typewriter.

Signed,
  Wally.`, author: 'assistant' }, mergeMessage)

const endpoint = '/plan98/about'
fetch(window.location.origin + endpoint)
  .then(res => res.json())
  .then(({plan98}) => {
    fileSystem = plan98
    $.teach({ cwd: '/' })
  })
  .catch(e => console.error(e))

function askLLM(message) {
  const { model } = $.learn()

  if(!model) {
    $.teach({ body: 'ask "help" for assistance', author: 'assistant' }, mergeMessage)
    return
  }
  const url = "http://localhost:11434/api/generate";
  const headers = {
    "Content-Type": "application/json",
  }

  $.teach({ thinking: true, messageHeight: null, messageText: '' })

  fetch(url, {
    headers: headers,
    method: 'POST',
    body: JSON.stringify({
      model,
      prompt: message,
      stream: false
    })
  }).then((response) => response.text()).then((result) => {
    const data = JSON.parse(result)
    $.teach({ thinking: false })
    $.teach({ body: data.response, author: 'assistant' }, mergeMessage)
  }).catch(e => {
    console.error(e)
  })
}

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

$.when('change', 'select', (event) => {
  const model = event.target.value
  $.teach({ model, messages: [] })
})

function renderModels(model) {
  const keys = Object.keys(models)
  return keys.map((key) => `
    <option value="${key}" ${model === key?'selected':''}>${models[key]}</option>
  `).join('')
}

function mount(target) {
  if(target.mounted) return
  target.mounted = true
  const src = target.getAttribute('src')
  const rom = target.getAttribute('rom')
  if(src) {
    execute(src)
  } else if(rom) {
    execute('<'+rom)
  }
}

$.draw((target) => {
  mount(target)
  const { model, messages, messageText, messageHeight, thinking } = $.learn()

  const log = messages.map((message) => `
    <div class="message -${message.author}">${escapeHyperText(message.body)}</div>
  `).join('')

  return `
      <div class="scroll-back">
        <div class="messages">
          ${log}
        </div>
      </div>
      <form>
        ${thinking ? `
          <div class="loading">
            <flying-disk></flying-disk>
          </div>
        ` : ''}
        <textarea
          data-bind
          name="messageText"
          placeholder="help"
          value="${escapeHyperText(messageText)}"
          ${messageHeight ? `style="height: ${messageHeight}px"`:''}
        ></textarea>
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

  saveCursor(target)
}

function afterUpdate(target) {
  replaceCursor(target)

  {
    const { messages } = $.learn()
    if(target.lastIndex !== messages.length -1) {
      target.lastIndex = messages.length - 1
      const lastChild = target.querySelector('.messages .message:last-child')
      if(lastChild) {
        lastChild.scrollIntoView()
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

const modalities = {
  luau(program) {
    if(program === 'exit') {
      $.teach({ modality: null })
    return 'Exiting Luau modality.'
    }
    if(imports.haveLuau) {
      const logs = imports.haveLuau(program)

      return logs.join('\n')
    }
  },
  async js(program) {
    if(program === 'exit') {
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
  'echo': (...args) => {
    return args.join(' ')
  },
  'color': () => {
    loadModule('<plan98-palette')
    return 'Success!'
  },
  'error': (...args) => {
    throw new Error(args.map(x => JSON.stringify(x)).join(' '))
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

    return 'Entering JS modality'
  },



  clear() {
    $.teach({ messages: [] })
    return ' '
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
  'help': (...args) => {
    const help = paperPocketHelp()
    return `Welcome to ur-shell, the Universal Resource Shell!

${help}

plan98 commands

help
  display help options

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


Modes:

/* - load URL
     example: /app/remote-control

<* - load ELF
     example: <couch-coop

For further assistance, enter <cool-chat
`
  },

  shebang() {
    execute('/app/ur-shell?src=/app/door-man?src=/app/mobile-device?src=/app/file-surf?src=/app/paper-pocket?rom=couch-coop')
  }
}

async function execute(message) {
  if(!message) return

  $.teach(message, history)
  $.teach({ body: message, author: 'human' }, mergeMessage)
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
    $.teach({ body: result, author: 'assistant' }, mergeMessage)
    return
  }

  const [command, ...args] = message.split(' ')
  if(commands[command]) {
    try {
      const result = commands[command].apply($, args)
      $.teach({ body: result || 'Success!', author: 'assistant' }, mergeMessage)
    } catch(e) {
      $.teach({ body: `Error. Inspect Logs.<br><a href="${window.location.origin + window.location.pathname}?q=${message}&debug=true">Reload in debug mode</a>`, author: 'assistant' }, mergeMessage)
      console.error(e)
    }
    return
  }

  askLLM(message)
}

function loadPath(message) {
  // add some hype to our scene
  showModal(`<iframe src="${message}"></iframe>`, {
    blockExit: true,
    onHide: () => $.teach({ popped: false })
  })

  $.teach({ popped: true })
}

const elements = "a,abbr,address,area,article,aside,audio,b,base,bdi,bdo,blockquote,body,br,button,canvas,caption,cite,code,col,colgroup,data,datalist,dd,del,details,dfn,dialog,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,i,iframe,img,input,ins,kbd,label,legend,li,link,main,map,mark,menu,meta,meter,nav,noscript,object,ol,optgroup,option,output,p,param,picture,pre,progress,q,rp,rt,ruby,s,samp,script,section,select,slot,small,source,span,strong,style,sub,summary,sup,table,tbody,td,template,textarea,tfoot,th,thead,time,title,tr,track,u,ul,var,video,wbr"


async function loadModule(message) {
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
    showModal(`<${elf} ${attributes}>${innerHTML || innerText}</${elf}>`, {
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

  & form textarea {
    width: 100%;
    display: block;
    resize: none;
    border: none;
    border-radius: 0;
    padding: 8px;
    max-height: 35vh;
    font-size: 1rem;
    background: linear-gradient(155deg, rgba(0,0,0,.7), rgba(0,0,0,.8)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.75);
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
