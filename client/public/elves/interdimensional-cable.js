import elf from '@silly/tag'
import { parseM3U, writeM3U } from "@iptv/playlist";
import Hls from 'hls.js'

const $ = elf('interdimensional-cable', { status: 'fetching channels', channels: [], start: 0, stop: 0, length: 0 })

state[`ls/${$.link}`] ||= {history: []}

fetch('https://iptv-org.github.io/iptv/index.m3u')
  .then(res => res.text())
  .then((m3u) => {
    const { channels } = parseM3U(m3u)
    $.teach({
      status: 'ready',
      channels,
      length: channels.length,
      start: 0,
      stop: channels.length > 10 ? 10 : channels.length
    })
  }).catch(console.error)

$.when('click', '[data-random]', randomChannel)  
let timeoutTimeout
function randomChannel() {
  clearTimeout(timeoutTimeout)
  const { src, channels, length, retry } = $.learn()
  state[`ls/${$.link}`].history.push(src)
  const station = channels[Math.floor(Math.random() * length)]
  $.teach({ station, status: 'changing station', src: station.url  })

  timeoutTimeout = setTimeout(() => {
    const newRetry = (retry || 0) + 1
    $.teach({
      station,
      retry: newRetry,
      status: 'failed to find, retry attempt: ' + newRetry
    })
    randomChannel()
  }, 5000)
}

$.draw((target) => {
  let { channels, station, status, src, playing } = $.learn()

  src = src ? src : target.getAttribute('src')

  if(status === 'playing') {
    target.querySelector('.status').innerText = status
    const app = window.location.origin + `/app/interdimensional-cable?src=${src}`
    target.querySelector('.keep-watching').innerHTML = `<qr-code data-tooltip="${app}" src="${app}" data-fg="rgba(0,0,0,.65)" data-bg="transparent"></qr-code>`
    return
  }
  if(!channels) return `
    <div class="status">${status?status:''}</div>
  `

  if(!station && !src) {
    return `
      <div class="status">${status?status:''}</div>
      <button data-random>Random</button>
    `
  }
  
  return `
    <div class="status">${status?status:''}</div>
    <button data-random>Random</button>
    <video></video>
    <div class="keep-watching"></div>
  `
}, { afterUpdate })

function afterUpdate(target) {
  const video = target.querySelector('video')
  if(!video) return
  let { src } = $.learn()
  src = src ? src : target.getAttribute('src')

  {
    if(target.src !== src) {
      if(src) target.src = src
      try {
        const hls = new Hls();
        hls.loadSource(target.src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED,function() {
          try {
            clearTimeout(timeoutTimeout)
            video.play();
            $.teach({ retry: 0 })
          } catch (e) {
            $.teach({ status: 'error' })
          }
        });
        $.teach({ status: 'playing', src: target.src })
      } catch (e) {
        randomChannel()
      }
    }
  }

}

$.when('error', 'video', () => {
  $.teach({ status: 'video error, shuffling in 5' })
  setTimeout(randomChannel, 5000)
})

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

  & .keep-watching {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 1rem;
    width: 320px;
    height: 320px;
    opacity: 1;
  }

  @keyframes &-fade-out {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }

  }

  & .keep-watching:not(:empty) {
    animation: &-fade-out 2500ms ease-out 10000ms forwards;
    background: rgba(255,255,255,.65);
  }

  & .status {
    position: absolute;
    border: none;
    top: 0;
    right: 0;
    height: 2rem;
    line-height: 2rem;
    background: black;
    color: rgba(255,255,255,.65);
    padding: 0 1rem;
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

function schedule(x, delay=1) { setTimeout(x, delay) }
