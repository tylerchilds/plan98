(function iife() {

/*
  rune table:
    ! comment
    # location
    ^ effect
    @ actor
    > quote
    & parenthetical
    < embed actor element
*/

// ---------------------------------------------------------------------------
// SagaParser — stateful line-by-line parser (internal)
// ---------------------------------------------------------------------------

function SagaParser() {
  this.location  = undefined
  this.character = undefined
  this.pending   = undefined
}

SagaParser.prototype.pushLine = function(raw) {
  var line = raw.trim()

  if (this.pending) {
    if (!line) return [this._flushPending()]
    var attrMatch = line.match(/^([\w-]+):\s*(.*)/)
    if (attrMatch) {
      var key = attrMatch[1]
      var val = attrMatch[2].trim()
      this.pending.attrs.push({ key: key, value: val === '' ? null : val })
      return []
    }
    var flushed = this._flushPending()
    return [flushed].concat(this.pushLine(raw))
  }

  if (!line) return []

  var sigil = line[0]
  var text  = line.slice(1).trim()

  if (sigil === '#') { this.location  = text; return [] }
  if (sigil === '@') { this.character = text; return [] }
  if (sigil === '&' || sigil === '!') return []

  if (sigil === '>') {
    var activity = {
      type:   'Create',
      actor:  { name: this.character !== undefined ? this.character : 'Unknown' },
      object: { type: 'Note', content: text }
    }
    if (this.location !== undefined) activity.location = this.location
    return [activity]
  }

  if (sigil === '^') {
    return [{ type: 'Effect', content: text }]
  }

  if (sigil === '<') {
    this.pending = { tagName: text, attrs: [] }
    return []
  }

  return [{ type: 'Narrate', actor: { type: 'Narrator' }, content: line }]
}

SagaParser.prototype.flush = function() {
  return this.pending ? [this._flushPending()] : []
}

SagaParser.prototype._flushPending = function() {
  var tagName = this.pending.tagName
  var attrs   = this.pending.attrs
  this.pending = undefined
  var attrStr = ''
  for (var i = 0; i < attrs.length; i++) {
    var k = attrs[i].key
    var v = attrs[i].value
    attrStr += v === null ? (' ' + k) : (' ' + k + '="' + v + '"')
  }
  var content = attrs.length === 0
    ? '<' + tagName + '>'
    : '<' + tagName + attrStr + '></' + tagName + '>'
  return { type: 'Narrate', actor: { type: 'Narrator' }, content: content }
}

// ---------------------------------------------------------------------------
// activities() — parses saga text into an array of AS2 JSON activity objects
// ---------------------------------------------------------------------------

function activities(script) {
  if (!script) return []
  var parser = new SagaParser()
  var result = []
  var lines  = ('' + script).split('\n')
  var emitted, i, j
  for (i = 0; i < lines.length; i++) {
    emitted = parser.pushLine(lines[i])
    for (j = 0; j < emitted.length; j++) result.push(emitted[j])
  }
  emitted = parser.flush()
  for (j = 0; j < emitted.length; j++) result.push(emitted[j])
  return result
}

// ---------------------------------------------------------------------------
// as2() — renders saga text to hypertext HTML string
// ---------------------------------------------------------------------------

function as2(script) {
  if(!script) return ''
  script = '' + script
  var state = {}
  var actors = state.actors = {}
  var time = 'NORMAL_TIME'
  var property = ''
  var actor = ''
  var scene = ''

  var RuneTable = {
    '!': append.bind({}, 'hypertext-comment'),
    '#': append.bind({}, 'hypertext-address'),
    '^': append.bind({}, 'hypertext-effect'),
    '@': append.bind({}, 'hypertext-puppet'),
    '>': append.bind({}, 'hypertext-quote'),
    '&': append.bind({}, 'hypertext-parenthetical'),
    '<': function puppet(x) {
      actors[x] = {}
      actor = x
      time = 'ACTOR_TIME'
    }
  }

  var times = {
    'NORMAL_TIME': normalTime,
    'PROP_TIME': propertyTime,
    'ACTOR_TIME': actorTime,
  }

  var lines = script.split('\n')
  for (var i = 0; i < lines.length; i++) {
    var beat = lines[i].trim()
    ;(times[time] || noop)(beat)
  }

  if(time !== 'NORMAL_TIME') times[time]('')

  return template(state, scene)

  function normalTime(line) {
    if(!line.trim()) { append("hypertext-blankline", ""); return }
    var rune = line[0]
    if(Object.keys(RuneTable).indexOf(rune) > -1) {
      var beat = line.split(rune)
      var text = beat[1]
      return RuneTable[rune](text.trim())
    }
    append('hypertext-action', line)
  }

  function propertyTime(line, separator) {
    separator = separator || ':'
    var index = line.indexOf(separator)
    var key = line.substring(0, index)
    var value = line.substring(index+1)
    if(!value) { time = 'NORMAL_TIME'; return }
    state[property][key.trim()] = value.trim()
  }

  function actorTime(line, separator) {
    separator = separator || ':'
    var index = line.indexOf(separator)
    var key = line.substring(0, index)
    var value = line.substring(index+1)
    if(!key) {
      var properties = actors[actor]
      var innerHTML = ''
      var innerText = ''
      var attributes = Object.keys(properties).map(function(x) {
        if(x === 'html') { innerHTML = properties[x]; return '' }
        if(x === 'text') { innerText = properties[x]; return '' }
        return [x, '="', properties[x], '" '].join('')
      }).join('')
      scene += "<"+actor+" "+attributes+">"+(innerHTML || innerText)+"</"+actor+">"
      time = 'NORMAL_TIME'
      if(value) normalTime(line)
      return
    }
    actors[actor][key.trim()] = value.trim()
  }

  function append(actor, body) {
    scene += "<"+actor+">"+body+"</"+actor+">"
  }

  function noop() {}
}

// ---------------------------------------------------------------------------
// templates
// ---------------------------------------------------------------------------

var templates = {
  'thelanding.page': spa,
  'wrapper': wrapper,
  'screenplay': screenplay,
}

function template(state, content){
  if(!state.template) return content
  var T = templates[state.template.engine]
  if(!T) return content
  return T(content)
}

function spa(content) {
  return "<header><mast-head></mast-head></header><nav><quick-links></quick-links></nav><main>"+content+"</main><footer><mega-footer></mega-footer></footer>"
}
function wrapper(content) {
  return '<div class="wrapper">'+content+'</div>'
}
function screenplay(content) {
  return '<div class="darkroom"><div class="screenplay">'+content+'</div></div>'
}

// ---------------------------------------------------------------------------
// exports
// ---------------------------------------------------------------------------

as2.activities = activities

globalThis.as2 = as2

// ---------------------------------------------------------------------------
// polyglot stdin runner — only when invoked directly as a script
// ---------------------------------------------------------------------------

var isQuickJS = typeof scriptArgs !== 'undefined'
var isDeno    = typeof Deno !== 'undefined'
var isBun     = typeof Bun !== 'undefined'
var isNode    = typeof process !== 'undefined' && !isDeno && !isBun

function runCLI(input) {
  console.log(as2(input))
  console.log(JSON.stringify(activities(input), null, 2))
}

if (isQuickJS) {
  var __saga = globalThis.__saga
  if (__saga) runCLI(__saga)
}

if (isDeno) {
  if (typeof import_meta_main !== 'undefined' && import_meta_main) {
    var buf = new Uint8Array(1024 * 1024)
    var n = Deno.stdin.readSync(buf)
    runCLI(new TextDecoder().decode(buf.subarray(0, n)))
  }
}

if ((isNode || isBun) && typeof module !== 'undefined' && require.main === module) {
  var chunks = []
  process.stdin.on('data', function(d) { chunks.push(d) })
  process.stdin.on('end', function() { runCLI(chunks.join('')) })
}

})()
