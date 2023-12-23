import module from '@sillonious/module'

const $ = module('boot-loader')

$.draw(() => {
  const loader = document.getElementById('bootloader').cloneNode(true)
  loader.id =''
  return loader.outerHTML
})
