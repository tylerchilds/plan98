import elf from '@plan98/elf'
import * as protomapsL from 'protomaps-leaflet'
import { showPanel } from './plan98-panel.js'

const linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";

const scriptElement = document.createElement("script");
scriptElement.src = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js";

// Append the elements to the document head
document.head.appendChild(linkElement);
document.head.appendChild(scriptElement);

function mount(target) {
  if(target.mounted) return true
  if(window.maplibregl) {
    target.mounted = true
    $.teach({ [target.id]: true })
  } else {
    requestAnimationFrame(() => mount(target))
    return false
  }

  target.map = new maplibregl.Map({
    container: target,
    center: [-122.4580, 37.7691],
    zoom: 13,
    pitch: 60,
    bearing: 0,
    style: `https://api.protomaps.com/styles/v2/light.json?key=${plan98.env.PROTOMAPS_API_KEY}`
  });

  target.map.on('movestart', proxyEvent(target, 'movestart'))
  target.map.on('move', proxyEvent(target, 'move'))
  target.map.on('moveend', proxyEvent(target, 'moveend'))

  setupCompass(target);
  $.teach({ ready: true })
  return true
}

function proxyEvent(target, name) {
  return (event) => {
    target.dispatchEvent(new CustomEvent(name, {
      detail: { 
        event,
        map: target.map,
        root: target,
      }
    }))
  }
}

function setupCompass(target) {
  if ('DeviceOrientationEvent' in window) {
    const handleOrientation = (event) => {
      if (event.alpha !== null) {
        const bearing = 360 - event.alpha; // Compass direction
        target.map.setBearing(bearing);
      }

      // Add pitch control based on device tilt (beta is forward/back tilt)
      if (event.beta !== null) {
        // Beta ranges from -180 to 180
        // When phone is upright (portrait): beta ≈ 0
        // When phone is flat (face up): beta ≈ 0-90
        // We want to adjust pitch so horizon aligns with real world
        const deviceTilt = event.beta;
        // Map device tilt to map pitch (you may need to tune this)
        const mapPitch = Math.max(0, Math.min(85, 60 + (90 - deviceTilt)));
        target.map.setPitch(mapPitch);
      }
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation, true);

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        });
    }
  }
}

const $ = elf('brokemon-go')

$.when('movestart', ({ detail }) => {
  const { fadeTimeoutRef } = $.learn()
  if(fadeTimeoutRef) {
    clearTimeout(fadeTimeoutRef)
  }
  $.teach({ screensaver: false, fadeTimeoutRef: null })
})

$.when('move', ({ detail }) => {
  const { map, event } = detail
  const center = map.getCenter();
  const zoom = map.getZoom();

  $.teach({ center, zoom })
})

$.when('moveend', ({ detail }) => {
  const fadeTimeoutRef = setTimeout(() => {
    $.teach({ screensaver: true })
  }, 1000)
  $.teach({ fadeTimeoutRef })
})

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

  if(ready && target.map && markers.length === 0) {
    sfData.forEach((data, index) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.backgroundColor = 'lemonchiffon';
      el.style.border = '1px solid black';
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([data.longitude, data.latitude])
        .addTo(target.map);

      el.addEventListener('click', (e) => {
        console.log('Marker clicked:', data.name);
        showPanel(`
          <div style="padding: 0 1rem;">
            <div style="color: rgba(0,0,0,.85); font-size: 2rem; font-weight: bold; line-height: 1.2; margin-bottom: 1rem;">
              ${data.name}
            </div>
            <div style="color: rgba(0,0,0,.65)">
              ${data.description}
            </div>
          </div>
        `)
      });

      markers.push(marker);
    });
  }
}, {
  afterUpdate(target) {
    if(target.dataset.screensaver !== $.learn().screensaver) {
      target.dataset.screensaver = $.learn().screensaver
    }
  }
})

$.style(`
  & {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
    transition: opacity 200ms ease-in-out;
  }

  &[data-screensaver="true"] {
    opacity: .1;
    transition: opacity 1000ms ease-in-out;
  }

  & .maplibregl-canvas-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    max-width: 100%;
    max-height: 100%;
  }

  & .marker {
    display: block;
  }
`)
