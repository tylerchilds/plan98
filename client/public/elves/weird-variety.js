import elf from '@silly/tag'

const $ = elf('weird-variety')

$.draw((target) => {
  return `
    Hello World
    <mux-player
      stream-type="on-demand"
      playback-id="ckZGO55bYvUb3N9Kx02Saj3gQKMmFbKt00hfy6VFPsWGY"
      metadata-video-id="ckZGO55bYvUb3N9Kx02Saj3gQKMmFbKt00hfy6VFPsWGY"
      metadata-video-title="Living Impaired - Weird Variety Show"
      metadata-viewer-user-id="${target.id}"
    ></mux-player>
  `
})
