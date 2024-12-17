import module from '@silly/tag'
import { KeyPair } from "p2panda-js";
const keyPair = new KeyPair();

const $ = module('p2panda-demo')

$.draw(() => {
  return keyPair.publicKey()
})
