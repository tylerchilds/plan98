import { tag } from "/deps.js"
import QRCode from "/packages/lib/qrcode.js"

const $ = tag('qr-code')

$.render(target => {
  const url = target.getAttribute('url')
	new QRCode(target, { text: url })
})
