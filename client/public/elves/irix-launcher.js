import elf from '@silly/elf'

const $ = elf('irix-launcher')

$.draw(target => {
  const { tray } = target.dataset
  return `
    <div class="irix-launcher">
      <button class="application" data-tray="${tray}" data-href="/app/file-system">
        <span><sl-icon name="archive"></sl-icon></span>
        <input disabled value="Files" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/secure-mail">
        <span><sl-icon name="envelope-paper-heart"></sl-icon></span>

        <input disabled value="Mail" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/party-chat">
        <span><sl-icon name="chat"></sl-icon></span>

        <input disabled value="Chat" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/hello-bluesky">
        <span><sl-icon name="at"></sl-icon></span>

        <input disabled value="Blue Sky" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/owncast-broadcast">
        <span><sl-icon name="camera-reels"></sl-icon></span>

        <input disabled value="Owncast" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/solid-todolist">
        <span><sl-icon name="check"></sl-icon></span>
        <input disabled value="Tim's List" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/e2ee-todolist">
        <span><sl-icon name="check2-all"></sl-icon></span>
        <input disabled value="Ty's List" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/draw-term?src=/app/play-wheel?src=/app/hyper-script?src=/public/sagas/sillyz.computer/ethnography.saga">
        <span class="nonce-icon nonce"></span>
        <input disabled value="Synthia" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/impromptu-stagehand">
        <span><sl-icon name="person-raised-hand"></sl-icon></span>

        <input disabled value="Impromptu Stagehand" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/?world=ncity.executiontime.pub">
        <span><sl-icon name="egg-fried"></sl-icon></span>

        <input disabled value="Cyberpunk 2077" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/interdimensional-cable">
        <span><sl-icon name="tv"></sl-icon></span>

        <input disabled value="Interdimensional Cable" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/giggle-search">
        <span><sl-icon name="search"></sl-icon></span>

        <input disabled value="Giggle Search" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/middle-earth">
        <span><sl-icon name="globe2"></sl-icon></span>

        <input disabled value="Planet Earth" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/startup-wizard">
        <span><sl-icon name="shop"></sl-icon></span>

        <input disabled value="Story Mode" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/my-journal">
        <span><sl-icon name="journal"></sl-icon></span>

        <input disabled value="My Journal" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/hyper-browser">
        <span><sl-icon name="controller"></sl-icon></span>

        <input disabled value="Hyper Browser" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/simpleton-client?src=/private/${$.link}/${new Date().toISOString()}/${self.crypto.randomUUID()}.saga">
        <span><sl-icon name="people"></sl-icon></span>

        <input disabled value="Collaborative Text" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/bulletin-board?src=/private/${$.link}/${self.crypto.randomUUID()}.json&group=${self.crypto.randomUUID()}">
        <span><sl-icon name="window-stack"></sl-icon></span>

        <input disabled value="Bulletin Board" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/dial-tone">
        <span><sl-icon name="music-note"></<span>sl-icon></span>

        <input disabled value="Amateur Synth" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/sillyz-ocarina">
        <span><sl-icon name="music-note-beamed"></sl-icon></span>

        <input disabled value="Professional Synth" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/video-feed/">
        <span><sl-icon name="camera-reels"></sl-icon></span>

        <input disabled value="Video Feed" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/sillyz-piano">
        <span><sl-icon name="keyboard"></sl-icon></span>

        <input disabled value="Silly Piano" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/story-board">
        <span><sl-icon name="brush"></sl-icon></span>

        <input disabled value="Chalk Board" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/paint-app">
        <span><sl-icon name="paint-bucket"></sl-icon></span>

        <input disabled value="Old Paint" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/mine-sweeper/">
        <span><sl-icon name="minecart"></sl-icon></span>

        <input disabled value="Mine Sweeper" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/generic-park/">
        <span><sl-icon name="joystick"></sl-icon></span>

        <input disabled value="Generic Park" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/hyper-script">
        <span><sl-icon name="code-slash"></sl-icon></span>

        <input disabled value="Script Editor" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/code-module">
        <span><sl-icon name="braces"></sl-icon></span>

        <input disabled value="Code Editor" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/9/">
        <span><sl-icon name="music-player"></sl-icon></span>

        <input disabled value="Plan9 Zune" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/main-quest/">
        <span><sl-icon name="balloon"></sl-icon></span>

        <input disabled value="Havok Physics" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/wallet-1998/">
        <span><sl-icon name="wallet"></sl-icon></span>

        <input disabled value="Wallet" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/wallet-metamask/">
        <span><sl-icon name="wallet2"></sl-icon></span>

        <input disabled value="Meta Mask" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/sonic-knuckles/">
        <span><sl-icon name="browser-firefox"></sl-icon></span>

        <input disabled value="Sonic and Knuckles" class="app-name">
      </button>
      <button class="application" data-tray="${tray}" data-href="/app/draw-term/">
        <span><sl-icon name="terminal"></sl-icon></span>

        <input disabled value="Draw Term 98" class="app-name">
      </button>
    </div>
  `
})
