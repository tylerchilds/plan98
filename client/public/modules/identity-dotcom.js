import module from '@silly/tag'
const searchParams = new URLSearchParams(window.location.search);

const callbacks = {
  'callback': params => {
    const provider = params.get('provider')
    const token = params.get('access_token')
    const secret = params.get('access_secret')
    bus.state[`ls/${provider}/tokens`] = {
      provider,
      token,
      secret
    }
  }
}

resolveCallbacks(searchParams)

const $ = module('identity-dotcom')

const modes = {
	welcome: 'welcome',
	callforward: 'callforward',
	callback: 'callback',
	ready: 'ready',
	misconfigured: 'misconfigured',
}

const actions = {
	goto: 'goto',
	authenticate: 'authenticate',
	connect: 'connect',
	next: 'next',
	back: 'back',
	close: 'close',
}

const emptyLauncher = {
	mode: searchParams.get('mode') || 'welcome',
	nextMode: null,
	backMode: null,
	companionActive: true,
}

function launcherById(id) {
	return $.learn()[id] || emptyLauncher
}

const paginationActions = [actions.back, actions.next]

$.when('click', '[data-action]', action)
$.when('click', '[data-goto]', goTo)

const actionHandlers = {
	[modes.welcome]: (id) => [
		`
			<button class="button" data-id="${id}" data-goto="callforward">
				Start
			</button>
		`
	],
	[modes.callforward]: (id) => [
		`
			<button class="button" data-id="${id}" data-action="connect">
				Connect
			</button>
		`,
		`
			<button class="button -secondary" data-id="${id}" data-action="back">
				Go Back
			</button>
		`
	],
	[modes.callback]: (id) => [
		`
      <button class="button" data-id="${id}" data-goto="ready">
        Continue
			</button>
		`,
		`
			<button class="button -secondary" data-id="${id}" data-goto="callforward">
				Connect Another
			</button>
		`
  ],
	[modes.ready]: (id) => [
		`
      <button class="button" data-id="${id}" data-action="${actions.close}">
      Close
			</button>
		`,
  ],
	[modes.misconfigured]: (id) => [
		`
      <button class="button" data-id="${id}" data-action="${actions.authenticate}">
				Try Again
			</button>
		`,
	],
	'default': (id) => [
		`
			<button class="button" data-id="${id}" data-goto="welcome">
				Restart
			</button>
		`
	]
}

function actionItems(id, mode) {
	const buttons = (actionHandlers[mode] || actionHandlers['default'])(id).join('')
	return `
		<actions>
			${buttons}
		</actions>	
	`
}

$.draw(target => {
	const { id } = target

	const launcher = launcherById(id)

	const renderers = {
		[modes.welcome]: () => `
				<div class="card">
					<h2>Smugoogle</h2>
					<p>Bridge your physical and digital operations</p>
					${actionItems(id, modes.welcome)}
				</div>
			`,
		[modes.callforward]: () => `
      <div class="card">
        <h2>Connect a service</h2>
        <p>First, log in to smugmug</p>
        ${actionItems(id, modes.callforward)}
      </div>
    `,
		[modes.callback]: () => `
      <div class="card">
        <h2>Service Connection Successful</h2>
          <connected-service key='ls/smugmug/tokens'></connected-service>
        ${actionItems(id, modes.callback)}
      </div>
    `,
    [modes.ready]: () => `
      <div class="card">
        <h2>You're Ready</h2>
        <tree-view tokens="ls/smugmug/tokens"></tree-view>
          <br/>
        ${actionItems(id, modes.ready)}
      </div>
    `,
		[modes.misconfigured]: () => `
      <div class="card">
        <h2>Whoops</h2>
        <p>Something went super wrong so, yeah, maybe tweak these.</p>
        ${actionItems(id, modes.misconfigured)}
      </div>
    `,
		'default': () => `
      <div class="card">
        <h2>Error...</h2>
        ${actionItems(id)}
      </div>
    `
	}

	const { mode, nextMode, companionActive } = launcher
	const view = (renderers[mode] || renderers['default'])()
	const fadeOut = nextMode && mode !== nextMode

	const companionClass = companionActive ? `mode-${mode} active` : `mode-${mode}`

	target.innerHTML = `
    <div class="application">
    </div>
    <!--
		<button aria-label="Companion" class="switcher" data-id="${id}"></button>
    -->
		<companion class="${companionClass}">
			<transition class="${fadeOut ? 'out' : ''}" data-id="${id}">
				${view}
			</transition>
		</companion>
		`
})

$.when('click', 'button.switcher', switcher)

function switcher({target}) {
	const { id } = target.dataset
	const { companionActive } = launcherById(id)
	$.teach({ companionActive: !companionActive }, merge(id))
}

function transition({target}) {
	const { id } = target.dataset
	const { mode, nextMode, backMode } = launcherById(id)

  console.log(backMode)

	const currentMode = nextMode ? nextMode : mode
	const previousMode = mode !== backMode ? backMode : mode
	$.teach({ mode: currentMode, backMode: previousMode }, merge(id))
	target.scrollTop = '0'
	document.activeElement.blur()
}

$.when('animationend', 'transition', transition)

$.style(`
		& {
      --color-primary: darkgoldenrod;
      --color-primary-shade1: goldenrod;
			display: block;
			position: absolute;
			overflow: hidden;
			height: 100%;
			width: 100%;
			inset: 0;
      margin: auto;
      display: grid;
		}

    & .application {
      overflow: auto;
      position: relative;
      z-index: 1;
    }

    & h2 {
      font-size: 2rem;
      line-height: 1.2;
      font-weight: bold;
    }

		& .switcher {
      border-radius: 0 0 0 100%;
			display: block;
			position: fixed;
			height: 72px;
			padding: 0;
			margin: 0;
			background: orange;
			right: 0;
			z-index: 10;
			border: 0;
			top: 0;
			width: 72px;
		}

		& actions {
      display: block;
			border-radius: 2px;
		}

		& companion {
			min-height: 1rem;
			z-index: 5;
			transition: opacity 100ms ease-in-out;
      opacity: 0;
      margin: auto;
      display: grid;
      height: 100%;
      position: fixed;
      inset: 0;
      z-index: -1;
      backdrop-filter: blur(3px);
		}

    & companion .card {
      max-width: 320px;
      backdrop-filter: blur(3px);
    }

		& companion.active {
      opacity: 1;
      z-index: 1;
		}

		& companion:not(.active) button {
			animation: &-fade-out ease-in-out 0ms;
			display: none;
		}

		& companion .button {
			animation: &-fade-in ease-in-out 1000ms;
			border: none;
      display: block;
			width: 100%;
			margin-bottom: 1rem;	
		}

		& companion .button:last-child {
			margin-bottom: 0;	
		}

		& transition {
			animation: &-fade-in ease-in-out 250ms;
			display: grid;
			height: 100%;
			place-items: center;
			width: 100%;
		}

		& transition.out {
			animation: &-fade-out ease-in-out 100ms;
		}

		& .icons {
			display: grid;
			height: 100%;
			gap: 1rem;
			grid-template-columns: repeat(auto-fill, 4rem);
			grid-template-rows: repeat(auto-fill, 4rem);
			padding: 1rem;
			width: 100%;
		}

		& .icons button {
			margin: 0;
		}

		& .card {
      overflow: auto;
			padding: 1rem;
      max-height: 100vh;
		}

		@keyframes &-fade-in {
			0% {
				opacity: 0;
			}
			100% {
				opacity: 1;
			}
		}

		@keyframes &-fade-out {
			0% {
				opacity: 1;
			}
			100% {
				opacity: 0;
			}
		}

		@keyframes &-zoom-in {
			0% {
				transform: scale(.9);
			}
			100% {
				transform: scale(1);
			}
		}

		@keyframes &-zoom-out {
			0% {
				transform: scale(1);
			}
			100% {
				transform: scale(.9);
			}
		}
	`)
/* controller-like logic */
const welcomePath = [
	modes.welcome,
	modes.planting,
	modes.jamming,
]

function goTo({ target }) {
	const mode = target.dataset.goto
	return messageStateMachine(target, { action: actions.goto, mode })
}

function action({ target }) {
	const { action } = target.dataset
	return messageStateMachine(target, { action })
}

function dispatch(target, type, mode) {
	const states = {
		'welcome': {
      'leaving': () => `bye felicia`,
      'entering': () => `hello clarice`,
		}
	}

	if(states[mode]) {
		const change = states[mode][type] || (() => null)
		change(target)
	}
}

async function messageStateMachine(target, message) {
	const { id } = target.dataset
	const { mode, backMode } = launcherById(id)
	const { action } = message

	function setMode(nextMode) {
		dispatch(target, 'leaving', mode)
		$.teach({ nextMode }, merge(id))
		dispatch(target, 'entering', nextMode)
	}

	if(action === actions.goto) {
		setMode(message.mode)
		return
	}

	if(action === actions.close) {
		setMode(message.welcome)
    $.teach({ companionActive: false }, merge(id))
		return
	}

  if(action === actions.authenticate) {
    try {
      const { status, data } = await fetchTen(state['ls/fastmail/username'], state['ls/fastmail/apikey'])
      state['ls/fastmail/fetchTen'] = data || []
      setMode(status === 'ok' ? modes.ready : modes.misconfigured)
      return
    } catch(e) {
      console.log(e)
      setMode(modes.misconfigured)
    }
	}

  if(action === actions.connect) {
    try {
      window.location.href="http://localhost:3000/connect/smugmug"
      return
    } catch(e) {
      console.log(e)
      setMode(modes.misconfigured)
    }
	}

	if(action === actions.back && backMode) {
		setMode(backMode)
		return
	}

	const onTheWelcomePath = welcomePath.includes(mode) && paginationActions.includes(action)

	if(onTheWelcomePath) {
		const order = action === actions.next
			? welcomePath
			: [...welcomePath].reverse()

		const nextIndex = order.indexOf(mode) + 1
		setMode(order[nextIndex])
		return
	}
}

function merge(id) {
	return function middleware(state, payload) {
		return {
			...state,
			[id]: {
				...emptyLauncher,
				...state[id],
				...payload
			}
		}
	}
}

const hostname = "api.fastmail.com";

const authUrl = `https://${hostname}/.well-known/jmap`;
const headers = (apikey) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${apikey}`,
});

const getSession = async (apikey) => {
  const response = await fetch(authUrl, {
    method: "GET",
    headers: headers(apikey),
  });
  return response.json();
};

const inboxIdQuery = async (apikey, api_url, account_id) => {
  const response = await fetch(api_url, {
    method: "POST",
    headers: headers(apikey),
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [
        [
          "Mailbox/query",
          {
            accountId: account_id,
            filter: { role: "inbox", hasAnyRole: true },
          },
          "a",
        ],
      ],
    }),
  });

  const data = await response.json();

  inbox_id = data["methodResponses"][0][1]["ids"][0];

  if (!inbox_id.length) {
    console.error("Could not get an inbox.");
    process.exit(1);
  }

  return await inbox_id;
};

const mailboxQuery = async (apikey, api_url, account_id, inbox_id) => {
  const response = await fetch(api_url, {
    method: "POST",
    headers: headers(apikey),
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [
        [
          "Email/query",
          {
            accountId: account_id,
            filter: { inMailbox: inbox_id },
            sort: [{ property: "receivedAt", isAscending: false }],
            limit: 10,
          },
          "a",
        ],
        [
          "Email/get",
          {
            accountId: account_id,
            properties: ["id", "from", "subject", "receivedAt", 'bodyValues', 'htmlBody', 'textBody'],
            fetchAllBodyValues: true,
            "#ids": {
              resultOf: "a",
              name: "Email/query",
              path: "/ids/*",
            },
          },
          "b",
        ],
      ],
    }),
  });

  const data = await response.json();

  return await data;
};
async function fetchTen(username, apikey){
  const messages = [];

  // bail if we don't have our ENV set:
  if (!username || !apikey) {
    console.log("Please set the username and apikey");
  }

  return await getSession(apikey).then(async(session) => {
    const api_url = session.apiUrl;
    const account_id = session.primaryAccounts["urn:ietf:params:jmap:mail"];
    await inboxIdQuery(apikey, api_url, account_id).then(async (inbox_id) => {
      await mailboxQuery(apikey, api_url, account_id, inbox_id).then((emails) => {
        emails["methodResponses"][1][1]["list"].forEach((email) => {
          const from = email.from[0].email
          const subject = email.subject
          const timestamp = email.receivedAt

          console.log(email)
          const textParts = email.textBody.map(x => x.partId)
          const htmlParts = email.htmlBody.map(x => x.partId)
          const textBody = textParts.map(id => email.bodyValues[id].value).join('')
          const htmlBody = htmlParts.map(id => email.bodyValues[id].value).join('')
          messages.push({
            post_hint: 'email',
            meta: {
              author: from,
              authorPhotoUrl: 'https://tychi.me/professional-headshot.jpg',
              timestamp,
            },
            subject,
            textBody,
            htmlBody,
          })
        });
      });
    });
    return { data: messages, status: 'ok' }
  });
}

function resolveCallbacks(params) {
  const mode = params.get('mode')
  const provider = params.get('provider')
  const callback = callbacks[mode]
  if(typeof callback === 'function') {
    callback(params)
  }
}

