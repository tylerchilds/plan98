import module from "@silly/tag";
import { init, Wasmer } from "@wasmer/sdk";

const $ = module('ffmpeg-demo')

$.draw(target => {
  const { src } = $.learn()
  if(!target.processing) start(target)
  return src
    ? `<a href="${src}" download="${$.link}">Download</a>`
    : 'Loading!!!'
})

async function start(target) {
  target.processing = true
  await init();

  let ffmpeg = await Wasmer.fromRegistry("wasmer/ffmpeg");
  let resp = await fetch("https://cdn.wasmer.io/media/wordpress.mp4");
  let video = await resp.arrayBuffer();

  // We take stdin ("-") as input and write the output to stdout ("-") as a
  // WAV audio stream.
  const instance = await ffmpeg.entrypoint.run({
    args: ["-i", "-", "-f", "wav", "-"],
    stdin: new Uint8Array(video),
  });
  const { stdoutBytes } = await instance.wait();
  downloadBlob(stdoutBytes)
}

// refactor of: https://stackoverflow.com/a/33622881
function downloadBlob (data) {
  const downloadURL = (data) => {
    const a = document.createElement('a')
    a.href = data
    document.body.appendChild(a)
    a.style.display = 'none'
    a.download = $.link
    a.click()
    a.remove()
  }

  const blob = new Blob([data])

  const url = window.URL.createObjectURL(blob)

  downloadURL(url)
  $.teach({ src: url })
}
