import module from '@silly/tag'
import * as protomapsL from 'protomaps-leaflet'
import { doingBusinessAs } from './sillonious-brand.js'

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
	const popup = L.popup()
		.setLatLng([37.7691, -122.4580])
		.setContent('<sillonious-brand host="tychi.me"></sillonious-brand>')
		.openOn(target.map);
	function onMapClick(e) {
		popup
			.setLatLng(e.latlng)
			.setContent(`You clicked the map at ${e.latlng.toString()}`)
			.openOn(target.map);
	}

	target.map.on('click', onMapClick);
  return true
}
const $ = module('secure-map')

$.draw((target) => {
  $.learn()
  const { art } = state['ls/sillonious-memex'] || { art: 'sillyz.computer' }
	if(!mount(target)) return
  const metadata = doingBusinessAs[art] || doingBusinessAs['sillyz.computer']
  console.log(metadata)

  if(target.marker) {
    target.map.removeLayer(target.marker)
  }

  const gps = [metadata.latitude, metadata.longitude]
  target.marker = L.marker(gps).addTo(target.map)

  target.map.setView(gps, metadata.zoom);
    // Calculate the new center coordinates

  target.marker
    .bindPopup(`<sticky-note><qr-code text="https://${art}"></qr-code></sticky-note>`)
    .openPopup();
})

$.style(`
	& {
		display: block;
		height: 100%;
    width: 100%;
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


