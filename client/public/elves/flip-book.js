/*

In the beginning, Dog gave man the gift of sequential images,
and called it animation.

Man's first instruction: draw

*/

import elf from '@silly/elf'
import { Integer } from '@plan98/types'

const tag = 'flip-book'

/*

The frame is a hypermedia object.
Each frame may contain children — a universe within a universe.

*/

const db = {}

function makeFrame(w, h, id) {
  id = id || crypto.randomUUID()
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  db[id] = { id, canvas, strokes: [], children: null, childIndex: 0 }
  return id
}

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

/*

Gruvbox — warm, terminal, alive.
Transparent joins the palette. Erasure is also a mark.

*/

const PALETTE = [
  { color: 'transparent', label: '∅' },
  { color: '#1d2021' }, { color: '#282828' }, { color: '#3c3836' },
  { color: '#504945' }, { color: '#665c54' }, { color: '#7c6f64' },
  { color: '#928374' }, { color: '#a89984' }, { color: '#d5c4a1' },
  { color: '#ebdbb2' }, { color: '#fbf1c7' }, { color: '#cc241d' },
  { color: '#fb4934' }, { color: '#d65d0e' }, { color: '#fe8019' },
  { color: '#d79921' }, { color: '#fabd2f' }, { color: '#98971a' },
  { color: '#b8bb26' }, { color: '#458588' }, { color: '#83a598' },
  { color: '#689d6a' }, { color: '#8ec07c' }, { color: '#b16286' },
  { color: '#d3869b' }, { color: '#076678' },
]

/*

The tools.
draw  — pixel brush, auto-fills closed shapes on stroke end
pen   — bezier stroke with explicit fill color
erase — clear pixels
fill  — flood fill
pan   — move the viewport

*/

const TOOLS = {
  draw:  'draw',
  pen:   'pen',
  erase: 'erase',
  fill:  'fill',
  pan:   'pan',
}

/*

The views — what the overlay shows.

*/

const VIEWS = {
  color:    'color',
  brush:    'brush',
  canvas:   'canvas',
  settings: 'settings',
  export:   'export',
}

/*

The state is the soul of the application.

*/

const $ = elf(tag, {
  frames:       [],
  current:      0,
  canvasW:      320,
  canvasH:      240,
  tool:         TOOLS.draw,
  color:        '#ebdbb2',
  fillColor:    '#d79921',
  brushSize:    4,
  onion:        true,
  zoom:         2,
  panX:         0,
  panY:         0,
  playing:      false,
  fps:          12,
  loopMode:     'loop',
  menuOpen:     false,
  view:         null,
  showOverlay:  false,
  // toolbelt drag (v-log pattern)
  beltGrabbed:  false,
  beltDragged:  false,
  beltOffsetX:  0,
  beltOffsetY:  0,
  grabStartX:   undefined,
  grabStartY:   undefined,
})

/*

Dog said: let there be style.
Minimal. Dark. Warm.

*/

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    background: #1d2021;
    color: #ebdbb2;
    font-family: 'DM Mono', 'Courier New', monospace;
    overflow: hidden;
    position: relative;
    touch-action: none;
  }

  & * { box-sizing: border-box; }

  /*
    Root layout: artboard (1fr) + film reel (auto)
    Taskbar corners sit absolutely over the artboard.
  */

  & .app {
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100%;
    width: 100%;
  }

  /* ── ARTBOARD ── */

  & .artboard {
    position: relative;
    overflow: hidden;
    background: #1c1c1c;
  }

  & .artboard-inner {
    position: absolute;
    transform-origin: 0 0;
  }

  & .artboard-inner::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(45deg, #262626 25%, transparent 25%),
      linear-gradient(-45deg, #262626 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #262626 75%),
      linear-gradient(-45deg, transparent 75%, #262626 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0;
    background-color: #1d2021;
    z-index: 0;
  }

  & .onion-layer {
    position: absolute;
    top: 0; left: 0;
    pointer-events: none;
    image-rendering: pixelated;
  }

  & .draw-canvas {
    display: block;
    image-rendering: pixelated;
    position: relative;
    z-index: 10;
    touch-action: none;
    user-select: none;
  }

  & .pen-preview {
    position: absolute;
    top: 0; left: 0;
    pointer-events: none;
    z-index: 11;
    image-rendering: pixelated;
  }

  /* ── FILM REEL ── */

  & .film-reel {
    background: #1d2021;
    border-top: 1px solid #3c3836;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    overflow-x: auto;
    overflow-y: hidden;
    height: 80px;
    flex-shrink: 0;
  }

  & .film-reel::-webkit-scrollbar { height: 3px; }
  & .film-reel::-webkit-scrollbar-track { background: transparent; }
  & .film-reel::-webkit-scrollbar-thumb { background: #504945; border-radius: 2px; }

  & .reel-add {
    flex-shrink: 0;
    width: 52px; height: 60px;
    border: 1px dashed #504945;
    background: transparent;
    color: #665c54;
    font-size: 1.2rem;
    cursor: pointer;
    border-radius: 2px;
    display: grid;
    place-items: center;
    transition: all 80ms;
  }
  & .reel-add:hover { border-color: #d79921; color: #fabd2f; }

  & .reel-frame {
    flex-shrink: 0;
    position: relative;
    cursor: pointer;
    border: 2px solid #3c3836;
    border-radius: 2px;
    overflow: hidden;
    background: #282828;
    height: 60px;
    transition: border-color 80ms;
  }
  & .reel-frame:hover { border-color: #7c6f64; }
  & .reel-frame.active { border-color: #fabd2f; }

  & .reel-frame canvas {
    display: block;
    height: 100%;
    width: auto;
    image-rendering: pixelated;
  }

  & .reel-num {
    position: absolute;
    bottom: 1px; left: 3px;
    font-size: .45rem;
    color: #665c54;
    pointer-events: none;
  }
  & .reel-frame.active .reel-num { color: #fabd2f; }

  & .reel-del {
    position: absolute;
    top: 1px; right: 1px;
    width: 12px; height: 12px;
    background: rgba(29,32,33,.85);
    border: none;
    color: #665c54;
    font-size: .5rem;
    cursor: pointer;
    border-radius: 1px;
    display: none;
    place-items: center;
    z-index: 3;
  }
  & .reel-frame:hover .reel-del { display: grid; }
  & .reel-del:hover { color: #fb4934; }

  & .sub-badge {
    position: absolute;
    top: 1px; left: 3px;
    font-size: .4rem;
    color: #fe8019;
    pointer-events: none;
  }

  /* ── CORNER TASKBARS (absolute over artboard) ── */

  & .taskbar {
    position: absolute;
    left: 0; right: 0;
    z-index: 5;
    padding: .5rem;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: .5rem;
    pointer-events: none;
  }
  & .taskbar.-top { top: 0; }
  & .taskbar.-bottom { bottom: 0; }

  & .taskbar button,
  & .taskbar .right { pointer-events: all; }
  & .taskbar .right { text-align: right; }

  & .corner-btn {
    background: rgba(29,32,33,.75);
    border: 1px solid #3c3836;
    color: #a89984;
    font-family: 'DM Mono', monospace;
    font-size: .65rem;
    padding: .25rem .5rem;
    cursor: pointer;
    border-radius: 2px;
    backdrop-filter: blur(4px);
    transition: all 80ms;
    white-space: nowrap;
  }
  & .corner-btn:hover { border-color: #d79921; color: #fabd2f; }
  & .corner-btn.active { background: #d79921; color: #282828; border-color: #d79921; }

  /* ── ZOOM INDICATOR ── */

  & .zoom-pill {
    position: absolute;
    bottom: 88px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: .3rem;
    background: rgba(29,32,33,.8);
    border: 1px solid #3c3836;
    padding: .2rem .45rem;
    border-radius: 100px;
    z-index: 6;
    backdrop-filter: blur(4px);
    pointer-events: none;
  }
  & .zoom-pill span {
    font-size: .6rem;
    color: #665c54;
  }

  /* ── v-log COMPASS TOOLBELT ── */

  &[data-belt="true"] .artboard *,
  &[data-belt="true"] .taskbar,
  &[data-belt="true"] .zoom-pill {
    pointer-events: none !important;
  }

  &[data-belt="true"] .toolbelt-actions [data-menu] {
    pointer-events: all !important;
  }

  & .toolbelt-actions {
    position: absolute;
    bottom: 80px;
    right: 0;
    z-index: 20;
    padding: .5rem;
    display: inline-block;
    transform: translate(var(--belt-offset-x, 0px), var(--belt-offset-y, 0px));
    pointer-events: none;
    touch-action: none;
    user-select: none;
  }

  & .toolbelt-actions button {
    pointer-events: all;
  }

  & .the-compass {
    display: grid;
    grid-template-columns: repeat(6, calc(100% / 6));
    grid-template-rows: repeat(6, calc(100% / 6));
    aspect-ratio: 1;
    width: 10rem;
    height: 10rem;
    pointer-events: none;
  }

  & .the-compass button {
    position: relative;
    overflow: hidden;
    touch-action: manipulation;
    border: none;
    border-radius: 100%;
    color: #ebdbb2;
    border: 1px solid #d79921;
    background-image: radial-gradient(rgba(29,32,33,1), rgba(29,32,33,1) 25%, rgba(29,32,33,.75) 25%);
    pointer-events: all;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-image 80ms;
  }

  & .the-compass button:hover {
    background-image: radial-gradient(rgba(215,153,33,.6), rgba(215,153,33,.6) 25%, rgba(29,32,33,0) 25%);
    color: #fabd2f;
  }

  & .the-compass button.active {
    background-image: radial-gradient(#d79921, #d79921 25%, rgba(29,32,33,0) 25%);
    color: #282828;
  }

  & .the-compass button .icon {
    position: relative;
    z-index: 2;
    font-size: 1.1rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  /* compass root — center */
  & .the-compass .root {
    grid-row: 3 / 5;
    grid-column: 3 / 5;
    background-color: #1d2021;
    border-width: 2px;
    border-color: #fabd2f;
    color: #fabd2f;
    cursor: grab;
  }

  & .the-compass .root .icon {
    font-size: 1.3rem;
  }

  /* compass positions — mirrors v-log */
  & .the-compass .plus-2  { grid-row: 3 / 5; grid-column: 5 / 7; }
  & .the-compass .minus-2 { grid-row: 3 / 5; grid-column: 1 / 3; }
  & .the-compass .minus-7 { grid-row: 1 / 3; grid-column: 2 / 4; transform: translateY(13%); }
  & .the-compass .plus-7  { grid-row: 1 / 3; grid-column: 4 / 6; transform: translateY(13%); }
  & .the-compass .minus-5 { grid-row: 5 / 7; grid-column: 2 / 4; transform: translateY(-13%); }
  & .the-compass .plus-5  { grid-row: 5 / 7; grid-column: 4 / 6; transform: translateY(-13%); }

  /* ── OVERLAY PANEL ── */

  & .overlay-area {
    display: none;
    position: absolute;
    inset: 0;
    z-index: 50;
    background: rgba(29,32,33,.92);
    overflow: auto;
    backdrop-filter: blur(6px);
  }
  & .overlay-area.open { display: block; }

  & .overlay-inner {
    max-width: 360px;
    margin: 3rem auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  & .overlay-title {
    font-size: .6rem;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #665c54;
    margin-bottom: .25rem;
  }

  & .overlay-close {
    position: absolute;
    top: .75rem; right: .75rem;
    background: transparent;
    border: 1px solid #504945;
    color: #665c54;
    width: 28px; height: 28px;
    border-radius: 2px;
    cursor: pointer;
    font-size: .9rem;
    display: grid;
    place-items: center;
  }
  & .overlay-close:hover { color: #ebdbb2; border-color: #928374; }

  & .color-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  & .swatch {
    aspect-ratio: 1;
    border-radius: 2px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: transform 80ms;
    position: relative;
  }
  & .swatch.transparent-swatch {
    background: repeating-conic-gradient(#504945 0% 25%, #3c3836 0% 50%) 0 0 / 8px 8px;
  }
  & .swatch:hover { transform: scale(1.15); z-index: 1; }
  & .swatch.active { border-color: #fabd2f; }

  & .color-row-label {
    font-size: .55rem;
    color: #665c54;
    letter-spacing: .08em;
    margin-bottom: .2rem;
  }

  & input[type=color] {
    width: 100%;
    height: 28px;
    border: 1px solid #504945;
    background: #3c3836;
    cursor: pointer;
    border-radius: 2px;
    padding: 2px;
  }

  & input[type=range] { accent-color: #d79921; width: 100%; }

  & .range-row { display: flex; align-items: center; gap: .5rem; }
  & .range-val { font-size: .65rem; color: #928374; min-width: 1.5rem; text-align: right; }

  & .preset-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
  & .preset-btn {
    padding: .3rem .15rem;
    font-family: 'DM Mono', monospace;
    font-size: .55rem;
    background: #3c3836;
    border: 1px solid #504945;
    color: #928374;
    cursor: pointer;
    border-radius: 2px;
    text-align: center;
    transition: all 80ms;
  }
  & .preset-btn:hover { border-color: #d79921; color: #ebdbb2; }
  & .preset-btn.active { border-color: #d79921; color: #fabd2f; background: rgba(215,153,33,.12); }

  & .dims-row { display: flex; gap: 4px; align-items: center; }
  & .dims-row input {
    width: 60px;
    background: #3c3836;
    border: 1px solid #504945;
    color: #ebdbb2;
    font-family: 'DM Mono', monospace;
    font-size: .7rem;
    padding: .25rem .3rem;
    border-radius: 2px;
  }
  & .dims-row span { font-size: .65rem; color: #665c54; }

  & .row-btn {
    padding: .3rem .6rem;
    background: #3c3836;
    border: 1px solid #504945;
    color: #a89984;
    font-family: 'DM Mono', monospace;
    font-size: .65rem;
    cursor: pointer;
    border-radius: 2px;
    transition: all 80ms;
    width: 100%;
    text-align: left;
  }
  & .row-btn:hover { border-color: #d79921; color: #fabd2f; }
  & .row-btn.active { background: #d79921; color: #282828; border-color: #d79921; }

  & .tl-select {
    background: #3c3836;
    border: 1px solid #504945;
    color: #ebdbb2;
    font-family: 'DM Mono', monospace;
    font-size: .7rem;
    padding: .2rem .3rem;
    border-radius: 2px;
    cursor: pointer;
    width: 100%;
  }

  & .field-row {
    display: flex;
    align-items: center;
    gap: .5rem;
  }
  & .field-row label { font-size: .6rem; color: #928374; white-space: nowrap; min-width: 3rem; }

  /* ── DARKROOM ── */

  & .darkroom {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(29,32,33,.97);
    z-index: 100;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
  }
  & .darkroom.open { display: flex; }
  & .dr-canvas { image-rendering: pixelated; cursor: zoom-in; max-width: 88vw; max-height: 65vh; }
  & .dr-canvas.zoomed { cursor: zoom-out; transform: scale(var(--dr-zoom, 1)); }
  & .dr-controls { display: flex; align-items: center; gap: .75rem; }
  & .dr-btn {
    background: #3c3836;
    border: 1px solid #504945;
    color: #a89984;
    font-family: 'DM Mono', monospace;
    font-size: .7rem;
    padding: .3rem .65rem;
    cursor: pointer;
    border-radius: 2px;
    transition: all 80ms;
  }
  & .dr-btn:hover { border-color: #d79921; color: #fabd2f; }
  & .dr-btn.active { background: #d79921; color: #282828; border-color: #d79921; }
  & .dr-counter { font-size: .65rem; color: #665c54; min-width: 4rem; text-align: center; }
  & .dr-close {
    position: absolute;
    top: .75rem; right: .75rem;
    background: transparent;
    border: 1px solid #504945;
    color: #665c54;
    width: 28px; height: 28px;
    border-radius: 2px;
    cursor: pointer;
    font-size: .9rem;
    display: grid;
    place-items: center;
  }
  & .dr-close:hover { color: #ebdbb2; border-color: #928374; }
  & .dr-title { font-size: .65rem; color: #928374; letter-spacing: .08em; }

  /* sub-animation overlay */
  & .sub-overlay {
    position: fixed;
    inset: 0;
    background: rgba(29,32,33,.95);
    z-index: 200;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  & .sub-title { font-size: .65rem; color: #fe8019; letter-spacing: .1em; }
  & .sub-controls { display: flex; gap: .5rem; align-items: center; }

  & ::-webkit-scrollbar { width: 3px; height: 3px; }
  & ::-webkit-scrollbar-track { background: transparent; }
  & ::-webkit-scrollbar-thumb { background: #504945; border-radius: 2px; }
`)

/*

Dog drew the interface.
Minimal. Corners for context. Compass for tools.

*/

$.draw(target => {
  if (target._mounted) return update(target)
  return mount(target)
}, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
  const { beltGrabbed } = $.learn()
  target.dataset.belt = beltGrabbed ? 'true' : 'false'
}

function mount(target) {
  const { canvasW, canvasH, zoom, tool, fps, loopMode, beltOffsetX, beltOffsetY } = $.learn()

  return `
    <div class="app">

      <!-- ── ARTBOARD (1fr) ── -->
      <div class="artboard" data-artboard>
        <div class="artboard-inner" data-artboard-inner>
          <canvas class="draw-canvas" data-draw-canvas></canvas>
          <canvas class="pen-preview" data-pen-preview></canvas>
        </div>

        <!-- zoom pill -->
        <div class="zoom-pill">
          <span data-zoom-lbl>${zoom}00%</span>
          <span style="color:#3c3836">|</span>
          <span data-dim-lbl>${canvasW}×${canvasH}</span>
        </div>

        <!-- top corners -->
        <div class="taskbar -top">
          <div class="left">
            <button class="corner-btn" data-open-view="settings">⚙ settings</button>
          </div>
          <div class="center"></div>
          <div class="right">
            <button class="corner-btn" data-open-view="canvas">⬜ canvas</button>
          </div>
        </div>

        <!-- bottom corners -->
        <div class="taskbar -bottom">
          <div class="left">
            <button class="corner-btn" data-new-frame>+ frame</button>
          </div>
          <div class="center"></div>
          <div class="right">
            <button class="corner-btn" data-darkroom-open>▶ play</button>
          </div>
        </div>

        <!-- ── COMPASS TOOLBELT (v-log pattern) ── -->
        <div class="toolbelt-actions" style="--belt-offset-x:${beltOffsetX}px;--belt-offset-y:${beltOffsetY}px;">
          <div class="the-compass">

            <!-- root: grab handle + menu toggle -->
            <button data-menu data-drag class="root" data-tooltip="Tools">
              <span class="icon">${toolIcon(tool)}</span>
            </button>

            <!-- N: color picker -->
            <button class="minus-7" data-open-view="color" data-tooltip="Color">
              <span class="icon" style="width:1.1rem;height:1.1rem;border-radius:50%;background:${$.learn().color === 'transparent' ? 'repeating-conic-gradient(#504945 0% 25%,#3c3836 0% 50%) 0 0/6px 6px' : $.learn().color};border:1px solid #665c54;display:block;"></span>
            </button>

            <!-- NE: brush -->
            <button class="plus-7" data-open-view="brush" data-tooltip="Brush size">
              <span class="icon">✏</span>
            </button>

            <!-- E: redo -->
            <button class="plus-2" data-redo data-tooltip="Redo">
              <span class="icon">↷</span>
            </button>

            <!-- SE: export -->
            <button class="plus-5" data-open-view="export" data-tooltip="Export">
              <span class="icon">↓</span>
            </button>

            <!-- S: next tool -->
            <button class="minus-5" data-cycle-tool data-tooltip="Cycle tool">
              <span class="icon">${nextToolIcon(tool)}</span>
            </button>

            <!-- W: undo -->
            <button class="minus-2" data-undo data-tooltip="Undo">
              <span class="icon">↶</span>
            </button>

          </div>
        </div>

        <!-- overlay panel -->
        <div class="overlay-area" data-overlay>
          <div class="overlay-inner" data-overlay-inner></div>
          <button class="overlay-close" data-close-overlay>✕</button>
        </div>

      </div>

      <!-- ── FILM REEL (auto) ── -->
      <div class="film-reel" data-film-reel>
        <!-- frames injected here -->
        <button class="reel-add" data-new-frame>+</button>
      </div>

    </div>

    <!-- ── DARKROOM ── -->
    <div class="darkroom" data-darkroom>
      <button class="dr-close" data-darkroom-close>✕</button>
      <div class="dr-title" data-dr-title>flipbook</div>
      <canvas class="dr-canvas" data-dr-canvas></canvas>
      <div class="dr-controls">
        <button class="dr-btn" data-dr-prev>‹ prev</button>
        <button class="dr-btn active" data-dr-play>⏸ pause</button>
        <button class="dr-btn" data-dr-next>next ›</button>
        <span class="dr-counter" data-dr-counter>1 / 1</span>
        <span style="font-size:.6rem;color:#665c54;">click to zoom</span>
      </div>
    </div>
  `
}

function toolIcon(tool) {
  return { draw: '✏', pen: '🖊', erase: '⬜', fill: '⬛', pan: '✋' }[tool] || '✏'
}

function nextToolIcon(tool) {
  const order = [TOOLS.draw, TOOLS.pen, TOOLS.erase, TOOLS.fill, TOOLS.pan]
  const next = order[(order.indexOf(tool) + 1) % order.length]
  return toolIcon(next)
}

function update(target) {
  // Belt offset
  const { beltOffsetX, beltOffsetY, menuOpen, tool, view } = $.learn()
  const toolbelt = target.querySelector('.toolbelt-actions')
  if (toolbelt) toolbelt.style.cssText = `--belt-offset-x:${beltOffsetX}px;--belt-offset-y:${beltOffsetY}px;`

  // Compass open/closed
  const compass = target.querySelector('.the-compass')
  if (compass) compass.dataset.open = menuOpen

  // Tool icon on root
  const root = target.querySelector('.the-compass .root .icon')
  if (root) root.textContent = toolIcon(tool)

  // Cycle tool icon
  const cycleBtn = target.querySelector('[data-cycle-tool] .icon')
  if (cycleBtn) cycleBtn.textContent = nextToolIcon(tool)

  // Color swatch on color button — it's a styled span, not a text icon
  const colorIcon = target.querySelector('[data-open-view="color"] .icon')
  if (colorIcon) {
    const c = $.learn().color
    colorIcon.style.cssText = `width:1.1rem;height:1.1rem;border-radius:50%;background:${c === 'transparent' ? 'repeating-conic-gradient(#504945 0% 25%,#3c3836 0% 50%) 0 0/6px 6px' : c};border:1px solid #665c54;display:block;`
  }

  // Zoom / dim labels
  const zl = target.querySelector('[data-zoom-lbl]')
  const dl = target.querySelector('[data-dim-lbl]')
  const { zoom, canvasW, canvasH } = $.learn()
  if (zl) zl.textContent = zoom >= 1 ? `${zoom * 100|0}%` : `${Math.round(zoom*100)}%`
  if (dl) dl.textContent = `${canvasW}×${canvasH}`

  return null
}

function afterUpdate(target) {
  if (!target._mounted) {
    target._mounted = true
    boot(target)
  }
}

/*

Boot — the moment of creation.

*/

function boot(target) {
  const { canvasW, canvasH } = $.learn()

  target._artboard      = target.querySelector('[data-artboard]')
  target._artboardInner = target.querySelector('[data-artboard-inner]')
  target._drawCanvas    = target.querySelector('[data-draw-canvas]')
  target._penPreview    = target.querySelector('[data-pen-preview]')
  target._darkroom      = target.querySelector('[data-darkroom]')
  target._drCanvas      = target.querySelector('[data-dr-canvas]')
  target._onionCanvases = []

  initCanvas(target, canvasW, canvasH)

  const f0 = makeFrame(canvasW, canvasH)
  $.teach({ frames: [f0], current: 0 })
  loadCurrentFrame(target)
  fitZoom(target)

  renderReel(target)
  updateHdr(target)
  attachDrawEvents(target)
}

/*

Canvas initialization.

*/

function initCanvas(target, w, h) {
  const { zoom } = $.learn()
  const dc = target._drawCanvas
  const pp = target._penPreview

  dc.width = w; dc.height = h
  if (pp) { pp.width = w; pp.height = h }

  applyZoomToCanvases(target, zoom)

  // rebuild onion layers
  target._onionCanvases.forEach(c => c.remove())
  target._onionCanvases = []
  const opacities = [0.2, 0.4, 0.6, 0.8]
  opacities.forEach((op, i) => {
    const c = document.createElement('canvas')
    c.className = 'onion-layer'
    c.width = w; c.height = h
    c.style.opacity = op
    c.style.zIndex = i + 1
    target._artboardInner.insertBefore(c, dc)
    target._onionCanvases.push(c)
  })

  applyZoomToCanvases(target, zoom)
}

function applyZoomToCanvases(target, zoom) {
  const { canvasW, canvasH } = $.learn()
  const w = canvasW, h = canvasH
  const dc = target._drawCanvas
  const pp = target._penPreview

  const px = (n) => (n * zoom) + 'px'

  if (dc) { dc.style.width = px(w); dc.style.height = px(h) }
  if (pp) { pp.style.width = px(w); pp.style.height = px(h) }

  target._onionCanvases.forEach(c => {
    c.style.width = px(w); c.style.height = px(h)
  })
}

function setZoom(target, z) {
  const zoom = Math.max(0.25, Math.min(32, z))
  $.teach({ zoom })
  applyZoomToCanvases(target, zoom)
  const lbl = target.querySelector('[data-zoom-lbl]')
  if (lbl) lbl.textContent = zoom >= 1 ? `${zoom * 100|0}%` : `${Math.round(zoom*100)}%`
}

function fitZoom(target) {
  const { canvasW, canvasH } = $.learn()
  const rect = target._artboard.getBoundingClientRect()
  const z = Math.min((rect.width - 40) / canvasW, (rect.height - 80) / canvasH)
  setZoom(target, Math.max(0.25, z))

  // center in artboard
  const zv = $.learn().zoom
  const cx = (rect.width  - canvasW * zv) / 2
  const cy = (rect.height - canvasH * zv) / 2
  $.teach({ panX: cx, panY: cy })
  target._artboardInner.style.transform = `translate(${cx}px,${cy}px)`
}

function updateHdr(target) {
  const { canvasW, canvasH, zoom } = $.learn()
  const dl = target.querySelector('[data-dim-lbl]')
  const zl = target.querySelector('[data-zoom-lbl]')
  if (dl) dl.textContent = `${canvasW}×${canvasH}`
  if (zl) zl.textContent = zoom >= 1 ? `${zoom * 100|0}%` : `${Math.round(zoom*100)}%`
}

/*

Frame management — the passage of time.

*/

function saveCurrentFrame(target) {
  const { frames, current } = $.learn()
  if (!frames.length) return
  const f = db[frames[current]]
  const ctx = f.canvas.getContext('2d')
  ctx.clearRect(0, 0, f.canvas.width, f.canvas.height)
  ctx.drawImage(target._drawCanvas, 0, 0)
}

function loadCurrentFrame(target) {
  const { frames, current } = $.learn()
  const ctx = target._drawCanvas.getContext('2d')
  ctx.clearRect(0, 0, target._drawCanvas.width, target._drawCanvas.height)
  if (!frames.length) return
  ctx.drawImage(db[frames[current]].canvas, 0, 0)
}

function gotoFrame(target, idx) {
  saveCurrentFrame(target)
  $.teach({ current: idx })
  loadCurrentFrame(target)
  renderOnion(target)
  renderReel(target)
}

function addFrame(target, copyFrom = null) {
  const { frames, current, canvasW, canvasH } = $.learn()
  const id = makeFrame(canvasW, canvasH)
  if (copyFrom !== null && frames[copyFrom]) {
    db[id].canvas.getContext('2d').drawImage(db[frames[copyFrom]].canvas, 0, 0)
  }
  const newFrames = [...frames]
  newFrames.splice(current + 1, 0, id)
  saveCurrentFrame(target)
  $.teach({ frames: newFrames, current: current + 1 })
  loadCurrentFrame(target)
  renderOnion(target)
  renderReel(target)
}

function deleteFrame(target, idx) {
  const { frames } = $.learn()
  if (frames.length <= 1) return
  const newFrames = frames.filter((_, i) => i !== idx)
  let cur = $.learn().current
  if (cur >= newFrames.length) cur = newFrames.length - 1
  saveCurrentFrame(target)
  $.teach({ frames: newFrames, current: cur })
  loadCurrentFrame(target)
  renderOnion(target)
  renderReel(target)
}

function applyDims(target, w, h) {
  const { frames } = $.learn()
  saveCurrentFrame(target)
  frames.forEach(id => {
    const f = db[id]
    const tmp = document.createElement('canvas')
    tmp.width = w; tmp.height = h
    tmp.getContext('2d').drawImage(f.canvas, 0, 0, w, h)
    f.canvas = tmp
  })
  $.teach({ canvasW: w, canvasH: h })
  target._drawCanvas.width = w; target._drawCanvas.height = h
  if (target._penPreview) { target._penPreview.width = w; target._penPreview.height = h }
  target._onionCanvases.forEach(c => { c.width = w; c.height = h })
  initCanvas(target, w, h)
  loadCurrentFrame(target)
  renderOnion(target)
  renderReel(target)
  updateHdr(target)
  fitZoom(target)
}

/*

Onion skinning — the ghost of frames past.

*/

function renderOnion(target) {
  const { frames, current, onion } = $.learn()
  target._onionCanvases.forEach((c, i) => {
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, c.width, c.height)
    if (!onion) return
    const frameIdx = current - (4 - i)
    if (frameIdx >= 0 && frames[frameIdx]) {
      ctx.drawImage(db[frames[frameIdx]].canvas, 0, 0)
    }
  })
}

/*

Film reel renderer — the horizontal strip of panels.
Frame selection fixed: del button stops propagation imperatively.

*/

function renderReel(target) {
  const { frames, current } = $.learn()
  const reel = target.querySelector('[data-film-reel]')
  if (!reel) return

  // preserve the add button
  const addBtn = reel.querySelector('[data-new-frame]')
  reel.innerHTML = ''

  frames.forEach((id, idx) => {
    const f = db[id]

    const div = document.createElement('div')
    div.className = 'reel-frame' + (idx === current ? ' active' : '')

    // thumb canvas
    const c = document.createElement('canvas')
    c.width = f.canvas.width; c.height = f.canvas.height
    c.getContext('2d').drawImage(f.canvas, 0, 0)

    const num = document.createElement('span')
    num.className = 'reel-num'; num.textContent = idx + 1

    const del = document.createElement('button')
    del.className = 'reel-del'; del.textContent = '✕'
    // Imperative — stops propagation before the frame click fires
    del.addEventListener('click', (e) => {
      e.stopPropagation()
      saveCurrentFrame(target)
      deleteFrame(target, idx)
    })

    if (f.children) {
      const badge = document.createElement('span')
      badge.className = 'sub-badge'; badge.textContent = '↳'
      div.appendChild(badge)
    }

    // Frame click — select this frame
    div.addEventListener('click', () => gotoFrame(target, idx))

    // Right-click — open sub-animation
    div.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      openSubAnimation(target, id)
    })

    div.appendChild(c); div.appendChild(num); div.appendChild(del)
    reel.appendChild(div)
  })

  // re-append add button
  if (addBtn) reel.appendChild(addBtn)

  // scroll active into view
  const active = reel.querySelector('.active')
  if (active) active.scrollIntoView({ inline: 'nearest', block: 'nearest' })
}

/*

Drawing — man's sacred act of mark-making.

draw mode: freehand pixel brush, auto-fills closed shape on mouseup
pen mode:  click to place bezier points, double-click to close + fill

*/

let _drawing  = false
let _lastPx   = null
let _panStart  = null
let _panOrigin = null
let _penPoints = []    // pen mode: array of {x,y}
let _drawPoints = []   // draw mode: stroke points for auto-fill

const _undoStack = {}

function getCanvasPos(target, e) {
  const { zoom } = $.learn()
  const rect = target._drawCanvas.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  return {
    x: Math.floor((clientX - rect.left) / zoom),
    y: Math.floor((clientY - rect.top)  / zoom)
  }
}

function captureUndo(target) {
  const { frames, current, tool } = $.learn()
  if (tool === 'pan' || !frames.length) return
  const id = frames[current]
  if (!_undoStack[id]) _undoStack[id] = []
  const ctx = target._drawCanvas.getContext('2d')
  _undoStack[id].push(ctx.getImageData(0, 0, target._drawCanvas.width, target._drawCanvas.height))
  if (_undoStack[id].length > 30) _undoStack[id].shift()
}

function undoFrame(target) {
  const { frames, current } = $.learn()
  if (!frames.length) return
  const id = frames[current]
  if (!_undoStack[id] || !_undoStack[id].length) return
  target._drawCanvas.getContext('2d').putImageData(_undoStack[id].pop(), 0, 0)
  saveCurrentFrame(target)
  renderReel(target)
}

function redoFrame(target) {
  // redo stack omitted for brevity — placeholder
}

function plotPixel(ctx, x, y) {
  const { tool, color, brushSize } = $.learn()
  const half = Math.floor(brushSize / 2)
  if (tool === 'erase' || color === 'transparent') {
    ctx.clearRect(x - half, y - half, brushSize, brushSize)
  } else {
    ctx.fillStyle = color
    ctx.fillRect(x - half, y - half, brushSize, brushSize)
  }
}

function plotLine(ctx, x0, y0, x1, y1) {
  const dx = Math.abs(x1-x0), dy = Math.abs(y1-y0)
  const sx = x0<x1?1:-1, sy = y0<y1?1:-1
  let err = dx-dy, x = x0, y = y0
  while (true) {
    plotPixel(ctx, x, y)
    if (x===x1 && y===y1) break
    const e2 = 2*err
    if (e2>-dy) { err-=dy; x+=sx }
    if (e2< dx) { err+=dx; y+=sy }
  }
}

function hexToRgba(hex) {
  if (!hex || hex === 'transparent') return { r:0, g:0, b:0, a:0 }
  return {
    r: parseInt(hex.slice(1,3), 16),
    g: parseInt(hex.slice(3,5), 16),
    b: parseInt(hex.slice(5,7), 16),
    a: 255
  }
}

function floodFill(ctx, x, y, fillColor, w, h) {
  if (fillColor === 'transparent') {
    // flood-erase
    floodErase(ctx, x, y, w, h)
    return
  }
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  const ti = (y * w + x) * 4
  const tr = d[ti], tg = d[ti+1], tb = d[ti+2], ta = d[ti+3]
  const fc = hexToRgba(fillColor)
  if (tr===fc.r && tg===fc.g && tb===fc.b && ta===fc.a) return
  const stack = [[x,y]], vis = new Uint8Array(w * h)
  while (stack.length) {
    const [cx,cy] = stack.pop()
    if (cx<0||cx>=w||cy<0||cy>=h) continue
    const i = cy*w+cx; if (vis[i]) continue
    const pi = i*4
    if (d[pi]!==tr||d[pi+1]!==tg||d[pi+2]!==tb||d[pi+3]!==ta) continue
    vis[i]=1; d[pi]=fc.r; d[pi+1]=fc.g; d[pi+2]=fc.b; d[pi+3]=fc.a
    stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1])
  }
  ctx.putImageData(img, 0, 0)
}

function floodErase(ctx, x, y, w, h) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  const ti = (y * w + x) * 4
  const tr = d[ti], tg = d[ti+1], tb = d[ti+2], ta = d[ti+3]
  if (ta === 0) return
  const stack = [[x,y]], vis = new Uint8Array(w * h)
  while (stack.length) {
    const [cx,cy] = stack.pop()
    if (cx<0||cx>=w||cy<0||cy>=h) continue
    const i = cy*w+cx; if (vis[i]) continue
    const pi = i*4
    if (d[pi]!==tr||d[pi+1]!==tg||d[pi+2]!==tb||d[pi+3]!==ta) continue
    vis[i]=1; d[pi+3]=0
    stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1])
  }
  ctx.putImageData(img, 0, 0)
}

/*

Auto-fill for draw mode.
When the stroke ends and the shape appears roughly closed,
flood-fill the interior with fillColor.

*/

function tryAutoFill(target) {
  const { color, fillColor, canvasW, canvasH } = $.learn()
  if (!_drawPoints.length) return

  // Check if start and end are close enough to be "closed"
  const first = _drawPoints[0]
  const last  = _drawPoints[_drawPoints.length - 1]
  const dist  = Math.hypot(last.x - first.x, last.y - first.y)

  if (dist > 12) return // not closed enough

  // find centroid of stroke
  const cx = Math.round(_drawPoints.reduce((s, p) => s + p.x, 0) / _drawPoints.length)
  const cy = Math.round(_drawPoints.reduce((s, p) => s + p.y, 0) / _drawPoints.length)

  const ctx = target._drawCanvas.getContext('2d')
  floodFill(ctx, cx, cy, fillColor, canvasW, canvasH)
}

/*

Pen mode rendering — preview bezier path on the preview canvas.

*/

function renderPenPreview(target) {
  const pp = target._penPreview
  if (!pp) return
  const { color, fillColor, brushSize } = $.learn()
  const ctx = pp.getContext('2d')
  ctx.clearRect(0, 0, pp.width, pp.height)

  if (_penPoints.length < 2) {
    if (_penPoints.length === 1) {
      ctx.fillStyle = color === 'transparent' ? 'rgba(255,255,255,0.3)' : color
      ctx.fillRect(_penPoints[0].x - 2, _penPoints[0].y - 2, 4, 4)
    }
    return
  }

  ctx.beginPath()
  ctx.moveTo(_penPoints[0].x, _penPoints[0].y)
  for (let i = 1; i < _penPoints.length - 1; i++) {
    const mx = (_penPoints[i].x + _penPoints[i+1].x) / 2
    const my = (_penPoints[i].y + _penPoints[i+1].y) / 2
    ctx.quadraticCurveTo(_penPoints[i].x, _penPoints[i].y, mx, my)
  }
  const last = _penPoints[_penPoints.length - 1]
  ctx.lineTo(last.x, last.y)

  ctx.strokeStyle = color === 'transparent' ? 'rgba(255,255,255,0.4)' : color
  ctx.lineWidth = brushSize
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.globalAlpha = 0.85
  ctx.stroke()
  ctx.globalAlpha = 1

  // draw point handles
  _penPoints.forEach((p, i) => {
    ctx.fillStyle = i === 0 ? '#fabd2f' : '#d79921'
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
  })
}

function commitPenPath(target) {
  if (_penPoints.length < 2) { _penPoints = []; return }
  const { color, fillColor, brushSize, canvasW, canvasH } = $.learn()
  const ctx = target._drawCanvas.getContext('2d')

  ctx.beginPath()
  ctx.moveTo(_penPoints[0].x, _penPoints[0].y)
  for (let i = 1; i < _penPoints.length - 1; i++) {
    const mx = (_penPoints[i].x + _penPoints[i+1].x) / 2
    const my = (_penPoints[i].y + _penPoints[i+1].y) / 2
    ctx.quadraticCurveTo(_penPoints[i].x, _penPoints[i].y, mx, my)
  }
  ctx.lineTo(_penPoints[_penPoints.length-1].x, _penPoints[_penPoints.length-1].y)
  ctx.closePath()

  // fill
  if (fillColor && fillColor !== 'transparent') {
    ctx.fillStyle = fillColor
    ctx.fill()
  }

  // stroke
  if (color && color !== 'transparent') {
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  // clear preview
  const pp = target._penPreview
  if (pp) pp.getContext('2d').clearRect(0, 0, pp.width, pp.height)

  _penPoints = []
  saveCurrentFrame(target)
  renderReel(target)
}

/*

Attach draw events imperatively — canvas needs direct refs.

*/

function attachDrawEvents(target) {
  const dc = target._drawCanvas

  let _lastClickTime = 0

  dc.addEventListener('mousedown', e => {
    const { tool } = $.learn()
    if (tool === 'pan') { startPan(target, e); return }

    if (tool === 'pen') {
      const { x, y } = getCanvasPos(target, e)
      const now = Date.now()
      if (now - _lastClickTime < 350 && _penPoints.length > 1) {
        // double-click = commit path
        captureUndo(target)
        commitPenPath(target)
      } else {
        _penPoints.push({ x, y })
        renderPenPreview(target)
      }
      _lastClickTime = now
      return
    }

    captureUndo(target)
    _drawing = true
    _drawPoints = []
    const ctx = dc.getContext('2d')
    const { x, y } = getCanvasPos(target, e)

    if (tool === 'fill') {
      const { color, canvasW, canvasH } = $.learn()
      floodFill(ctx, x, y, color, canvasW, canvasH)
      saveCurrentFrame(target); renderReel(target)
      _drawing = false
      return
    }

    plotPixel(ctx, x, y)
    _drawPoints.push({ x, y })
    _lastPx = { x, y }
  })

  dc.addEventListener('mousemove', e => {
    const { tool } = $.learn()
    if (tool === 'pan') { movePan(target, e); return }
    if (tool === 'pen') {
      // preview line from last point to cursor
      if (_penPoints.length > 0) {
        const { x, y } = getCanvasPos(target, e)
        const preview = [..._penPoints, { x, y }]
        const saved = _penPoints
        _penPoints = preview
        renderPenPreview(target)
        _penPoints = saved
      }
      return
    }
    if (!_drawing) return
    const ctx = dc.getContext('2d')
    const { x, y } = getCanvasPos(target, e)
    if (_lastPx) plotLine(ctx, _lastPx.x, _lastPx.y, x, y)
    else plotPixel(ctx, x, y)
    _drawPoints.push({ x, y })
    _lastPx = { x, y }
  })

  dc.addEventListener('mouseup', e => {
    if ($.learn().tool === 'pan') { endPan(target); return }
    if ($.learn().tool === 'pen') return
    if (!_drawing) return
    _drawing = false; _lastPx = null

    // draw mode auto-fill
    if ($.learn().tool === TOOLS.draw) {
      tryAutoFill(target)
    }

    saveCurrentFrame(target)
    renderReel(target)
    _drawPoints = []
  })

  dc.addEventListener('mouseleave', e => {
    if (_drawing) {
      _drawing = false; _lastPx = null
      if ($.learn().tool === TOOLS.draw) tryAutoFill(target)
      saveCurrentFrame(target); renderReel(target)
      _drawPoints = []
    }
    endPan(target)
  })

  dc.addEventListener('touchstart', e => {
    e.preventDefault()
    const { tool } = $.learn()
    if (tool === 'pan') { startPan(target, e); return }
    if (tool === 'pen') {
      const { x, y } = getCanvasPos(target, e)
      _penPoints.push({ x, y }); renderPenPreview(target); return
    }
    captureUndo(target)
    _drawing = true; _drawPoints = []
    const ctx = dc.getContext('2d')
    const { x, y } = getCanvasPos(target, e)
    plotPixel(ctx, x, y); _drawPoints.push({ x, y }); _lastPx = { x, y }
  }, { passive: false })

  dc.addEventListener('touchmove', e => {
    e.preventDefault()
    const { tool } = $.learn()
    if (tool === 'pan') { movePan(target, e); return }
    if (tool === 'pen') return
    if (!_drawing) return
    const ctx = dc.getContext('2d')
    const { x, y } = getCanvasPos(target, e)
    if (_lastPx) plotLine(ctx, _lastPx.x, _lastPx.y, x, y)
    _drawPoints.push({ x, y }); _lastPx = { x, y }
  }, { passive: false })

  dc.addEventListener('touchend', e => {
    e.preventDefault()
    if ($.learn().tool === 'pen') return
    _drawing = false; _lastPx = null
    if ($.learn().tool === TOOLS.draw) tryAutoFill(target)
    saveCurrentFrame(target); renderReel(target); _drawPoints = []
  })

  // Escape cancels pen path
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _penPoints.length) {
      _penPoints = []
      if (target._penPreview) target._penPreview.getContext('2d').clearRect(0,0,target._penPreview.width,target._penPreview.height)
    }
  })
}

/*

Pan — man's desire to wander.

*/

function startPan(target, e) {
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  _panStart  = { x: clientX, y: clientY }
  _panOrigin = { x: $.learn().panX, y: $.learn().panY }
  target._artboard.style.cursor = 'grabbing'
}

function movePan(target, e) {
  if (!_panStart) return
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  const panX = _panOrigin.x + (clientX - _panStart.x)
  const panY = _panOrigin.y + (clientY - _panStart.y)
  $.teach({ panX, panY })
  target._artboardInner.style.transform = `translate(${panX}px,${panY}px)`
}

function endPan(target) {
  _panStart = null
  target._artboard.style.cursor = ''
}

/*

Playback.

*/

let _playInterval = null
let _playDir = 1

function startPlayback(target) {
  $.teach({ playing: true })
  _playDir = 1
  _playInterval = setInterval(() => {
    const { frames, current, loopMode } = $.learn()
    saveCurrentFrame(target)
    let next = current + _playDir
    if (loopMode === 'loop') {
      next = ((next % frames.length) + frames.length) % frames.length
    } else if (loopMode === 'pingpong') {
      if (next >= frames.length) { next = frames.length - 2; _playDir = -1 }
      else if (next < 0) { next = 1; _playDir = 1 }
    } else {
      if (next >= frames.length) { next = frames.length - 1; stopPlayback(target); return }
    }
    $.teach({ current: Math.max(0, Math.min(frames.length - 1, next)) })
    loadCurrentFrame(target)
    renderOnion(target)
    renderReel(target)
  }, 1000 / $.learn().fps)
}

function stopPlayback(target) {
  $.teach({ playing: false })
  clearInterval(_playInterval)
}

/*

Darkroom.

*/

let _drPlaying = false, _drInterval = null, _drZoomed = false, _drDir = 1

function openDarkroom(target) {
  const { canvasW, canvasH } = $.learn()
  const dc = target._drCanvas
  target._darkroom.classList.add('open')
  dc.width = canvasW; dc.height = canvasH

  const scale = Math.min((window.innerWidth*.85)/canvasW, (window.innerHeight*.62)/canvasH)
  dc.style.width  = (canvasW * scale) + 'px'
  dc.style.height = (canvasH * scale) + 'px'
  dc.style.setProperty('--dr-zoom', scale * 2)

  if (!dc._zoomWired) {
    dc._zoomWired = true
    dc.addEventListener('click', () => {
      _drZoomed = !_drZoomed
      dc.classList.toggle('zoomed', _drZoomed)
    })
  }
  drRenderFrame(target); drStart(target)
}

function closeDarkroom(target) {
  target._darkroom.classList.remove('open')
  drStop(target)
  _drZoomed = false
  target._drCanvas.classList.remove('zoomed')
}

function drRenderFrame(target) {
  const { frames, current, canvasW, canvasH, fps, loopMode } = $.learn()
  const dc = target._drCanvas
  const ctx = dc.getContext('2d')
  ctx.clearRect(0, 0, dc.width, dc.height)
  if (frames.length) ctx.drawImage(db[frames[current]].canvas, 0, 0)
  const counter = target.querySelector('[data-dr-counter]')
  if (counter) counter.textContent = `${current+1} / ${frames.length}`
  const title = target.querySelector('[data-dr-title]')
  if (title) title.textContent = `${canvasW}×${canvasH} · ${fps}fps · ${loopMode}`
}

function drStart(target) {
  _drPlaying = true
  const btn = target.querySelector('[data-dr-play]')
  if (btn) { btn.textContent = '⏸ pause'; btn.classList.add('active') }
  _drDir = 1
  _drInterval = setInterval(() => {
    const { frames, current, loopMode } = $.learn()
    let next = current + _drDir
    if (loopMode === 'loop') {
      next = ((next % frames.length) + frames.length) % frames.length
    } else if (loopMode === 'pingpong') {
      if (next >= frames.length) { next = frames.length - 2; _drDir = -1 }
      else if (next < 0) { next = 1; _drDir = 1 }
    } else {
      if (next >= frames.length) { next = frames.length - 1; drStop(target); return }
    }
    $.teach({ current: Math.max(0, Math.min(frames.length-1, next)) })
    drRenderFrame(target)
  }, 1000 / $.learn().fps)
}

function drStop(target) {
  _drPlaying = false
  clearInterval(_drInterval)
  const btn = target.querySelector('[data-dr-play]')
  if (btn) { btn.textContent = '▶ play'; btn.classList.remove('active') }
}

/*

Export.

*/

async function exportMp4(target) {
  const { frames, canvasW, canvasH, fps, loopMode } = $.learn()
  saveCurrentFrame(target)
  const off = document.createElement('canvas')
  off.width = canvasW; off.height = canvasH
  const octx = off.getContext('2d')
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm'
  const stream = off.captureStream(fps)
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 })
  const chunks = []
  rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
  rec.onstop = () => {
    const blob = new Blob(chunks, { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'flipbook.webm'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
  rec.start()
  let sequence = [...frames]
  if (loopMode === 'pingpong') sequence = [...frames, ...[...frames].reverse().slice(1,-1)]
  for (const id of sequence) {
    octx.clearRect(0,0,canvasW,canvasH)
    octx.drawImage(db[id].canvas,0,0)
    await new Promise(r => setTimeout(r, 1000/fps))
  }
  rec.stop()
}

/*

Sub-animation — right-click a reel frame to enter.

*/

function openSubAnimation(target, parentId) {
  const f = db[parentId]
  const { canvasW, canvasH, fps } = $.learn()

  if (!f.children) {
    const child0 = makeFrame(canvasW, canvasH)
    db[child0].canvas.getContext('2d').drawImage(f.canvas, 0, 0)
    const child1 = makeFrame(canvasW, canvasH)
    f.children = [child0, child1]; f.childIndex = 0
  }

  const overlay = document.createElement('div')
  overlay.className = 'sub-overlay'
  const title = document.createElement('div')
  title.className = 'sub-title'
  const subCanvas = document.createElement('canvas')
  subCanvas.width = canvasW; subCanvas.height = canvasH
  const scale = Math.min((window.innerWidth*.7)/canvasW, (window.innerHeight*.55)/canvasH)
  subCanvas.style.cssText = `width:${canvasW*scale}px;height:${canvasH*scale}px;image-rendering:pixelated;border:1px solid #3c3836;cursor:crosshair;`

  let subIdx = f.childIndex || 0, subDrawing = false

  function renderSub() {
    const ctx = subCanvas.getContext('2d')
    ctx.clearRect(0,0,canvasW,canvasH)
    ctx.drawImage(db[f.children[subIdx]].canvas,0,0)
    title.textContent = `↳ sub-animation · cel ${subIdx+1}/${f.children.length}`
  }
  function updateParent() {
    const pctx = db[parentId].canvas.getContext('2d')
    pctx.clearRect(0,0,canvasW,canvasH)
    pctx.drawImage(db[f.children[f.childIndex||0]].canvas,0,0)
  }

  subCanvas.addEventListener('mousedown', e => {
    subDrawing = true
    const r = subCanvas.getBoundingClientRect()
    const x = Math.floor((e.clientX-r.left)/scale), y = Math.floor((e.clientY-r.top)/scale)
    const { color, brushSize } = $.learn()
    const cc = db[f.children[subIdx]].canvas.getContext('2d')
    const sc = subCanvas.getContext('2d')
    ;[cc,sc].forEach(ctx => { ctx.fillStyle=color; ctx.fillRect(x,y,brushSize,brushSize) })
  })
  subCanvas.addEventListener('mousemove', e => {
    if (!subDrawing) return
    const r = subCanvas.getBoundingClientRect()
    const x = Math.floor((e.clientX-r.left)/scale), y = Math.floor((e.clientY-r.top)/scale)
    const { color, brushSize } = $.learn()
    const cc = db[f.children[subIdx]].canvas.getContext('2d')
    const sc = subCanvas.getContext('2d')
    ;[cc,sc].forEach(ctx => { ctx.fillStyle=color; ctx.fillRect(x,y,brushSize,brushSize) })
  })
  subCanvas.addEventListener('mouseup', () => { subDrawing=false; updateParent() })

  const controls = document.createElement('div'); controls.className = 'sub-controls'
  function makeBtn(label) { const b = document.createElement('button'); b.className='dr-btn'; b.textContent=label; return b }

  const prevBtn = makeBtn('‹ prev')
  prevBtn.addEventListener('click', () => { subIdx=Math.max(0,subIdx-1); f.childIndex=subIdx; renderSub() })
  const nextBtn = makeBtn('next ›')
  nextBtn.addEventListener('click', () => { subIdx=Math.min(f.children.length-1,subIdx+1); f.childIndex=subIdx; renderSub() })
  const addBtn = makeBtn('+ cel')
  addBtn.addEventListener('click', () => { const nid=makeFrame(canvasW,canvasH); f.children.splice(subIdx+1,0,nid); subIdx++; f.childIndex=subIdx; renderSub() })
  let subInt=null
  const playBtn = makeBtn('▶')
  playBtn.addEventListener('click', () => {
    if (subInt){clearInterval(subInt);subInt=null;playBtn.textContent='▶';return}
    playBtn.textContent='⏸'
    subInt=setInterval(()=>{subIdx=(subIdx+1)%f.children.length;f.childIndex=subIdx;renderSub()},1000/fps)
  })
  const closeBtn = makeBtn('✕ close')
  closeBtn.addEventListener('click', () => {
    clearInterval(subInt); updateParent(); saveCurrentFrame(target); renderReel(target); overlay.remove()
  })

  controls.append(prevBtn,nextBtn,addBtn,playBtn,closeBtn)
  overlay.append(title,subCanvas,controls)
  document.body.appendChild(overlay); renderSub()
}

/*

Overlay panel renderer.

*/

function openView(target, view) {
  $.teach({ view, showOverlay: true })
  const overlay = target.querySelector('[data-overlay]')
  const inner   = target.querySelector('[data-overlay-inner]')
  if (!overlay || !inner) return
  overlay.classList.add('open')
  inner.innerHTML = renderView(view, target)
  wireOverlay(inner, target)
}

function closeOverlay(target) {
  $.teach({ view: null, showOverlay: false })
  const overlay = target.querySelector('[data-overlay]')
  if (overlay) overlay.classList.remove('open')
}

function renderView(view, target) {
  const { color, fillColor, brushSize, onion, fps, loopMode, canvasW, canvasH } = $.learn()

  if (view === VIEWS.color) {
    const stroke = color
    const fill   = fillColor
    return `
      <div class="overlay-title">stroke color</div>
      <div class="color-grid">
        ${PALETTE.map(p => `
          <div class="swatch ${p.color === 'transparent' ? 'transparent-swatch' : ''} ${stroke === p.color ? 'active' : ''}"
            style="${p.color !== 'transparent' ? `background:${p.color}` : ''}"
            data-set-color="${p.color}">
          </div>
        `).join('')}
      </div>
      <input type="color" value="${stroke !== 'transparent' ? stroke : '#ebdbb2'}" data-custom-color>
      <div class="overlay-title" style="margin-top:.75rem;">fill color</div>
      <div class="color-grid">
        ${PALETTE.map(p => `
          <div class="swatch ${p.color === 'transparent' ? 'transparent-swatch' : ''} ${fill === p.color ? 'active' : ''}"
            style="${p.color !== 'transparent' ? `background:${p.color}` : ''}"
            data-set-fill="${p.color}">
          </div>
        `).join('')}
      </div>
      <input type="color" value="${fill !== 'transparent' ? fill : '#d79921'}" data-custom-fill>
    `
  }

  if (view === VIEWS.brush) {
    return `
      <div class="overlay-title">brush size</div>
      <div class="range-row">
        <input type="range" min="1" max="64" value="${brushSize}" data-brush-slider>
        <span class="range-val" data-brush-val>${brushSize}</span>
      </div>
      <div class="overlay-title" style="margin-top:.75rem;">onion skin</div>
      <button class="row-btn ${onion ? 'active' : ''}" data-toggle-onion>
        ${onion ? '● on' : '○ off'}
      </button>
    `
  }

  if (view === VIEWS.canvas) {
    return `
      <div class="overlay-title">preset</div>
      <div class="preset-grid">
        ${PRESETS.map(p => `
          <button class="preset-btn ${p.w===canvasW&&p.h===canvasH?'active':''}"
            data-preset-w="${p.w}" data-preset-h="${p.h}">${p.label}</button>
        `).join('')}
      </div>
      <div class="overlay-title" style="margin-top:.75rem;">custom</div>
      <div class="dims-row">
        <input type="number" value="${canvasW}" min="1" max="3840" data-cust-w>
        <span>×</span>
        <input type="number" value="${canvasH}" min="1" max="2160" data-cust-h>
        <button class="row-btn" style="width:auto;" data-apply-dims>ok</button>
      </div>
    `
  }

  if (view === VIEWS.settings) {
    return `
      <div class="overlay-title">playback</div>
      <div class="field-row">
        <label>fps</label>
        <select class="tl-select" data-fps-select>
          ${[1,2,4,6,8,12,24,30,60].map(v => `<option value="${v}" ${v===fps?'selected':''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="field-row" style="margin-top:.4rem;">
        <label>mode</label>
        <select class="tl-select" data-loop-select>
          ${['loop','pingpong','once'].map(v => `<option value="${v}" ${v===loopMode?'selected':''}>${v}</option>`).join('')}
        </select>
      </div>
    `
  }

  if (view === VIEWS.export) {
    return `
      <div class="overlay-title">export</div>
      <button class="row-btn" data-do-export>↓ export webm</button>
      <button class="row-btn" style="margin-top:.4rem;" data-do-play>▶ fullscreen play</button>
    `
  }

  return ''
}

function wireOverlay(inner, target) {
  // color swatches
  inner.querySelectorAll('[data-set-color]').forEach(el => {
    el.addEventListener('click', () => {
      $.teach({ color: el.dataset.setColor })
      inner.querySelectorAll('[data-set-color]').forEach(s => s.classList.remove('active'))
      el.classList.add('active')
      // update compass color swatch
      const colorBtn = target.querySelector('[data-open-view="color"] span')
      if (colorBtn) {
        const c = $.learn().color
        colorBtn.style.background = c === 'transparent'
          ? 'repeating-conic-gradient(#504945 0% 25%,#3c3836 0% 50%) 0 0/8px 8px'
          : c
      }
    })
  })

  inner.querySelectorAll('[data-set-fill]').forEach(el => {
    el.addEventListener('click', () => {
      $.teach({ fillColor: el.dataset.setFill })
      inner.querySelectorAll('[data-set-fill]').forEach(s => s.classList.remove('active'))
      el.classList.add('active')
    })
  })

  const customColor = inner.querySelector('[data-custom-color]')
  if (customColor) customColor.addEventListener('input', e => { $.teach({ color: e.target.value }) })

  const customFill = inner.querySelector('[data-custom-fill]')
  if (customFill) customFill.addEventListener('input', e => { $.teach({ fillColor: e.target.value }) })

  // brush
  const brushSlider = inner.querySelector('[data-brush-slider]')
  if (brushSlider) brushSlider.addEventListener('input', e => {
    const v = Integer(e.target.value)
    $.teach({ brushSize: v })
    const lbl = inner.querySelector('[data-brush-val]')
    if (lbl) lbl.textContent = v
  })

  const onionBtn = inner.querySelector('[data-toggle-onion]')
  if (onionBtn) onionBtn.addEventListener('click', () => {
    const next = !$.learn().onion
    $.teach({ onion: next })
    onionBtn.classList.toggle('active', next)
    onionBtn.textContent = next ? '● on' : '○ off'
    renderOnion(target)
  })

  // canvas presets
  inner.querySelectorAll('[data-preset-w]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyDims(target, Integer(btn.dataset.presetW), Integer(btn.dataset.presetH))
      closeOverlay(target)
    })
  })

  const applyBtn = inner.querySelector('[data-apply-dims]')
  if (applyBtn) applyBtn.addEventListener('click', () => {
    const w = Integer(inner.querySelector('[data-cust-w]').value) || 320
    const h = Integer(inner.querySelector('[data-cust-h]').value) || 240
    applyDims(target, w, h)
    closeOverlay(target)
  })

  // settings
  const fpsSelect = inner.querySelector('[data-fps-select]')
  if (fpsSelect) fpsSelect.addEventListener('change', e => $.teach({ fps: Integer(e.target.value) }))

  const loopSelect = inner.querySelector('[data-loop-select]')
  if (loopSelect) loopSelect.addEventListener('change', e => $.teach({ loopMode: e.target.value }))

  // export
  const doExport = inner.querySelector('[data-do-export]')
  if (doExport) doExport.addEventListener('click', () => { closeOverlay(target); exportMp4(target) })

  const doPlay = inner.querySelector('[data-do-play]')
  if (doPlay) doPlay.addEventListener('click', () => { closeOverlay(target); openDarkroom(target) })
}

/*

v-log compass toolbelt drag — exact pattern.

*/

let _lastBeltX, _lastBeltY

$.when('pointerdown', '[data-drag]', (event) => {
  event.preventDefault()
  const { clientX, clientY } = event
  $.teach({
    grabStartX: clientX,
    grabStartY: clientY,
    beltGrabbed: true,
    beltDragged: false
  })
})

$.when('pointermove', '.artboard', (event) => {
  const { clientX, clientY } = event
  const { beltGrabbed, beltDragged, beltOffsetX, beltOffsetY, grabStartX, grabStartY } = $.learn()
  if (!beltGrabbed) return

  if (grabStartX !== undefined && grabStartY !== undefined) {
    const dx = Math.abs(clientX - grabStartX)
    const dy = Math.abs(clientY - grabStartY)
    if ((dx > 5 || dy > 5) && !beltDragged) {
      event.preventDefault()
      $.teach({ beltOffsetX: beltOffsetX || 0, beltOffsetY: beltOffsetY || 0, beltDragged: true })
    }
  }

  if (!$.learn().beltDragged) return
  event.preventDefault()

  if (_lastBeltX !== undefined && _lastBeltY !== undefined) {
    $.teach({
      beltOffsetX: beltOffsetX + (clientX - _lastBeltX),
      beltOffsetY: beltOffsetY + (clientY - _lastBeltY),
    })
  }
  _lastBeltX = clientX; _lastBeltY = clientY
})

$.when('pointerup', '.artboard', (event) => {
  event.target.releasePointerCapture(event.pointerId)
  const { beltDragged } = $.learn()
  if (!beltDragged && event.target.closest('[data-menu]')) {
    $.teach({ menuOpen: !$.learn().menuOpen })
  }
  $.teach({ beltGrabbed: false, beltDragged: false, grabStartX: undefined, grabStartY: undefined })
  _lastBeltX = undefined; _lastBeltY = undefined
})

$.when('pointerup', '[data-drag]', (event) => {
  event.target.releasePointerCapture(event.pointerId)
  const { beltDragged } = $.learn()
  if (!beltDragged) {
    $.teach({ menuOpen: !$.learn().menuOpen })
  }
  $.teach({ beltGrabbed: false, beltDragged: false, grabStartX: undefined, grabStartY: undefined })
  _lastBeltX = undefined; _lastBeltY = undefined
})

/*

Events — man communicating with the machine.

*/

$.when('click', '[data-open-view]', (event) => {
  const root = event.target.closest(tag); if (!root) return
  const view = event.target.closest('[data-open-view]').dataset.openView
  const { showOverlay, view: currentView } = $.learn()
  if (showOverlay && currentView === view) { closeOverlay(root); return }
  openView(root, view)
})

$.when('click', '[data-close-overlay]', (event) => {
  const root = event.target.closest(tag); if (!root) return
  closeOverlay(root)
})

$.when('click', '[data-new-frame]', (event) => {
  const root = event.target.closest(tag); if (!root) return
  addFrame(root)
})

$.when('click', '[data-cycle-tool]', (event) => {
  const order = [TOOLS.draw, TOOLS.pen, TOOLS.erase, TOOLS.fill, TOOLS.pan]
  const { tool } = $.learn()
  const next = order[(order.indexOf(tool) + 1) % order.length]
  $.teach({ tool: next })
})

$.when('click', '[data-undo]', (event) => {
  const root = event.target.closest(tag); if (!root) return
  undoFrame(root)
})

$.when('click', '[data-redo]', (event) => {
  // placeholder
})

$.when('click', '[data-darkroom-open]', (e) => { const r = e.target.closest(tag); if (r) openDarkroom(r) })
$.when('click', '[data-darkroom-close]', (e) => { const r = e.target.closest(tag); if (r) closeDarkroom(r) })

$.when('click', '[data-dr-play]', (e) => {
  const root = e.target.closest(tag); if (!root) return
  _drPlaying ? drStop(root) : drStart(root)
})

$.when('click', '[data-dr-prev]', (e) => {
  const root = e.target.closest(tag); if (!root) return
  drStop(root)
  $.teach({ current: Math.max(0, $.learn().current - 1) })
  drRenderFrame(root)
})

$.when('click', '[data-dr-next]', (e) => {
  const root = e.target.closest(tag); if (!root) return
  drStop(root)
  const { frames, current } = $.learn()
  $.teach({ current: Math.min(frames.length - 1, current + 1) })
  drRenderFrame(root)
})

/*

Keyboard shortcuts.

*/

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
  const root = document.querySelector(tag); if (!root) return

  if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) { undoFrame(root); return }

  const { frames, current, playing, zoom } = $.learn()
  if (e.key === 'ArrowRight' || e.key === '.') gotoFrame(root, Math.min(frames.length-1, current+1))
  if (e.key === 'ArrowLeft'  || e.key === ',') gotoFrame(root, Math.max(0, current-1))
  if (e.key === 'n') addFrame(root)
  if (e.key === 'd') addFrame(root, current)
  if (e.key === ' ')  { e.preventDefault(); playing ? stopPlayback(root) : startPlayback(root) }
  if (e.key === 'p')  openDarkroom(root)
  if (e.key === 'Escape') { closeDarkroom(root); closeOverlay(root) }
  if (e.key === '+' || e.key === '=') setZoom(root, zoom + 1)
  if (e.key === '-') setZoom(root, Math.max(0.25, zoom - 0.25))

  const toolKeys = { b: TOOLS.draw, v: TOOLS.pen, e: TOOLS.erase, f: TOOLS.fill, h: TOOLS.pan }
  if (toolKeys[e.key]) $.teach({ tool: toolKeys[e.key] })
})

/*

Dog rested.
And on the seventh frame, man drew something worth watching.

*/

customElements.define(tag, class FlipBook extends HTMLElement {
  connectedCallback() {
    if (this._booted) return
    this._booted = true
    if (!this.id) this.id = crypto.randomUUID()
    this.dispatchEvent(new Event('create'))
  }
})
