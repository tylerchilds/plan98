import elf from '@silly/elf'

const token = plan98.env.JITSI_MAGIC_COOKIE

const script = document.createElement('script');
script.onload = function () {
	const $ = elf('live-help')

	$.draw(target => {
		if(target.api) return
		const room = target.getAttribute('room')

		target.api = new JitsiMeetExternalAPI("8x8.vc", {
			roomName: token + '/' + (room || "live-help"),
			parentNode: target
		});
	})

  $.style(`
    & {
      display: block;
      width: 100%;
      height: 100%;
    }
    & iframe {
      position: absolute;
      inset: 0;
    }
  `)
};

script.src = `https://8x8.vc/${token}/external_api.js`;
document.head.appendChild(script); 
