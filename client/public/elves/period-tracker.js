import Self from '@plan98/elf'
import Cache from '@silly/cache'

const ZERO = {
  period: false
}

function getAllDaysInYear(year) {
  const dates = [];
  const date = new Date(year, 0, 1);
  while (date.getFullYear() === year) {
    dates.push(new Date(date).toJSON());
    date.setDate(date.getDate() + 1);
  }

  return dates;
}

function formatDate(date) {
  const month = date.toLocaleString('en-US', {
    month: 'long'
  });

  const year = date.toLocaleString('en-US', {
    year: 'numeric'
  });

  const day = date.toLocaleString('en-US', {
    day: '2-digit'
  });

  return `
    <year>
      ${year}
    </year>

    <month>
      ${month}
    </month>

    <day>
      ${day}
    </day>
  `
}

const elf = 'period-tracker'

const $ = Self(elf, {
  year: new Date().getFullYear()
})

$.hand('pointerdown', '[data-timestamp]', grab)
$.hand('pointerup', '[data-timestamp]', ungrab)

$.hand('click', '[data-year]', (event) => {
  const { year } = event.target.dataset
  $.mouth({ year: parseInt(year) })
})

$.hand('click', '[data-timestamp]', (event) => {
  const { timestamp } = event.target.dataset

  const data = $.ear()[timestamp] || ZERO

  $.mouth({
    [timestamp]: {
      period: !data.period
    }
  })
})

$.head(() => {
  const { year } = $.ear()

  const thisYear = getAllDaysInYear(year).map((T) => {
    const date = new Date(T)
    const data = $.ear()[T] || ZERO

    return `
      <button class="standard-button ${data.period?'bias-negative':'bias-clear'}" data-timestamp="${T}">
        ${formatDate(date)}
      </button>

    `
  }).join('')

  const lastYear = year - 1
  const nextYear = year + 1
  return `
    <button class="standard-button bias-generic" data-year="${lastYear}">
      ${lastYear}
    </button>
    ${thisYear}
    <button class="standard-button bias-generic" data-year="${nextYear}">
      ${nextYear}
    </button>
  `
}, {
  beforeUpdate(target) {
    {
      if(!target.mounted) {
        target.mounted = true
        target.cache = Cache(target.id)

        target.cache.get(elf).then(record => {
          if(record) {
            $.mouth(record.data)
          }
        })
      }
    }
  },
  afterUpdate(target) {
    target.cache.put(elf, $.ear())
  }
})

let grabTimeout
function grab(event) {
  event.preventDefault()
  const { timestamp } = event.target.dataset
  grabTimeout = setTimeout(() => {
    alert('show edit mode: ' + timestamp)
  }, 500)
}

function ungrab(event) {
  clearTimeout(grabTimeout)
}

$.eye(`
  & {
    display: block;
    width: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  & button > * {
    pointer-events: none;
  }

  & button {
    padding: 0;
    background: transparent;
    border: none;
  }

  & [data-year] {
    place-content: center;
  }

  & [data-timestamp] {
    display: grid;
    grid-template-columns: 8ch 1fr 8ch;
    place-items: center;
  }
`)
