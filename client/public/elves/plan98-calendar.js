/*
import { Calendar } from '@fullcalendar/core'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'

import elf from '@silly/tag'

const $ = elf('plan98-calendar')

$.draw((target) => {
  if(target.calendaerered) return
  target.calendaerered = true

    const calendar = new Calendar(target, {
      plugins: [
        interactionPlugin,
        dayGridPlugin
      ],
      themeSystem: 'standard',
      initialView: 'dayGridMonth',
      editable: true, // important for activating event interactions!
      selectable: true, // important for activating date selectability!
      events: [
        { title: 'Meeting', start: new Date() }
      ]
    })

  setTimeout(() => calendar.render(), 1000)
})
*/

import elf from '@silly/tag'

const $ = elf('plan98-calendar')

$.draw(() => {
  return `
    <full-calendar shadow options='{
    "headerToolbar": {
      "left": "prev,next today",
      "center": "title",
      "right": "dayGridMonth,dayGridWeek,dayGridDay"
    }
  }' />
  `
})
