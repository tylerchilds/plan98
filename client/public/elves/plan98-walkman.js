import elf from '@silly/tag'

const $ = elf('plan98-walkman', {

})

$.draw(() => {
  return `
    CURRENTLY PLAYING
    ARTIST
    ALBUM
    TRACK
    <audio controls="true">
     <source src="/private/tychi.1998.social/Music/Fat_Night_-_Live_for_Each_Other/Fat_Night_-_Live_for_Each_Other_-_09_What_Do_You_Got-.mp3" type="audio/mpeg">
    </audio>
    <button data-next>
    next
    </button>
    <button data-back>
      back
    </button>
    UPCOMING

    ADD MORE
    RECOMMENDED PLAYLISTS
  `
})

$.when('click', '[data-next]', (event) => {
  const nextEvent = new CustomEvent("next", {
    detail: {
      type: "next",
    },
  });
  event.target.closest($.link).querySelector('audio').dispatchEvent(nextEvent)
})

$.when('click', '[data-back]', (event) => {
  const backEvent = new CustomEvent("back", {
    detail: {
      type: "back",
    },
  });
  event.target.closest($.link).querySelector('audio').dispatchEvent(backEvent)
})

$.when('next', 'audio', () => {
alert('next')
})
$.when('back', 'audio', () => {
alert('back')
})