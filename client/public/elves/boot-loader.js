import elf from '@silly/elf'

const $ = elf('boot-loader')

$.draw((target) => {
  if(target.innerHTML) return
  const loader = document.getElementById('bootloader').cloneNode(true)
  loader.id =''
  return loader.innerHTML
})

$.style(`
  &{
    display:block;
    margin: auto;
    height: 100%;
    position: relative;
  }

  @media print {
    & {
      display: none;
    }
  }
   & svg {
    position: absolute;
    max-height: 100%;
    width: 100%;
    max-width: 100%;
    inset: 0;
    margin: 0;
   }
`)
