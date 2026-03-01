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
// activities() — parses saga text into an array of AS2 JSON activity objects
// ---------------------------------------------------------------------------
function activities(script) {
  if(!script) return []
  script = '' + script

  var result = []
  var location = ''
  var currentActor = ''
  var time = 'NORMAL_TIME'
  var embedName = ''
  var embedAttrs = {}

  function flushEmbed() {
    var attrs = ''
    var keys = Object.keys(embedAttrs)
    for (var k = 0; k < keys.length; k++) {
      attrs += ' ' + keys[k] + '="' + embedAttrs[keys[k]] + '"'
    }
    var content = '<' + embedName + attrs + '></' + embedName + '>'
    result.push({
      type: 'Narrate',
      actor: { type: 'Narrator' },
      content: content,
      location: location || undefined
    })
    embedName = ''
    embedAttrs = {}
    time = 'NORMAL_TIME'
  }

  var lines = script.split('\n')

  for (var i = 0; i < lines.length; i++) {
    var beat = lines[i].trim()

    if (time === 'EMBED_TIME') {
      if (!beat) {
        // blank line closes the embed
        flushEmbed()
        continue
      }
      var sep = beat.indexOf(':')
      if (sep > -1) {
        var key = beat.substring(0, sep).trim()
        var val = beat.substring(sep + 1).trim()
        if (key) {
          embedAttrs[key] = val
          continue
        }
      }
      // non-property line closes the embed and reprocesses this line
      flushEmbed()
      // fall through to normal processing below
    }

    if (!beat) continue

    var rune = beat[0]
    var text = beat.slice(1).trim()

    switch(rune) {
      case '#':
        location = text
        break

      case '@':
        currentActor = text.split('&')[0].trim()
        break

      case '>':
        if (currentActor) {
          result.push({
            type: 'Create',
            actor: { name: currentActor },
            object: { type: 'Note', content: text },
            location: location || undefined
          })
        } else {
          result.push({
            type: 'Narrate',
            actor: { type: 'Narrator' },
            content: text,
            location: location || undefined
          })
        }
        break

      case '<':
        embedName = text
        embedAttrs = {}
        time = 'EMBED_TIME'
        break

      case '!':
        result.push({
          type: 'Narrate',
          actor: { type: 'Narrator' },
          content: text,
          location: location || undefined
        })
        break

      case '^':
        result.push({
          type: 'Effect',
          content: text,
          location: location || undefined
        })
        break

      case '&':
        break

      default:
        currentActor = ''
        result.push({
          type: 'Narrate',
          actor: { type: 'Narrator' },
          content: beat,
          location: location || undefined
        })
        break
    }
  }

  // flush any unclosed embed at end of input
  if (time === 'EMBED_TIME') flushEmbed()

  return result
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
globalThis.as2 = as2
globalThis.as2.activities = activities

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
