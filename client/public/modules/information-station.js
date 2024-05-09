import module from '@silly/tag'
import { showModal, types as modalTypes } from './plan98-modal.js'

const $ = module('information-station')

$.draw(() => `
  Check out <button>These examples...</button>
`)

$.when('click', 'button', () => {
  showModal(`
    <sticky-note>
      <sillonious-tutorials></sillonious-tutorials>
    </sticky-note>
  `, { bannerType: modalTypes.news })
})

