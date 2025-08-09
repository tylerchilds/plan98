import elf from '@silly/elf'
import * as protomapsL from 'protomaps-leaflet'
import { showPanel } from './plan98-panel.js'

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

	target.map = L.map(target).setView([37.7691, -122.4580], 13);
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
const $ = elf('world-map')

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
`)


