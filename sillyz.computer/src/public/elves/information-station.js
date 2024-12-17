import module from '@silly/tag'
import { showModal, types as modalTypes } from './plan98-modal.js'

const $ = module('information-station')

$.draw(() => `
  To be helped less, check out-- <button>Nonsense</button>
`)

$.when('click', 'button', () => {
  showModal(`
    <sticky-note>
      <sillonious-tutorials></sillonious-tutorials>
    </sticky-note>
  `, { bannerType: modalTypes.news })
})

$.style(`
  & button {
    border: none;
    background: dodgerblue;
    color: white;
    border-radius: 100%;
    padding: .5rem 1rem;
  }
`)
