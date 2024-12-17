import module from '@silly/tag'
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

const $ = module('electric-mail', { loading: true })

async function query(target, key) {
  if(target.lastKey === key) return
  target.lastKey = key
  $.teach({ loading: true })
  const messages = await fetchTen(key)
  $.teach({ key, messages, loading: false })
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
    const { author, timestamp, subject, textBody } = message
    console.log(author, timestamp, subject, textBody)
    return `
      <button name="message" data-index="${index}">
        ${author.email}
        ${timestamp}
        ${subject}
      </button>
    `
  }).join('')

  return `
    <div name="message-list">
      ${list}
    </div>
  `
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
          "Mailbox/query",
          {
            accountId: account_id,
            filter: { role: "inbox", hasAnyRole: true },
          },
          "a",
        ],
      ],
    }),
  });

  const data = await response.json();

  const inbox_id = data["methodResponses"][0][1]["ids"][0];

  if (!inbox_id.length) {
    console.error("Could not get an inbox.");
    process.exit(1);
  }

  return await inbox_id;
};

async function mailboxQuery(apikey, api_url, account_id, inbox_id, startPosition, limit=10) {
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

async function fetchTen(apikey){
  const messages = [];

  // bail if we don't have our ENV set:
  if (!apikey) {
    console.log("Please set the apikey");
  }

  return await getSession(apikey).then(async(session) => {
    const api_url = session.apiUrl;
    const account_id = session.primaryAccounts["urn:ietf:params:jmap:mail"];
    await inboxIdQuery(apikey, api_url, account_id).then(async (inbox_id) => {
      await mailboxQuery(apikey, api_url, account_id, inbox_id, 0).then((emails) => {
        emails["methodResponses"][1][1]["list"].forEach((email) => {
          const from = email.from[0].email
          const subject = email.subject
          const timestamp = email.receivedAt

          const textParts = email.textBody.map(x => x.partId)
          const htmlParts = email.htmlBody.map(x => x.partId)
          const textBody = textParts.map(id => email.bodyValues[id].value).join('')
          const htmlBody = htmlParts.map(id => email.bodyValues[id].value).join('')
          messages.push({
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
      });
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

$.when('click', '[name="message"]', (event) => {
  const { messages } = $.learn()
  const message = messages[parseInt(event.target.dataset.index)]
  if(!message) return
  showModal(`
    <div style="width: 100%; height: 100%; background: white; padding: 2rem 1rem; overflow: auto;">
      ${escapeHyperText(message.textBody)}
    </div>
  `)
})


$.style(`
  & {
    background: #54796d;
    display: block;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  & [name="message-list"] {
    border-radius: 3px;
    border: 1px solid rgba(255,255,255,.1);
    padding: 3px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  & [name="message"] {
    border: none;
    display: block;
    width: 100%;
    background: lemonchiffon;
    color: saddlebrown;
    padding: 8px;
  }
`)
