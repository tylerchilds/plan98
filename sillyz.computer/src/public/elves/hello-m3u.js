import elf from '@silly/tag'
import { parseM3U, writeM3U } from "@iptv/playlist";
import Hls from 'hls.js'

const $ = elf('hello-m3u', { channels: [], start: 0, stop: 0, length: 0 })

$.draw(() => {
  const { channels, start, stop, src } = $.learn()
  const slice = channels.slice(start, stop)
  return `
    <video src="${src}"></video>
    set a m3u, like https://iptv-org.github.io/iptv/index.m3u
    <input>
    <hr>
    ${stop === length ? '': '<button data-next>next</next>'}
    ${start === 0 ? '': '<button data-back>back</button>'}
    ${slice.map(x => {
      return `
        <div>
          <a href="${x.url}" class="launch">
            ${x.name}
          </a>
        </div>
      `
    }).join('')}
  `
}, { afterUpdate })

function afterUpdate(target) {
  {
    const { src } = $.learn()
    if(target.src !== src) {
      const video = target.querySelector('video')
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED,function() {
        video.play();
      });
    }
  }
}

$.when('input', 'input', async (event) => {
  const m3u = await fetch(event.target.value).then(res => res.text()).catch(console.error)
  const { channels } = parseM3U(m3u)
  $.teach({
    channels,
    length: channels.length,
    start: 0,
    stop: channels.length > 10 ? 10 : channels.length
  })
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
