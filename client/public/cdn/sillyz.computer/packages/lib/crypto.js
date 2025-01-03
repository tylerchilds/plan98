export const scopeSign = ["sign", "verify"]
export const scopeEncrypt = ["encrypt", "decrypt"]

export const signAlgorithm = {
  name: "RSASSA-PKCS1-v1_5",
  hash: {
    name: "SHA-256"
  },
  modulusLength: 2048,
  extractable: false,
  publicExponent: new Uint8Array([1, 0, 1])
}

export const encryptAlgorithm = {
	name: "RSA-OAEP",
	modulusLength: 2048,
	publicExponent: new Uint8Array([1, 0, 1]),
	extractable: false,
	hash: {
		name: "SHA-256"
	}
}

export function generateKey(alg, scope) {
  return new Promise(function(resolve) {
    const genkey = crypto.subtle.generateKey(alg, true, scope)
    genkey.then(function (pair) {
      resolve(pair)
    })
  })
}

export function arrayBufferToBase64String(arrayBuffer) {
  const byteArray = new Uint8Array(arrayBuffer)
  let byteString = ''
  for (let i=0; i<byteArray.byteLength; i++) {
    byteString += String.fromCharCode(byteArray[i])
  }
  return btoa(byteString)
}

export function base64StringToArrayBuffer(b64str) {
  const byteStr = atob(b64str)
  const bytes = new Uint8Array(byteStr.length)
  for (let i = 0; i < byteStr.length; i++) {
    bytes[i] = byteStr.charCodeAt(i)
  }
  return bytes.buffer
}

export function textToArrayBuffer(str) {
  const buf = unescape(encodeURIComponent(str)) // 2 bytes for each char
  const bufView = new Uint8Array(buf.length)
  for (let i=0; i < buf.length; i++) {
    bufView[i] = buf.charCodeAt(i)
  }
  return bufView
}

export function arrayBufferToText(arrayBuffer) {
  const byteArray = new Uint8Array(arrayBuffer)
  let str = ''
  for (let i=0; i<byteArray.byteLength; i++) {
    str += String.fromCharCode(byteArray[i])
  }
  return str
}


export function arrayBufferToBase64(arr) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(arr)))
}

export function convertBinaryToPem(binaryData, label) {
  const base64Cert = arrayBufferToBase64String(binaryData)
  let pemCert = "-----BEGIN " + label + "-----\r\n"
  let nextIndex = 0
  while (nextIndex < base64Cert.length) {
    if (nextIndex + 64 <= base64Cert.length) {
      pemCert += base64Cert.substr(nextIndex, 64) + "\r\n"
    } else {
      pemCert += base64Cert.substr(nextIndex) + "\r\n"
    }
    nextIndex += 64
  }
  pemCert += "-----END " + label + "-----\r\n"
  return pemCert
}

export function convertPemToBinary(pem) {
  const lines = pem.split('\n')
  let encoded = ''
  for(let i = 0;i < lines.length;i++){
    if (lines[i].trim().length > 0 &&
      lines[i].indexOf('-BEGIN RSA PRIVATE KEY-') < 0 &&
      lines[i].indexOf('-BEGIN RSA PUBLIC KEY-') < 0 &&
      lines[i].indexOf('-END RSA PRIVATE KEY-') < 0 &&
      lines[i].indexOf('-END RSA PUBLIC KEY-') < 0) {
      encoded += lines[i].trim()
    }
  }
  return base64StringToArrayBuffer(encoded)
}

export function importPublicKey(pemKey) {
  return new Promise(function(resolve) {
    const importer = crypto.subtle.importKey("spki", convertPemToBinary(pemKey), signAlgorithm, true, ["verify"])
    importer.then(function(key) {
      resolve(key)
    })
  })
}

export function importPrivateKey(pemKey) {
  return new Promise(function(resolve) {
    const importer = crypto.subtle.importKey("pkcs8", convertPemToBinary(pemKey), signAlgorithm, true, ["sign"])
    importer.then(function(key) {
      resolve(key)
    })
  })
}

export function exportPublicKey(keys) {
  return new Promise(function(resolve) {
    window.crypto.subtle.exportKey('spki', keys.publicKey).
      then(function(spki) {
        resolve(convertBinaryToPem(spki, "RSA PUBLIC KEY"))
      })
  })
}

export function exportPrivateKey(keys) {
  return new Promise(function(resolve) {
    const expK = window.crypto.subtle.exportKey('pkcs8', keys.privateKey)
    expK.then(function(pkcs8) {
      resolve(convertBinaryToPem(pkcs8, "RSA PRIVATE KEY"))
    })
  })
}

export function exportPemKeys(keys) {
  return new Promise(function(resolve) {
    exportPublicKey(keys).then(function(pubKey) {
      exportPrivateKey(keys).then(function(privKey) {
        resolve({publicKey: pubKey, privateKey: privKey})
      })
    })
  })
}

export function signData(key, data) {
  return window.crypto.subtle.sign(signAlgorithm, key, textToArrayBuffer(data))
}

export function testVerifySig(pub, sig, data) {
  return crypto.subtle.verify(signAlgorithm, pub, sig, data)
}

export function encryptData(vector, key, data) {
  return crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
      iv: vector
    },
    key,
    textToArrayBuffer(data)
  )
}

export function decryptData(vector, key, data) {
  return crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
      iv: vector
    },
    key,
    data
  )
}
