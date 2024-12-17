import module from '@silly/tag'

const $ = module('hello-calendar', { events: [] })

$.draw(() => {
  const {
    focusDay,
    rangeStart,
    rangeEnd
  } = $.learn()
  return `
    focused:<br>
    ${focusDay}<br>
    started:<br>
    ${rangeStart}<br>
    ended:<br>
    ${rangeEnd}<br>
    <calendar-range
      min="2024-01-01"
      max="2024-12-31"
      locale="en-GB"
    >
      <calendar-month></calendar-month>
    </calendar-range>
  `
})

$.when('change', 'calendar-range', (event) => {
  console.log(event)
})

$.when('focusday', 'calendar-range', (event) => {
  console.log(event)
  $.teach({ focusDay: new Date(event.detail).toLocaleString() })
})

$.when('rangestart', 'calendar-range', (event) => {
  $.teach({ rangeStart: new Date(event.detail).toLocaleString() })
})

$.when('rangeend', 'calendar-range', (event) => {
  $.teach({ rangeEnd: new Date(event.detail).toLocaleString() })
})

