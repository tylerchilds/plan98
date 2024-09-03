import tag from '@silly/tag'
import Webamp from 'webamp'

const $ = tag('webamp-player')

$.draw((target) => {
  const webamp = new Webamp({
    /**
     * Here we list three tracks. Note that the `metaData` fields and
     * duration are required to populate the playlist.  If any of those
     * fields are omitted, Webamp will download at least part of each file
     * on initial page load in order to determine the missing information.
     */
    initialTracks: [
      {
        metaData: {
          artist: "DJ Mike Llama",
          title: "Llama Whippin' Intro",
        },
        // NOTE: Your audio file must be served from the same domain as your HTML
        // file, or served with permissive CORS HTTP headers:
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
        url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3",
        duration: 5.322286,
      },
      {
        metaData: {
          title: "Heroines",
          artist: "Diablo Swing Orchestra",
        },
        // NOTE: Your audio file must be served from the same domain as your HTML
        // file, or served with permissive CORS HTTP headers:
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
        url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Diablo_Swing_Orchestra_-_01_-_Heroines.mp3",
        duration: 322.612245,
      },
      {
        metaData: {
          title: "We Are Going To Eclecfunk Your Ass",
          artist: "Eclectek",
        },
        // NOTE: Your audio file must be served from the same domain as your HTML
        // file, or served with permissive CORS HTTP headers:
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
        url: "https://raw.githubusercontent.com/captbaritone/webamp-music/4b556fbf/Eclectek_-_02_-_We_Are_Going_To_Eclecfunk_Your_Ass.mp3",
        duration: 190.093061,
      },
    ],
  });
  const pane = document.createElement('div')
  pane.id = 'webamp-player'
  target.appendChild(pane)
  webamp.renderWhenReady(document.querySelector('body'));
})
