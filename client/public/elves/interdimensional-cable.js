import elf from '@silly/tag'
import { parseM3U, writeM3U } from "@iptv/playlist";
import Hls from 'hls.js'


const $ = elf('interdimensional-cable', { channels: [], start: 0, stop: 0, length: 0 })

state[`ls/${$.link}`] ||= {history: []}

fetch('https://iptv-org.github.io/iptv/index.m3u')
  .then(res => res.text())
  .then((m3u) => {
    const { channels } = parseM3U(m3u)
    $.teach({
      channels,
      length: channels.length,
      start: 0,
      stop: channels.length > 10 ? 10 : channels.length
    })
  }).catch(console.error)

$.when('click', '[data-random]', randomChannel)  
function randomChannel() {
  const { src, channels, length } = $.learn()
  state[`ls/${$.link}`].history.push(src)
  const station = channels[Math.floor(Math.random() * length)]
  $.teach({ station })
}

$.draw(() => {
  const { channels, station } = $.learn()
  if(!channels) return '...'

  if(!station) {
    return `<button data-random>Random</button>`
  }
  
  return `
    <video src="${station.url}"></video>
    <button data-random>Random</button>
  `
}, { afterUpdate })

function afterUpdate(target) {
  {
    const { station } = $.learn()
    if(station && target.src !== station.url) {
      const video = target.querySelector('video')
      const hls = new Hls();
      hls.loadSource(station.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED,function() {
        video.play();
      });
    }
  }
}

$.when('input', 'input', async (event) => {
  })

$.when('click', '.launch', (event) => {
  event.preventDefault()
  $.teach({ src: event.target.href })
})

$.when('click', '[data-next]', (event) => {
  let { start, stop, length } = $.learn()

  start = start + 10 < length ? start + 10 : length
  stop = stop + 10 < length ? stop + 10 : length

  $.teach({ start, stop })
})

$.when('click', '[data-back]', (event) => {
  let { start, stop } = $.learn()
  start = start - 10 < 0 ? 0 : start - 10
  stop = stop - 10 < 0 ? 0 : stop - 10


  $.teach({ start, stop })
})

$.style(`
  & {
    display: grid;
    background: black;
    place-content: center;
    height: 100%;

  }

  & [data-random] {
    position: absolute;
    border: none;
    top: 0;
    left: 0;
    height: 2rem;
    line-height: 1;
    background: black;
    color: rgba(255,255,255,.65);
  }
`)
