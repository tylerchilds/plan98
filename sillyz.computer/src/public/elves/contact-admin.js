import elf from '@silly/elf'
import jspreadsheet from 'jspreadsheet-ce'

const $ = elf('contact-admin')

$.when('submit', 'form', async (event) => {
  event.preventDefault()

  const key = event.target.key.value
  $.teach({ key, error: null })
})


$.draw((target) => {
  const { key, error } = $.learn()

  if(!key) {
    return `
      <div class="error">${error || ''}</div>
      <form>
        <label class="field">
          <span class="label">key</span>
          <input name="key">
        </label>
        <button type="submit">
          Send
        </button>
      </form>
    `
  }


  if(!target.subscribed) {
    target.subscribed = true
    fetchContacts(target)
  }

  const { data } = $.learn()

  if(data) {
    target.innerHTML = ''
    jspreadsheet(target, {
      data,
      defaultColWidth: 120,
      columns:[
        { title:'id', width:30 },
        { title:'name', width:80 },
        { title:'email', width:120 },
        { title:'message', width:300 },
        { title:'submitted', width:300 }
      ]
    });
  }

})

async function fetchContacts(target) {
  try {
    const response = await fetch(plan98.env.PLAN98_API_HOST + '/api/contacts', {
      method: "GET",
      headers: {
        "x-api-key": $.learn().key,
      },
    });

    if (!response.ok) {
      throw new Error("Unauthorized access");
    }

    const data = await response.json();
    $.teach({ data })
  } catch (error) {
    $.teach({ error: error.toString(), key: null });
    target.subscribed = false
  }
}

$.style(`
  & .error {
    border: 1px solid red;
  }

  & .error:empty {
    display: none;
  }
`)

// Dynamically load AG Grid CSS
const cssUrl1 = 'https://esm.sh/jspreadsheet-ce@4.15.0/dist/jspreadsheet.css';

loadCSS(cssUrl1);

function loadCSS(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}
