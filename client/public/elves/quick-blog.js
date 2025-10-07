import elf from '@silly/elf'

function logo() {
  return `
    <div class="logo-area">
      TheLanding.Page
    </div>
  `
}

const PAGES = {
  HOME: 'home',
  NEWS: 'news',
  CREATE: 'create',
  ABOUT: 'about',
}

const pages = {
  [PAGES.HOME]: {
    label: 'Home',
    path: '/',
    icon: '<sl-icon name="house"></sl-icon>',
  },
  [PAGES.NEWS]: {
    label: 'News',
    path: '/news',
    icon: '<sl-icon name="newspaper"></sl-icon>',
  },
  [PAGES.ABOUT]: {
    label: 'About',
    path: '/about',
    icon: '<sl-icon name="info-circle"></sl-icon>',
  },
  [PAGES.CREATE]: {
    label: 'Create',
    path: '/create',
    icon: '<sl-icon name="globe2"></sl-icon>',
  },
}

function createPathMap() {
  return Object
    .keys(pages)
    .reduce((paths, key) => {
      const page = pages[key]
      paths[page.path] = {
        page: key,
        label: page.label
      }

      return paths
    }, {})
}

const paths = createPathMap()

function router(route) {
  return paths[route] ? paths[route] : {
    page: Object.keys(pages)[0]
  }
}


const hello = { world: 'bye' }

console . log ( hello . world )


const $ = elf('quick-blog', {
  ...router(self.location.pathname),
  messageText: '',
  messageDraft: '',
  messageHeight: null,
  posts: [
    {
      title: 'Hello World',
      author: 'Silly Sillonious',
      permalink: '/url/1',
      timestamp: new Date().toJSON(),
      body: `
        Ok
      `
    },
    {
      title: 'Hello Dragon',
      author: 'Sally Svalbard',
      permalink: '/url/2',
      timestamp: new Date().toJSON(),
      body: `
        I baked the dragon a cake. Bakeries were a good investment on paper.
      `
    },
    {
      title: 'Cyber Circus',
      author: 'Shelly Shenanigans',
      permalink: '/url/3',
      timestamp: new Date().toJSON(),
      body: `
        Forget the dragon! We don't need gold, we don't need power, circus up!
      `
    },
    {
      title: 'Greatest Gamer 3v3r',
      author: 'Sully Sullivan',
      permalink: '/url/4',
      timestamp: new Date().toJSON(),
      body: `
        I beat the dragon, but no one wants to play anything with me anymore. So I system linked myself across the multiverse and spoiler alert: i'm still the best.
      `
    },
    {
      title: '',
      author: 'Sunny',
      permalink: '/url/5',
      timestamp: new Date().toJSON(),
      body: `
      `
    },
  ]
})

function nav(keys) {
  const { page } = $.learn()
  return keys
    .map((key) => {
      const { path, label } = pages[key]

      return `
        <a class="${key === page ? 'active': ''}" href="${path}" data-page="${key}" data-path="${path}">
          ${label}
        </a>
      `
    })
    .join('')
}

addEventListener("popstate", (event) => {
  $.teach(router(self.location.pathname))
});

const renderers = {
  [PAGES.HOME]: {
    render: () => {
      return `
        <div class="interlude">
          <div class="interlude-title">
            ShirtFlicks.App
          </div>
          <div class="interlude-subtitle">
            A personal entertainment console that's fashionable and comfortable.
          </div>
          <div>
            <button data-get-started class="standard-button -large bias-generic">
              What?
            </button>
          </div>
        </div>

        <div class="feature-list">
          <div class="featured-item">
            <span>
              <sl-icon name="check2-square"></sl-icon>
            </span>
            <span>
              Play games on your TV, Phone, PC, or DIY Device
            </span>
          </div>
          <div class="featured-item">
            <span>
              <sl-icon name="check2-square"></sl-icon>
            </span>
            <span>
              All your personal media on all your devices
            </span>
          </div>
          <div class="featured-item">
            <span>
              <sl-icon name="check2-square"></sl-icon>
            </span>
            <span>
              An excercise in the Fourth Amendment
            </span>
          </div>
          <div class="featured-item">
            <span>
              <sl-icon name="check2-square"></sl-icon>
            </span>
            <span>
              A platform for player to player economies and experiences
            </span>
          </div>
        </div>
        <div class="hero-section -right">
          <div class="hero-graphic">
            <graph-paper></graph-paper>
            <span class="hero-icon">
              <sl-icon name="globe"></sl-icon>
            </span>
          </div>
          <div class="hero-content">
            <div class="hero-headline">ComedyMap.Org</div>
            Find <span class="hero-tag" data-tooltip="Comedy is better when some authoritarian arbiter does not control the clowns.">local-first</span>, <span class="hero-tag" data-tooltip="It does not matter if it was five seconds or fifty years ago. Past comedy is propaganda-- I don't make the rules!">live comedy</span>, <span class="hero-tag" data-tooltip="hi ho.">and so on</span>, all around <span class="hero-tag" data-tooltip="Especially in countries, localities, and jurisdictions that dismember journalists.">the globe</span>. Keep an eye out for ShirtFlicks <span class="hero-tag" data-tooltip="Join tomorrow, we're not ready yet!">member exclusive</span> <span class="hero-tag" data-tooltip="Intimate club settings where you can be face to face with your favorite artists.">private tapings</span> in a major city <span class="hero-tag" data-tooltip="Be a liason for your community! Reach out to ty@shirtflicks.app for more information.">near you</span>!
            <div class="hero-action-container">
              <button class="hero-cta" data-href="https://comedymap.org">
                Laugh Now
                <span class="hero-cta-icon">
                  <sl-icon name="arrow-up-right-circle"></sl-icon>
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="hero-section -left">
          <div class="hero-graphic">
            <graph-paper></graph-paper>
            <span class="hero-icon">
              <sl-icon name="shield-lock"></sl-icon>
            </span>
          </div>
          <div class="hero-content">
            <div class="hero-headline">Plan98.org</div>
            <span class="hero-tag" data-tooltip="Our kids have not been able to write software for their personal devices since before smart phones.">Modern challenges</span> require <span class="hero-tag" data-tooltip="So now they can without you even needing to buy them any newfangled hardware.">modern solutions</span>. Plan98 <span class="hero-tag" data-tooltip="As the vision, operating system, and universal interface for creating any type of media production.">powers</span> everything from <span class="hero-tag" data-tooltip="Cross-platform. 'nuff said.">real-time multiplayer</span> to <span class="hero-tag" data-tooltip="Passwords are gone. Emails are gone. Phones are gone. You are who you claim to be.">sovereign identity</span> and <span class="hero-tag" data-tooltip="End-to-End Encrypted Zero-Knowledge Agentic Workflows&trade;">secure compute</span>.
            <div class="hero-action-container">
              <button class="hero-cta" data-href="https://plan98.org">
                Love Now
                <span class="hero-cta-icon">
                  <sl-icon name="arrow-up-right-circle"></sl-icon>
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="hero-section -right">
          <div class="hero-graphic">
            <graph-paper></graph-paper>
            <span class="hero-icon">
              <sl-icon name="bullseye"></sl-icon>
            </span>
          </div>
          <div class="hero-content">
            <div class="hero-headline">Sillyz.Computer</div>
            A <span class="hero-tag" data-tooltip="It is criminal for a technology provider to train K-12 students on systems that won't exist in the future.">creative suite</span> for <span class="hero-tag" data-tooltip="Don't we all miss being sub double digits?">kids at heart</span>. <span class="hero-tag" data-tooltip="Alright stop, collaborate and listen. Ice is back with a brand new invention.">Collaborate</span> across <span class="hero-tag" data-tooltip="Current me loved hanging out with past me and future me, but now you try.">generations</span> on <span class="hero-tag" data-tooltip="Dream it. Do it.">art</span>, <span class="hero-tag" data-tooltip="Tune your guitar and ukelele or build a guitar and ukelele.">music</span>, and <span class="hero-tag" data-tooltip="We eliminated the cybersecurity threat by eliminating the compiler. Anyone who says otherwise is a nation-state actor that would take your mother out to dinner and never call her again.">coding</span>.
            <div class="hero-action-container">
              <button class="hero-cta" data-href="https://sillyz.computer">
                Learn Now
                <span class="hero-cta-icon">
                  <sl-icon name="arrow-up-right-circle"></sl-icon>
                </span>
              </button>
            </div>
          </div>
        </div>
        <div class="featured">
          <div class="featured-title">
            <span style="font-weight: 100; font-size: 1rem;">Featured Work:</span><br>HiveLabworks.Com
          </div>

          <div class="featured-subtitle">
            <a target="_blank" href="https://flatfeecorp.com">Flatfee</a> is a Silicon Valley based startup providing AI-empowered compliance solutions for small to mid-sized companies expanding globally. They support global companies in procuring legal, accounting, tax, human resources and other administrative support when they are selling or hiring overseas.
          </div>

          <div class="featured-video">
            <hls-video controls="true" src="https://cdn.hivelabworks.com/public/cdn/flatfee.com/agents-on-agents-1080p/manifest.m3u8"></hls-video>
          </div>

          <div class="featured-description">
            Hive Labworks has partnered with Flatfee on pioneering a new product by combining their in-house AI system with the Hive Platform embedded in a browser extension. This applied use-case of our core technology facilitates an agentic experience anywhere on the web to streamline the tasks their vendors complete on behalf of their customers. Watch the above video to see a unified experience that bridges multitudinous systems, seamlessly.
          </div>
        </div>
        <div class="feature-list">
          <div class="featured-item">
            <span>
              <sl-icon name="check2-square"></sl-icon>
            </span>
            <span>
              Reduce eye-strain by reading screenplays instead of watching them
            </span>
          </div>

          <div class="featured-item">
            <span>
              <sl-icon name="check2-square"></sl-icon>
            </span>
            <span>
              Imagine writing a novel or becoming a photographer
            </span>
          </div>
          <div class="featured-item">
            <span>
              <sl-icon name="check2-square"></sl-icon>
            </span>
            <span>
              Consider that your true calling could be clown
            </span>
          </div>
          <div class="featured-item">
            <span>
              <sl-icon name="check2-square"></sl-icon>
            </span>
            <span>
              Laughter is the only system capable of reducing universal entropy
            </span>
          </div>
        </div>

        <div class="interlude">
          <div class="interlude-title">
            ShirtFlicks.App
          </div>
          <div class="interlude-subtitle">
            "All my Flicks in my Shirt."
          </div>
          <div>
            <button data-get-started class="standard-button bias-generic -large">
              What?
            </button>
          </div>
        </div>
      `
    }
  },
  news: {
    render: () => {
      return news()
    }
  },
  create: {
    render: () => {
      return create()
    }
  },
  about: {
    render: () => {

      return `
        <div class="hero">
          <img class="hero-image" src="/public/cdn/sillyz.computer/definitive-edition.jpeg" alt="That is right.">
          <div class="hero-caption">
            An accidental art installation photographed by <a href="https://tychi.me">Ty</a>. Located at the Internet Archive 300 Funston, San Francisco at 12:16pm on September 12th, 2025. Original creation: March 21st, 2025, also by <a href="https://tychi.me">Ty</a>.
          </div>
        </div>
        <div class="wizard">
          <div style="font-weight: 800; font-size: 2rem; margin-bottom: 1rem;">
            Additional Context
          </div>
          <a href="https://tylerchilds.com">Tyler Childs</a> a Founder, Owner, Operator, and Liason.<br><br>

          By day, he is a net-runner and secures the globe with his code.<br><br>

          By night, he is an edge-runner that produces comedy around the greater San Francisco Bay Area.<br><br>

          While <a href="https://ncity.executiontime.pub">retired from professional gaming</a>-- his career capstone being his team winning gold at the Halo 3 PAX East Tournament in 2010-- <a href="https://plan98.org/app/was-code?src=/public/plan98.js">he wrote a game engine.</a><br><br>

          He is qualified to do any job on this planet that doesn't require a specialized license.
        </div>
      `
    }
  },
}

function news() {
  const { posts } = $.learn()
  return `
    <div class="blog">
      ${posts.map((post) => {
        const forHuman = new Intl.DateTimeFormat("en-US", {
              dateStyle: 'short',
              timeStyle: 'short',
            }).format(new Date(post.timestamp))


        return `
          <div class="post">
            <div class="post-title">
              <a class="post-permalink" href="${post.permalink}">
                ${post.title}
              </a>
            </div>
            <div class="post-meta">
              <div class="post-author">
                ${post.author}
              </div>
              <div class="post-timestamp">
                ${forHuman}
              </div>
            </div>
            <div class="post-body">
              ${post.body}
            </div>
          </div>
        `
      }).join('')}
    </div>
  `
}

function create() {
  const { title, messageText, messageHeight } = $.learn()

  return `
    <div class="publish-form">
      <div style="background: lemonchiffon; display: grid; grid-template-columns: 1fr auto; padding: .5rem; gap: .5rem;">
        <div>
          Thank you for choosing Blog Org Inc, where U is in charge of U, 4 REAL! By pushing the "Go Online!" button, the thoughts you shared will leave local subspace and achieve global subspace. More optionalities incoming!
        </div>
        <div>
          <button class="standard-button" data-publish>
            Go Online!
          </button>
        </div>
      </div>
      <div class="page-title">
        <input data-bind name="title" class="transparent-input" placeholder="Article Title" value="${escapeHyperText(title)}" />
      </div>
      <textarea
        data-bind
        class="page-body"
        name="messageText"
        placeholder="help"
        ${messageHeight ? `style="height: ${messageHeight}px"`:''}
        value="${escapeHyperText(messageText)}"
      ></textarea>

      <upload-drop></upload-drop>
    </div>
  `
}

$.draw((target) => {
  const { page, slideout } = $.learn()

  return `
    <header>
      ${logo()}
      <nav>
        ${nav([PAGES.HOME, PAGES.ABOUT, PAGES.NEWS, PAGES.CREATE])}
      </nav>
    </header>
    <section class="content ${slideout?'':'bleed'}">
      ${renderContent(target)}
    </section>
    <footer>
      &copy; 2025 Half-Rights Reserved<br>Production provided by the Chief Executive Officer of Custom Secure Shirts (<a href="https://css.ceo">CSS.CEO</a>)
    </footer>
  `
}, {
  beforeUpdate: (target) => {
    {
    }
  },
  afterUpdate: (target) => {
    {
    }

    {
      const { slideout } = $.learn()
      if(target.dataset.slideout !== 'true' && slideout) {
        target.querySelector('.context').scrollTop = 0
        target.dataset.slideout = true
      } else {
        target.dataset.slideout = false
      }
    }

    {
      const { page } = $.learn()
      if(target.dataset.page !== page) {
        target.querySelector('.content').scrollTop = 0
        target.dataset.page = page
      }
    }

    {
      [...target.querySelectorAll('textarea')].map(ta => {
        ta.style.height = ta.scrollHeight + "px"
      })
    }
  }
})

function renderContent(target) {
  const { page } = $.learn()

  if(pages[page]) return renderers[page].render(target)

  return `
    <div class="page-title">
      ${type.label}
    </div>
  `
}

$.when('click', '[data-get-started]', (event) => {
  window.location.href = 'https://shirtflicks.app'
})

$.when('click', '[data-page]', (event) => {
  event.preventDefault()
  const { page, path } = event.target.dataset
  $.teach({ page, slideout: false })
  //self.history.pushState(null, '', `${path}`)
})

$.when('click', '[data-href]', (event) => {
  event.preventDefault()
  const { href } = event.target.dataset
  window.location.href = href
})

$.when('click', '[data-slideout]', (event) => {
  const { slideout } = $.learn()
  $.teach({ slideout: !slideout })
})

$.when('click', '[data-publish]', () => {
const { title, messageText  } = $.learn()

  $.teach({
    title,
    body: messageText,
    timestamp: new Date().toJSON(),
    author: 'Wally Wollaston',
    permalink: self.crypto.randomUUID()
  }, function mergeHandler(state, payload) {
    return {
      ...state,
      posts: [
        ...state.posts,
        payload
      ]
    }
  })

  $.teach({
    title: '',
    messageText: ''
  })
})

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
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

$.style(`
  & {
    background: white;
    display: block;
    height: 100%;
    overflow: auto;
    position: relative;
    --color-primary-tint1: #1d4689;
    --color-primary: #1d4689;
    --color-primary-shade1: #1d4689;
    --focus-outline: 2px solid #1d4689;

  }

  & :focus {
    outline-color: dodgerblue;
  }

  & .page-title {
    font-weight: 600;
    font-size: 2rem;
    margin: 1rem 0;
  }

  & .publish-form {
    margin: 0 auto; 
    max-width: 55ch;
  }

  & .transparent-input {
    border: none;
  }

  & .page-body {
    width: 100%;
    padding: 0;
    border: 0;
    resize: none;
  }

  & .blog {
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  & .publish-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  & .post {

  }

  & .post-title {
    font-size: 2rem;
    color: dodgerblue;
    font-weight: 800;
    font-size: 2rem;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), linear-gradient(mediumseagreen 0%, mediumseagreen 50%, dodgerblue 50%, dodgerblue 66%, mediumpurple 66%, mediumpurple 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }

  & .post-permalink {
    text-decoration: none;
  }

  & .post-meta {
    display: flex;
    gap: 1rem;
  }

  & .post-author {
    color: rgba(0,0,0,.65);
  }

  & .post-timestamp {
    color: rgba(0,0,0,.45);
  }

  & .subtitle {
    font-weight: 600;
    font-size: 1.5rem;
    margin: 1rem 0;
  }

  & .interlude {
    min-height: 50vh;
    display: grid;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), linear-gradient(135deg, mediumseagreen, dodgerblue, mediumpurple);
    place-content: center;
    text-align: center;
    padding: 1rem;
    gap: 1rem;
    color: white;
  }

  & .interlude-title {
    font-size: 3rem;
    font-weight: 900;
    color: white;
  }

  @media(max-width: 768px) {
    & .interlude-title {
      font-size: 2rem;
    }
  }

  & .interlude-subtitle {
    font-size: 1.5rem;
    color: rgba(255,255,255,.65);
  }


  & .interlude-cta {
    background: dodgerblue;
    color: white;
    font-weight: 800;
    border: none;
    padding: 1rem;
    border-radius: 4px;
  }

  & .hero-headline {
    margin: 1rem 0 .5rem;
    font-size: 2rem;
    font-weight: bold;
    color: rgba(0,0,0,.65);
  }

  & .hero-section {
    font-size: 1.5rem;
    min-height: 50vh;
    padding: 2rem;
  }

  & .hero-content {
    grid-area: content;
  }

  & .hero-icon {
    font-size: 120px;
    display: grid;
    place-content: center;
    position: absolute;
    inset: 0;
    z-index: 100;
    color: dodgerblue;
  }

  & .hero-graphic {
    grid-area: graphic;
    aspect-ratio: 1;
    max-width: 300px;
    margin: auto;
    border-radius: 100%;
    overflow: hidden;
    position: relative;
  }

  @media (min-width: 768px) {
    & .hero-section {
      display: grid;
      gap: 4rem;
    }
    & .hero-section.-left {
      grid-template-columns: 1fr 300px;
      grid-template-areas: "content graphic";
    }

    & .hero-section.-right {
      grid-template-columns: 300px 1fr;
      grid-template-areas: "graphic content";
    }
  }

  & .hero-action-container {
    margin-top: 1rem;
  }

  & .hero-cta {
    font-weight: 800;
    color: dodgerblue;
    border: none;
    background: white;
    font-size: 2rem;
    padding: 0;
  }

  & .hero-cta-icon {
    font-size: 1.5rem;
  }

  & .hero-tag {
    display: inline;
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-decoration-color: darkorange;
    text-underline-offset: 5px;
    font-weight: bold;
  }

  & .interlude .wrapper {
    background: white;
    border: none;
  }

  & .featured {
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.85)), dodgerblue;
    min-height: 50vh;
    display: grid;
    place-content: center;
    padding: 3rem 1rem;
    gap: 1rem;
  }

  & .featured-title {
    font-size: 3rem;
    color: rgba(255,255,255,.85);
    font-weight: 900;
    text-align: center;
  }

  @media(max-width: 768px) {
    & .featured-title {
      font-size: 2rem;
    }
  }



  & .featured-video {
    max-width: 960px;
    margin: 1rem auto;
  }

  & .featured-subtitle {
    font-size: 1.5rem;
    color: rgba(255,255,255,.65);
    font-weight: 100;
    max-width: 45rem;
    margin: auto;
  }

  & .featured-description {
    color: rgba(255,255,255,.85);
    line-height: 2;
    max-width: 45rem;
    margin: auto;
  }

  & .feature-list {
    padding: 3rem 1rem;
    font-size: 1.5rem;
    display: grid;
    gap: 1rem;
  }

  & .featured-item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }

  & .featured-item sl-icon {
    color: mediumseagreen;
  }

  & .featured a:link,
  & .featured a:visited {
    color: white;
    font-weight: bold;
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-decoration-color: darkorange;
  }

  & .logo-area {
    font-weight: 800;
    font-size: 2rem;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), linear-gradient(darkorange 0%, darkorange 50%, gold 50%, gold 66%, firebrick 66%, firebrick 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }

  & header {
    padding: 1rem;
  }

  & nav {
    white-space: nowrap;
    padding: .5rem 0;
  }

  & nav a {
    text-decoration: none;
    display: inline-block;
    margin: 0 4px;
    padding: .25rem .5rem;
    border-radius: 1rem;
    font-weight: 600;
  }

  & nav a:link,
  & nav a:visited {
    color: dodgerblue;
  }

  & nav a:active,
  & nav a.active {
    color: white;
    background: dodgerblue;
  }

  & footer {
    padding: 1rem;
  }

  & .hero-caption {
    padding: .25rem .5rem;
    font-style: italic;
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


