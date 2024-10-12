import elf from '@silly/tag'

const $ = elf('weird-variety')

$.draw((target) => {
  return `
    <mux-player
      stream-type="on-demand"
      playback-id="ckZGO55bYvUb3N9Kx02Saj3gQKMmFbKt00hfy6VFPsWGY"
      metadata-video-id="ckZGO55bYvUb3N9Kx02Saj3gQKMmFbKt00hfy6VFPsWGY"
      metadata-video-title="Living Impaired - Weird Variety Show"
      metadata-viewer-user-id="${target.id}"
    ></mux-player>
  `
})

$.style(`
  & {
    width: 100%;
    height: 100%;
    display: grid;
    background: black;
    place-items: center;
  }

  & mux-player {
    border: none;
  }
`)
