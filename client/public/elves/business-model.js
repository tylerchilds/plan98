import { Self } from '@plan98/types'

const $ = Self('business-model')

$.draw((target) => {
  const language = target.getAttribute('lang') || 'en-us'
  return `
    <mark-down class="brutal" src="/public/cdn/sillyz.computer/${language}/BUSINESS.md"></mark-down>
  `
})
