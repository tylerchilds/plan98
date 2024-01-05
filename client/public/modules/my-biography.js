import module from '@sillonious/module'

const $ = module('my-biography')

$.draw(target => {
  // do not use the implcit return virtual dom
  target.innerHTML =  `
    <div>
      <widget-slot tag="my-name"></widget-slot>
      <widget-slot tag="my-profile"></widget-slot>
      <widget-slot tag="my-contact"></widget-slot>
      <widget-slot tag="my-details"></widget-slot>
    </div>
    <div>
      <widget-slot tag="my-friendliness"></widget-slot>
      <widget-slot tag="my-thoughts"></widget-slot>
      <widget-slot tag="my-blurbs"></widget-slot>
      <widget-slot tag="my-top"></widget-slot>
      <widget-slot tag="my-love"></widget-slot>
    </div>
  `
})

$.style(`
  & {
    display: block;
  }

  @media screen and (min-width: 768px) {
    & {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }
`)
