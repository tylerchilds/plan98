/*

In the beginning, Dog gave man the gift of sequential images,
and called it animation.

Dog also gave man the ability to draw with friends,
to key out colors,
and to rotoscope over moving pictures.

Multiplayer architecture — v-log pattern:

  SHARED (travels over WebRTC via @plan98/elf):
    frames[]          — ordered frame id array
    frameStrokes{}    — { [frameId]: stroke[][] } plain JSON, replayed locally
    players[pid]      — presence: color, cursorX/Y, frameId, activelyDrawing, currentStroke
    canvasW/H, fps, loopMode

  NOTE: `current` is NO LONGER shared state. Each peer tracks their own
  viewport position via target._localCurrent. players[pid].frameId is the
  presence signal used for reel dots and cursor visibility.

  LOCAL ONLY (never in elf state):
    target._localCurrent              — this peer's current frame index
    db[frameId].drawCanvas            — pixel canvas, rebuilt from frameStrokes on-demand
    db[frameId].videoCanvas           — extracted video frame pixels
    db[frameId].hasVideo

*/

import elf from '@plan98/elf'
import { Integer } from '@plan98/types'
import Chromakey from './chroma-key.js'
import './plan98-palette.js'

const tag = 'flip-book'
const playerId = self.crypto.randomUUID()

/*

db — local per peer. ensureFrame() creates it on first encounter of an id.
When a remote frame id arrives that we haven't seen, ensureFrame + replayStrokes.

*/

const db = {}

function ensureFrame(id, w, h) {
  if (db[id]) return db[id]
  const drawCanvas  = document.createElement('canvas')
  const videoCanvas = document.createElement('canvas')
  drawCanvas.width  = videoCanvas.width  = w
  drawCanvas.height = videoCanvas.height = h
  db[id] = { id, drawCanvas, videoCanvas, hasVideo: false, children: null, childIndex: 0 }
  return db[id]
}

/*

replayStrokes — draw all committed strokes for a frame onto its local drawCanvas.
Called whenever frameStrokes changes for a frame (peer committed a stroke).

*/

function replayStrokes(frameId) {
  const { frameStrokes, canvasW, canvasH } = $.learn()
  const f = ensureFrame(frameId, canvasW, canvasH)
  const ctx = f.drawCanvas.getContext('2d')
  ctx.clearRect(0, 0, canvasW, canvasH)
  const strokes = frameStrokes[frameId] || []
  strokes.forEach(stroke => drawStroke(ctx, stroke))
}

/*

Presets, thicknoids, palette.

*/

const PRESETS = [
  { label: '8×8',    w: 8,    h: 8    },
  { label: '16×16',  w: 16,   h: 16   },
  { label: '32×32',  w: 32,   h: 32   },
  { label: '64×64',  w: 64,   h: 64   },
  { label: '88×31',  w: 88,   h: 31   },
  { label: '120×60', w: 120,  h: 60   },
  { label: '240×60', w: 240,  h: 60   },
  { label: 'HD',     w: 1280, h: 720  },
  { label: 'FHD',    w: 1920, h: 1080 },
  { label: '4K',     w: 3840, h: 2160 },
  { label: '1:1',    w: 1080, h: 1080 },
  { label: '9:16',   w: 1080, h: 1920 },
]

const thicknoids = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096]

const TOOLS = { draw: 'draw', pen: 'pen', erase: 'erase', fill: 'fill', pan: 'pan' }
const VIEWS = { brush: 'brush', canvas: 'canvas', settings: 'settings', export: 'export' }

/*

State. current is removed from shared state — each peer owns their viewport.

*/

const $ = elf(tag, {
  // shared frame data
  frames:             [],    // string[] — frame ids in order
  frameStrokes:       {},    // { [frameId]: stroke[][] }

  // canvas config
  canvasW:            320,
  canvasH:            240,

  // drawing config (local preference — also shared so peers see your color)
  tool:               TOOLS.draw,
  color:              '#ebdbb2',
  fillColor:          '#d79921',
  colorTarget:        'stroke',  // 'stroke' | 'fill'
  opacity:            1,
  thickness:          8,

  // playback
  onion:              true,
  zoom:               2,
  panX:               0,
  panY:               0,
  playing:            false,
  fps:                12,
  loopMode:           'loop',

  // UI
  menuOpen:           false,
  view:               null,
  showOverlay:        false,

  // chromakey
  chromakeyEnabled:   false,
  chromakeyColor:     '#00b140',
  chromakeyTolerance: 30,

  // toolbelt drag
  beltGrabbed:        false,
  beltDragged:        false,
  beltOffsetX:        0,
  beltOffsetY:        0,
  grabStartX:         undefined,
  grabStartY:         undefined,

  // players map — player-namespaced, set via mergePlayer
  players:            {},
})

/*

mergePlayer — v-log pattern exactly.
Updates players[pid] without touching anyone else's state.

*/

function mergePlayer(pid) {
  return (state, payload) => ({
    ...state,
    players: {
      ...state.players,
      [pid]: { ...state.players[pid], ...payload }
    }
  })
}

/*

appendStrokeMerge — uses mergeHandler+parameters pattern so the function
survives plan98 QuickJS serialization.

*/

function appendStrokeMerge(frameId) {
  return (state, stroke) => ({
    ...state,
    frameStrokes: {
      ...state.frameStrokes,
      [frameId]: [...(state.frameStrokes[frameId] || []), stroke]
    }
  })
}

/*

Style.

*/

$.style(`
  & {
    display: block; width: 100%; height: 100%;
    background: #1d2021; color: #ebdbb2;
    font-family: 'DM Mono', 'Courier New', monospace;
    overflow: hidden; position: relative; touch-action: none;
  }
  & * { box-sizing: border-box; }
  & .app { display: grid; grid-template-rows: 1fr auto; height: 100%; width: 100%; }

  & .artboard { position: relative; overflow: hidden; background: #1c1c1c; }
  & .artboard-inner { position: absolute; transform-origin: 0 0; }
  & .artboard-inner::before {
    content: ''; position: absolute; inset: 0;
    background-image:
      linear-gradient(45deg, #262626 25%, transparent 25%),
      linear-gradient(-45deg, #262626 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #262626 75%),
      linear-gradient(-45deg, transparent 75%, #262626 75%);
    background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0;
    background-color: #1d2021; z-index: 0;
  }

  & .onion-layer { position: absolute; top: 0; left: 0; pointer-events: none; image-rendering: pixelated; }

  & .output-canvas {
    display: block; image-rendering: pixelated; position: relative; z-index: 10;
    touch-action: none; user-select: none; -webkit-user-select: none;
  }

  /* player presence canvases — one per remote peer, same-frame only */
  & .player-canvases { position: absolute; inset: 0; pointer-events: none; z-index: 11; }
  & .player-canvas { position: absolute; top: 0; left: 0; pointer-events: none; image-rendering: pixelated; }

  /* cursor label for each remote player */
  & .player-cursor {
    position: absolute; pointer-events: none; z-index: 30;
    transform: translate(-2px, -2px);
  }
  & .player-cursor .dot {
    width: 8px; height: 8px; border-radius: 50%;
    border: 1px solid rgba(0,0,0,.5);
  }
  & .player-cursor .label {
    position: absolute; left: 10px; top: -2px;
    font-size: .5rem; white-space: nowrap;
    background: rgba(0,0,0,.7); padding: 1px 4px; border-radius: 2px;
    color: white;
  }

  & .drop-overlay {
    display: none; position: absolute; inset: 0; z-index: 30;
    background: rgba(215,153,33,.15); border: 3px dashed #d79921;
    align-items: center; justify-content: center;
    font-size: 1.2rem; color: #fabd2f; pointer-events: none;
  }
  & .drop-overlay.active { display: flex; }

  /* ── FILM REEL ── */
  & .film-reel {
    background: #1d2021; border-top: 1px solid #3c3836;
    display: flex; align-items: center; gap: 6px;
    padding: 6px 8px; overflow-x: auto; overflow-y: hidden;
    height: 80px; flex-shrink: 0;
  }
  & .film-reel::-webkit-scrollbar { height: 3px; }
  & .film-reel::-webkit-scrollbar-thumb { background: #504945; border-radius: 2px; }

  & .reel-add {
    flex-shrink: 0; width: 52px; height: 60px;
    border: 1px dashed #504945; background: transparent;
    color: #665c54; font-size: 1.2rem; cursor: pointer;
    border-radius: 2px; display: grid; place-items: center; transition: all 80ms;
  }
  & .reel-add:hover { border-color: #d79921; color: #fabd2f; }

  & .reel-frame {
    flex-shrink: 0; position: relative; cursor: pointer;
    border: 2px solid #3c3836; border-radius: 2px;
    overflow: hidden; background: #282828; height: 60px; transition: border-color 80ms;
  }
  & .reel-frame:hover { border-color: #7c6f64; }
  & .reel-frame.active { border-color: #fabd2f; }
  & .reel-frame canvas { display: block; height: 100%; width: auto; image-rendering: pixelated; pointer-events: none; }
  & .reel-num { position: absolute; bottom: 1px; left: 3px; font-size: .45rem; color: #665c54; pointer-events: none; }
  & .reel-frame.active .reel-num { color: #fabd2f; }
  & .reel-del {
    position: absolute; top: 1px; right: 1px; width: 12px; height: 12px;
    background: rgba(29,32,33,.85); border: none; color: #665c54; font-size: .5rem;
    cursor: pointer; border-radius: 1px; display: none; place-items: center; z-index: 4;
  }
  & .reel-frame:hover .reel-del { display: grid; }
  & .reel-del:hover { color: #fb4934; }

  & .reel-menu {
    position: fixed; z-index: 1000;
    display: flex; flex-direction: column; gap: 3px;
    background: #1d2021; border: 1px solid #504945;
    border-radius: 3px; padding: 3px; box-shadow: 0 4px 12px rgba(0,0,0,.5);
  }
  & .reel-menu-btn {
    background: #3c3836; border: 1px solid #504945; color: #a89984;
    font-family: 'DM Mono', monospace; font-size: .6rem;
    padding: .3rem .6rem; cursor: pointer; border-radius: 2px;
    text-align: left; white-space: nowrap; transition: all 80ms;
  }
  & .reel-menu-btn:hover { border-color: #d79921; color: #fabd2f; }
  & .reel-menu-btn.-danger:hover { border-color: #fb4934; color: #fb4934; }

  /* player presence dots on reel frames */
  & .reel-player-dots {
    position: absolute; top: 1px; right: 14px;
    display: flex; gap: 2px; pointer-events: none;
  }
  & .reel-player-dot { width: 5px; height: 5px; border-radius: 50%; }

  & .reel-badge { position: absolute; top: 1px; left: 3px; font-size: .4rem; pointer-events: none; }

  /* ── CORNER TASKBARS ── */
  & .taskbar {
    position: absolute; left: 0; right: 0; z-index: 5; padding: .5rem;
    display: grid; grid-template-columns: 1fr auto 1fr; gap: .5rem; pointer-events: none;
  }
  & .taskbar.-top { top: 0; }
  & .taskbar.-bottom { bottom: 0; }
  & .taskbar button, & .taskbar .right { pointer-events: all; }
  & .taskbar .right { display: flex; justify-content: flex-end; align-items: center; }

  & .corner-btn {
    background: rgba(29,32,33,.75); border: 1px solid #3c3836; color: #a89984;
    font-family: 'DM Mono', monospace; font-size: .65rem;
    padding: .25rem .5rem; cursor: pointer; border-radius: 2px;
    backdrop-filter: blur(4px); transition: all 80ms; white-space: nowrap;
  }
  & .corner-btn:hover { border-color: #d79921; color: #fabd2f; }

  & .zoom-widget {
    display: inline-flex; align-items: center; gap: 0;
    background: rgba(29,32,33,.75); border: 1px solid #3c3836;
    border-radius: 2px; backdrop-filter: blur(4px); overflow: hidden;
  }
  & .zoom-btn {
    background: transparent; border: none; color: #a89984;
    font-family: 'DM Mono', monospace; font-size: .8rem;
    padding: .2rem .4rem; cursor: pointer; line-height: 1; flex-shrink: 0;
    transition: all 80ms;
  }
  & .zoom-btn:hover { background: rgba(215,153,33,.15); color: #fabd2f; }
  & .zoom-label {
    background: transparent; border: none; border-left: 1px solid #3c3836; border-right: 1px solid #3c3836;
    color: #665c54; font-family: 'DM Mono', monospace; font-size: .6rem;
    padding: .2rem .35rem; cursor: pointer; display: flex; align-items: center; gap: .25rem;
    transition: color 80ms, border-color 80ms; white-space: nowrap;
  }
  & .zoom-label:hover { color: #fabd2f; border-color: #d79921; }
  & .zoom-sep { color: #3c3836; }
  & [data-zoom-lbl] { display: inline-block; min-width: 3.2em; text-align: right; font-variant-numeric: tabular-nums; }
  & [data-dim-lbl]  { display: inline-block; min-width: 5.5em; font-variant-numeric: tabular-nums; }

  /* ── COMPASS TOOLBELT — v-log pattern ── */
  &[data-belt="true"] .artboard *, &[data-belt="true"] .taskbar {
    pointer-events: none !important;
  }
  &[data-belt="true"] .toolbelt-actions [data-menu] { pointer-events: all !important; }

  & .toolbelt-actions {
    position: absolute; bottom: 80px; right: 0; z-index: 20; padding: .5rem;
    display: inline-block;
    transform: translate(var(--belt-offset-x, 0px), var(--belt-offset-y, 0px));
    pointer-events: none; touch-action: none; user-select: none;
  }
  & .toolbelt-actions button { pointer-events: all; }

  & .the-compass {
    display: grid;
    grid-template-columns: repeat(6, calc(100% / 6));
    grid-template-rows: repeat(6, calc(100% / 6));
    aspect-ratio: 1; width: 10rem; height: 10rem; pointer-events: none;
  }
  & .the-compass button {
    position: relative; overflow: hidden; touch-action: manipulation;
    border-radius: 100%; color: #ebdbb2; border: 1px solid #d79921;
    background: #1d2021;
    pointer-events: all; cursor: pointer; padding: 0; transition: background 80ms, opacity 80ms, transform 80ms;
  }
  & .the-compass button:hover { background: rgba(215,153,33,.25); color: #fabd2f; }
  & .the-compass button.active { background: #d79921; color: #282828; }

  /* petals hidden when compass closed */
  & .the-compass[data-open="false"] button:not(.root) {
    opacity: 0; pointer-events: none; transform: scale(0.5);
  }
  & .the-compass[data-open="true"] button:not(.root) {
    opacity: 1; pointer-events: all; transform: scale(1);
  }
  & .the-compass button * { pointer-events: none; }
  & .the-compass button .icon {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; line-height: 1; z-index: 2; pointer-events: none;
  }
  & .the-compass .root {
    grid-row: 3 / 5; grid-column: 3 / 5;
    background-color: #1d2021; border-width: 2px; border-color: #fabd2f; color: #fabd2f; cursor: grab;
  }
  & .the-compass .root .icon { font-size: 1.3rem; }
  & .the-compass .plus-2  { grid-row: 3 / 5; grid-column: 5 / 7; }
  & .the-compass .minus-2 { grid-row: 3 / 5; grid-column: 1 / 3; }
  & .the-compass .minus-7 { grid-row: 1 / 3; grid-column: 2 / 4; transform: translateY(13%); }
  & .the-compass .plus-7  { grid-row: 1 / 3; grid-column: 4 / 6; transform: translateY(13%); }
  & .the-compass .minus-5 { grid-row: 5 / 7; grid-column: 2 / 4; transform: translateY(-13%); }
  & .the-compass .plus-5  { grid-row: 5 / 7; grid-column: 4 / 6; transform: translateY(-13%); }

  /* ── OVERLAY ── */
  & .overlay-area {
    display: none; position: absolute; inset: 0; z-index: 50;
    background: rgba(29,32,33,.92); overflow: auto; backdrop-filter: blur(6px);
  }
  & .overlay-area.open { display: flex; flex-direction: column; }
  & .overlay-inner { max-width: 380px; margin: 3rem auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
  & .overlay-title { font-size: .6rem; letter-spacing: .12em; text-transform: uppercase; color: #665c54; margin-bottom: .25rem; }
  & .overlay-close {
    position: absolute; top: .75rem; right: .75rem; background: transparent;
    border: 1px solid #504945; color: #665c54; width: 28px; height: 28px;
    border-radius: 2px; cursor: pointer; font-size: .9rem; display: grid; place-items: center;
  }
  & .overlay-close:hover { color: #ebdbb2; border-color: #928374; }

  & input[type=color] { width: 100%; height: 28px; border: 1px solid #504945; background: #3c3836; cursor: pointer; border-radius: 2px; padding: 2px; }
  & input[type=range] { accent-color: #d79921; width: 100%; }

  & .thicknoid-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; }
  & .thicknoid-btn {
    padding: .3rem .1rem; font-family: 'DM Mono', monospace; font-size: .6rem;
    background: #3c3836; border: 1px solid #504945; color: #928374;
    cursor: pointer; border-radius: 2px; text-align: center; transition: all 80ms;
  }
  & .thicknoid-btn:hover { border-color: #d79921; color: #ebdbb2; }
  & .thicknoid-btn.active { border-color: #d79921; color: #fabd2f; background: rgba(215,153,33,.12); }

  & .opacity-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 3px; }
  & .opacity-btn {
    padding: .25rem .1rem; font-family: 'DM Mono', monospace; font-size: .6rem;
    background: #3c3836; border: 1px solid #504945; color: #928374;
    cursor: pointer; border-radius: 2px; text-align: center; transition: all 80ms;
  }
  & .opacity-btn:hover { border-color: #d79921; color: #ebdbb2; }
  & .opacity-btn.active { border-color: #d79921; color: #fabd2f; background: rgba(215,153,33,.12); }

  & .preset-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
  & .preset-btn {
    padding: .3rem .15rem; font-family: 'DM Mono', monospace; font-size: .55rem;
    background: #3c3836; border: 1px solid #504945; color: #928374;
    cursor: pointer; border-radius: 2px; text-align: center; transition: all 80ms;
  }
  & .preset-btn:hover { border-color: #d79921; color: #ebdbb2; }
  & .preset-btn.active { border-color: #d79921; color: #fabd2f; background: rgba(215,153,33,.12); }

  & .dims-row { display: flex; gap: 4px; align-items: center; }
  & .dims-row input { width: 60px; background: #3c3836; border: 1px solid #504945; color: #ebdbb2; font-family: 'DM Mono', monospace; font-size: .7rem; padding: .25rem .3rem; border-radius: 2px; }
  & .dims-row span { font-size: .65rem; color: #665c54; }

  & .row-btn {
    padding: .3rem .6rem; background: #3c3836; border: 1px solid #504945; color: #a89984;
    font-family: 'DM Mono', monospace; font-size: .65rem; cursor: pointer;
    border-radius: 2px; transition: all 80ms; width: 100%; text-align: left;
  }
  & .row-btn:hover { border-color: #d79921; color: #fabd2f; }
  & .row-btn.active { background: #d79921; color: #282828; border-color: #d79921; }

  & .tl-select { background: #3c3836; border: 1px solid #504945; color: #ebdbb2; font-family: 'DM Mono', monospace; font-size: .7rem; padding: .2rem .3rem; border-radius: 2px; cursor: pointer; width: 100%; }
  & .field-row { display: flex; align-items: center; gap: .5rem; }
  & .field-row label { font-size: .6rem; color: #928374; white-space: nowrap; min-width: 4rem; }
  & .ck-color-row { display: flex; gap: .5rem; align-items: center; }
  & .ck-preview { width: 28px; height: 28px; border-radius: 3px; border: 1px solid #504945; flex-shrink: 0; }

  & .darkroom { display: none; position: fixed; inset: 0; background: rgba(29,32,33,.97); z-index: 100; flex-direction: column; align-items: center; justify-content: center; gap: 1.25rem; }
  & .darkroom.open { display: flex; }
  & .dr-canvas { image-rendering: pixelated; cursor: zoom-in; max-width: 88vw; max-height: 65vh; }
  & .dr-canvas.zoomed { cursor: zoom-out; transform: scale(var(--dr-zoom, 1)); }
  & .dr-controls { display: flex; align-items: center; gap: .75rem; }
  & .dr-btn { background: #3c3836; border: 1px solid #504945; color: #a89984; font-family: 'DM Mono', monospace; font-size: .7rem; padding: .3rem .65rem; cursor: pointer; border-radius: 2px; transition: all 80ms; }
  & .dr-btn:hover { border-color: #d79921; color: #fabd2f; }
  & .dr-btn.active { background: #d79921; color: #282828; border-color: #d79921; }
  & .dr-counter { font-size: .65rem; color: #665c54; min-width: 4rem; text-align: center; }
  & .dr-close { position: absolute; top: .75rem; right: .75rem; background: transparent; border: 1px solid #504945; color: #665c54; width: 28px; height: 28px; border-radius: 2px; cursor: pointer; font-size: .9rem; display: grid; place-items: center; }
  & .dr-close:hover { color: #ebdbb2; border-color: #928374; }
  & .dr-title { font-size: .65rem; color: #928374; letter-spacing: .08em; }

  & .sub-overlay { position: fixed; inset: 0; background: rgba(29,32,33,.95); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
  & .sub-title { font-size: .65rem; color: #fe8019; letter-spacing: .1em; }
  & .sub-controls { display: flex; gap: .5rem; align-items: center; }

  & .import-progress { position: absolute; inset: 0; z-index: 40; background: rgba(29,32,33,.9); display: none; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
  & .import-progress.active { display: flex; }
  & .import-bar-outer { width: 200px; height: 6px; background: #3c3836; border-radius: 3px; overflow: hidden; }
  & .import-bar-inner { height: 100%; background: #d79921; border-radius: 3px; width: 0%; }
  & .import-label { font-size: .65rem; color: #928374; }

  & ::-webkit-scrollbar { width: 3px; height: 3px; }
  & ::-webkit-scrollbar-thumb { background: #504945; border-radius: 2px; }
`)

/*

Draw — afterUpdate boots once, update() is minimal.

*/

$.draw(target => {
  if (target._mounted) return update(target)
  return mount(target)
}, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
  target.dataset.belt = $.learn().beltGrabbed ? 'true' : 'false'
}

function toolIcon(t) {
  return { draw: '✏', pen: '🖊', erase: '⬜', fill: '⬛', pan: '✋' }[t] || '✏'
}
function nextTool(t) {
  const o = [TOOLS.draw, TOOLS.pen, TOOLS.erase, TOOLS.fill, TOOLS.pan]
  return o[(o.indexOf(t) + 1) % o.length]
}

function mount(target) {
  const { canvasW, canvasH } = $.learn()
  return `
    <div class="app">
      <div class="artboard" data-artboard>
        <div class="artboard-inner" data-artboard-inner>
          <canvas class="output-canvas" data-output-canvas></canvas>
          <div class="player-canvases" data-player-canvases></div>
        </div>
        <div class="drop-overlay" data-drop-overlay>↓ drop video to import frames</div>
        <div class="import-progress" data-import-progress>
          <div class="import-label" data-import-label>extracting frames…</div>
          <div class="import-bar-outer"><div class="import-bar-inner" data-import-bar></div></div>
        </div>
        <div class="taskbar -top">
          <div class="left"><button class="corner-btn" data-open-view="settings">⚙ settings</button></div>
          <div class="center"></div>
          <div class="right">
            <div class="zoom-widget">
              <button class="zoom-btn" data-zoom-out>−</button>
              <button class="zoom-label" data-open-view="canvas">
                <span data-zoom-lbl>200%</span>
                <span class="zoom-sep">|</span>
                <span data-dim-lbl>${canvasW}×${canvasH}</span>
              </button>
              <button class="zoom-btn" data-zoom-in>+</button>
            </div>
          </div>
        </div>
        <div class="taskbar -bottom">
          <div class="left"><button class="corner-btn" data-new-frame>+ frame</button></div>
          <div class="center"></div>
          <div class="right"><button class="corner-btn" data-darkroom-open>▶ play</button></div>
        </div>
        <div class="toolbelt-actions" data-toolbelt>
          <div class="the-compass">
            <button data-menu data-drag class="root"><span class="icon" data-root-icon>✏</span></button>
            <button class="minus-7" data-open-view="color"><span class="icon" data-color-icon></span></button>
            <button class="plus-7" data-open-view="brush"><span class="icon">≡</span></button>
            <button class="plus-2" data-redo><span class="icon">↷</span></button>
            <button class="plus-5" data-open-view="export"><span class="icon">↓</span></button>
            <button class="minus-5" data-cycle-tool><span class="icon" data-cycle-icon>🖊</span></button>
            <button class="minus-2" data-undo><span class="icon">↶</span></button>
          </div>
        </div>
        <div class="overlay-area" data-overlay>
          <div class="overlay-inner" data-overlay-inner></div>
          <button class="overlay-close" data-close-overlay>✕</button>
        </div>
      </div>
      <div class="film-reel" data-film-reel>
        <button class="reel-add" data-new-frame>+</button>
      </div>
    </div>
    <div class="darkroom" data-darkroom>
      <button class="dr-close" data-darkroom-close>✕</button>
      <div class="dr-title" data-dr-title>flipbook</div>
      <canvas class="dr-canvas" data-dr-canvas></canvas>
      <div class="dr-controls">
        <button class="dr-btn" data-dr-prev>‹ prev</button>
        <button class="dr-btn active" data-dr-play>⏸ pause</button>
        <button class="dr-btn" data-dr-next>next ›</button>
        <span class="dr-counter" data-dr-counter>1 / 1</span>
        <span style="font-size:.6rem;color:#665c54">click to zoom</span>
      </div>
    </div>
  `
}

/*

update() — only belt position + compass icons.
Reel and cursor overlays are updated imperatively when data changes.

*/

function update(target) {
  const { beltOffsetX, beltOffsetY, tool, color, menuOpen } = $.learn()
  const toolbelt = target.querySelector('[data-toolbelt]')
  if (toolbelt) toolbelt.style.cssText = `--belt-offset-x:${beltOffsetX}px;--belt-offset-y:${beltOffsetY}px;`
  const compass = target.querySelector('.the-compass')
  if (compass) compass.dataset.open = menuOpen ? 'true' : 'false'
  const ri = target.querySelector('[data-root-icon]'); if (ri) ri.textContent = toolIcon(tool)
  const ci = target.querySelector('[data-cycle-icon]'); if (ci) ci.textContent = toolIcon(nextTool(tool))
  const colorIcon = target.querySelector('[data-color-icon]')
  if (colorIcon) {
    colorIcon.style.cssText = color === 'transparent'
      ? 'position:absolute;inset:20%;border-radius:50%;background:repeating-conic-gradient(#504945 0% 25%,#3c3836 0% 50%) 0 0/8px 8px;display:block;'
      : `position:absolute;inset:20%;border-radius:50%;background:${color};display:block;`
  }
  return null
}

function afterUpdate(target) {
  if (!target._mounted) { target._mounted = true; boot(target); return }
  // fires on every elf state change — drives frame/stroke sync
  if (target._onStateChange) target._onStateChange()
}

/*

Boot.
Does NOT overwrite frames if they already exist in shared state (peer joined late).
Instead, syncs local db to whatever frames are already there.

*/

function boot(target) {
  const { canvasW, canvasH, frames } = $.learn()

  // ── local viewport position — never shared ──
  target._localCurrent = 0

  target._artboard        = target.querySelector('[data-artboard]')
  target._artboardInner   = target.querySelector('[data-artboard-inner]')
  target._outputCanvas    = target.querySelector('[data-output-canvas]')
  target._playerCanvasCtr = target.querySelector('[data-player-canvases]')
  target._darkroom        = target.querySelector('[data-darkroom]')
  target._drCanvas        = target.querySelector('[data-dr-canvas]')
  target._onionCanvases   = []
  target._playerCanvasMap = {}
  target._chromakey       = new Chromakey()

  target._drawCanvas  = document.createElement('canvas')
  target._videoCanvas = document.createElement('canvas')
  target._drawCanvas.width  = target._videoCanvas.width  = canvasW
  target._drawCanvas.height = target._videoCanvas.height = canvasH

  initCanvas(target, canvasW, canvasH)

  if (frames.length === 0) {
    // First peer — create the first frame
    const f0 = crypto.randomUUID()
    ensureFrame(f0, canvasW, canvasH)
    $.teach({ frames: [f0], frameStrokes: { [f0]: [] } })
    teachPlayer({ frameId: f0 })
  } else {
    // Late-joining peer — ensure all existing frames exist locally, replay their strokes
    frames.forEach(id => {
      ensureFrame(id, canvasW, canvasH)
      replayStrokes(id)
    })
    target._localCurrent = 0
    teachPlayer({ frameId: frames[0] })
  }

  loadCurrentFrame(target)
  fitZoom(target)
  renderReel(target)

  // start compass closed
  const compass = target.querySelector('.the-compass')
  if (compass) compass.dataset.open = 'false'
  setupCompositeLoop(target)
  attachDrawEvents(target)
  attachDropEvents(target)

  // Watch for remote frame/stroke changes
  watchSharedState(target)
}

/*

watchSharedState — responds to peers adding frames or committing strokes.
Uses _onStateChange hook called from afterUpdate on every elf state change.

FIX: _knownCounts initialised to -1 so the very first onStateChange pass
always triggers replayStrokes for every frame, even when elf delivers the
full state atomically (late-join burst).

*/

function watchSharedState(target) {
  // initialise ALL known frames to -1 so first pass always replays
  const _knownCounts = {}
  $.learn().frames.forEach(id => { _knownCounts[id] = -1 })

  let _lastFrameStr = ''  // force frames diff on first run

  function onStateChange() {
    if (target._destroyed) return
    const state = $.learn()
    const framesStr = JSON.stringify(state.frames)
    let reelDirty = false

    // ── new or removed frames ─────────────────────────────────────────────
    if (framesStr !== _lastFrameStr) {
      _lastFrameStr = framesStr

      // clamp _localCurrent if frames were deleted
      if (target._localCurrent >= state.frames.length) {
        target._localCurrent = Math.max(0, state.frames.length - 1)
      }

      state.frames.forEach(id => {
        // new frame from a peer — init to -1 so stroke pass below replays it
        if (!(_knownCounts[id] >= 0)) _knownCounts[id] = -1
        ensureFrame(id, state.canvasW, state.canvasH)
      })

      loadCurrentFrame(target)
      renderOnion(target)
      reelDirty = true
    }

    // ── new strokes on any frame ──────────────────────────────────────────
    state.frames.forEach(id => {
      const sharedLen = (state.frameStrokes[id] || []).length
      const knownLen  = _knownCounts[id] ?? -1
      if (sharedLen !== knownLen) {
        _knownCounts[id] = sharedLen
        ensureFrame(id, state.canvasW, state.canvasH)
        replayStrokes(id)
        // only refresh draw canvas if this is the frame we're currently viewing
        if (id === state.frames[target._localCurrent]) {
          const ctx = target._drawCanvas.getContext('2d')
          ctx.clearRect(0, 0, state.canvasW, state.canvasH)
          ctx.drawImage(db[id].drawCanvas, 0, 0)
        }
        reelDirty = true
      }
    })

    if (reelDirty) renderReel(target)
  }

  // Store so afterUpdate can call it on every elf state change
  target._onStateChange = onStateChange

  // Run immediately — catches state already present at boot time.
  // Also run after a tick to catch any elf burst that arrived before
  // the hook was wired up.
  onStateChange()
  setTimeout(onStateChange, 0)

  // rAF loop — lightweight, only for live peer cursors + active strokes
  const cursorLoop = () => {
    if (target._destroyed) return
    const state = $.learn()
    updatePeerCanvases(target, state)
    renderPlayerCursors(target)
    requestAnimationFrame(cursorLoop)
  }
  requestAnimationFrame(cursorLoop)
}

/*

updatePeerCanvases — draws remote players' active strokes onto per-player canvases.
Compares against target._localCurrent so peers on different frames don't bleed through.

*/

function updatePeerCanvases(target, state) {
  const currentFrameId = (state.frames || [])[target._localCurrent]
  const { zoom } = state

  Object.entries(state.players || {}).forEach(([pid, p]) => {
    if (pid === playerId) return

    if (!p.currentStroke?.length || p.frameId !== currentFrameId) {
      // peer not drawing on this frame — clear their canvas
      const c = target._playerCanvasMap[pid]
      if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height)
      return
    }

    // ensure canvas exists
    let c = target._playerCanvasMap[pid]
    if (!c) {
      c = document.createElement('canvas')
      c.width  = state.canvasW
      c.height = state.canvasH
      c.style.cssText = `position:absolute;top:0;left:0;width:${state.canvasW*zoom}px;height:${state.canvasH*zoom}px;pointer-events:none;image-rendering:pixelated;`
      target._playerCanvasCtr.appendChild(c)
      target._playerCanvasMap[pid] = c
    }

    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, c.width, c.height)
    drawStroke(ctx, p.currentStroke)
  })
}

/*

teachPlayer — shorthand for player-namespaced $.teach.

*/

function teachPlayer(payload) {
  $.teach(payload,
    { mergeHandler: mergePlayer, parameters: [playerId] },
    { bypassSecurity: true }
  )
}

/*

Canvas init.

*/

function initCanvas(target, w, h) {
  const { zoom } = $.learn()
  target._outputCanvas.width  = w; target._outputCanvas.height = h
  target._drawCanvas.width    = w; target._drawCanvas.height   = h
  target._videoCanvas.width   = w; target._videoCanvas.height  = h

  target._onionCanvases.forEach(c => c.remove())
  target._onionCanvases = []
  ;[0.2, 0.4, 0.6, 0.8].forEach((op, i) => {
    const c = document.createElement('canvas')
    c.className = 'onion-layer'; c.width = w; c.height = h
    c.style.opacity = op; c.style.zIndex = i + 1
    target._artboardInner.insertBefore(c, target._outputCanvas)
    target._onionCanvases.push(c)
  })

  applyZoomStyles(target)
}

function applyZoomStyles(target) {
  const { canvasW: w, canvasH: h, zoom } = $.learn()
  const px = n => (n * zoom) + 'px'
  target._outputCanvas.style.width  = px(w)
  target._outputCanvas.style.height = px(h)
  target._onionCanvases.forEach(c => { c.style.width = px(w); c.style.height = px(h) })
  target._playerCanvasCtr.style.width  = px(w)
  target._playerCanvasCtr.style.height = px(h)
  const lbl = target.querySelector('[data-zoom-lbl]')
  if (lbl) lbl.textContent = zoom >= 1 ? `${zoom*100|0}%` : `${Math.round(zoom*100)}%`
}

function setZoom(target, z) {
  $.whisper({ zoom: Math.max(0.25, Math.min(32, z)) })
  applyZoomStyles(target)
}

function fitZoom(target) {
  const { canvasW, canvasH } = $.learn()
  const rect = target._artboard.getBoundingClientRect()
  const zoom = Math.max(0.25, Math.min((rect.width - 40) / canvasW, (rect.height - 80) / canvasH))
  const cx = (rect.width  - canvasW * zoom) / 2
  const cy = (rect.height - canvasH * zoom) / 2
  $.whisper({ zoom, panX: cx, panY: cy })
  applyZoomStyles(target)
  target._artboardInner.style.transform = `translate(${cx}px,${cy}px)`
}

/*

Frame management.
All frame navigation writes to target._localCurrent only.
Shared state carries only frames[] and frameStrokes{}.

*/

function loadCurrentFrame(target) {
  const { frames, canvasW, canvasH } = $.learn()
  const current = target._localCurrent ?? 0
  target._drawCanvas.getContext('2d').clearRect(0, 0, canvasW, canvasH)
  target._videoCanvas.getContext('2d').clearRect(0, 0, canvasW, canvasH)
  if (!frames.length) return
  const f = ensureFrame(frames[current], canvasW, canvasH)
  target._drawCanvas.getContext('2d').drawImage(f.drawCanvas, 0, 0)
  if (f.hasVideo) target._videoCanvas.getContext('2d').drawImage(f.videoCanvas, 0, 0)
}

function gotoFrame(target, idx) {
  const { frames } = $.learn()
  target._localCurrent = Math.max(0, Math.min(frames.length - 1, idx))
  teachPlayer({ frameId: frames[target._localCurrent] })
  loadCurrentFrame(target)
  renderOnion(target)
  renderReel(target)
}

function addFrame(target, copyFromIdx = null) {
  const { frames, canvasW, canvasH, frameStrokes } = $.learn()
  const current = target._localCurrent ?? 0
  const id = crypto.randomUUID()
  ensureFrame(id, canvasW, canvasH)

  // copy strokes if duplicating
  let newStrokes = []
  if (copyFromIdx !== null && frames[copyFromIdx]) {
    const srcId = frames[copyFromIdx]
    newStrokes = [...(frameStrokes[srcId] || [])]
    // also copy pixels locally
    db[id].drawCanvas.getContext('2d').drawImage(db[srcId].drawCanvas, 0, 0)
  }

  const insertAfter = copyFromIdx !== null ? copyFromIdx : current
  const newFrames = [...frames]
  newFrames.splice(insertAfter + 1, 0, id)

  // advance local viewport to the new frame
  target._localCurrent = insertAfter + 1

  $.teach({
    frames: newFrames,
    frameStrokes: { ...frameStrokes, [id]: newStrokes }
  })
  teachPlayer({ frameId: id })

  loadCurrentFrame(target)
  renderOnion(target)
  renderReel(target)
}

function deleteFrame(target, idx) {
  const { frames, frameStrokes } = $.learn()
  if (frames.length <= 1) return
  const id = frames[idx]
  const newFrames = frames.filter((_, i) => i !== idx)
  // clamp local current
  let cur = target._localCurrent ?? 0
  if (cur >= newFrames.length) cur = newFrames.length - 1
  target._localCurrent = cur
  const newStrokes = { ...frameStrokes }; delete newStrokes[id]
  $.teach({ frames: newFrames, frameStrokes: newStrokes })
  loadCurrentFrame(target); renderOnion(target); renderReel(target)
}

function applyDims(target, w, h) {
  const { frames } = $.learn()
  frames.forEach(id => {
    const f = ensureFrame(id, w, h)
    ;['drawCanvas','videoCanvas'].forEach(key => {
      const tmp = document.createElement('canvas'); tmp.width=w; tmp.height=h
      tmp.getContext('2d').drawImage(f[key], 0, 0, w, h); f[key] = tmp
    })
    replayStrokes(id)
  })
  $.teach({ canvasW: w, canvasH: h })
  initCanvas(target, w, h)
  loadCurrentFrame(target); renderOnion(target); renderReel(target); fitZoom(target)
  const dl = target.querySelector('[data-dim-lbl]'); if (dl) dl.textContent = `${w}×${h}`
}

/*

Onion skinning — uses target._localCurrent.

*/

function renderOnion(target) {
  const { frames, onion, canvasW, canvasH } = $.learn()
  const current = target._localCurrent ?? 0
  target._onionCanvases.forEach((c, i) => {
    const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height)
    if (!onion) return
    const fi = current - (4 - i)
    if (fi >= 0 && frames[fi]) {
      const f = ensureFrame(frames[fi], canvasW, canvasH)
      if (f.hasVideo) ctx.drawImage(f.videoCanvas, 0, 0)
      ctx.drawImage(f.drawCanvas, 0, 0)
    }
  })
}

/*

Reel drag-to-reorder.
Ghost follows pointer, drop indicator shows between frames,
edge-scroll kicks in with velocity proportional to proximity.

*/

function startReelDrag(target, frameDiv, idx, e) {
  const reel = target.querySelector('[data-film-reel]')
  const rect = frameDiv.getBoundingClientRect()

  // ghost
  const ghost = document.createElement('canvas')
  const f = db[$.learn().frames[idx]]
  if (f) {
    ghost.width = f.drawCanvas.width; ghost.height = f.drawCanvas.height
    ghost.getContext('2d').drawImage(f.drawCanvas, 0, 0)
  }
  ghost.style.cssText = `
    position:fixed; pointer-events:none; z-index:9999;
    width:${rect.width}px; height:${rect.height}px;
    image-rendering:pixelated; opacity:.85;
    border:2px solid #fabd2f; border-radius:2px;
    left:${rect.left}px; top:${rect.top}px;
  `
  document.body.appendChild(ghost)

  // drop indicator
  const indicator = document.createElement('div')
  indicator.style.cssText = `
    position:fixed; pointer-events:none; z-index:9998;
    width:3px; background:#fabd2f; border-radius:2px;
    top:${reel.getBoundingClientRect().top + 4}px;
    height:${reel.getBoundingClientRect().height - 8}px;
    display:none;
  `
  document.body.appendChild(indicator)

  return {
    reel, ghost, indicator,
    fromIdx: idx,
    dropIdx: idx,
    offsetX: e.clientX - rect.left,
    scrollRaf: null
  }
}

function updateReelDrag(state, e) {
  const { ghost, indicator, reel } = state
  const reelRect = reel.getBoundingClientRect()

  // move ghost
  ghost.style.left = `${e.clientX - state.offsetX}px`

  // edge scroll
  const ZONE = 48
  const distFromLeft  = e.clientX - reelRect.left
  const distFromRight = reelRect.right - e.clientX
  let scrollVel = 0
  if (distFromLeft < ZONE)  scrollVel = -((ZONE - distFromLeft)  / ZONE) * 12
  if (distFromRight < ZONE) scrollVel =  ((ZONE - distFromRight) / ZONE) * 12

  if (state.scrollRaf) cancelAnimationFrame(state.scrollRaf)
  if (scrollVel !== 0) {
    const scroll = () => {
      reel.scrollLeft += scrollVel
      state.scrollRaf = requestAnimationFrame(scroll)
    }
    state.scrollRaf = requestAnimationFrame(scroll)
  } else {
    state.scrollRaf = null
  }

  // find drop position from frame divs
  const frames = [...reel.querySelectorAll('.reel-frame')]
  let dropIdx = frames.length
  let indicatorX = null

  for (let i = 0; i < frames.length; i++) {
    const r = frames[i].getBoundingClientRect()
    const mid = r.left + r.width / 2
    if (e.clientX < mid) {
      dropIdx = i
      indicatorX = r.left - 2
      break
    }
    if (i === frames.length - 1) {
      indicatorX = r.right + 2
    }
  }

  state.dropIdx = dropIdx

  if (indicatorX !== null) {
    indicator.style.display = 'block'
    indicator.style.left = `${indicatorX}px`
  }
}

function endReelDrag(target, state, e) {
  if (state.scrollRaf) cancelAnimationFrame(state.scrollRaf)
  state.ghost.remove()
  state.indicator.remove()

  const { fromIdx, dropIdx } = state
  // adjust dropIdx for removal of fromIdx
  let toIdx = dropIdx > fromIdx ? dropIdx - 1 : dropIdx
  if (toIdx === fromIdx) return  // no move

  const { frames, frameStrokes } = $.learn()
  const newFrames = [...frames]
  const [moved] = newFrames.splice(fromIdx, 1)
  newFrames.splice(toIdx, 0, moved)

  // keep _localCurrent tracking the same frame
  const currentId = frames[target._localCurrent]
  target._localCurrent = newFrames.indexOf(currentId)

  $.teach({ frames: newFrames, frameStrokes })
  renderReel(target)
  renderOnion(target)
}

/*

showReelMenu — long-press context menu anchored above the frame.
Delete (top, further away) and Duplicate (bottom, closer to thumb).

*/

function showReelMenu(target, frameDiv, idx, id) {
  document.querySelector('.reel-menu')?.remove()

  const menu = document.createElement('div')
  menu.className = 'reel-menu'
  menu.style.cssText = `
    position:fixed; z-index:9999;
    display:flex; flex-direction:column; gap:3px;
    background:#1d2021; border:1px solid #504945;
    border-radius:3px; padding:4px;
    box-shadow:0 4px 16px rgba(0,0,0,.7);
    font-family:'DM Mono','Courier New',monospace;
  `

  const mkBtn = (label, danger) => {
    const b = document.createElement('button')
    b.textContent = label
    b.style.cssText = `
      background:#3c3836; border:1px solid ${danger ? '#fb4934' : '#504945'};
      color:${danger ? '#fb4934' : '#a89984'};
      font-family:'DM Mono','Courier New',monospace; font-size:.65rem;
      padding:.35rem .7rem; cursor:pointer; border-radius:2px;
      text-align:left; white-space:nowrap; display:block; width:100%;
    `
    b.addEventListener('pointerover', () => { b.style.background = danger ? 'rgba(251,73,52,.15)' : 'rgba(215,153,33,.15)'; b.style.borderColor = danger ? '#fb4934' : '#d79921'; b.style.color = danger ? '#fb4934' : '#fabd2f' })
    b.addEventListener('pointerout',  () => { b.style.background = '#3c3836'; b.style.borderColor = danger ? '#fb4934' : '#504945'; b.style.color = danger ? '#fb4934' : '#a89984' })
    return b
  }

  const delBtn = mkBtn('✕  delete', true)
  const dupBtn = mkBtn('⊕  duplicate', false)

  menu.appendChild(delBtn)
  menu.appendChild(dupBtn)
  document.body.appendChild(menu)

  // position above the frame — measure after append
  const rect = frameDiv.getBoundingClientRect()
  const mh = menu.offsetHeight
  const top = rect.top - mh - 8
  menu.style.left = `${rect.left}px`
  menu.style.top  = `${Math.max(4, top)}px`

  dupBtn.addEventListener('pointerdown', e => { e.stopPropagation(); menu.remove(); addFrame(target, idx) })
  delBtn.addEventListener('pointerdown', e => { e.stopPropagation(); menu.remove(); deleteFrame(target, idx) })

  const dismiss = e => {
    if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('pointerdown', dismiss) }
  }
  setTimeout(() => document.addEventListener('pointerdown', dismiss), 0)
}

/*

Film reel — uses target._localCurrent for active highlight.
Presence dots still driven by players[pid].frameId (correct — peer-namespaced).

*/

function renderReel(target) {
  const { frames, players } = $.learn()
  const current = target._localCurrent ?? 0
  const reel = target.querySelector('[data-film-reel]'); if (!reel) return
  const addBtn = reel.querySelector('[data-new-frame]')
  reel.innerHTML = ''

  frames.forEach((id, idx) => {
    const f = ensureFrame(id, $.learn().canvasW, $.learn().canvasH)
    const div = document.createElement('div')
    div.className = 'reel-frame' + (idx === current ? ' active' : '')

    const thumb = document.createElement('canvas')
    thumb.width = f.drawCanvas.width; thumb.height = f.drawCanvas.height
    const tctx = thumb.getContext('2d')
    if (f.hasVideo) tctx.drawImage(f.videoCanvas, 0, 0)
    tctx.drawImage(f.drawCanvas, 0, 0)

    const num = document.createElement('span'); num.className = 'reel-num'; num.textContent = idx + 1

    const del = document.createElement('button'); del.className = 'reel-del'; del.textContent = '✕'

    // player presence dots — peers on this frame (by their frameId, not our current)
    const peersHere = Object.entries(players || {}).filter(([pid, p]) => pid !== playerId && p.frameId === id)
    if (peersHere.length) {
      const dotsRow = document.createElement('div'); dotsRow.className = 'reel-player-dots'
      peersHere.forEach(([pid, p]) => {
        const dot = document.createElement('div'); dot.className = 'reel-player-dot'
        dot.style.background = p.color || '#fabd2f'
        dot.title = pid.slice(0, 6)
        dotsRow.appendChild(dot)
      })
      div.appendChild(dotsRow)
    }

    if (f.hasVideo) { const b=document.createElement('span');b.className='reel-badge';b.style.color='#83a598';b.textContent='▶';div.appendChild(b) }
    if (f.children) { const b=document.createElement('span');b.className='reel-badge';b.style.cssText='color:#fe8019;left:10px';b.textContent='↳';div.appendChild(b) }

    div.dataset.reelIdx = idx
    div.dataset.reelId = id

    // full-area click catcher — sits above thumb/num, below del button
    const catcher = document.createElement('div')
    catcher.style.cssText = 'position:absolute;inset:0;z-index:2;'
    catcher.dataset.reelIdx = idx
    catcher.dataset.reelId = id

    div.appendChild(thumb); div.appendChild(num); div.appendChild(catcher); div.appendChild(del)

    let _pressTimer = null
    let _dragState = null

    const cancelPress = () => { if (_pressTimer) { clearTimeout(_pressTimer); _pressTimer = null } }

    catcher.addEventListener('pointerdown', e => {
      e.preventDefault()
      catcher.setPointerCapture(e.pointerId)
      const startX = e.clientX, startY = e.clientY
      let moved = false

      _pressTimer = setTimeout(() => {
        _pressTimer = null
        if (!moved) showReelMenu(target, div, idx, id)
      }, 400)

      const onMove = e => {
        const dx = e.clientX - startX, dy = e.clientY - startY
        if (!moved && Math.sqrt(dx*dx + dy*dy) > 6) {
          moved = true
          cancelPress()
          // start drag
          _dragState = startReelDrag(target, div, idx, e)
        }
        if (_dragState) updateReelDrag(_dragState, e)
      }

      const onUp = e => {
        catcher.removeEventListener('pointermove', onMove)
        catcher.removeEventListener('pointerup', onUp)
        catcher.removeEventListener('pointercancel', onUp)
        if (_dragState) {
          endReelDrag(target, _dragState, e)
          _dragState = null
        } else if (_pressTimer) {
          cancelPress()
          gotoFrame(target, idx)
        }
      }

      catcher.addEventListener('pointermove', onMove)
      catcher.addEventListener('pointerup', onUp)
      catcher.addEventListener('pointercancel', onUp)
    })

    catcher.addEventListener('contextmenu', e => e.preventDefault())
    del.addEventListener('click', e => { e.stopPropagation(); deleteFrame(target, idx) })

    reel.appendChild(div)
  })

  if (addBtn) reel.appendChild(addBtn)
  const active = reel.querySelector('.active')
  if (active) active.scrollIntoView({ inline: 'nearest', block: 'nearest' })
}

/*

renderPlayerCursors — uses target._localCurrent for same-frame check.

*/

function renderPlayerCursors(target) {
  const { players, frames, zoom } = $.learn()
  const current = target._localCurrent ?? 0
  let container = target._artboardInner.querySelector('.player-cursors-overlay')
  if (!container) {
    container = document.createElement('div')
    container.className = 'player-cursors-overlay'
    container.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:25;'
    target._artboardInner.appendChild(container)
  }

  const currentFrameId = frames[current]
  container.innerHTML = Object.entries(players || {})
    .filter(([pid, p]) => pid !== playerId && p.activelyDrawing && p.frameId === currentFrameId)
    .map(([pid, p]) => `
      <div class="player-cursor" style="left:${p.cursorX * zoom}px;top:${p.cursorY * zoom}px">
        <div class="dot" style="background:${p.color || '#fabd2f'}"></div>
        <div class="label" style="color:${p.color || '#fabd2f'}">${pid.slice(0,6)}</div>
      </div>
    `).join('')
}

/*

drawStroke — v-log verbatim.

*/

function drawStroke(context, stroke) {
  if (stroke?.length === 1 && stroke[0].fill) {
    floodFill(context, stroke[0].x, stroke[0].y, stroke[0].color, context.canvas.width, context.canvas.height)
    return
  }
  if (!stroke || stroke.length < 2) return
  context.beginPath()
  context.moveTo(stroke[0].x, stroke[0].y)
  for (let i = 1; i < stroke.length; i++) {
    const point = stroke[i]
    context.globalCompositeOperation = point.erase ? 'destination-out' : 'source-over'
    context.strokeStyle = point.erase ? 'rgba(0,0,0,1)' : (point.color || '#ebdbb2')
    context.lineCap = 'round'; context.lineJoin = 'round'
    context.globalAlpha = point.opacity ?? 1
    context.lineWidth = point.lineWidth || 8
    if (i < stroke.length - 1) {
      const xc = (stroke[i].x + stroke[i+1].x) / 2
      const yc = (stroke[i].y + stroke[i+1].y) / 2
      context.quadraticCurveTo(point.x, point.y, xc, yc)
    } else {
      context.lineTo(point.x, point.y)
    }
  }
  context.stroke()
  context.globalAlpha = 1
  context.globalCompositeOperation = 'source-over'
}

function hexToRgba(colorStr) {
  if (!colorStr || colorStr === 'transparent') return { r:0,g:0,b:0,a:0 }
  const c=document.createElement('canvas');c.width=c.height=1
  const ctx=c.getContext('2d');ctx.fillStyle=colorStr;ctx.fillRect(0,0,1,1)
  const [r,g,b,a]=ctx.getImageData(0,0,1,1).data
  return {r,g,b,a}
}

function floodFill(ctx, x, y, fillColor, w, h) {
  const img=ctx.getImageData(0,0,w,h),d=img.data
  const ti=(y*w+x)*4,tr=d[ti],tg=d[ti+1],tb=d[ti+2],ta=d[ti+3]
  const fc=hexToRgba(fillColor)
  if(tr===fc.r&&tg===fc.g&&tb===fc.b&&ta===fc.a)return
  const stack=[[x,y]],vis=new Uint8Array(w*h)
  while(stack.length){
    const[cx,cy]=stack.pop();if(cx<0||cx>=w||cy<0||cy>=h)continue
    const i=cy*w+cx;if(vis[i])continue;const pi=i*4
    if(d[pi]!==tr||d[pi+1]!==tg||d[pi+2]!==tb||d[pi+3]!==ta)continue
    vis[i]=1;d[pi]=fc.r;d[pi+1]=fc.g;d[pi+2]=fc.b;d[pi+3]=fc.a
    stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1])
  }
  ctx.putImageData(img,0,0)
}

/*

Composite loop — video → committed+active draw → output.

*/

function setupCompositeLoop(target) {
  const ctx = target._outputCanvas.getContext('2d')
  const ckCanvas = document.createElement('canvas')
  let ckCtx = null

  const loop = () => {
    if (target._destroyed) return
    const { canvasW:w, canvasH:h, chromakeyEnabled, chromakeyColor, chromakeyTolerance } = $.learn()

    if (chromakeyEnabled && (ckCanvas.width!==w||ckCanvas.height!==h)) {
      ckCanvas.width=w; ckCanvas.height=h
      ckCtx=ckCanvas.getContext('2d',{willReadFrequently:true})
    }

    ctx.clearRect(0,0,w,h)
    ctx.drawImage(target._videoCanvas,0,0)

    if (chromakeyEnabled) {
      if (!ckCtx) ckCtx=ckCanvas.getContext('2d',{willReadFrequently:true})
      ckCtx.clearRect(0,0,w,h)
      ckCtx.drawImage(target._drawCanvas,0,0)
      if (target._activeCanvas) ckCtx.drawImage(target._activeCanvas,0,0)
      if (target._chromakey?.gl) {
        ctx.drawImage(target._chromakey.process(ckCanvas,hexToRgb(chromakeyColor),chromakeyTolerance),0,0)
      } else {
        const keyRgb=hexToRgb(chromakeyColor),img=ckCtx.getImageData(0,0,w,h),d=img.data
        for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;if(colorDistance(d[i],d[i+1],d[i+2],keyRgb.r,keyRgb.g,keyRgb.b)<=chromakeyTolerance)d[i+3]=0}
        ckCtx.putImageData(img,0,0); ctx.drawImage(ckCanvas,0,0)
      }
    } else {
      ctx.drawImage(target._drawCanvas,0,0)
      if (target._activeCanvas) ctx.drawImage(target._activeCanvas,0,0)
    }

    // draw other players' active strokes (maintained by updatePeerCanvases)
    Object.values(target._playerCanvasMap || {}).forEach(pc => {
      ctx.drawImage(pc, 0, 0)
    })

    requestAnimationFrame(loop)
  }
  loop()
}

/*

Chromakey helpers.

*/

const _colorCache = new Map()
function hexToRgb(s) {
  if (_colorCache.has(s)) return _colorCache.get(s)
  const c=document.createElement('canvas');c.width=c.height=1
  const ctx=c.getContext('2d');ctx.fillStyle=s;ctx.fillRect(0,0,1,1)
  const[r,g,b]=ctx.getImageData(0,0,1,1).data
  const result={r,g,b}
  if(_colorCache.size>100)_colorCache.delete(_colorCache.keys().next().value)
  _colorCache.set(s,result);return result
}
function colorDistance(r1,g1,b1,r2,g2,b2){return Math.sqrt((r2-r1)**2+(g2-g1)**2+(b2-b1)**2)}

/*

Undo — local only, ImageData snapshots per frame.

*/

const _undoStack = {}

function captureUndo(target) {
  const { frames, tool } = $.learn()
  const current = target._localCurrent ?? 0
  if (tool==='pan'||!frames.length) return
  const id=frames[current]
  if (!_undoStack[id]) _undoStack[id]=[]
  _undoStack[id].push(target._drawCanvas.getContext('2d').getImageData(0,0,target._drawCanvas.width,target._drawCanvas.height))
  if (_undoStack[id].length>30) _undoStack[id].shift()
}

function undoFrame(target) {
  const { frames }=$.learn()
  const current = target._localCurrent ?? 0
  if(!frames.length)return
  const id=frames[current]
  if (!_undoStack[id]?.length) return
  target._drawCanvas.getContext('2d').putImageData(_undoStack[id].pop(),0,0)
  if (target._activeCanvas) target._activeCanvas.getContext('2d').clearRect(0,0,target._activeCanvas.width,target._activeCanvas.height)
  // sync back to local db so reel thumb is correct
  db[id].drawCanvas.getContext('2d').clearRect(0,0,db[id].drawCanvas.width,db[id].drawCanvas.height)
  db[id].drawCanvas.getContext('2d').drawImage(target._drawCanvas,0,0)
  renderReel(target)
}

/*

Draw events — pointer unified, pressure via e.pressure.
Active stroke → _activeCanvas during drag.
On commit → stroke pushed to shared frameStrokes (travels to peers).
Peers' watchSharedState sees the new stroke length, calls replayStrokes.

*/

let _drawing=false,_lineWidth=0,_points=[],_penPoints=[],_panStart=null,_panOrigin=null,_drawRafId=null

function getCanvasPos(target, e) {
  const { zoom }=$.learn(), rect=target._outputCanvas.getBoundingClientRect()
  const clientX=e.touches?e.touches[0].clientX:e.clientX
  const clientY=e.touches?e.touches[0].clientY:e.clientY
  return { x:Math.floor((clientX-rect.left)/zoom), y:Math.floor((clientY-rect.top)/zoom) }
}

function attachDrawEvents(target) {
  const oc = target._outputCanvas
  target._activeCanvas=document.createElement('canvas')
  target._activeCanvas.width=target._drawCanvas.width
  target._activeCanvas.height=target._drawCanvas.height

  oc.addEventListener('pointerdown', e => {
    oc.setPointerCapture(e.pointerId)
    const { tool }=$.learn()
    if (tool==='pan'){startPan(target,e);return}

    if (tool==='pen'){const{x,y}=getCanvasPos(target,e);_penPoints.push({x,y});renderPenPreview(target);return}

    captureUndo(target)
    _drawing=true; _points=[]
    const{x,y}=getCanvasPos(target,e)

    if (tool==='fill'){
      const{fillColor,canvasW,canvasH}=$.learn()
      const current=target._localCurrent??0
      const{frames}=$.learn()
      const frameId=frames[current]
      floodFill(target._drawCanvas.getContext('2d'),x,y,fillColor,canvasW,canvasH)
      db[frameId].drawCanvas.getContext('2d').clearRect(0,0,canvasW,canvasH)
      db[frameId].drawCanvas.getContext('2d').drawImage(target._drawCanvas,0,0)
      const fs=$.learn().frameStrokes
      $.teach({frameStrokes:{...fs,[frameId]:[...(fs[frameId]||[]),[{x,y,fill:true,color:fillColor,lineWidth:0,opacity:1}]]}})
      _drawing=false; renderReel(target); return
    }

    const{thickness,opacity,color}=$.learn()
    const pressure=e.pressure>0?e.pressure:1.0
    _lineWidth=Math.log(pressure+1)*thickness
    const pt={x,y,lineWidth:_lineWidth,color,opacity,erase:tool==='erase'}
    _points.push(pt)
    teachPlayer({currentStroke:[pt],cursorX:x,cursorY:y,activelyDrawing:true,color})
  })

  oc.addEventListener('pointermove', e => {
    const{tool}=$.learn()
    if (tool==='pan'){movePan(target,e);return}
    if (tool==='pen'){
      if(_penPoints.length>0){
        const{x,y}=getCanvasPos(target,e)
        const preview=[..._penPoints,{x,y}],saved=_penPoints
        _penPoints=preview; renderPenPreview(target); _penPoints=saved
      }
      return
    }
    if (!_drawing) return

    const{x,y}=getCanvasPos(target,e)
    const{thickness,opacity,color}=$.learn()
    const pressure=e.pressure>0?e.pressure:1.0
    _lineWidth=Math.log(pressure+1)*thickness*4*0.2+_lineWidth*0.8

    const pt={x,y,lineWidth:_lineWidth,color,opacity,erase:tool==='erase'}
    _points.push(pt)

    if (tool === 'erase') {
      // erase must draw directly to _drawCanvas — destination-out on _activeCanvas
      // (which is transparent) would be invisible until commit
      const ctx = target._drawCanvas.getContext('2d')
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth = pt.lineWidth; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      const pts = _points
      if (pts.length >= 2) {
        ctx.beginPath()
        ctx.moveTo(pts[pts.length-2].x, pts[pts.length-2].y)
        ctx.lineTo(pt.x, pt.y)
        ctx.stroke()
      }
      ctx.globalCompositeOperation = 'source-over'
    } else {
      // draw full current stroke to _activeCanvas
      const actCtx=target._activeCanvas.getContext('2d')
      actCtx.clearRect(0,0,target._activeCanvas.width,target._activeCanvas.height)
      drawStroke(actCtx,_points)
    }

    // throttle multiplayer broadcast
    if (!_drawRafId){
      _drawRafId=requestAnimationFrame(()=>{
        teachPlayer({currentStroke:[..._points],cursorX:x,cursorY:y,color,activelyDrawing:true})
        _drawRafId=null
      })
    }
  })

  oc.addEventListener('pointerup', e => {
    const{tool}=$.learn()
    if (tool==='pan'){endPan(target);return}
    if (tool==='pen')return
    if (!_drawing)return
    _drawing=false; _lineWidth=0

    if (_points.length>=2){
      drawStroke(target._drawCanvas.getContext('2d'),_points)
    } else if (_points.length===1){
      const{color,opacity,thickness}=$.learn(),ctx=target._drawCanvas.getContext('2d')
      ctx.fillStyle=color;ctx.globalAlpha=opacity
      ctx.beginPath();ctx.arc(_points[0].x,_points[0].y,thickness/2,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1
    }

    target._activeCanvas.getContext('2d').clearRect(0,0,target._activeCanvas.width,target._activeCanvas.height)
    teachPlayer({currentStroke:[],activelyDrawing:false})

    // commit stroke to shared state — peers will replay it
    if (_points.length>0) {
      const{frames,frameStrokes}=$.learn()
      const current = target._localCurrent ?? 0
      const frameId=frames[current]
      const committed=[..._points]
      // update local db immediately so reel thumb is current
      db[frameId].drawCanvas.getContext('2d').clearRect(0,0,db[frameId].drawCanvas.width,db[frameId].drawCanvas.height)
      db[frameId].drawCanvas.getContext('2d').drawImage(target._drawCanvas,0,0)
      const {frameStrokes: fs} = $.learn()
      $.teach({
        frameStrokes: {
          ...fs,
          [frameId]: [...(fs[frameId] || []), committed]
        }
      })
      renderReel(target)
    }
    _points=[]
  })

  oc.addEventListener('pointercancel',()=>{
    _drawing=false;_points=[]
    if(target._activeCanvas)target._activeCanvas.getContext('2d').clearRect(0,0,target._activeCanvas.width,target._activeCanvas.height)
    teachPlayer({currentStroke:[],activelyDrawing:false})
    endPan(target)
  })

  oc.addEventListener('dblclick',()=>{
    if($.learn().tool==='pen'&&_penPoints.length>1){captureUndo(target);commitPenPath(target)}
  })

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&_penPoints.length){_penPoints=[];renderPenPreview(target)}
  })
}

/*

commitCurrentPixels — for fill tool, sync pixels to db then teach stroke marker.

*/

function commitCurrentPixels(target) {
  const{frames}=$.learn()
  const current = target._localCurrent ?? 0
  const frameId=frames[current]
  db[frameId].drawCanvas.getContext('2d').clearRect(0,0,db[frameId].drawCanvas.width,db[frameId].drawCanvas.height)
  db[frameId].drawCanvas.getContext('2d').drawImage(target._drawCanvas,0,0)
  renderReel(target)
}

/*

Pan, pen preview, pen commit.

*/

function startPan(target,e){
  const clientX=e.touches?e.touches[0].clientX:e.clientX,clientY=e.touches?e.touches[0].clientY:e.clientY
  _panStart={x:clientX,y:clientY};_panOrigin={x:$.learn().panX,y:$.learn().panY}
  target._artboard.style.cursor='grabbing'
}
function movePan(target,e){
  if(!_panStart)return
  const clientX=e.touches?e.touches[0].clientX:e.clientX,clientY=e.touches?e.touches[0].clientY:e.clientY
  const panX=_panOrigin.x+(clientX-_panStart.x),panY=_panOrigin.y+(clientY-_panStart.y)
  $.whisper({panX,panY}); target._artboardInner.style.transform=`translate(${panX}px,${panY}px)`
}
function endPan(target){_panStart=null;target._artboard.style.cursor=''}

function renderPenPreview(target){
  let pp=target._penPreviewCanvas
  if(!pp){
    const{canvasW,canvasH,zoom}=$.learn()
    pp=document.createElement('canvas');pp.width=canvasW;pp.height=canvasH
    pp.style.cssText=`position:absolute;top:0;left:0;width:${canvasW*zoom}px;height:${canvasH*zoom}px;pointer-events:none;z-index:12;image-rendering:pixelated;`
    target._artboardInner.appendChild(pp);target._penPreviewCanvas=pp
  }
  const{canvasW,canvasH,color,fillColor,thickness}=$.learn()
  const ctx=pp.getContext('2d');ctx.clearRect(0,0,canvasW,canvasH)
  if(_penPoints.length<1)return
  ctx.beginPath();ctx.moveTo(_penPoints[0].x,_penPoints[0].y)
  for(let i=1;i<_penPoints.length;i++){
    if(i<_penPoints.length-1){const mx=(_penPoints[i].x+_penPoints[i+1].x)/2,my=(_penPoints[i].y+_penPoints[i+1].y)/2;ctx.quadraticCurveTo(_penPoints[i].x,_penPoints[i].y,mx,my)}
    else ctx.lineTo(_penPoints[i].x,_penPoints[i].y)
  }
  if(fillColor&&fillColor!=='transparent'){ctx.fillStyle=fillColor;ctx.globalAlpha=.35;ctx.fill();ctx.globalAlpha=1}
  if(color&&color!=='transparent'){ctx.strokeStyle=color;ctx.lineWidth=thickness;ctx.lineCap='round';ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([])}
  _penPoints.forEach((p,i)=>{ctx.fillStyle=i===0?'#fabd2f':'#d79921';ctx.fillRect(p.x-2,p.y-2,4,4)})
}

function commitPenPath(target){
  if(_penPoints.length<2){_penPoints=[];return}
  const{color,fillColor,thickness,opacity,frames,frameStrokes}=$.learn()
  const current = target._localCurrent ?? 0
  const ctx=target._drawCanvas.getContext('2d')
  ctx.beginPath();ctx.moveTo(_penPoints[0].x,_penPoints[0].y)
  for(let i=1;i<_penPoints.length-1;i++){
    const mx=(_penPoints[i].x+_penPoints[i+1].x)/2,my=(_penPoints[i].y+_penPoints[i+1].y)/2
    ctx.quadraticCurveTo(_penPoints[i].x,_penPoints[i].y,mx,my)
  }
  ctx.lineTo(_penPoints[_penPoints.length-1].x,_penPoints[_penPoints.length-1].y)
  ctx.closePath();ctx.globalAlpha=opacity
  if(fillColor&&fillColor!=='transparent'){ctx.fillStyle=fillColor;ctx.fill()}
  if(color&&color!=='transparent'){ctx.strokeStyle=color;ctx.lineWidth=thickness;ctx.lineCap='round';ctx.stroke()}
  ctx.globalAlpha=1
  if(target._penPreviewCanvas)target._penPreviewCanvas.getContext('2d').clearRect(0,0,target._penPreviewCanvas.width,target._penPreviewCanvas.height)
  const frameId=frames[current]
  db[frameId].drawCanvas.getContext('2d').clearRect(0,0,db[frameId].drawCanvas.width,db[frameId].drawCanvas.height)
  db[frameId].drawCanvas.getContext('2d').drawImage(target._drawCanvas,0,0)
  const syntheticStroke=_penPoints.map(p=>({...p,lineWidth:thickness,color,opacity}))
  const {frameStrokes: fspen} = $.learn()
  $.teach({
    frameStrokes: {
      ...fspen,
      [frameId]: [...(fspen[frameId] || []), syntheticStroke]
    }
  })
  _penPoints=[]; renderReel(target)
}

/*

Playback — uses target._localCurrent.

*/

let _playInterval=null,_playDir=1
function startPlayback(target){
  $.teach({playing:true});_playDir=1
  _playInterval=setInterval(()=>{
    const{frames,loopMode}=$.learn()
    const current = target._localCurrent ?? 0
    let next=current+_playDir
    if(loopMode==='loop')next=((next%frames.length)+frames.length)%frames.length
    else if(loopMode==='pingpong'){if(next>=frames.length){next=frames.length-2;_playDir=-1}else if(next<0){next=1;_playDir=1}}
    else{if(next>=frames.length){next=frames.length-1;stopPlayback(target);return}}
    target._localCurrent=Math.max(0,Math.min(frames.length-1,next))
    loadCurrentFrame(target);renderOnion(target);renderReel(target)
  },1000/$.learn().fps)
}
function stopPlayback(target){$.teach({playing:false});clearInterval(_playInterval)}

/*

Darkroom — self-contained playback cursor, doesn't touch _localCurrent.

*/

let _drPlaying=false,_drInterval=null,_drZoomed=false,_drDir=1,_drCurrent=0
function openDarkroom(target){
  const{canvasW,canvasH}=$.learn(),dc=target._drCanvas
  _drCurrent = target._localCurrent ?? 0
  target._darkroom.classList.add('open')
  dc.width=canvasW;dc.height=canvasH
  const scale=Math.min((window.innerWidth*.85)/canvasW,(window.innerHeight*.62)/canvasH)
  dc.style.width=(canvasW*scale)+'px';dc.style.height=(canvasH*scale)+'px';dc.style.setProperty('--dr-zoom',scale*2)
  if(!dc._zoomWired){dc._zoomWired=true;dc.addEventListener('click',()=>{_drZoomed=!_drZoomed;dc.classList.toggle('zoomed',_drZoomed)})}
  drRenderFrame(target);drStart(target)
}
function closeDarkroom(target){target._darkroom.classList.remove('open');drStop(target);_drZoomed=false;target._drCanvas.classList.remove('zoomed')}
function drRenderFrame(target){
  const{frames,canvasW,canvasH,fps,loopMode}=$.learn(),dc=target._drCanvas,ctx=dc.getContext('2d')
  ctx.clearRect(0,0,dc.width,dc.height)
  if(frames.length){const f=ensureFrame(frames[_drCurrent],canvasW,canvasH);if(f.hasVideo)ctx.drawImage(f.videoCanvas,0,0);ctx.drawImage(f.drawCanvas,0,0)}
  const counter=target.querySelector('[data-dr-counter]');if(counter)counter.textContent=`${_drCurrent+1} / ${frames.length}`
  const title=target.querySelector('[data-dr-title]');if(title)title.textContent=`${canvasW}×${canvasH} · ${fps}fps · ${loopMode}`
}
function drStart(target){
  _drPlaying=true;const btn=target.querySelector('[data-dr-play]');if(btn){btn.textContent='⏸ pause';btn.classList.add('active')}
  _drDir=1;_drInterval=setInterval(()=>{
    const{frames,loopMode}=$.learn();let next=_drCurrent+_drDir
    if(loopMode==='loop')next=((next%frames.length)+frames.length)%frames.length
    else if(loopMode==='pingpong'){if(next>=frames.length){next=frames.length-2;_drDir=-1}else if(next<0){next=1;_drDir=1}}
    else{if(next>=frames.length){next=frames.length-1;drStop(target);return}}
    _drCurrent=Math.max(0,Math.min(frames.length-1,next));drRenderFrame(target)
  },1000/$.learn().fps)
}
function drStop(target){_drPlaying=false;clearInterval(_drInterval);const btn=target.querySelector('[data-dr-play]');if(btn){btn.textContent='▶ play';btn.classList.remove('active')}}

/*

Export.

*/

async function exportMp4(target){
  const{frames,canvasW,canvasH,fps,loopMode}=$.learn()
  const off=document.createElement('canvas');off.width=canvasW;off.height=canvasH
  const octx=off.getContext('2d')
  const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp8')?'video/webm;codecs=vp8':'video/webm'
  const mspf=Math.round(1000/fps)  // ms per frame

  let seq=[...frames]
  if(loopMode==='pingpong') seq=[...frames,...[...frames].reverse().slice(1,-1)]

  const stream=off.captureStream(fps)
  const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8_000_000})
  const chunks=[]
  rec.ondataavailable=e=>{if(e.data.size>0)chunks.push(e.data)}
  rec.onstop=()=>{
    const blob=new Blob(chunks,{type:mime})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a');a.href=url;a.download='flipbook.webm';a.click()
    setTimeout(()=>URL.revokeObjectURL(url),5000)
  }

  // start with a small timeslice so ondataavailable fires regularly
  rec.start(mspf)

  for(const id of seq){
    const f=ensureFrame(id,canvasW,canvasH)
    octx.clearRect(0,0,canvasW,canvasH)
    if(f.hasVideo) octx.drawImage(f.videoCanvas,0,0)
    octx.drawImage(f.drawCanvas,0,0)
    // hold this frame for exactly one frame duration
    // use two back-to-back waits: one rAF to ensure the canvas stream
    // captures the new pixels, then the remainder of the frame time
    await new Promise(r=>requestAnimationFrame(r))
    await new Promise(r=>setTimeout(r,mspf))
  }

  rec.stop()
}

/*

Video import.

*/

function attachDropEvents(target){
  const ab=target._artboard
  ab.addEventListener('dragover',e=>{e.preventDefault();if(e.dataTransfer.types.includes('Files'))target.querySelector('[data-drop-overlay]').classList.add('active')})
  ab.addEventListener('dragleave',e=>{if(!ab.contains(e.relatedTarget))target.querySelector('[data-drop-overlay]').classList.remove('active')})
  ab.addEventListener('drop',async e=>{e.preventDefault();target.querySelector('[data-drop-overlay]').classList.remove('active');const f=[...e.dataTransfer.files].find(f=>f.type.startsWith('video/'));if(f)await importVideo(target,f)})
}

async function importVideo(target,file){
  const{fps,canvasW,canvasH,frames,frameStrokes}=$.learn()
  const current = target._localCurrent ?? 0
  const progress=target.querySelector('[data-import-progress]'),bar=target.querySelector('[data-import-bar]'),lbl=target.querySelector('[data-import-label]')
  progress.classList.add('active')
  const url=URL.createObjectURL(file),video=document.createElement('video');video.src=url;video.muted=true;video.preload='auto'
  await new Promise(r=>{video.onloadedmetadata=r})
  const duration=video.duration,totalFrames=Math.min(Math.ceil(duration*fps),240),interval=duration/totalFrames
  const replaceAll=confirm(`Import ${totalFrames} frames?\nOK = insert after current\nCancel = replace all`)===false
  const vw=video.videoWidth,vh=video.videoHeight
  if(vw!==canvasW||vh!==canvasH){if(confirm(`Resize project to ${vw}×${vh}?`))applyDims(target,vw,vh)}
  const{canvasW:w,canvasH:h}=$.learn()
  const off=document.createElement('canvas');off.width=w;off.height=h;const octx=off.getContext('2d')
  let newFrames=replaceAll?[]:[...frames],newStrokes=replaceAll?{}:{...frameStrokes}
  for(let i=0;i<totalFrames;i++){
    video.currentTime=i*interval;await new Promise(r=>{video.onseeked=r})
    octx.clearRect(0,0,w,h);octx.drawImage(video,0,0,w,h)
    const id=crypto.randomUUID();const f=ensureFrame(id,w,h)
    f.videoCanvas.getContext('2d').drawImage(off,0,0);f.hasVideo=true
    newStrokes[id]=[]
    const insertAt=replaceAll?i:current+1+i;newFrames.splice(insertAt,0,id)
    bar.style.width=`${Math.round(((i+1)/totalFrames)*100)}%`;lbl.textContent=`frame ${i+1} / ${totalFrames}`
  }
  URL.revokeObjectURL(url);progress.classList.remove('active')
  target._localCurrent = replaceAll ? 0 : current + 1
  $.teach({frames:newFrames,frameStrokes:newStrokes})
  loadCurrentFrame(target);renderOnion(target);renderReel(target)
}

/*

Sub-animation (local only — not synced).

*/

function openSubAnimation(target,parentId){
  const f=db[parentId]||ensureFrame(parentId,$.learn().canvasW,$.learn().canvasH)
  const{canvasW,canvasH,fps}=$.learn()
  if(!f.children){
    const c0=crypto.randomUUID(),c1=crypto.randomUUID()
    ensureFrame(c0,canvasW,canvasH);ensureFrame(c1,canvasW,canvasH)
    db[c0].drawCanvas.getContext('2d').drawImage(f.drawCanvas,0,0)
    f.children=[c0,c1];f.childIndex=0
  }
  const overlay=document.createElement('div');overlay.className='sub-overlay'
  const title=document.createElement('div');title.className='sub-title'
  const sc=document.createElement('canvas');sc.width=canvasW;sc.height=canvasH
  const scale=Math.min((window.innerWidth*.7)/canvasW,(window.innerHeight*.55)/canvasH)
  sc.style.cssText=`width:${canvasW*scale}px;height:${canvasH*scale}px;image-rendering:pixelated;border:1px solid #3c3836;cursor:crosshair;`
  let subIdx=f.childIndex||0,subDrawing=false
  function renderSub(){const ctx=sc.getContext('2d');ctx.clearRect(0,0,canvasW,canvasH);ctx.drawImage(db[f.children[subIdx]].drawCanvas,0,0);title.textContent=`↳ cel ${subIdx+1}/${f.children.length}`}
  function updateParent(){const pctx=db[parentId].drawCanvas.getContext('2d');pctx.clearRect(0,0,canvasW,canvasH);pctx.drawImage(db[f.children[f.childIndex||0]].drawCanvas,0,0)}
  sc.addEventListener('pointerdown',e=>{subDrawing=true;const r=sc.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/scale),y=Math.floor((e.clientY-r.top)/scale),{color,thickness}=$.learn(),cc=db[f.children[subIdx]].drawCanvas.getContext('2d'),sctx=sc.getContext('2d');[cc,sctx].forEach(c=>{c.fillStyle=color;c.fillRect(x,y,thickness,thickness)})})
  sc.addEventListener('pointermove',e=>{if(!subDrawing)return;const r=sc.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/scale),y=Math.floor((e.clientY-r.top)/scale),{color,thickness}=$.learn(),cc=db[f.children[subIdx]].drawCanvas.getContext('2d'),sctx=sc.getContext('2d');[cc,sctx].forEach(c=>{c.fillStyle=color;c.fillRect(x,y,thickness,thickness)})})
  sc.addEventListener('pointerup',()=>{subDrawing=false;updateParent()})
  const controls=document.createElement('div');controls.className='sub-controls'
  function makeBtn(l){const b=document.createElement('button');b.className='dr-btn';b.textContent=l;return b}
  const prev=makeBtn('‹'),next=makeBtn('›'),add=makeBtn('+cel'),play=makeBtn('▶'),close=makeBtn('✕')
  prev.onclick=()=>{subIdx=Math.max(0,subIdx-1);f.childIndex=subIdx;renderSub()}
  next.onclick=()=>{subIdx=Math.min(f.children.length-1,subIdx+1);f.childIndex=subIdx;renderSub()}
  add.onclick=()=>{const nid=crypto.randomUUID();ensureFrame(nid,canvasW,canvasH);f.children.splice(subIdx+1,0,nid);subIdx++;f.childIndex=subIdx;renderSub()}
  let subInt=null
  play.onclick=()=>{if(subInt){clearInterval(subInt);subInt=null;play.textContent='▶';return}play.textContent='⏸';subInt=setInterval(()=>{subIdx=(subIdx+1)%f.children.length;f.childIndex=subIdx;renderSub()},1000/fps)}
  close.onclick=()=>{clearInterval(subInt);updateParent();renderReel(target);overlay.remove()}
  controls.append(prev,next,add,play,close);overlay.append(title,sc,controls);document.body.appendChild(overlay);renderSub()
}

/*

Overlay panel.

*/

function openPalette(target, colorTarget) {
  $.whisper({ colorTarget, showOverlay: true, view: 'palette' })
  const overlay = target.querySelector('[data-overlay]')
  const inner   = target.querySelector('[data-overlay-inner]')
  if (!overlay || !inner) return
  overlay.classList.add('open')
  inner.style.cssText = 'height:100%;padding:0;margin:0;max-width:none;display:flex;flex-direction:column;'
  inner.innerHTML = `<plan98-palette data-color-target="${colorTarget}"></plan98-palette>`
}

function openView(target, view) {
  $.whisper({ view, showOverlay: true, colorTarget: null })
  const overlay = target.querySelector('[data-overlay]')
  const inner   = target.querySelector('[data-overlay-inner]')
  if (!overlay || !inner) return
  overlay.classList.add('open')
  inner.style.cssText = ''
  inner.innerHTML = renderView(view)
  wireOverlay(inner, target)
}
function closeOverlay(target){
  $.whisper({view:null,showOverlay:false,colorTarget:null})
  const overlay=target.querySelector('[data-overlay]')
  if(overlay)overlay.classList.remove('open')
  const inner=target.querySelector('[data-overlay-inner]')
  if(inner){inner.style.cssText='';inner.innerHTML=''}
}

function renderView(view){
  const{color,fillColor,thickness,opacity,onion,fps,loopMode,canvasW,canvasH,chromakeyEnabled,chromakeyColor,chromakeyTolerance}=$.learn()
  if(view===VIEWS.color)return`
    <div class="overlay-title">stroke</div>
    <div class="color-grid">${PALETTE.map(p=>`<div class="swatch ${p.color==='transparent'?'transparent-swatch':''} ${color===p.color?'active':''}" style="${p.color!=='transparent'?`background:${p.color}`:''}" data-set-color="${p.color}"></div>`).join('')}</div>
    <input type="color" value="${color!=='transparent'?color:'#ebdbb2'}" data-custom-color style="margin-top:.5rem;">
    <div class="overlay-title" style="margin-top:.75rem;">fill (pen mode)</div>
    <div class="color-grid">${PALETTE.map(p=>`<div class="swatch ${p.color==='transparent'?'transparent-swatch':''} ${fillColor===p.color?'active':''}" style="${p.color!=='transparent'?`background:${p.color}`:''}" data-set-fill="${p.color}"></div>`).join('')}</div>
    <input type="color" value="${fillColor!=='transparent'?fillColor:'#d79921'}" data-custom-fill style="margin-top:.5rem;">
  `
  if(view===VIEWS.brush)return`
    <div class="overlay-title">size</div>
    <div class="thicknoid-grid">${thicknoids.map(t=>`<button class="thicknoid-btn ${thickness===t?'active':''}" data-thick="${t}">${t}</button>`).join('')}</div>
    <div class="overlay-title" style="margin-top:.75rem;">opacity</div>
    <div class="opacity-grid">${[0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1].map(o=>`<button class="opacity-btn ${opacity===o?'active':''}" data-opacity="${o}">${o}</button>`).join('')}</div>
    <div class="overlay-title" style="margin-top:.75rem;">fill color <span style="font-size:.5rem;color:#504945">(pen mode)</span></div>
    <button class="row-btn" data-pick-fill style="display:flex;align-items:center;gap:.5rem;">
      <span style="display:inline-block;width:14px;height:14px;border-radius:2px;border:1px solid #504945;background:${fillColor==='transparent'?'repeating-conic-gradient(#504945 0% 25%,#3c3836 0% 50%) 0 0/6px 6px':fillColor};flex-shrink:0;"></span>
      <span>pick fill</span>
    </button>
    <div class="overlay-title" style="margin-top:.75rem;">onion skin</div>
    <button class="row-btn ${onion?'active':''}" data-toggle-onion>${onion?'● on':'○ off'}</button>
  `
  if(view===VIEWS.canvas)return`
    <div class="overlay-title">preset</div>
    <div class="preset-grid">${PRESETS.map(p=>`<button class="preset-btn ${p.w===canvasW&&p.h===canvasH?'active':''}" data-preset-w="${p.w}" data-preset-h="${p.h}">${p.label}</button>`).join('')}</div>
    <div class="overlay-title" style="margin-top:.75rem;">custom</div>
    <div class="dims-row"><input type="number" value="${canvasW}" min="1" max="3840" data-cust-w><span>×</span><input type="number" value="${canvasH}" min="1" max="2160" data-cust-h><button class="row-btn" style="width:auto;" data-apply-dims>ok</button></div>
  `
  if(view===VIEWS.settings)return`
    <div class="overlay-title">playback</div>
    <div class="field-row"><label>fps</label><select class="tl-select" data-fps-select>${[1,2,4,6,8,12,24,30,60].map(v=>`<option value="${v}" ${v===fps?'selected':''}>${v}</option>`).join('')}</select></div>
    <div class="field-row" style="margin-top:.4rem;"><label>mode</label><select class="tl-select" data-loop-select>${['loop','pingpong','once'].map(v=>`<option value="${v}" ${v===loopMode?'selected':''}>${v}</option>`).join('')}</select></div>
    <div class="overlay-title" style="margin-top:.75rem;">chromakey</div>
    <button class="row-btn ${chromakeyEnabled?'active':''}" data-toggle-ck>${chromakeyEnabled?'● on':'○ off'}</button>
    <div class="ck-color-row" style="margin-top:.5rem;"><div class="ck-preview" style="background:${chromakeyColor};" data-ck-preview></div><input type="color" value="${chromakeyColor}" data-ck-color></div>
    <div class="field-row" style="margin-top:.4rem;"><label>tolerance</label><input type="range" min="0" max="150" value="${chromakeyTolerance}" data-ck-tolerance><span style="font-size:.6rem;color:#928374;min-width:2rem;">${chromakeyTolerance}</span></div>
  `
  if(view===VIEWS.export)return`
    <div class="overlay-title">export</div>
    <button class="row-btn" data-do-export>↓ export webm</button>
    <button class="row-btn" style="margin-top:.4rem;" data-do-play>▶ fullscreen play</button>
  `
  return ''
}

function wireOverlay(inner,target){
  inner.querySelectorAll('[data-thick]').forEach(btn=>btn.addEventListener('click',()=>{$.whisper({thickness:Integer(btn.dataset.thick)});inner.querySelectorAll('[data-thick]').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}))
  inner.querySelectorAll('[data-opacity]').forEach(btn=>btn.addEventListener('click',()=>{$.whisper({opacity:parseFloat(btn.dataset.opacity)});inner.querySelectorAll('[data-opacity]').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}))
  const ob=inner.querySelector('[data-toggle-onion]');if(ob)ob.addEventListener('click',()=>{const n=!$.learn().onion;$.whisper({onion:n});ob.classList.toggle('active',n);ob.textContent=n?'● on':'○ off';renderOnion(target)})
  inner.querySelectorAll('[data-preset-w]').forEach(btn=>btn.addEventListener('click',()=>{applyDims(target,Integer(btn.dataset.presetW),Integer(btn.dataset.presetH));closeOverlay(target)}))
  const ab=inner.querySelector('[data-apply-dims]');if(ab)ab.addEventListener('click',()=>{applyDims(target,Integer(inner.querySelector('[data-cust-w]').value)||320,Integer(inner.querySelector('[data-cust-h]').value)||240);closeOverlay(target)})
  const fs=inner.querySelector('[data-fps-select]');if(fs)fs.addEventListener('change',e=>$.teach({fps:Integer(e.target.value)}))
  const ls=inner.querySelector('[data-loop-select]');if(ls)ls.addEventListener('change',e=>$.teach({loopMode:e.target.value}))
  const ct=inner.querySelector('[data-toggle-ck]');if(ct)ct.addEventListener('click',()=>{const n=!$.learn().chromakeyEnabled;$.whisper({chromakeyEnabled:n});ct.classList.toggle('active',n);ct.textContent=n?'● on':'○ off'})
  const ckc=inner.querySelector('[data-ck-color]');if(ckc)ckc.addEventListener('input',e=>{$.whisper({chromakeyColor:e.target.value});const p=inner.querySelector('[data-ck-preview]');if(p)p.style.background=e.target.value})
  const ckt=inner.querySelector('[data-ck-tolerance]');if(ckt)ckt.addEventListener('input',e=>{const v=Integer(e.target.value);$.whisper({chromakeyTolerance:v});ckt.nextElementSibling.textContent=v})
  const de=inner.querySelector('[data-do-export]');if(de)de.addEventListener('click',()=>{closeOverlay(target);exportMp4(target)})
  const dp=inner.querySelector('[data-do-play]');if(dp)dp.addEventListener('click',()=>{closeOverlay(target);openDarkroom(target)})
}

/*

v-log compass toolbelt drag.

*/

let _lastBeltX,_lastBeltY

$.when('pointerdown','[data-drag]',event=>{
  event.preventDefault()
  $.whisper({grabStartX:event.clientX,grabStartY:event.clientY,beltGrabbed:true,beltDragged:false})
})
$.when('pointermove','.artboard',event=>{
  const{beltGrabbed,beltDragged,beltOffsetX,beltOffsetY,grabStartX,grabStartY}=$.learn()
  if(!beltGrabbed)return
  if(grabStartX!==undefined){const dx=Math.abs(event.clientX-grabStartX),dy=Math.abs(event.clientY-grabStartY);if((dx>5||dy>5)&&!beltDragged){event.preventDefault();$.whisper({beltOffsetX:beltOffsetX||0,beltOffsetY:beltOffsetY||0,beltDragged:true})}}
  if(!$.learn().beltDragged)return
  event.preventDefault()
  if(_lastBeltX!==undefined&&_lastBeltY!==undefined)$.whisper({beltOffsetX:beltOffsetX+(event.clientX-_lastBeltX),beltOffsetY:beltOffsetY+(event.clientY-_lastBeltY)})
  _lastBeltX=event.clientX;_lastBeltY=event.clientY
})
$.when('pointerup','[data-drag]',event=>{
  event.target.releasePointerCapture(event.pointerId)
  if(!$.learn().beltDragged)$.whisper({menuOpen:!$.learn().menuOpen})
  $.whisper({beltGrabbed:false,beltDragged:false,grabStartX:undefined,grabStartY:undefined})
  _lastBeltX=undefined;_lastBeltY=undefined
})
$.when('pointerup','.artboard',event=>{
  event.target.releasePointerCapture(event.pointerId)
  $.whisper({beltGrabbed:false,beltDragged:false,grabStartX:undefined,grabStartY:undefined})
  _lastBeltX=undefined;_lastBeltY=undefined
})

/*

Events.

*/

$.when('click','[data-open-view]',event=>{
  const root=event.target.closest(tag);if(!root)return
  const view=event.target.closest('[data-open-view]').dataset.openView
  if(view==='color'){openPalette(root,'stroke');return}
  const{showOverlay,view:cv}=$.learn()
  if(showOverlay&&cv===view){closeOverlay(root);return}
  openView(root,view)
})

// palette input — routes to stroke or fill based on data-color-target attribute
$.when('input','plan98-palette',event=>{
  const{color}=event.detail
  const colorTarget=event.target.dataset.colorTarget
  if(colorTarget==='fill'){
    $.whisper({fillColor:color,showOverlay:false,view:null,colorTarget:null})
  } else {
    $.whisper({color,showOverlay:false,view:null,colorTarget:null})
  }
  const root=event.target.closest(tag)
  if(root)closeOverlay(root)
})

// pick-fill button inside brush overlay
$.when('click','[data-pick-fill]',event=>{
  const root=event.target.closest(tag);if(!root)return
  openPalette(root,'fill')
})
$.when('click','[data-close-overlay]',event=>{const r=event.target.closest(tag);if(r)closeOverlay(r)})
$.when('click','[data-new-frame]',event=>{const r=event.target.closest(tag);if(r)addFrame(r)})
$.when('click','[data-zoom-in]',e=>{const r=e.target.closest(tag);if(!r)return;setZoom(r,$.learn().zoom+0.25)})
$.when('click','[data-zoom-out]',e=>{const r=e.target.closest(tag);if(!r)return;setZoom(r,$.learn().zoom-0.25)})
$.when('click','[data-cycle-tool]',()=>$.whisper({tool:nextTool($.learn().tool)}))
$.when('click','[data-undo]',event=>{const r=event.target.closest(tag);if(r)undoFrame(r)})
$.when('click','[data-darkroom-open]',e=>{const r=e.target.closest(tag);if(r)openDarkroom(r)})
$.when('click','[data-darkroom-close]',e=>{const r=e.target.closest(tag);if(r)closeDarkroom(r)})
$.when('click','[data-dr-play]',e=>{const r=e.target.closest(tag);if(!r)return;_drPlaying?drStop(r):drStart(r)})
$.when('click','[data-dr-prev]',e=>{const r=e.target.closest(tag);if(!r)return;drStop(r);_drCurrent=Math.max(0,_drCurrent-1);drRenderFrame(r)})
$.when('click','[data-dr-next]',e=>{const r=e.target.closest(tag);if(!r)return;drStop(r);const{frames}=$.learn();_drCurrent=Math.min(frames.length-1,_drCurrent+1);drRenderFrame(r)})

/*

Keyboard.

*/

document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return
  const root=document.querySelector(tag);if(!root)return
  if((e.key==='z'||e.key==='Z')&&(e.ctrlKey||e.metaKey)){undoFrame(root);return}
  const{frames,playing,zoom,tool}=$.learn()
  const current = root._localCurrent ?? 0
  if(e.key==='ArrowRight'||e.key==='.')gotoFrame(root,Math.min(frames.length-1,current+1))
  if(e.key==='ArrowLeft'||e.key===',')gotoFrame(root,Math.max(0,current-1))
  if(e.key==='n')addFrame(root)
  if(e.key==='d')addFrame(root,current)  // 'd' duplicates current frame
  if(e.key===' '){e.preventDefault();playing?stopPlayback(root):startPlayback(root)}
  if(e.key==='p')openDarkroom(root)
  if(e.key==='Escape'){closeDarkroom(root);closeOverlay(root)}
  if(e.key==='+'||e.key==='=')setZoom(root,zoom+1)
  if(e.key==='-')setZoom(root,Math.max(0.25,zoom-0.25))
  if(e.key==='Tab'){e.preventDefault();$.whisper({tool:nextTool(tool)})}
  const tk={b:TOOLS.draw,v:TOOLS.pen,e:TOOLS.erase,f:TOOLS.fill,h:TOOLS.pan}
  if(tk[e.key])$.whisper({tool:tk[e.key]})
})

/*

Dog rested.

*/

customElements.define(tag, class FlipBook extends HTMLElement {
  connectedCallback() {
    if (this._booted) return
    this._booted = true
    if (!this.id) this.id = crypto.randomUUID()
    this.dispatchEvent(new Event('create'))
  }
  disconnectedCallback() { this._destroyed = true }
})
