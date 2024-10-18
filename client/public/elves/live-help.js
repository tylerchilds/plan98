import module from '@silly/tag'

const script = document.createElement('script');
script.onload = function () {
	const $ = module('live-help')

	$.draw(target => {
		if(target.api) return
		const room = target.getAttribute('src') || target.getAttribute('room')

		target.api = new JitsiMeetExternalAPI("8x8.vc", {
			roomName: room || "live-help",
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

script.src = `https://8x8.vc/${'vpaas-magic-cookie-601556760e2e4612a620aad1abd2b1d1'}/external_api.js`;
document.head.appendChild(script); 
