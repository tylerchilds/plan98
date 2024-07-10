import module from '@silly/tag'
import Peer from 'simple-peer'

const $ = module('proximity-chat')

// get video/voice stream
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(gotMedia).catch(() => {})

function gotMedia (stream) {
  const initiator = target.getAttribute('initiator')
  const peer1 = new Peer({ initiator, stream: stream })
  const peer2 = new Peer()

  peer1.on('signal', data => {
    peer2.signal(data)
  })

  peer2.on('signal', data => {
    peer1.signal(data)
  })

  peer2.on('stream', stream => {
    $.draw((target) => {
      const video = document.createElement('video')
      if ('srcObject' in video) {
        video.srcObject = stream
      } else {
        video.src = window.URL.createObjectURL(stream) // for older browsers
      }
      target.appendChild(video)
      video.play()
    })
  })
}
