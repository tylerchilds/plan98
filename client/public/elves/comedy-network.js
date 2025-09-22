import elf from '@silly/elf'
import * as protomapsL from 'protomaps-leaflet'
import { showPanel } from './plan98-panel.js'
import diffHTML from 'diffhtml'

/*

The Comedy Network

A global map of all upcoming shows.

- Via the music, pulls in all performers.
- New Performer
  - A QR Code for them to complete their biography

*/

const linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
linkElement.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
linkElement.crossOrigin = "";

// Create a script element fmr the Leaflet JavaScript
const scriptElement = document.createElement("script");
scriptElement.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
scriptElement.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
scriptElement.crossOrigin = "";

// Append the elements to the document head
document.head.appendChild(linkElement);
document.head.appendChild(scriptElement);

function mount(target) {
	if(target.mounted) return true
	if(window.L) {
		target.mounted = true
    $.teach({ [target.id]: true })
	} else {
		requestAnimationFrame(() => mount(target))
		return false
	}
  const activeMode = target.getAttribute('mode')

  if(activeMode) {
    $.teach({ activeMode })
  }

  target.innerHTML = `
    <div class="map-layer"></div>
    <div class="my-layer"></div>
    <div class="launcher"></div>
    <div class="mode"></div>
  `

  const map = target.querySelector('.map-layer')

	target.map = L.map(map).setView([37.7691, -122.4580], 13);
  const layer = protomapsL.leafletLayer({url:`https://api.protomaps.com/tiles/v3/{z}/{x}/{y}.mvt?key=${plan98.env.PROTOMAPS_API_KEY}`,theme:"light"})
  layer.addTo(target.map)

	const polygon = L.polygon([
		[51.509, -0.08],
		[51.503, -0.06],
		[51.51, -0.047]
	]).addTo(target.map).bindPopup('I am a polygon.');
/*
	const popup = L.popup()
		.setLatLng([37.7691, -122.4580])
		.setContent('<sillonious-brand host="tychi.me"></sillonious-brand>')
		.openOn(map);

	function onMapClick(e) {
		popup
			.setLatLng(e.latlng)
			.setContent(`You clicked the map at ${e.latlng.toString()}`)
			.openOn(map);
	}

	map.on('click', onMapClick);
    */

  $.teach({ ready: true })
  return true
}

const modes = {
  intake: {
    label: 'Intake',
    key: 'intake',
  }
}

const tabs = {
  biography: {
    label: 'Biography',
    key: 'biography',
  },
  schedule: {
    label: 'Schedule',
    key: 'schedule',
  },
  invite: {
    label: 'Invite',
    key: 'invite',
  },
}

const $ = elf('comedy-network', {
  open: false,
  activeTab: tabs.biography.key
})

function modulator(key) {
  const mode = modes[key] || ''
  if(!mode) return
  const { activeMode } = $.learn()
  return `
    <button data-tab="${tab.key}" class="tab ${activeTab === tab.key ? 'active':''}">${tab.label}</button>
  `
}


function tabulature(key) {
  const tab = tabs[key]
  if(!tab) return
  const { activeTab } = $.learn()
  return `
    <button data-tab="${tab.key}" class="tab ${activeTab === tab.key ? 'active':''}">${tab.label}</button>
  `
}

function myBiography(node) {
  const { activeTab } = $.learn()

  diffHTML.innerHTML(node, `
    <div class="tabs">
      ${Object.keys(tabs).map(tabulature).join('')}
    </div>
    <div class="tab-content">
      ${tabRenderer(activeTab)}
    </div>
  `)
}

const modeLookup = {
  intake: () => {
    const {
      banner,
      avatar,
      followersCount,
      followsCount,
      postsCount,
      displayName,
      handle,
      description,
      createdAt
    } = $.learn()

    return `
      Intake Form
    `
  },
}

function modeRenderer(mode) {
  return modeLookup[mode] ? modeLookup[mode]() : 'Mode Not Found'
}


const tabLookup = {
  biography: () => {
    const {
      banner,
      avatar,
      followersCount,
      followsCount,
      postsCount,
      displayName,
      handle,
      description,
      createdAt
    } = $.learn()

    return `
      <div class="profile">
        <div class="hero">
          <img src="${banner}" />
        </div>
        <div class="profile-information">
          <div class="profile-gutter">
            <div class="profile-picture">
              <img src="${avatar}" class="profile-avatar" />
            </div>
          </div>
          <div class="profile-content">
            <div class="profile-stats">
              <div class="stat">
                <div class="stat-value">
                  ${followersCount}
                </div>
                <div class="stat-label">
                  Followers
                </div>
              </div>
              <div class="stat">
                <div class="stat-value">
                  ${followsCount}
                </div>
                <div class="stat-label">
                  Following
                </div>
              </div>
              <div class="stat">
                <div class="stat-value">
                  ${postsCount}
                </div>
                <div class="stat-label">
                  Shows
                </div>
              </div>
            </div>
          </div>
          <div class="profile-contact">
            <div class="profile-displayname">
              ${displayName}
            </div>
            <div class="profile-handle">
              ${handle}
            </div>
            <div class="profile-description">${description}</div>
            <div class="profile-since">
              since: <sl-format-date date="${createdAt}" month="long" year="numeric"></sl-format-date>
            </div>
          </div>
        </div>
      </div>
    `
  },
  schedule: () => {
    return `
      Schedule
    `
  },
  invite: () => {
    return `
      <qr-code src="/app/comedy-network?mode=intake"></qr-code>
    `
  }
}

function tabRenderer(activeTab) {
  return tabLookup[activeTab] ? tabLookup[activeTab]() : 'Tab Not Found'
}

const sfData = [
  {
    "name": "Golden Gate Bridge",
    "latitude": 37.8199,
    "longitude": -122.4783,
    "description": "Iconic suspension bridge offering breathtaking views of the bay and city."
  },
  {
    "name": "Alcatraz Island",
    "latitude": 37.8270,
    "longitude": -122.4230,
    "description": "Historic island prison, accessible via ferry, with a rich history to explore."
  },
  {
    "name": "Fisherman's Wharf",
    "latitude": 37.8080,
    "longitude": -122.4177,
    "description": "Popular waterfront area with seafood restaurants, shops, and sea lions."
  },
  {
    "name": "Golden Gate Park",
    "latitude": 37.7694,
    "longitude": -122.4862,
    "description": "Expansive urban park featuring gardens, museums, and recreational spaces."
  },
  {
    "name": "Lombard Street",
    "latitude": 37.8021,
    "longitude": -122.4187,
    "description": "Famous for its steep, winding section, often called the 'crookedest street.'"
  },
  {
    "name": "Coit Tower",
    "latitude": 37.8024,
    "longitude": -122.4058,
    "description": "Art Deco tower with panoramic city views and historic murals inside."
  },
  {
    "name": "Chinatown Gate",
    "latitude": 37.7909,
    "longitude": -122.4052,
    "description": "Entrance to the oldest Chinatown in North America, filled with culture."
  },
  {
    "name": "Union Square",
    "latitude": 37.7881,
    "longitude": -122.4075,
    "description": "Bustling shopping district with high-end retailers and dining options."
  },
  {
    "name": "Palace of Fine Arts",
    "latitude": 37.8021,
    "longitude": -122.4487,
    "description": "Historic structure and lagoon, great for photos and serene walks."
  },
  {
    "name": "Twin Peaks",
    "latitude": 37.7544,
    "longitude": -122.4477,
    "description": "Offers stunning 360-degree views of San Francisco and surrounding areas."
  }
] 

const markers = []

$.draw((target) => {
  const { ready } = $.learn()
  const { art } = { art: 'sillyz.computer' }
	if(!mount(target)) return

  if(ready && target.map) {
    if(target.marker) {
      target.map.removeLayer(target.marker)
    }

    sfData.map((data, index)=> {
      const gps = [data.latitude, data.longitude]
      const marker = L.marker(gps, { id: index }).addTo(target.map)

      marker.on('click', () => {
        showPanel(`
          <div style="padding: 0 1rem;">
            <div style="color: rgba(0,0,0,.85); font-size: 2rem; font-weight: bold; line-height: 1.2; margin-bottom: 1rem;">
              ${sfData[index].name}
            </div>
            <div style="color: rgba(0,0,0,.65)">
              ${sfData[index].description}
            </div>
          </div>
        `)
      })
    })
  }
}, {
  afterUpdate(target) {
    const { open, activeMode } = $.learn()

    const mode = target.querySelector('.mode')

    if(mode) {
      diffHTML.innerHTML(mode, modeRenderer(activeMode))
    }

    if(activeMode) {
      target.dataset.mode = activeMode
    } else {
      delete target.dataset.mode
    }

    const me = target.querySelector('.my-layer')

    if(me) {
      myBiography(me)
    }

    const launcher = target.querySelector('.launcher')

    if(launcher) {
      diffHTML.innerHTML(launcher, `
        <button class="start" data-launch>
          Start
        </button>
      `)
    }

    target.dataset.open = open
  }
})

$.when('click', '[data-launch]', (event) => {
  const { open } = $.learn()
  $.teach({
    open: !open
  })
})

$.when('click', '[data-tab]', (event) => {
  const { tab } = event.target.dataset
  $.teach({
    activeTab: tab
  })
})



$.style(`
	& {
		display: block;
    position: relative;
		height: 100%;
    width: 100%;
    z-index: 1;
	}

	& .leaflet-container {
		width: 100%;
		max-width: 100%;
		max-height: 100%;
	}

	& .leaflet-popup-content {
		min-width: 240px;
	}

  & .leaflet-popup-content {
    margin: 0;
  }

  & .leaflet-popup-content qr-code {
    width: 33%;
    place-self: center;
  }

  & .leaflet-popup-content-wrapper,
  & .leaflet-popup-tip {
    border-radius: 0;
    background: transparent;
  }

  & .my-layer {
    position: absolute;
    inset: 0;
    overflow: auto;
  }

  & .map-layer {
    position: absolute;
    inset: 0;
  }

  &[data-open="true"] .map-layer {
    display: none;
  }

  &[data-open="false"] .map-layer {
    display: block;
  }

  &[data-open="true"] .my-layer {
    display: block;
  }

  &[data-open="false"] .my-layer {
    display: none;
  }

  & .launcher {
    position: absolute;
    left: .5rem;
    bottom: .5rem;
    z-index: 500;
  }

  & .tabs {
    white-space: nowrap;
    overflow: auto;
    padding: .5rem;
  }

  & .tab {
    background: white;
    pointer-events: all;
    box-shadow: 0 1px 1px 0 rgba(0,0,0,.1),
                0 1px 2px 2px rgba(0,0,0,.05);
    background-size: 1px 100%;
    background-repeat: repeat-x;
    font-weight: 400;
    padding: .5rem;
    transition: background 200ms ease-in-out;
    line-height: 1.25;
    padding: .25rem 1rem;
    color: dodgerblue;
    text-decoration: none;
    display: inline-grid;
    border-radius: 1rem;
    place-items: center start;
    border: none;
  }

  & .tab.active {
    background: rgba(0,0,0,.85);
    color: white;
  }

  & .start {
    background: linear-gradient(rgba(0,0,0,.5) 0%, rgba(0,0,0,.75) 100%), mediumseagreen;
    color: white;
    font-weight: bold;
    pointer-events: all;
    box-shadow: 0 1px 1px 0 rgba(0,0,0,.1),
                0 1px 2px 2px rgba(0,0,0,.05);
    background-size: 1px 100%;
    background-repeat: repeat-x;
    padding: .5rem 1rem;
    border-radius: 1rem;
    transition: background 200ms ease-in-out;
    border: none;
    text-decoration: none;
    display: inline-grid;
    place-items: center start;
  }

  & .mode {
    display: none;
    position: absolute;
    inset: 0;
    overflow: auto;
  }

  &[data-mode] .mode {
    display: block;
    background: white;
    z-index: 9001;
  }
`)


