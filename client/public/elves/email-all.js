import elf from '@silly/elf'
import { showModal } from '@plan98/modal'

const username = plan98.env.PLAN98_EMAIL_USERNAME
const password = plan98.env.PLAN98_EMAIL_PASSWORD
const key = btoa(`${username}:${password}`);
const authUrl = plan98.env.PLAN98_EMAIL_URL;

function headers(apikey){
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${apikey}`,
  }
}

const $ = elf('email-all', { mailboxes: [] })

async function query(target, key) {
  if(target.lastKey === key) return
  target.lastKey = key

  await getSession(key).then(async(session) => {
    const api_url = session.apiUrl;
    const account_id = session.primaryAccounts["urn:ietf:params:jmap:mail"];
    $.teach({ api_url, account_id })
    await inboxIdQuery(key, api_url, account_id).then((mailboxes) => {
      $.teach({ mailboxes })
    });
  })
  const messages = await fetchTen(key)
  $.teach({ messages })
}

function form(key) {
  return `
    <form>
      <input name="key" value="${key || ''}" />
    </form>
  `
}

function formatDate(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Check if the date is today
  if (date.getTime() >= today.getTime() && date.getTime() < today.getTime() + 24 * 60 * 60 * 1000) {
    // Format as HH:MM for today
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } else {
    // Format as MM/DD for past dates
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  }
}


$.draw(target => {
  const { messages } = $.learn()
  query(target, key)

  if(!messages) {
    return `
      <div>
        <flying-disk></flying-disk>
      </div>
    `
  }

  const list = messages.map((message, index) => {
    const { id, author, timestamp, subject, preview } = message
    const time = `<span style='white-space: nowrap;'>${formatDate(new Date(timestamp))}</span>`
    return `
      <button class="email" name="message" data-id="${id}" data-index="${index}">
        <div class="meta-grid">
          <span name="message-email">${escapeHyperText(author.name || author.email)}</span>
          <span name="message-timestamp">${time}</span>
        </div>
        <div name="message-subject">${escapeHyperText(subject)}</div>
        <div name="message-body">
          ${escapeHyperText(preview)}
        </div>
      </button>
    `
  }).join('')
  target.innerHTML = `
    <div name="message-list" key="list">
      ${inboxSelector()}
      ${list}
      <flying-disk class="load-more"></flying-disk>
    </div>
  `
}, {
  afterUpdate: (target) => {
    { // recover icons from the virtual dom
      [...target.querySelectorAll('sl-icon')].map(ogIcon => {
        const iconParent = ogIcon.parentNode
        const icon = document.createElement('sl-icon')
        icon.name = ogIcon.name
        ogIcon.remove()
        iconParent.appendChild(icon)
      })
    }

    const { messages } = $.learn()

    if(!target.observer) {
      const options = {
        root: target,
        rootMargin: "0px",
        threshold: 0,
      };

      target.observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(async (entry) => {
          if(entry.isIntersecting) {
            const { fetching } = $.learn()
            if(fetching) return
            target.observer.unobserve(entry.target);
            $.teach({ fetching: true})

            const { offset } = $.learn()
            const messages = await fetchTen(key, offset)
            $.teach({ offset: offset+20, fetching: false })
            $.teach({ messages }, (s,p) => {
              return {
                ...s,
                messages: [...s.messages, ...p.messages]
              }
            })
          }
        });
      }, options);
    }
    const watcher = target.querySelector('.load-more')
    if(messages && watcher) {
      target.observer.observe(watcher);
    }
  }
})

$.when('click', '.email', (event) => {
  event.preventDefault()
  const root = event.target.closest($.link)
  const { id } = event.target.dataset
  root.dispatchEvent(new CustomEvent('picked', {
    detail: { emailId: id }
  }))
})

function inboxSelector() {
  const { mailboxes, inbox_id } = $.learn()
  if(mailboxes.length === 0) return ''

  const options = mailboxes.map((mailbox) => {
    return `
      <option value="${mailbox.id}" ${mailbox.id === inbox_id ? 'selected="true"':''}>
      ${mailbox.name}
    </option>
    `
  }).join('')

  return `
    <select name="mailbox-selector">
      ${options}
    </select>
  `
}


$.when('change', '[name="mailbox-selector"]', async (event) => {
  const { value } = event.target
  $.teach({ inbox_id: value })
  const messages = await fetchTen(key)
  $.teach({ messages })
})

$.when('change', '[name="key"]', (event) => {
  const { value } = event.target
  $.teach({ key: value })
})

async function getSession(apikey) {
  const response = await fetch(authUrl, {
    method: "GET",
    headers: headers(apikey),
  });
  return response.json();
};

async function inboxIdQuery(apikey, api_url, account_id) {
  const response = await fetch(api_url, {
    method: "POST",
    headers: headers(apikey),
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [
        [
          "Mailbox/get",
          {
            accountId: account_id,
            properties: ["id", "name", "role"]
          },
          "a",
        ],
      ],
    }),
  });

  const data = await response.json();

  const inbox_id = data.methodResponses[0][1].list[0].id
  if (!inbox_id.length) {
    console.error("Could not get an inbox.");
    process.exit(1);
  }

  $.teach({ inbox_id })
  return data.methodResponses[0][1].list
};

async function mailboxQuery(apikey, api_url, account_id, inbox_id, startPosition, limit=20) {
  const response = await fetch(api_url, {
    method: "POST",
    headers: headers(apikey),
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [
        [
          "Email/query",
          {
            accountId: account_id,
            filter: { inMailbox: inbox_id },
            sort: [{ property: "receivedAt", isAscending: false }],
            position: startPosition,
            limit
          },
          "a",
        ],
        [
          "Email/get",
          {
            accountId: account_id,
            properties: ["id", "from", "subject", "receivedAt", 'bodyValues', 'htmlBody', 'textBody', 'preview'],
            fetchAllBodyValues: true,
            "#ids": {
              resultOf: "a",
              name: "Email/query",
              path: "/ids/*",
            },
          },
          "b",
        ],
      ],
    }),
  });

  const data = await response.json();

  return await data;
};

async function fetchTen(apikey, offset=0){
  const { inbox_id, api_url, account_id } = $.learn()
  const messages = [];

  // bail if we don't have our ENV set:
  if (!apikey) {
    console.log("Please set the apikey");
    return
  }

  if(!inbox_id) {
    console.log("No inbox");
  }

  $.teach({ offset: offset + 10 })
  return await mailboxQuery(apikey, api_url, account_id, inbox_id, offset).then((emails) => {
    emails["methodResponses"][1][1]["list"].forEach((email) => {
      const from = (email.from || [])[0] || {}
      const subject = email.subject
      const timestamp = email.receivedAt
      const textParts = email.textBody.map(x => x.partId)
      const htmlParts = email.htmlBody.map(x => x.partId)
      const textBody = textParts.map(id => email.bodyValues[id] ? email.bodyValues[id].value : '(missing part)').join('')
      const htmlBody = htmlParts.map(id => email.bodyValues[id] ? email.bodyValues[id].value : '(missing part)').join('')
      messages.push({
        id: email.id,
        author: {
          email: from.email,
          photoUrl: 'https://tychi.me/professional-headshot.jpg',
          name: from.name,
        },
        preview: email.preview,
        subject,
        timestamp,
        textBody,
        htmlBody,
        content: subject,
        updated: timestamp
      })
    });

    return messages
  });
}

function escapeHyperText(text = '') {
  return text.replace(/[&<>'"]/g,
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    overflow: auto;
    background: rgba(255,255,255,.85);
    padding-right: 10px;
  }

  & .email {
    text-align: left;
    oveflow: hidden;
  }

  & [name="message-list"] {
    border-radius: 3px;
    display: flex;
    flex-direction: column;
  }

  & [name="message"] {
    border: none;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    width: 100%;
    color: rgba(0,0,0,.85);
    padding: .25rem .5rem;
    border-bottom: 1px solid rgba(0,0,0,.25);
    text-decoration: none;
    overflow: auto;
    position: relative;
    background: #d9d9d9;
  }

  & .meta-grid {
    display: grid;
    grid-template-columns: 1fr auto;
  }

  & [name="message-body"] {
    height: 2.5rem;
    overflow: hidden;
    line-height: 1.25rem;
  }
  & [name="message-subject"] {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-weight: bold;
    color: rgba(0,0,0,.65);
  }
  & [name="message-email"] {
    color: rgba(0,0,0,.5);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: block;
  }
  & [name="message-timestamp"] {
    color: rgba(0,0,0,.25);
  }

  & [name="mailbox-selector"] {
    background: #4b4b4b;
    color: rgba(255,255,255,.85);
    border: none;
    border-radius: none;
    padding: 0 .5rem;
    position: sticky;
    top: 0;
    height: 2rem;
    z-index: 2;
  }
`)
