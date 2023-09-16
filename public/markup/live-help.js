const script = document.createElement('script');
script.onload = function () {
	const $ = module('live-help')

	$.draw(target => {
		if(target.api) return
		const room = target.getAttribute('room')

		target.api = new JitsiMeetExternalAPI("8x8.vc", {
			roomName: room || "live-help",
			parentNode: target
		});
	})

  $.style(`
    & iframe {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
  `)
};

script.src = "https://8x8.vc/external_api.js";
document.head.appendChild(script); 
