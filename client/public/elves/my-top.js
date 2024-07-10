import module from '@silly/tag'
import {
  currentBusiness,
  doingBusinessAs,
  generateTheme
} from './sillonious-brand.js'

const $ = module('my-top')

$.draw((target) => {
  const {
    mascot,
  } = currentBusiness(plan98.host)

  const { fg, bg } = generateTheme(target, plan98.host)
  const friends = Object.keys(doingBusinessAs).slice(0,7).reduce((all, world)=> {
    const current = doingBusinessAs[world]
    const joinCode = `
      <button name="join-code">
        <qr-code
          text="https://${plan98.host}?world=${world}"
          ${fg ? `data-fg="${fg}"`: ''}
          ${bg ? `data-bg="${bg}"`: ''}
        ></qr-code>
      </button>
    `

    if(current.mascot !== mascot) {
      all.push(`
        <slot>
          <div class="sillonious-brand">
            ${current.mascot}
          </div>
          ${joinCode}
        </slot>
      `)
    }

    return all
  }, []).join('')

  return `
    top anything really
    <carousel-billboard>
      ${friends}
    </carousel-billboard>
    songs
    movies
    games
    who or what are you promoting
  `
})

$.style(`
  & {
    display: block;
    margin: 1rem 0;
  }
`)
