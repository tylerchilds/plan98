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

const $ = module('email-new', { loading: true })

async function query(target, key) {
  if(target.lastKey === key) return
  target.lastKey = key
  $.teach({ loading: true })
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

  return `
    <textarea></textarea>
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
            $.teach({ offset: offset+10, fetching: false })
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

    if(messages) {
      target.observer.observe(target.querySelector('.load-more'));
    }
  }
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

async function fetchTen(apikey, offset=0){
  const messages = [];

  // bail if we don't have our ENV set:
  if (!apikey) {
    console.log("Please set the apikey");
  }

  $.teach({ offset: offset + 10 })
  console.log($.learn().offset)
  return await getSession(apikey).then(async(session) => {
    const api_url = session.apiUrl;
    const account_id = session.primaryAccounts["urn:ietf:params:jmap:mail"];
    await inboxIdQuery(apikey, api_url, account_id).then(async (inbox_id) => {
      await mailboxQuery(apikey, api_url, account_id, inbox_id, offset).then((emails) => {
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
    border: 1px solid rgba(255,255,255,.1);
    display: flex;
    flex-direction: column;
  }

  & [name="message"] {
    border: none;
    display: block;
    width: 100%;
    color: rgba(0,0,0,.85);
    padding: .25rem 1rem;
    border-bottom: 1px solid rgba(0,0,0,.25);
    text-decoration: none;
    overflow: auto;
    position: relative;
  }

  & [name="message-email"] {
    color: rgba(0,0,0,.65);
    margin-right: 1rem;
    text-overflow: ellipsis;
    overflow: hidden;
    whitespace: nowrap;
    display: block;
  }
  & [name="message-timestamp"] {
    color: rgba(0,0,0,.5);
    position: absolute;
    top: .5rem;
    right: 1rem;;
  }

  & .load-more {
    transform: translateY(-200px);
  }
`)
