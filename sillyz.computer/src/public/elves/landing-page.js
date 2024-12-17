import elves from '@silly/tag'
import { idx, documents } from './giggle-search.js'

const $ = elves('landing-page', {
  query: "",
  top10: [
    {
      title: 'Hello World',
      img: '/cdn/thelanding.page/giggle.svg',
      permalink: '/app/hello-world',
      lead: 'The world has not been greeted enough... or has it?'
    },
    {
      title: 'Breaking News at 10',
      img: '/cdn/thelanding.page/giggle.svg',
      permalink: '/app/hello-world',
      lead: 'You will not believe that today happened... again.'
    },
    {
      title: 'Sad Story Tonight',
      img: '/cdn/thelanding.page/giggle.svg',
      permalink: '/app/hello-world',
      lead: 'There will be a feel good twist at the end.'
    },
    {
      title: 'Feel Good Sunshine',
      img: '/cdn/thelanding.page/giggle.svg',
      permalink: '/app/hello-world',
      lead: 'Not everything is warm and fuzzy, but it can be.'
    },
    {
      title: 'Happy Days of Future Past?',
      img: '/cdn/thelanding.page/giggle.svg',
      permalink: '/app/hello-world',
      lead: 'The Fonz and Wolverine? A multi-versal team up from another dimension.'
    },
    {
      title: 'John Travolta: Now',
      img: '/cdn/thelanding.page/giggle.svg',
      permalink: '/app/hello-world',
      lead: 'From Grease lightning to Pulp Fiction this iconic star still reigns.'
    },
    {
      title: 'Bogarts and You',
      img: '/cdn/thelanding.page/giggle.svg',
      permalink: '/app/hello-world',
      lead: 'The only thing to fear is fear itself, which is preyed upon by them.'
    },
    {
      title: 'Rookie of the Year',
      img: '/cdn/thelanding.page/giggle.svg',
      permalink: '/app/hello-world',
      lead: 'In the field of dreams, if you build it, they will come.'
    },
    {
      title: 'Gronkowski and his Legacy',
      img: '/cdn/thelanding.page/giggle.svg',
      permalink: '/app/hello-world',
      lead: 'Tom Brady might have been the face, but Gronk is why everyone has rings.'
    },
    {
      title: 'Super Positions and Quantum Computers',
      img: '/cdn/thelanding.page/giggle.svg',
      permalink: '/app/hello-world',
      lead: 'If you turn your computer off, do you need to unplug it still?'
    },
  ],
  categories: [
    {
      label: "Play",
      posts: [
        {
          title: 'Mine Sweeper',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/mine-sweeper',
        },
        {
          title: 'Chess',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/mind-chess',
        },
        {
          title: 'Sonic',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/sonic-knuckles',
        },
      ]
    },
    {
      label: "Code",
      posts: [
        {
          title: 'Hyper Script',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/hyper-script',
        },
        {
          title: 'Client',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/mind-chess',
        },
        {
          title: 'Full Stack',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/plan98-filesystem',
        },
        {
          title: 'Integrated Development',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/integrated-development',
        },
      ]
    },
    {
      label: "Office",
      posts: [
        {
          title: 'Notes',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/sagas/sillyz.computer/en-us/notes.saga',
        },
        {
          title: 'Boards',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/sagas/sillyz.computer/en-us/boards.saga',
        },
        {
          title: 'Browser',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/sagas/sillyz.computer/en-us/browser.saga',
        },
        {
          title: 'Maps',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/sagas/sillyz.computer/en-us/maps.saga',
        },
      ]
    },
    {
      label: "Toys",
      posts: [
        {
          title: 'Paint',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/sagas/sillyz.computer/en-us/paint.saga',
        },
        {
          title: 'Free Cell',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/sagas/sillyz.computer/en-us/free-cell.saga',
        },
        {
          title: 'Synthia',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/sagas/sillyz.computer/en-us/fdos.saga',
        },
        {
          title: 'Sonic A.I.R.',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/sagas/sillyz.computer/en-us/sonic.saga',
        },
        {
          title: 'Mind Chess',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/sagas/sillyz.computer/en-us/mind-chess.saga',
        },
        {
          title: 'Pocket Dexter',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/sagas/sillyz.computer/en-us/pokedex.saga',
        },
      ]
    }

  ],
  ring: [
    {
      label: 'Mike',
      posts: [
        {
          title: 'About Braid',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/hyper-script'
        },
        {
          title: 'Braidmail Release Notes',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/mind-chess'
        },
        {
          title: 'Simpleton and Collaborative Text',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/plan98-filesystem'
        }
      ]
    },
    {
      label: 'Wendy',
      posts: [
        {
          title: 'About Dweb',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/hyper-script'
        },
        {
          title: 'Dweb Meetups',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/mind-chess'
        },
        {
          title: 'Building Bridges Acrsoss Cultures',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/plan98-filesystem'
        }
      ]
    },
    {
      label: 'Ty',
      posts: [
        {
          title: 'Why Sillyz Computer?',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/hyper-script'
        },
        {
          title: 'Oranges or Door Hinges?',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/mind-chess'
        },
        {
          title: 'Milk and Cookies for Santa',
          img: '/cdn/thelanding.page/giggle.svg',
          permalink: '/app/plan98-filesystem'
        }
      ]
    }

  ]
})

$.draw(() => {
  const { top10, categories, ring, query } = $.learn()
  return `
      <div class="top-bar">
        <button data-publish>
          Create
        </button>
      </div>
    <div class="content">
      ${splash(top10)}
    </div>
    <div class="sidebar">
      ${withThumbnails(categories)}
    </div>
    <div class="third-rail">
      ${minimal(ring)}
    </div>
  `
})

$.when('submit', 'form', (event) => {
  event.preventDefault()
  window.location.href = '/app/giggle-search?query=' + $.learn().query
})

$.when('click', '[data-path]', event => {
  event.preventDefault()
  const { path } = event.target.dataset
  window.location.href = '/app/code-module?src=' +path
})

$.when('input', '[name="search"]', (event) => {
  const { value } = event.target;
  const suggestions = idx.search(value)
  $.teach({ suggestions,  query: event.target.value  })
})

$.when('focus', '[name="search"]', event => {
  $.teach({ focused: true })
})

$.when('blur', '[name="search"]', event => {
  setTimeout(() => {
    $.teach({ focused: false, suggestIndex: 0 })
  }, 200)
})

const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', '[name="search"]', event => {
  if(event.keyCode === down) {
    event.preventDefault()
    $.teach({ suggestIndex: $.learn().suggestIndex + 1 })
    return
  }

  if(event.keyCode === up) {
    event.preventDefault()
    $.teach({ suggestIndex: $.learn().suggestIndex - 1 })
    return
  }

  if(event.keyCode === enter) {
    event.preventDefault()
    const { suggestions, suggestIndex } = $.learn()
    const item = documents.find(y => {
      return suggestions[suggestIndex].ref === y.path
    })

    if(item) {
      window.location.href = '/app/code-module?src=' +item.path
      return
    }
  }
})

$.when('keyup', '[name="search"]', event => {
})

$.when('click', '[data-publish]', (event) => {
  showModal(`
    <div style="width: 100%; height: 100%; background: rgba(255,255,255,1); padding: 1rem;"
      <div style="max-width: 55rem; margin: auto;">
        <landing-publish></landing-publish>
      </div>
    </div>
  `)
})

function splash(top10) {
  const breaking = top10[0]

  const featured = top10.slice(1,3).map(teaser).join('')
  const important = top10.slice(3,6).map(teaser).join('')
  const rest = top10.slice(6,10).map(teaser).join('')

  return `
    <div class="breaking">
      <a class="breaking-image" href="${breaking.permalink}">
        <img src="${breaking.img}" />
      </a>
      <a class="title" href="${breaking.permalink}">
        ${breaking.title}
      </a>
      <p class="lead">
        ${breaking.lead}
      </p>
    </div>
    <h5>Featured</h5>
    <div class="featured">
      ${featured}
    </div>
    <h5>Important</h5>
    <div class="important">
      ${important}
    </div>
    <div class="rest">
      <h5>Still Popular Enough</h5>
      ${rest}
    </div>
  `
}

function teaser(post) {
  return `
    <div class="teaser">
      <a class="teaser-image" href="${post.permalink}">
        <img src="${post.img}" />
      </a>
      <a class="title" href="${post.permalink}">
        ${post.title}
      </a>
      ${post.lead?`<div class="lead">${post.lead}</div>`: ''}
    </div>
  `
}

function withThumbnails(feeds) {
  return feeds.map(feed => {
    const content = feed.posts.map(teaser).join('')

    return `
      <div class="feed">
        <div class="label">${feed.label}</div>
        ${content}
      </div>
    `
  }).join('')
}

function minimal(feeds) {
  return feeds.map(feed => {
    const content = feed.posts.map((post) => {
      return `
        <div class="teaser">
          <a href="${post.permalink}" class="title">
            ${post.title}
          </a>
        </div>
      `
    }).join('')
    return `
      <div class="feed">
        <div class="label">${feed.label}</div>
        ${content}
      </div>
    `
  }).join('')
}

$.style(`
  & {
    position: relative;
    display: grid;
    grid-template-columns: 2fr 4fr 1fr;
    gap: 1rem;
    grid-template-areas: "sidebar content third";
    grid-template-rows: auto;
    padding: 0 1rem;
  }

  & .sidebar {
    grid-area: sidebar;
  }

  & .third-rail {
    grid-area: third;
  }

  & .featured {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr 1fr;
  }

  & .important {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr 1fr 1fr;
  }

  & .content {
    grid-area: content;
  }

  @media (max-width: 1024px) {
    & {
      grid-template-areas:
        "content content"
        "sidebar third";
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
    }
  }

  @media (max-width: 767px) {
    & {
      grid-template-columns: 1fr;
      grid-template-areas:
        "content"
        "sidebar"
        "third";
      grid-template-rows: auto auto auto;
    }

    & .important {
      display: block;
    }

    & .featured {
      display: block;
    }
  }

  @media (max-height: 319px) {
    & {
      grid-template-rows: auto auto auto;
    }
  }

  & .teaser {
    clear: both;
    display: block;
  }

  & .rest .teaser {
    display: grid;
    grid-template-columns: 1fr 1.618fr;
    grid-template-areas:
      "image title"
      "image lead";
    grid-template-rows: auto 1fr;
    margin-bottom: 1rem;
  }

  @media (max-width: 479px) {
    & .rest .teaser {
      display: block;
    }
  }

  & .rest .teaser .teaser-image {
    grid-area: image;
  }

  & .rest .teaser .title {
    grid-area: title;
  }

  & .rest .teaser .lead {
    grid-area: lead;
  }

  & sidebar {
    
  }

  & .teaser img {
    padding-right: 1rem;
    aspect-ratio: 16/9;
  }
  & .sidebar .teaser img {
    float: left;
    max-width: 80px;
  }

  & .third-rail .teaser {
    margin-bottom: .5rem;
  }

  & .feed {
    clear: both;
    margin-bottom: 1rem;
  }

  & .feed .label {
    font-weight: 800;
  }

  & .sidebar .teaser {
    min-height: 50px;
  }

  & .top-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    padding: .5rem;
  }

  & [data-publish] {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    color: rgba(255,255,255,.85);
    padding: .5rem 1rem;
    border-radius: 1rem;
    border: none;
    float: right;
  }

  & [data-publish]:hover,
  & [data-publish]:focus {
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
  }

  & .breaking {
    positon: relative;
  }

  & .breaking-image {
    display: block;
  }

  & .teaser-image {
    display: block;
  }

  & .search {
    text-align: center;
  }

  & .search img {
    display: block;
  }
  & .search input {
    display: block;
    margin: auto;
    text-align: left;
    border: 1px solid rgba(0,0,0,.65);
    font-size: 1.2rem;
    padding: .5rem 1rem;
    margin: 1rem auto 0;
    width: 100%;
    max-width: 480px;
    border-radius: 1.5rem 0 0 1.5rem;

  }

  & .search button {
    display: inline-block;
  }

  & .search button {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    border: none;
    border-radius: 1rem;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
  }

  & .search button:focus,
  & .search button:hover {
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
  }

  & .suggestions {
    display: none;
    position: relative;
    max-height: 300px;
    max-width: 480px;
    margin: auto;
    text-align: left;
  }

  & .suggestions.focused {
    display: block;
  }

  & .suggestion-box {
    position: absolute;
    inset: 0;
    height: 300px;
    max-height: 80vh;
    overflow: auto;
    z-index: 10;
    
  }

  & .suggestion-box button {
    background-color: white;
    border: 1px solid dodgerblue;
    margin: 1px 0;
    border-radius: 2rem;
    color: white;
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    text-align: left;
  }

  & .suggestion-box button:focus,
  & .suggestion-box button:hover {
    background-color: dodgerblue;
    color: white;
    filter: grayscale(0);
  }

  & .suggestion-box button.active {
    color: white;
    filter: grayscale(0);
    background-color: dodgerblue;
  }


  & [data-suggestion] {
    display: block;
  }

  & .input-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    max-width: 480px;
    margin: auto;
    text-align: left;
  }

  & .input-grid button {
    font-size: 1.2rem;
    border-radius: 0 1.5rem 1.5rem 0;
    padding: .5rem 1rem;
    margin: 1rem auto 0;
    width: 100%;
    max-width: 480px;
  }

  & [data-suggestion] {
    position: relative;
  }
  & .path {
    text-align: right;
    position: absolute;
    right: .5rem;
    color: rgba(255,255,255,.5);
    white-space: nowrap;
  }

  & .name {
    text-align: right;
    position: relative;
    z-index: 2;
  }
`)
