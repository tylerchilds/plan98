import module from '@sillonious/module'

const $ = module('boot-loader')

$.draw((target) => {
  if(target.innerHTML) return
  const loader = document.getElementById('bootloader').cloneNode(true)
  loader.id =''
  return loader.outerHTML
})

$.style(`
  &{
    display:block;
    position: relative;
    margin: auto;
    height: 100%;
  }

   & > * {
    position: absolute;
    max-height: 100%;
    width: 100%;
    max-width: 100%;
    inset: 0;
    margin: 0;
   }
`)
