import { tag } from '/deps.js'

const script = document.createElement('script');
script.onload = function () {
	const $ = tag('jitsi-meet')

	$.render(target => {
		if(target.api) return
		const room = target.getAttribute('room')

		target.api = new JitsiMeetExternalAPI("8x8.vc", {
			roomName: room,
			parentNode: target
		});
	})
};

script.src = "https://8x8.vc/external_api.js";
document.head.appendChild(script); 
