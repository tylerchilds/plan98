import module from '@sillonious/module'
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
	if(target.mounted) return
	if(window.L) {
		target.mounted = true
	} else {
		requestAnimationFrame(() => mount(target))
		return false
	}

	const map = target.map = L.map(target).setView([37.7691, -122.4580], 13);

	const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

	const polygon = L.polygon([
		[51.509, -0.08],
		[51.503, -0.06],
		[51.51, -0.047]
	]).addTo(map).bindPopup('I am a polygon.');
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
  return true
}
const $ = module('middle-earth')

$.draw((target) => {
  const { art } = state['ls/sillonious-memex'] || { art: 'sillyz.computer' }

	if(!mount(target)) return
  const metadata = doingBusinessAs[art] || doingBusinessAs['sillyz.computer']
  console.log(metadata)

  const gps = [metadata.latitude, metadata.longitude]
  L.marker(gps).addTo(target.map)
    .bindPopup(`<qr-code text="https://${art}"></qr-code>`)
    .openPopup();
  target.map.setView(gps, metadata.zoom);
})

$.style(`
	& {
		display: block;
		height: 100vmin;
	}

	& .leaflet-container {
		width: 100%;
		max-width: 100%;
		max-height: 100%;
	}

	& .leaflet-popup-content {
		min-width: 240px;
    min-height: 240px;
    display: grid;
	}

  & .leaflet-popup-content-wrapper,
  & .leaflet-popup-tip {
    border-radius: 0;
    border: 10px solid black;
    background: rgba(255,255,255,.85);
  }
`)


