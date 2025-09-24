import supabase from '@sillonious/database'
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
  ACCOUNT: 'account',
  NEWS: 'news',
  CONTACT: 'contact',
  ABOUT: 'about',
}

const pages = {
  [PAGES.HOME]: {
    label: 'Home',
    path: '/',
    icon: '<sl-icon name="house"></sl-icon>',
  },
  [PAGES.ACCOUNT]: {
    label: 'Account',
    path: '/account',
    icon: '<sl-icon name="person-circle"></sl-icon>',
  },
  [PAGES.NEWS]: {
    label: 'News',
    path: '/news',
    icon: '<sl-icon name="newspaper"></sl-icon>',
  },
  [PAGES.CONTACT]: {
    label: 'Contact',
    path: '/contact',
    icon: '<sl-icon name="headset"></sl-icon>',
  },
  [PAGES.ABOUT]: {
    label: 'About',
    path: '/about',
    icon: '<sl-icon name="info-circle"></sl-icon>',
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


const $ = elf('landing-template', {
  ...router(self.location.pathname),
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
      return `
        ${renderNews()}
      `
    }
  },
  contact: {
    render: () => {
      return contactForm()
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
  account: {
    render: () => {
      return `
        ${renderAccount()}
      `
    }
  }
}

function contactForm() {
  const {
    name,
    email,
    details,
    success,
    error,
    message
  } = $.learn()

  return `
    <div class="wrapper">
      ${success ? `
        <div class="nofication success">
          ${message}
        </div>
      ` : `
        <form data-contact method="post">
          <div class="subtitle">Get in Touch</div>
          Fields marked (*) are required
          <label class="field">
            <span class="label">Name *</span>
            <input data-bind required name="name" value="${name || ''}" />
          </label>
          <label class="field">
            <span class="label">Email *</span>
            <input data-bind required name="email" type="email" value="${email || ''}" />
          </label>
          <label class="field">
            <span class="label">What are you looking for?</span>
            <textarea data-bind name="details" value="${details || ''}"></textarea>
          </label>

          ${error ? `
            <div class="nofication error">
              ${message}
            </div>
          `: ``}
          <button type="submit">
            Submit Contact
          </button>
        </form>
      `}
    </div>
  `

}

function renderNews() {
  return `
    <div class="news-grid">
      <div class="hero-grid">
        <div class="mainbar">
          <div class="slight-right-grid">
            <div>
              <div class="placeholder-content"></div>
            </div>
            <div>
              <div class="placeholder-content"></div>
            </div>
          </div>
          <div class="three-column-grid">
            <div>
              <div class="placeholder-content"></div>
            </div>
            <div>
              <div class="placeholder-content"></div>
            </div>
            <div>
              <div class="placeholder-content"></div>
            </div>
          </div>
          <div class="heavy-left-grid">
            <div>
              <div class="placeholder-content"></div>
            </div>
            <div>
              <div class="placeholder-content"></div>
            </div>
          </div>
          <div class="slight-right-grid">
            <div>
              <div class="placeholder-content"></div>
            </div>
            <div>
              <div class="placeholder-content"></div>
            </div>
          </div>
          <div class="opinion-section">
            <div class="slight-right-grid">
              <div>
                <div class="placeholder-content"></div>
              </div>
              <div>
                <div class="placeholder-content"></div>
              </div>
            </div>
            <div class="three-column-grid">
              <div>
                <div class="placeholder-content"></div>
              </div>
              <div>
                <div class="placeholder-content"></div>
              </div>
              <div>
                <div class="placeholder-content"></div>
              </div>
            </div>
          </div>
          <div class="heavy-right-grid">
            <div>
              <div class="placeholder-content"></div>
            </div>
            <div>
              <div class="placeholder-content"></div>
            </div>
          </div>
          <div class="slight-right-grid">
            <div>
              <div class="placeholder-content"></div>
            </div>
            <div>
              <div class="placeholder-content"></div>
            </div>
          </div>

        </div>
        <div class="sidebar">
          <div class="latest">
            <div class="latest-title">
              Latest
            </div>
            <div class="latest-list">
              <div class="latest-row">
                <div class="latest-ago">6 min</div>
                <div class="latest-headline">Lorem Ipsum Shares Drop</div>
              </div>
              <div class="latest-row">
                <div class="latest-ago">8 min</div>
                <div class="latest-headline">Lorem Ipsum</div>
              </div>
              <div class="latest-row">
                <div class="latest-ago">12 min</div>
                <div class="latest-headline">Lorem Ipsum Sit Amet Dolor</div>
              </div>
              <div class="latest-row">
                <div class="latest-ago">16 min</div>
                <div class="latest-headline">Lorem Ipsum</div>
              </div>
              <div class="latest-row">
                <div class="latest-ago">20 min</div>
                <div class="latest-headline">Lorem Ipsum</div>
              </div>
              <div class="latest-row">
                <div class="latest-ago">24 min</div>
                <div class="latest-headline">Lorem Ipsum</div>
              </div>
            </div>
            <div class="latest-cta">
              <a href="javascript:;">See All Latest</a>
            </div>
          </div>
          <div class="podcast">
            <div class="placeholder-content"></div>
          </div>
          <div class="promo">
            <div class="placeholder-content"></div>
          </div>
          <div class="newsletter">
            <div class="placeholder-content"></div>
          </div>
          <div class="brief">
            <div class="placeholder-content"></div>
          </div>
          <div class="stocks">
            <div class="placeholder-content"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="interlude">
      <div class="interlude-title">
        Don't forget to smell the roses.
      </div>
      <div>
        <button class="interlude-cta">
          Click Me
        </button>
      </div>
    </div>
    <div class="news-grid">
      <div class="four-column-grid">
        <div>
          <div class="placeholder-content"></div>
        </div>
        <div>
          <div class="placeholder-content"></div>
        </div>
        <div>
          <div class="placeholder-content"></div>
        </div>
        <div>
          <div class="placeholder-content"></div>
        </div>
      </div>
      <div class="heavy-right-grid">
        <div>
          <div class="placeholder-content"></div>
        </div>
        <div>
          <div class="placeholder-content"></div>
        </div>
      </div>
      <div class="slight-left-grid">
        <div>
          <div class="placeholder-content"></div>
        </div>
        <div>
          <div class="placeholder-content"></div>
        </div>
      </div>
    </div>
  `
}

const tabs = {
  profile: {
    label: 'Profile',
    render: () => {
      return `
        <div class="page-title">Profile</div>
        <div>
        </div>
      `
    }
  },
  security:  {
    label: 'Security',
    render: () => {
      return `
        <div class="page-title">Security</div>
        <div>
        </div>
      `
    }
  }
}

$.draw((target) => {
  const { page, slideout } = $.learn()

  return `
    <header>
      ${logo()}
      <nav>
        ${nav([PAGES.HOME, PAGES.ABOUT])}
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

function renderAccount() {
  const { accountTab='profile' } = $.learn()
  return `
    <div class="tabs">
      ${Object.keys(tabs).map(key => {
        return `
          <button data-tab="${key}" class="${accountTab === key?'active':''}">
            ${tabs[key].label}
          </button>
        `
      }).join('')}
    </div>
    <div class="tab wrapper">
      ${tabs[accountTab].render()}
    </div>
  `
}

$.when('click', '[data-get-started]', (event) => {
  window.location.href = 'https://shirtflicks.app'
})

$.when('click', '[data-tab]', (event) => {
  const accountTab = event.target.dataset.tab
  $.teach({ accountTab })
})

$.when('click', '[data-page]', (event) => {
  event.preventDefault()
  const { page, path } = event.target.dataset
  $.teach({ page, slideout: false })
  self.history.pushState(null, '', `${path}`)
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

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.when('submit', '[data-contact]', async event => {
  event.preventDefault()

  $.teach({
    message: null
  })

  const { name, email, company, industry, phone, details } = event.target

  const values = {
    name: name.value,
    email: email.value,
    company: company.value,
    industry: industry.value,
    phone: phone.value,
    details: details.value,
  }

  try {
    const { error } = await supabase
      .from('client_intake')
      .insert(values)

    const response = error
      ? { error: true, message: error.message  }
      : { success: true, message: "We'll be in touch, thanks for reaching out!" }
    $.teach(response)
  } catch(e) {
    $.teach({ error: true, message: e.message })
  }
})


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

  & .subtitle {
    font-weight: 600;
    font-size: 1.5rem;
    margin: 1rem 0;
  }

  & .iconator {
    display: grid;
    place-content: center;
  }

  & .selector {
    display: grid;
    grid-template-areas: 'area';
  }

  @media (min-width: 500px) {
    & .selector {
      display: none;
    }
  }

  & .selector label[for],
  & .selector select[name] {
    grid-area: area;
  }

  & .selector label[for] {
    z-index: 2;
    pointer-events: none;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: .5rem;
    align-content: center;
    padding: 0 .5rem;
  }

  & .selector select[name] {
    font-size: 1rem;
    width: 100%;
    padding: .5rem;
    opacity: 0;
    z-index: 1;
    height: 2rem;
  }

  & .page .selector.active label,
  & .page .selector.active select {
    color: rgba(0,0,0,.85);
  }

  @media (min-width: 500px) {
    & .page button {
      display: block;
    }

    & .page select {
      display: none;
    }
  }


  & .page button:hover,
  & .page button:focus,
  & .page button.active {
    background: #ffce00;
  }

  & .content {
    grid-area: content;
    background: white;
    z-index: 2;
    position: relative;
    overflow: auto;
  }

  & .settings {
    background: white;
    grid-row: 2;
    grid-column: 1;
    padding: 1rem;
  }

  @media (min-width: 500px) {
    & .settings {
      grid-row: 1;
      grid-column: 2 / -1;
    }
  }

  @media (min-width: 768px) {
    & .settings {
      background: white;
      grid-row: 1;
      grid-column: 3 / -1;
    }
  }


  @keyframes &-fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  & .create-title {
    font-size: 1.5rem;
    font-weight: 100;
    margin-bottom: 1rem;
    display: flex;
  }

  & .create-title .selector {
    display: inline-grid;
  }

  & .context {
    grid-area: content;
    background: white;
    opacity: 0;
    animation: &-fade-in 250ms forwards 1000ms;
    transition: 100ms transform ease-in-out;
    transform: translateX(100%);
    padding: 1rem 0 4rem;
    z-index: 5;
    overflow: auto;
  }

  & .slideout.context {
    transform: translateX(0);
  }

  & textarea {
    resize: none;
  }

  & button.slideout-action {
    background: dodgerblue;
    color: white;
    border-radius: 3px;
    width: auto;
    display: inline-grid;
    place-content: center;
    grid-template-columns: auto 1fr;
    padding: 0 .5rem;
    border: 5px solid dodgerblue;
    margin: 3px 3px 3px auto;
    gap: .5rem;
  }

  & button.slideout-action:hover,
  & button.slideout-action:focus {
    outline: 2px solid white;
    outline-offset: -1px;
  }

  & [data-connect] {
    max-width: 320px;
    margin: auto;
    padding: 1rem;
  }

  & [data-contact] {
    margin: auto;
    max-width: 320px;
  }

  & [data-contact] [type="submit"],
  & [data-connect] [type="submit"] {
    background: dodgerblue;
    color: white;
    border: none;
    border-radius: 2px;
    padding: 1rem;
    width: 100%;
    display: block;
    font-size: 1rem;
    font-weight: 600;
    margin: 1rem 0;

  }

  & .nofication:not(:empty) {
    border: 1px solid transparent;
    padding: 1rem;
    margin: 1rem 0;
  }

  & .nofication.success {
    border-color: mediumseagreen;
    background: linear-gradient(rgba(255,255,255,.75), rgba(255,255,255,.75)), mediumseagreen;
    color: rgba(0,0,0,.85);
  }

  & .nofication.error {
    border-color: firebrick;
    background: linear-gradient(rgba(255,255,255,.75), rgba(255,255,255,.75)), firebrick;
    color: rgba(0,0,0,.85);
  }

  & .tabs {
    text-align: center;
    position: relative;
    top: 1px;
  }

  & .tabs button {
    border: 1px solid transparent;
    padding: .5rem;
    color: rgba(0,0,0,.65);
    background-color: rgba(0,0,0,.15)
  }

  & .tabs .active {
    background: white;
    border-color: rgba(0,0,0,.15);
    border-bottom-color: white;
    color: black;
  }

  & .placeholder-content {
    height: 200px;
    background: rgba(0,0,0,.2);
  }

  & .news-grid {
    border: 1px solid rgba(0,0,0,.2);
    max-width: 60rem;
    margin: auto;
  }

  & .hero-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
  }

  & .hero-grid .mainbar {
  }

  & .hero-grid .sidebar {
    border-left: 1px solid rgba(0,0,0,.2);
  }

  @media (max-width: 60rem) {
    & .hero-grid {
      grid-template-columns: 1fr;
      border-left: none;
      border-top: 1px solid rgba(0,0,0,.2);
    }
  }

  & .slight-left-grid {
    display: grid;
    grid-template-columns: 1.1fr .9fr;
    gap: 1rem;
    padding: .5rem;
    border-bottom: 1px solid rgba(0,0,0,.2);
  }

  & .slight-left-grid:last-child {
    border-bottom: none;
  }

  @media (max-width: 48rem) {
    & .slight-left-grid {
      grid-template-columns: 1fr;
    }
  }


  & .slight-right-grid {
    display: grid;
    grid-template-columns: .9fr 1.1fr;
    gap: 1rem;
    padding: .5rem;
    border-bottom: 1px solid rgba(0,0,0,.2);
  }

  & .slight-right-grid:last-child {
    border-bottom: none;
  }

  @media (max-width: 48rem) {
    & .slight-right-grid {
      grid-template-columns: 1fr;
    }
  }

  & .three-column-grid {
    display: grid;
    gap: 1rem;
    padding: .5rem;
    grid-template-columns: 1fr 1fr 1fr;
    border-bottom: 1px solid rgba(0,0,0,.2);
  }

  & .three-column-grid:last-child {
    border-bottom: none;
  }

  & .three-column-grid > * {
    position: relative;
  }

  & .three-column-grid > *::after {
    content: '';
    position: absolute;
    right: -.5rem;
    top: 1rem;
    bottom: 1rem;
    border-right: 1px solid rgba(0,0,0,.2);
  }

  & .three-column-grid > *:last-child::after {
    border-right: none;
  }

  @media (max-width: 48rem) {
    & .three-column-grid {
      grid-template-columns: 1fr;
    }

    & .three-column-grid > *::after {
      border-right: none;
    }
  }

  & .four-column-grid {
    display: grid;
    gap: 1rem;
    padding: .5rem;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    border-bottom: 1px solid rgba(0,0,0,.2);
  }

  & .four-column-grid:last-child {
    border-bottom: none;
  }

  & .four-column-grid > * {
    position: relative;
  }

  & .four-column-grid > *::after {
    content: '';
    position: absolute;
    right: -.5rem;
    top: 1rem;
    bottom: 1rem;
    border-right: 1px solid rgba(0,0,0,.2);
  }

  & .four-column-grid > *:last-child::after {
    border-right: none;
  }

  @media (max-width: 48rem) {
    & .four-column-grid {
      grid-template-columns: 1fr;
    }

    & .four-column-grid > *::after {
      border-right: none;
    }
  }

  & .heavy-left-grid {
    display: grid;
    gap: 1rem;
    padding: .5rem;
    grid-template-columns: 1.25fr .75fr;
    border-bottom: 1px solid rgba(0,0,0,.2);
  }

  & .heavy-left-grid:last-child {
    border-bottom: none;
  }

  @media (max-width: 48rem) {
    & .heavy-left-grid {
      grid-template-columns: 1fr;
    }
  }

  & .heavy-right-grid {
    display: grid;
    gap: 1rem;
    padding: .5rem;
    grid-template-columns: .75fr 1.25fr;
    border-bottom: 1px solid rgba(0,0,0,.2);
  }

  & .heavy-right-grid:last-child {
    border-bottom: none;
  }

  @media (max-width: 48rem) {
    & .heavy-right-grid {
      grid-template-columns: 1fr;
    }
  }

  & .opinion-section {
    background: lightcyan;
  }

  & .latest {
    padding: .5rem;
    border-bottom: 1px solid rgba(0,0,0,.2);
  }

  & .podcast {
    padding: .5rem;
    border-bottom: 1px solid rgba(0,0,0,.2);
  }

  & .promo {
    padding: .5rem;
    border-bottom: 1px solid rgba(0,0,0,.2);
  }

  & .newsletter {
    padding: .5rem;
    border-bottom: 1px solid rgba(0,0,0,.2);
  }

  & .brief {
    padding: .5rem;
    border-bottom: 1px solid rgba(0,0,0,.2);
  }

  & .stocks {
    padding: .5rem;
    border-bottom: 1px solid rgba(0,0,0,.2);
  }

  & .latest-title {
    color: firebrick;
    font-weight: 800;
    font-size: 1.2rem;
  }

  & .latest-ago {
    color: firebrick;
    font-weight: 500;
    line-height: 1.2;
  }

  & .latest-row {
    display: grid;
    grid-template-columns: 6ch 1fr;
    border-bottom: 1px solid rgba(0,0,0,.2);
    padding: .5rem;
  }

  & .latest-row:last-child {
    border-bottom: none;
  }

  & .latest-headline {
    font-weight: bold;
    line-height: 1.2;
  }

  & .latest-cta {
    text-align: right;
  }

  & .latest-cta a:link,
  & .latest-cta a:visited {
    color: rgba(0,0,0,.65);
  }
  & .latest-cta a:hover,
  & .latest-cta a:focus {
    color: black;
  }

  & .latest-cta a:active {
    color: firebrick;
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
    text-decoration-color: #ffce00;
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
