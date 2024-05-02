import module from '@sillonious/module'
import { KeyPair } from "p2panda-js";
debugger
const keyPair = new KeyPair();

const $ = module('p2panda-demo')

$.draw(() => {
  return keyPair.publicKey()
})
