import elf from '@silly/elf'
import { showModal } from '@plan98/modal'

const key = plan98.env.FASTMAIL_API_KEY

const hostname = "api.fastmail.com";

const authUrl = `https://${hostname}/.well-known/jmap`;

function headers(apikey){
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apikey}`,
  }
}

const $ = elf('email-all', { loading: true, mailboxes: [] })

async function query(target, key) {
  if(target.lastKey === key) return
  target.lastKey = key
  $.teach({ loading: true })

  await getSession(key).then(async(session) => {
    const api_url = session.apiUrl;
    const account_id = session.primaryAccounts["urn:ietf:params:jmap:mail"];
    $.teach({ api_url, account_id })
    await inboxIdQuery(key, api_url, account_id).then((mailboxes) => {
      $.teach({ mailboxes })
    });
  })
  const messages = await fetchTen(key)
  $.teach({ messages, loading: false })
}

function form(key) {
  return `
    <form>
      <input name="key" value="${key || ''}" />
    </form>
  `
}

$.draw(target => {
  const { messages, loading } = $.learn()
  query(target, key)

  if(loading) {
    return `<loading-spinner></loading-spinner>`
  }

  if(!messages) {
    return `
      No messages. Try another key?
      ${form(key)}
    `
  }

  const list = messages.map((message, index) => {
    const { id, author, timestamp, subject, textBody } = message
    const formattedTime = new Intl.DateTimeFormat("en-US", {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(timestamp))
    const time = `<span style='white-space: nowrap;'>${formattedTime}</span>`
    return `
      <a href="/app/email-view?id=${id}" target="${target.getAttribute('target')}" name="message" data-index="${index}">
        <span name="message-timestamp" data-tooltip="${time}"><sl-icon name="clock"></sl-icon></span>
        <span name="message-email">${escapeHyperText(author.email)}</span>
        <div name="message-subject">${escapeHyperText(subject)}</div>
      </a>
    `
  }).join('')
  return `
    <div name="message-list">
      ${inboxSelector()}
      ${list}
      <div class="load-more"></div>
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
  $.teach({ inbox_id: value, loading: true })
  const messages = await fetchTen(key)
  $.teach({ messages, loading: false })
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
            properties: ["id", "from", "subject", "receivedAt", 'bodyValues', 'htmlBody', 'textBody'],
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
      const from = email.from[0].email
      const subject = email.subject
      const timestamp = email.receivedAt

      const textParts = email.textBody.map(x => x.partId)
      const htmlParts = email.htmlBody.map(x => x.partId)
      const textBody = textParts.map(id => email.bodyValues[id].value).join('')
      const htmlBody = htmlParts.map(id => email.bodyValues[id].value).join('')
      messages.push({
        id: email.id,
        author: {
          email: from,
          photoUrl: 'https://tychi.me/professional-headshot.jpg',
          name: from,
        },
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
    background: lemonchiffon;
  }

  & [name="message-list"] {
    border-radius: 3px;
    display: flex;
    flex-direction: column;
  }

  & [name="message"] {
    border: none;
    display: block;
    width: 100%;
    color: rgba(0,0,0,.85);
    padding: .25rem .5rem;
    border-bottom: 1px solid rgba(0,0,0,.25);
    text-decoration: none;
    overflow: auto;
    position: relative;
  }

  & [name="message-email"] {
    color: rgba(0,0,0,.5);
    margin-right: 1.25rem;
    text-overflow: ellipsis;
    overflow: hidden;
    whitespace: nowrap;
    display: block;
  }
  & [name="message-timestamp"] {
    color: rgba(0,0,0,.25);
    position: absolute;
    top: .5rem;
    right: .5rem;;
  }

  & .load-more {
    transform: translateY(-200px);
  }

  & select {
    background: #54796d;
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
