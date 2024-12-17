import elf from '@silly/elf'
import lunr from 'lunr'

const Types = {
  File: {
    icon: '/cdn/plan98/plan9.png',
    type: 'File',
    actions: [
      ['data-move', 'Move'],
      ['data-remove', 'Remove']
    ]
  },
  Directory: {
    icon: '/cdn/plan98/firefox.png',
    type: 'Directory',
    actions: [
      ['data-', 'Create Bag'],
      ['data-trinket', 'Create trinket'],
      ['data-move', 'Move'],
      ['data-remove', 'Remove']
    ]
  },
  Help: {
    type: 'Help',
    actions: [
      ['data-debugger', 'Debugger'],
      ['data-live', 'Live'],
      ['data-reset', 'Factory Reset'],
    ]
  }
}

export let idx
export const documents = [];

(async function buildIndex() {
  try {
    const { plan98 } = await fetch(`/plan98/about`)
      .then(res => res.json())

    idx = lunr(function () {
      this.ref('path')
      this.field('path')
      this.field('keywords')
      this.field('type')
      this.field('name')
      this.field('extension')

      nest(this, { tree: plan98, pathParts: [], subtree: plan98 })
    })
    $.teach({ ready: true })
  } catch (e) {
    console.info('Build: Failed')
    console.error(e)
    return
  }
})()

function nest(idx, { tree = {}, pathParts = [], subtree = {} }) {
  if(!subtree.children) return ''
  return subtree.children.map((child, index) => {
    const { name, type, extension } = child
    const currentPathParts = [...pathParts, name]
    const currentPath = currentPathParts.join('/') || '/'

    if(type === Types.File.type) {
      const node = {
        path: currentPath,
        keywords: currentPath.split('/').join(' '),
        name,
        type,
        extension
      }
      idx.add(node)
      documents.push(node)
    }

    if(type === Types.Directory.type) {
      nest(idx, { tree, pathParts: currentPathParts, subtree: child })
    }

    return '-'
  }).join('')
}

const $ = elf('giggle-search', {query: ''})

$.draw((target) => {
  const { query, thinking, error, results, ready } = $.learn()

  if(!ready) {
    return 'Loading...'
  }

  if(target.getAttribute('query') && !target.searched) {
    target.searched = true
    setTimeout(() => search(target.getAttribute('query')), 1)
  }

  if(thinking) {
    return `
      Thinking...
    `
  }

  if(results) {
    const list = results.map(x => {
      const item = documents.find(y => {
        return x.ref === y.path
      })

      return `
        <div class="result">
          <a href="/app/code-module?src=${item.path}">
            ${item.name}
          </a>
          <div class="disambiguous">${item.path}</div>
        </div>
      `
    }).join('')

    return `
      <div class="wrapper">
      <form method="post">
        <label class="field">
          <input
            value="${query}"
            name="query"
            placeholder="bears, beats, battlestar galactica..."
          />
        </label>
        <input type="hidden" value="1" name="embed" />
        <input type="submit" value="Search" />
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
    <div class="wrapper">
      <div>
        <div>
          ${maybeError}
        </div>
        <form method="post">
          <label class="field">
            <input
              value="${query}"
              name="query"
              placeholder="bears, beats, battlestar galactica..."
            />
          </label>
          <input type="hidden" value="1" name="embed" />
          <input type="submit" value="Search" />
        </form>
      </div>
    </div>
  `
})

$.when('submit', 'form', async (event) => {
  event.preventDefault()

  if(idx) {
    const query = event.target.query.value
    search(query)
  }
})

function search(query) {
  $.teach({ results: {}, thinking: true, query })
  window.history.replaceState('', '', updateURLParameter(window.location.href, 'query', query))
  const results = idx.search(query)
  $.teach({ thinking: false,  results })
}

$.style(`
  & {
    
  }

  & .result {
    margin-bottom: 1rem;
  }

  & .disambiguous {
    color: rgba(0,0,0,.65);
  }
`)

// https://stackoverflow.com/questions/1090948/change-url-parameters-and-specify-defaults-using-javascript
function updateURLParameter(url, param, paramVal)
{
    var TheAnchor = null;
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";

    if (additionalURL) 
    {
        var tmpAnchor = additionalURL.split("#");
        var TheParams = tmpAnchor[0];
            TheAnchor = tmpAnchor[1];
        if(TheAnchor)
            additionalURL = TheParams;

        tempArray = additionalURL.split("&");

        for (var i=0; i<tempArray.length; i++)
        {
            if(tempArray[i].split('=')[0] != param)
            {
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }        
    }
    else
    {
        var tmpAnchor = baseURL.split("#");
        var TheParams = tmpAnchor[0];
            TheAnchor  = tmpAnchor[1];

        if(TheParams)
            baseURL = TheParams;
    }

    if(TheAnchor)
        paramVal += "#" + TheAnchor;

    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
}
