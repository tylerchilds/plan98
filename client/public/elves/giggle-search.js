import tag from '@silly/tag'
import lunr from 'lunr'

var documents = [{
  "name": "Lunr",
  "text": "Like Solr, but much smaller, and not as bright."
}, {
  "name": "React",
  "text": "A JavaScript library for building user interfaces."
}, {
  "name": "Lodash",
  "text": "A modern JavaScript utility library delivering modularity, performance & extras."
}]


const $ = tag('giggle-search')

$.draw((target) => {
  const { thinking, error, results } = $.learn()

  if(thinking) {
    return `
      <img src="/cdn/sillyz.computer/giggle.svg" alt="" />
      <sticky-note>
        <hypertext-highlighter color="dodgerblue">
          The ELF Negotiator is Negotiating on your behalf...
        </hypertext-highlighter>
      </sticky-note>
    `
  }

  if(results) {
    const list = results.map(x => {
      const item = documents.find(y => {
        return x.ref === y.name
      })

      return `
        <a href="#">
          ${item.name}
        </a>
        <p>
          ${item.text}
        </p>
      `
    }).join('')

    return `
      <img src="/cdn/sillyz.computer/giggle.svg" alt="" />
      <div class="wrapper">
      <form method="post">
        <label class="field">
          <input
            name="query"
            placeholder="bears, beats, battlestar galactica..."
          />
        </label>
        <input type="hidden" value="1" name="embed" />
        <rainbow-action>
        <input type="submit" value="Search" />
        </rainbow-action>
      </form>
      </div>
      <div class="list">
        ${list}
      </div>
    `
  }

  const maybeError = !error?'':`
    <hypertext-highlighter color="red">
      ${error}
    </hypertext-highlighter>
  `

  return `
    <img src="/cdn/sillyz.computer/giggle.svg" alt="" />
    <div class="wrapper">
      <div>
        <div>
          ${maybeError}
        </div>
        <form method="post">
          <label class="field">
            <input
              name="query"
              placeholder="bears, beats, battlestar galactica..."
            />
          </label>
          <input type="hidden" value="1" name="embed" />
          <rainbow-action>
          <input type="submit" value="Search" />
          </rainbow-action>
        </form>
      </div>
    </div>
  `
})

$.style(`
  & {
    display: grid;
    width: 100%;
    place-items: center;
    background: rgba(255,255,255,.85);
  }
  & .wrapper{
    display: block;
    max-width: 6in;
    width: 100%;
    margin: 0 auto;
    color: rgba(0,0,0,.85);
    text-align: center;
  }
  
  & rainbow-action {
    text-align: center;
  }

  & .list {
    padding: 1rem;
  }
`)


$.when('submit', 'form', async (event) => {
  event.preventDefault()
  $.teach({ results: {}, thinking: true })

  var idx = lunr(function () {
    this.ref('name')
    this.field('text')

    documents.forEach(function (doc) {
      this.add(doc)
    }, this)
  })

  const results = idx.search(event.target.query.value)

  $.teach({ thinking: false,  results })
})
