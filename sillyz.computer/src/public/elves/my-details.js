import module from '@silly/tag'

const $ = module('my-details')

$.draw(() => {
  return `
  status
  herefor
  orientation
  hometown
  bodytype
  ethnicity
  religion
  zodiac
  education
  occupation
  `
})

$.style(`
  & {
    display: block;
    margin: 1rem 0;
  }
`)
