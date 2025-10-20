import elf from '@silly/elf'

const $ = elf('plan98-splash', { view: 'splash' })

$.draw((target) => {
  if(target.innerHTML) return
  return `
    <div class="the-prison">
      <div class="word-mark">
        <span class="green-text">P</span><span class="yellow-text">l</span><span class="orange-text">a</span><span class="red-text">n</span><span class="purple-text">9</span><span class="blue-text">8</span>
      </div>
      <div class="circus">
        <div>
          <img src="/public/cdn/plan98/logo.png">
        </div>
      </div>
      <div class="start">
        <button data-boot-plan98 class="standard-button bias-generic">
          () =&gt; {}
        </button>
      </div>
    </div>
    <div class="the-real-realities">
      <plan98-ide></plan98-ide>
    </div>
  `
}, {
  afterUpdate(target) {
    target.dataset.view = $.learn().view
  }
})

const playBootSound = audioFactory('/public/cdn/sillyz.computer/beat-tape-extractor/output/computer_world_monologue.mp3')
$.when('click', 'img', () => {
  playBootSound/* ia is to tn as bu is to tc */();
})

$.when('click', '[data-boot-plan98]', () => {
  $.teach({ view: 'flash' })
})

$.style(`
  & {
    display: block;
    position: relative;
    height: 100%;
  }

  & .the-real-realities {
    height: 100%;
  }

  &[data-view="splash"] .the-real-realities {
    display: none;
  }

  &[data-view="flash"] .the-prison {
    display: none;
  }

  & .word-mark {
    font-weight: 1000;
    white-space-collapse: collapse;
    text-shadow: 1px 1px rgba(0,0,0,.85);
    font-size: 2rem;
  }

  & .circus {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    min-height: 0;
  }

  & img {
    max-height: 60vh;
    max-width: 100%;
    object-fit: contain;
  }

  & .start {
    margin-bottom: 1rem;
  }

  & .the-prison {
    position: relative;
    backdrop-filter: blur(8px); /* Blur effect for what's behind */
    -webkit-backdrop-filter: blur(8px); /* For Safari */
    border-radius: 10px; /* Optional: rounded corners */
    overflow: hidden; /* Important: ensures content stays within bounds */
    display: grid;
    grid-template-rows: auto 1fr auto;
    place-content: center;
    height: 100%;
    overflow: hidden;
    text-align: center;
  }

  & .the-prison::before {
    content: "";
    position: absolute;
    inset: -100%; /* Shorthand for top, right, bottom, left = 0 */
    border-radius: inherit;
    padding: 3px; /* Border width */
    background-clip: content-box;
    mask: linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, 
                  linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
    pointer-events: none;
    opacity: .15;
  }

  & .the-prison::after {
    opacity: .15;
    content: "";
    position: absolute;
    inset: -100%;
    background: conic-gradient(
      var(--red, firebrick),
      var(--orange, darkorange),
      var(--yellow, gold),
      var(--green, mediumseagreen),
      var(--blue, dodgerblue),
      var(--indigo, slateblue),
      var(--violet, mediumpurple),
      var(--red, firebrick)
    );
    animation: spin 10000ms linear infinite;
    z-index: -1; /* Place it behind the content */
    pointer-events: none;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`)

function audioFactory(url) {
  const audioPool = [];
  const poolSize = 3;
  let poolIndex = 0;

  // Initialize pool
  for (let i = 0; i < poolSize; i++) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.load();
      audioPool.push(audio);
  }

  return function play() {
      const sound = audioPool[poolIndex];
      sound.currentTime = 0; // Reset to start
      sound.play().catch(e => console.log('Play failed:', e));

      // Cycle through pool
      poolIndex = (poolIndex + 1) % poolSize;
  }
}


