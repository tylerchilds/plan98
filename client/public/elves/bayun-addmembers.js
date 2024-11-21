import tag from '@silly/tag'

const $ = tag('bayun-addmembers', {
  list: [
    {}
  ]
})

$.draw(() => {
  const { list } = $.learn()
  return list.map(({ companyName="", companyEmployeeId="" }, index) => {
    return `
      <label class="field">
        <span class="label">Company</span>
        <input value="${companyName}" name="companyName" data-index="${index}" />
      </label>
      <label class="field">
        <span class="label">Employee</span>
        <input value="${companyEmployeeId}" name="companyEmployeeId" data-index="${index}" />
      </label>
    `
  }).join('')
})

$.when('input', '[name="companyEmployeeId"]', (event) => {
  const { index } = event.target.dataset
  const { name, value } = event.target

  const { list } = $.learn()
  const item = list[index] || {}
  item[name] = value
  list[index] = item
  $.teach({ list: [...list.map(x=>x)] })

  event
    .target
    .closest($.link)
    .list = list
})

$.when('input', '[name="companyName"]', (event) => {
  const { index } = event.target.dataset
  const { name, value } = event.target

  const { list } = $.learn()
  const item = list[index] || {}
  item[name] = value
  list[index] = item
  $.teach({ list: [...list.map(x=>x)] })

  event
    .target
    .closest($.link)
    .list = list
})

$.style(`
  & .field {
    border: 1px solid rgb(0,0,0,.15);
    background: white;
  }

  & .field input {
    border: none;
    border-radius: 0;
    background: white;
  }
`)
