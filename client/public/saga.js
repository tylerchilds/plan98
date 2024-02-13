/*

















    ^
   <@>
   {&!
    #

  Elve




    ^      ^      ^      ^      ^      ^      ^
   <@>    <@>    <@>    <@>    <@>    <@>    <@>
   {&!    {&!    {&!    {&!    {&!    {&!    {&!
    #      #      #      #      #      #      #

  Silly  Sally  Sully  Shelly  Sol   Wally   Ty



















  mit license. <email@tychi.me> 1989-current

*/

self.state ||= {}

// normal time converts lines 1:1 from hype to hypertext
const NORMAL_TIME = Symbol('n-time')
// property are able to be stored
const PROP_TIME = Symbol('p-time')
// actor embeds rich hyper media content
const ACTOR_TIME = Symbol('a-time')

export function render(script) {
  // what do we embed
  // as actors are worn their attributes may become modified
  const actors = state.actors = {}
  // state changes cause time dilations
  let time = NORMAL_TIME
  // what model
  let property = ''
  // what perspective
  let actor = ''
  // what display
  let scene = ''

  // advanced-technology something magic whatever runes are a metaphor
  const RuneTable = {
    // comments, like this one you're reading now, are not for the audience
    '!': append.bind({}, 'hypertext-comment'),
    // addresses are space time locations where events and discussions happen
    '#': append.bind({}, 'hypertext-address'),
    // effects are the post production manipulations for aesthetic
    '^': append.bind({}, 'hypertext-effect'),
    // puppets are the performers of parenthetical prose
    '@': append.bind({}, 'hypertext-puppet'),
    // quotes are verbatim messages from puppets or the mind of sillonious
    '>': append.bind({}, 'hypertext-quote'),
    // parentheticals are subtext of expression
    '&': append.bind({}, 'hypertext-parenthetical'),
    // properties are able to change truths about the very facet of reality
    '{': (x) => {
      // clear whichever property from the stash
      state[x] = {}
      // use whatever property
      property = x
      // what time is it? property time!
      time = PROP_TIME
    },
    // actors are able to display projections beyond black and white text
    '<': (x) => {
      // clear whichever actor from the stash
      actors[x] = {}
      // use whatever actor
      actor = x
      // what time is it? actor time!
      time = ACTOR_TIME
    }
  }

  // mapping our concept of time to the atomic execution units underneath
  const times = {
    // line by line until finished
    [NORMAL_TIME]: normalTime,
    // accesses property and stores key value pairs after sequence break
    [PROP_TIME]: propertyTime,
    // accesses actor and embeds key value pairs after sequence break
    [ACTOR_TIME]: actorTime,
  }

  // collect the lines of our script
  if(!script) return
  const lines = script.split('\n')

  // loop over our lines one at a time
  for (const line of lines) {
    // and evaluating now and the times, process our line in the now time
    (times[time] || noop)(line)
  }

  // return our compiled hyper media scene
  return scene

  // just process our runes, yes magic, just straight forward level 1 magic
  function normalTime(line) {
    // anything here?
    if(!line.trim()) {
      // drop some invisible hype
      append("hypertext-blankline", "")
      // normal time is over
      return
    }

    // the rune will always be the first glyph
    const rune = line[0]

    // however, the first glyph won't always be a rune.
    if(Object.keys(RuneTable).includes(rune)) {
      // decouple the incantation from the rune
      const [_, text] = line.split(rune)
      // apply the rune from the table with the spell
      return RuneTable[rune](text.trim())
    }

    // drop some actionable hype
    append('hypertext-action', line)
    // normal time is over
    return
  }

  // process the sequence to understand our property's, well, properties.
  function propertyTime(line, separator=':') {
    // where in the line is our break
    const index = line.indexOf(separator)
    // before then is the attribute
    const key = line.substring(0, index)
    // after then is the data
    const value = line.substring(index+1)

    // no data?
    if(!value) {
      // back to normal time
      time = NORMAL_TIME
      return
    }

    // update our property of property of properties
    state[property][key.trim()] = value.trim()
  }

  // process the sequence to understand our actor's properties.
  function actorTime(line, separator=':') {
    // where in the line is our break
    const index = line.indexOf(separator)
    // before then is the attribute
    const key = line.substring(0, index)
    // after then is the data
    const value = line.substring(index+1)

    // no data?
    if(!value) {
      // collect the properties from our actor
      const properties = actors[actor]
      let innerHTML = ''

      // convert them into hype attributes
      const attributes = Object.keys(properties)
        .map(x => {
          if(x === 'innerHTML') {
            innerHTML = x
            return ''
          }
          return `${x}="${properties[x]}"`
        }).join('')

      // add some hype to our scene
      scene += `<${actor} ${attributes}>${innerHTML}</${actor}>`

      // back to normal time
      time = NORMAL_TIME
      return
    }

    // set the 
    actors[actor][key.trim()] = value.trim()
  }

  function append(actor, body) {
    const hype = `
      <${actor}>
        ${body}
      </${actor}>
    `
    scene += hype
  }

  function noop() {}
}
