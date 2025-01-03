import { tag } from "/deps.js"
import QRCode from "/packages/lib/qrcode.js"
import { 
	generateKey,
	exportPemKeys,
	importPublicKey,
	importPrivateKey,
	signAlgorithm,
	encryptAlgorithm,
	scopeSign,
	scopeEncrypt
} from '/packages/lib/crypto.js'

const $ = tag('key-create')

$.render(() => {
	const { nickname } = $.read()
	return `
		<form>
			<input name="nickname" placeholder="(optional)" value="${nickname || ''}" />
			<button type="submit">Mint</button>	
		</form>
		<div id="qr-code"></div>
	`	
})

$.on('submit', 'form', async function(event) {
	event.preventDefault()

	const [
		signingKeys,
		encryptionKeys 
	] = await Promise.all([
		generateKey(signAlgorithm, scopeSign),
		generateKey(encryptAlgorithm, scopeEncrypt)
	])

	const [
		signingPems,
		encryptionPems
	] = await Promise.all([
		exportPemKeys(signingKeys),
		exportPemKeys(encryptionKeys)
	])

	const url = urlifyPems({ signingPems, encryptionPems })

	console.log(url)
	new QRCode('qr-code', { text: url })
})

function urlifyPems({ signingPems, encryptionPems }) {
	const html = `
		# Signing Pems:
		## Public:
		${signingPems.publicKey}	
		## Private:
		${signingPems.privateKey}	

		# Encryption Pems:
		## Public:
		${encryptionPems.publicKey}	
		## Private:
		${encryptionPems.privateKey}	
	`
	const blob = new Blob([html], { type: 'text/html' })
	return URL.createObjectURL(blob)
}

