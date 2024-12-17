import module from '@silly/tag'
import { render } from "@sillonious/saga"

const $ = module('sonic-knuckles')

$.draw(() => {
  return render(`
<button
onclick:(function(){window.location.href='/cdn/spacejam.com/sonic3air_web.html'})()
text: Go Fast
style: position: absolute; top: 50%; left: 0; right: 0; margin: auto; background: dodgerblue; color: white; font-size: 3rem; line-height: 3rem; padding: 2rem; border-radius: 100%; border: none;
  `)
})

$.style(`
  & {
    display: block;
    aspect-ratio: 16/9;
    position: relative;
  }
`)
