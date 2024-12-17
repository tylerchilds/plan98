import tag from '@silly/tag'
import { bayunCore } from '@sillonious/vault'
import { getSession, getCompanies, setSession, clearSession } from './bayun-wizard.js'
import { social, setRoom, getRoom } from './chat-room.js'

const companies = getCompanies().map((company) => {
  return `
    <option value="${company}">
      ${company}
    </option>
  `
}).join('')

const companiesField = `
  <label>Organization</label>
  <select name="companyName" class="companyName">
    ${companies}
  </select>
`

let lastSidebar = false
let lastUser = false
let lastAuthState = false
const $ = tag('camp-map')


document.addEventListener('click', function(event) {
  if (event.target.closest('svg a')) {
    event.preventDefault();
    const href = event.target.closest('svg a').getAttribute('href');
    self.open(href,'_blank')
  }
}, true); // t

$.when('submit', '.quick-auth', async (event) => {
  event.preventDefault()

  const companyEmployeeId = event.target.companyEmployeeId.value
  const companyName = event.target.companyName.value
  const password = event.target.password.value

  const successCallback = async data => {
    const {
      sessionId,
    } = data

    setSession({ sessionId, companyName, companyEmployeeId })
  };

  const failureCallback = error => {
    $.teach({ error: `${error}` })
  };

  bayunCore.loginWithPassword(
    '', //sessionId,
    companyName,
    companyEmployeeId,
    password,
    true, //autoCreateEmployee,
    null, // TODO: @bayun, what is?
    noop.bind('securityQuestionsCallback'),
    noop.bind('passphraseCallback'),
    successCallback,
    failureCallback
  );
})

function noop(){}


$.when('click', '[data-disconnect]', async () => {
  clearSession()
})

$.style(`
  & {
    position: relative;
    position: relative;
    height: 100%;
    display: block;
  }

  & .remix {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 3;
  }

  & .content {
    position: relative;
    height: 100%;
    display: block;
  }

  & .control {
    position: absolute;
  }

  & .content > * {
    grid-area: center;
    place-self: center;
    position: absolute;
    inset: 0;
    margin: auto;
  }
`)

$.when('click', '[data-sidebar]', async (event) => {
  const { sidebar } = $.learn()
  $.teach({ sidebar: !sidebar })
})

$.draw((target) => {
  const { sessionId, companyName, companyEmployeeId } = getSession()
  const user = social(companyName, companyEmployeeId)
  const { sidebar } = $.learn()
  const authState = sessionId
  const avatarHTML = authState ? `
    <div data-avatar>
      <quick-media key="${user.avatar}"></quick-media>
    </div>
  ` : `
    <img data-avatar src="/cdn/tychi.me/photos/professional-headshot.jpg" alt="" />
  `

  const authChip = authState ? `
    <div class="tongue">
      <div class="quick-auth">
        <div class="console">
          <label>Organization</label>
          <div class="companyName">
            ${companyName}
          </div>
        </div>
        <div class="player">
          <label>Member</label>
          <div class="companyEmployeeId">
            ${companyEmployeeId}
          </div>
        </div>
        <button class="auth-button" data-disconnect>
          Disconnect
        </button>
      </div>
    </div>
  ` : `
    <div class="tongue">
      <form method="post" class="quick-auth">
        <div class="console">
          ${companiesField}
        </div>
        <div class="player">
          <label>Member</label>
          <input placeholder="player" name="companyEmployeeId" />
        </div>
        <div class="password">
          <label>Password</label>
          <input type="password" name="password" />
        </div>

        <button class="auth-button" type="submit">
          Connect
        </button>
      </form>
    </div>
  `

  if(authState !== lastAuthState && target.querySelector('.control-avatar')) {
    lastAuthState = authState
    target.querySelector('.control-avatar').innerHTML = authChip
    target.querySelector('[data-sidebar]').innerHTML = avatarHTML
    return
  }

  if(sidebar !== lastSidebar && target.querySelector('[data-sidebar]')) {
    lastSidebar = sidebar
    sidebar
      ? target.querySelector('.control').classList.add('sidebar')
      : target.querySelector('.control').classList.remove('sidebar')
    return
  }

  if(user !== lastUser && target.querySelector('[data-avatar]')) {
    lastUser = user.company + user.unix
    return
  }

  return `
    <div class="control ${sidebar ? 'sidebar': ''}" aria-live="assertive">
      <div class="control-toggle">
        <button data-sidebar>
          ${avatarHTML}
        </button>
      </div>
      <div class="control-tab-list">
        <div class="control-avatar">
          ${authChip}
        </div>
      </div>
    </div>
    <div class="content">
      <img src="/cdn/dwebcamp.org/map.png" />
      <svg viewBox="0 0 3981 2816" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <title>map</title>
        <g style="opacity: 0.25;" transform="matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 2.2737367544323206e-13, -2.2737367544323206e-13)">
          <title>legend</title>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/wayback-wheel">
            <rect x="2968.106" y="1993.377" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/hackers-hall">
            <rect x="2967.526" y="2072.681" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/migration-library">
            <rect x="2968.391" y="2145.291" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/tree-house">
            <rect x="2964.069" y="2224.143" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/cultivation-station">
            <rect x="2963.205" y="2299.347" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/access-to-knowledge-amphitheater">
            <rect x="2963.205" y="2373.685" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/campfire">
            <rect x="2970.12" y="2450.521" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/stages">
            <rect x="2964.07" y="2526.588" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/ai-think-tank">
            <rect x="2966.663" y="2603.52" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/art-barn">
            <rect x="2964.934" y="2678.723" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/volunteers">
            <rect x="3445.924" y="1991.716" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/nest">
            <rect x="3442.467" y="2069.512" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/impact-island">
            <rect x="3445.06" y="2145.579" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/heartwood-chapel">
            <rect x="3439.874" y="2222.319" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/lightning-salon">
            <rect x="3440.739" y="2297.522" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/tea-tent">
            <rect x="3439.01" y="2375.125" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/redwood-cathedral">
            <rect x="3443.331" y="2451.193" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/schedule">
            <rect x="3434.352" y="2533.407" width="467.694" height="215.73" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/registration">
            <rect x="2491.722" y="1841.206" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/info-point">
            <rect x="2494.09" y="1917.526" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/first-aid-facility">
            <rect x="2490.426" y="1994.466" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/cabins">
            <rect x="2489.205" y="2071.406" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/adirondacks">
            <rect x="2492.869" y="2149.567" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/deluxe-tents">
            <rect x="2494.085" y="2224.059" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/regular-tents">
            <rect x="2491.643" y="2299.777" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/single-tents">
            <rect x="2490.422" y="2377.938" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/self-camping-areas">
            <rect x="2495.307" y="2452.435" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/toilets">
            <rect x="2489.2" y="2529.375" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/showers">
            <rect x="2491.643" y="2606.315" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
          <a target="_blank" rel="noreferrer" href="/app/camp-thread?src=/braidurl/dweb/coffee-hollow">
            <rect x="2491.643" y="2683.254" width="467.694" height="74.336" style="fill: rgb(30, 144, 255);"/>
          </a>
        </g>
        <a target="_blank" rel="noreferrer" transform="matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 2.2737367544323206e-13, 0)" href="/?world=sillyz.computer">
          <g>
            <title>silly</title>
            <path style="stroke: rgb(0, 0, 0); fill: rgb(255, 164, 31);" d="M 2464.917 1273.241 C 2454.409 1283.749 2432.59 1316.48 2449.008 1332.9 C 2450.141 1334.033 2472.872 1348.338 2472.872 1334.226 C 2472.872 1332.423 2473.717 1318.797 2475.523 1316.991 C 2477.964 1314.55 2482.152 1321.494 2482.152 1324.945 C 2482.152 1337.724 2488.429 1366.395 2479.5 1375.324 C 2476.597 1378.227 2481.874 1390.955 2482.152 1391.233 C 2486.899 1395.979 2480.051 1403.164 2491.432 1403.164 C 2498.934 1403.164 2515.295 1402.841 2515.295 1392.558 C 2515.295 1389.506 2516.758 1372.535 2517.947 1371.346 C 2519.695 1369.598 2517.664 1344.832 2520.598 1344.832 C 2540.248 1344.832 2542.842 1377.681 2552.416 1387.255 C 2562.45 1397.289 2577.138 1403.632 2588.211 1392.558 C 2590.241 1390.528 2597.491 1390.858 2597.491 1387.255 C 2597.491 1354.963 2583.595 1348.168 2564.348 1328.923 C 2559.591 1324.166 2541.992 1321.332 2537.833 1313.014 C 2534.156 1305.659 2508.667 1300.485 2508.667 1285.173 C 2508.667 1282.749 2516.976 1282.876 2517.947 1283.847 C 2519.983 1285.884 2531.791 1293.128 2533.856 1293.128 C 2536.065 1293.128 2540.484 1295.337 2540.484 1293.128 C 2540.484 1285.394 2542.186 1262.636 2532.53 1262.636 C 2527.916 1262.636 2519.273 1254.045 2519.273 1258.658 C 2519.273 1261.936 2516.06 1273.241 2513.97 1273.241 C 2511.571 1273.241 2486.129 1269.264 2486.129 1269.264"/>
            <path style="stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255);" d="M 2447.683 1240.098 C 2446.674 1243.124 2440.353 1256.632 2443.705 1259.984 C 2453.936 1270.215 2469.163 1281.061 2484.803 1273.241 C 2493.011 1269.138 2493.136 1258.85 2495.409 1252.03 C 2496.419 1248.999 2500.42 1233.177 2498.061 1230.818 C 2486.658 1219.414 2470.862 1223.547 2462.266 1232.144 C 2461.336 1233.073 2450.334 1245.401 2450.334 1245.401"/>
            <path style="stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255);" d="M 2438.402 1323.62 C 2440.9 1331.113 2448.188 1350.135 2458.289 1350.135 C 2465.459 1350.135 2471.643 1348.712 2475.523 1344.832 C 2477.398 1342.957 2478.175 1336.877 2475.523 1336.877 C 2473.458 1336.877 2465.784 1328.463 2463.592 1326.271 C 2453.477 1316.158 2443.705 1337.491 2443.705 1340.854"/>
            <path style="stroke: rgb(0, 0, 0); fill: rgb(255, 164, 31);" d="M 2476.849 1214.909 C 2472.994 1230.332 2468.028 1243.616 2458.289 1253.355 C 2457.302 1254.342 2454.217 1263.866 2451.66 1261.31 C 2441.605 1251.253 2425.976 1238.276 2414.54 1226.84 C 2409.918 1222.219 2404.706 1220.431 2402.608 1216.234 C 2402.352 1215.722 2396.812 1210.931 2397.305 1210.931 C 2415.444 1210.931 2434.566 1225.515 2451.66 1225.515 C 2455.908 1225.515 2474.198 1220.212 2474.198 1220.212"/>
            <path style="stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255);" d="M 2563.022 1370.021 C 2555.257 1393.317 2587.448 1435.184 2604.12 1401.838 C 2605.945 1398.188 2600.492 1389.767 2598.817 1387.255 C 2590.057 1374.115 2585.694 1382.682 2570.977 1375.324 C 2567.531 1373.601 2560.371 1379.301 2560.371 1379.301"/>
            <path style="stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255);" d="M 2480.826 1404.49 C 2486.061 1409.725 2505.279 1425.112 2512.644 1417.747 C 2516.114 1414.277 2519.114 1391.233 2511.318 1391.233 C 2508.79 1391.233 2486.129 1389.519 2486.129 1395.21 C 2486.129 1401.022 2483.478 1412.444 2483.478 1412.444"/>
            <path style="stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255);" d="M 2523.25 1262.636 C 2528.368 1277.989 2543.737 1269.504 2533.856 1254.681 C 2533.281 1253.819 2530.036 1243.918 2528.553 1245.401 C 2525.972 1247.982 2515.031 1259.984 2513.97 1259.984"/>
          </g>
        </a>
      </svg>
    </div>
    <div class="remix">
      <a href="/app/code-module?src=/elves/camp-map.js">
        Goto:Editor
      </a>
    </div>
  `
})

$.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  & .quick-auth {
    background: rgba(0,0,0,.85);
    border-radius: 1rem;
    overflow: hidden;
  }

  & .quick-auth label {
    color: rgba(255,255,255,.65);
    padding: 0 1rem;
    text-transform: uppercase;
    font-size: .85rem;
    font-weight: 800;
  }

  & .control-toggle {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
  }

  & .control {
    display: grid;
    grid-template-columns: 1fr;
  }

  & .control.sidebar {
    grid-template-columns: 320px auto;
  }

  & .control-tab-list {
    display: none;
  }
  & .sidebar .control-tab-list {
    gap: .5rem;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    padding: 1rem;
    overflow: auto;
    background: rgba(255,255,255,.65);
    position: relative;
    z-index: 3;
    overflow-x: hidden;
  }
  & .multiplayer.control-tab-list {
    overflow: hidden;
  }
  & .control-tab {
    display: block;
    border: 0;
    border-radius: 1rem;
    line-height: 1;
    width: 4rem;
    color: white;
    display: block;
    width: 100%;
    text-align: left;
    padding: 1rem;
    color: dodgerblue;
    background: rgba(255,255,255,.85);
    transition: background 200ms ease-in-out;
    flex: none;
  }

  & .control-tab.-active,
  & .control-tab:hover,
  & .control-tab:focus {
    background: dodgerblue;
    color: white;
  }

  & .control-toggle .control-tab {
    display: block;
    border: 0;
    line-height: 1;
    width: 4rem;
    color: white;
    display: block;
    width: 100%;
    text-align: left;
    padding: .5rem;
    color: white;
    font-size: 1rem;
    border-radius: 0 1rem 1rem 0;
    background-image: linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.5));
    background-color: rgba(0,0,0,.5);
    transition: background 200ms ease-in-out;
    flex: none;
  }

  & .control-toggle .control-tab:hover,
  & .control-toggle .control-tab:focus {
    background-color: rgba(0,0,0,.25);
    color: white;
  }


  & .control-view {
    overflow: auto;
    position: relative;
    z-index: 2;
  }

  & .control-avatar {
    max-width: 100%;
    width: 320px;
    pointer-events: none;
  }

  & .control-avatar.show {

  }

  & data-tooltip,
  & xml-html,
  & data-tooltip .control {
    height: 100%;
  }
  & plan98-filesystem,
  & code-module {
    color: black;
  }

  & .heading-label {
    margin-top: 2rem;
    color: rgba(0,0,0,.5);
    text-align: right;
    font-weight: 600;
  }

  & hr {
    border-color: rgba(0,0,0,.05);
  }

  & poker-face {
    display: block;
    height: 280px;
  }

  & img + .heading-label {
    margin-top: 0;
  }

  & [data-sidebar] {
    font-size: 1.5rem;
    font-weight: 800;
    background: transparent;
    padding: 0;
    border: none;
    border-radius: 100%;
    width: 80px;
    height: 80px;
    color: rgba(255,255,255,.5);
    transition: background 200ms ease-in-out;
    display: grid;
    place-content: center;
  }

  & [data-sidebar]:focus,
  & [data-sidebar]:hover {
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
  }

  & iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  & .control-avatar {
  }

  & .control-avatar .auth-button {
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
    background-color: lime;
    color: white;
    display: block;
    border: 0;
    border-radius: 0 0 1rem 1rem;
    line-height: 1;
    width: 4rem;
    width: 100%;
    text-align: left;
    padding: 1rem;
    transition: all 200ms ease-in-out;
    flex: none;
  }

  & .control-avatar [data-disconnect] {
    background-color: orange;
  }


  & .control-avatar button:hover,
  & .control-avatar button:focus {
    background-color: rebeccapurple;
    color: white;
  }

  & .player {
  }

  & .control-avatar .console {
    background: rgba(128,128,128,.5);
    padding-top: 64px;
  }

  & .control-avatar input {
    border: none;
    background: transparent;
    color: rgba(255,255,255,.85);
    padding: .5rem 1rem;
    margin-bottom: .5rem;
    max-width: 100%;
  }

  & .control-avatar .companyName {
    padding: .5rem 1rem;
    margin-bottom: .5rem;
  }
  & .control-avatar .companyEmployeeId {
    padding: .5rem 1rem;
    margin-bottom: .5rem;
  }


  & [data-avatar] {
    max-width: 72px;
    border-radius: 100%;
    overflow: hidden;
    padding: 0;
    aspect-ratio: 1;
    z-index: 10;
    pointer-events: none;
  }

  & .tongue {
    color: rgba(255,255,255,.85);
    transition: opacity 200ms ease-in-out;
    overflow: auto;
    width: 100%;
    pointer-events: all;
  }

  & .tastebuds {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  }

  & .password {
    background: black;
  }

  & .console select {
    background: transparent;
    color: rgba(255,255,255,.85);
    border: none;
    width: 100%;
    display: block;
  }
  & .remix a {
    display: block;
    transform: translate(-0%, 150%) rotateZ(45deg);
  }
`)
