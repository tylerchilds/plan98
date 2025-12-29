import elf from '@silly/elf'
import { showModal } from '@plan98/modal'

const username = plan98.env.PLAN98_EMAIL_USERNAME
const password = plan98.env.PLAN98_EMAIL_PASSWORD
const key = btoa(`${username}:${password}`);
const authUrl = plan98.env.PLAN98_EMAIL_URL;

function headers(key){
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${key}`,
  }
}

const $ = elf('email-new', {
  to: '',
  from: '',
  subject: '',
  message: '',
  messageHeight: null
})

// https://github.com/fastmail/JMAP-Samples/blob/main/javascript/hello-world.js

const getSession = async () => {
  const response = await fetch(authUrl, {
    method: "GET",
    headers: headers(key),
  });
  return response.json();
};

const mailboxQuery = async (apiUrl, accountId) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [
        ["Mailbox/query", { accountId, filter: { name: "Drafts" } }, "a"],
      ],
    }),
  });
  const data = await response.json();

  return await data["methodResponses"][0][1].ids[0];
};

const identityQuery = async (apiUrl, accountId) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
        "urn:ietf:params:jmap:submission",
      ],
      methodCalls: [["Identity/get", { accountId, ids: null }, "a"]],
    }),
  });
  const data = await response.json();

  return await data["methodResponses"][0][1].list.filter(
    (identity) => identity.email === username
  )[0].id;
};

/* open ticket with the fastmail team
const contactsQuery = async (apiUrl, accountId) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:contacts"
      ],
      methodCalls: [
        ["Contact/query", {
          accountId,
          filter: { hasEmail: true },
          sort: [{ property: "lastName" }]
        }, "a"],
      ],
    }),
  });
  const data = await response.json();

  // Get the IDs of contacts returned by the query
  const contactIds = data["methodResponses"][0][1].ids;

  // Now fetch the actual contact data for these IDs
  return getContactsData(apiUrl, accountId, contactIds);
};

const getContactsData = async (apiUrl, accountId, contactIds) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:contacts"
      ],
      methodCalls: [
        ["Contact/get", {
          accountId,
          ids: contactIds,
          properties: ["firstName", "lastName", "emails"]
        }, "b"],
      ],
    }),
  });
  const data = await response.json();

  // Return the list of contacts with their data
  return data["methodResponses"][0][1].list;
};
*/

const draftResponse = async (apiUrl, accountId, draftId, identityId) => {
  const { message, to, from, subject } = $.learn()

  const draftObject = {
    from: [{ email: username }],
    to: [{ email: to }],
    subject,
    keywords: { $draft: true },
    mailboxIds: { [draftId]: true },
    bodyValues: { body: { value: message, charset: "utf-8" } },
    textBody: [{ partId: "body", type: "text/plain" }],
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
        "urn:ietf:params:jmap:submission",
      ],
      methodCalls: [
        ["Email/set", { accountId, create: { draft: draftObject } }, "a"],
        [
          "EmailSubmission/set",
          {
            accountId,
            onSuccessDestroyEmail: ["#sendIt"],
            create: { sendIt: { emailId: "#draft", identityId } },
          },
          "b",
        ],
      ],
    }),
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
};

const send = async () => {
  const session = await getSession();
  const apiUrl = session.apiUrl;
  const accountId = session.primaryAccounts["urn:ietf:params:jmap:mail"];
  const draftId = await mailboxQuery(apiUrl, accountId);
  const identityId = await identityQuery(apiUrl, accountId);
  draftResponse(apiUrl, accountId, draftId, identityId);
};

$.draw(target => {
  mount(target)
  const { to, from, subject, message, messageHeight } = $.learn()

  return `
    <!--
    <multi-select data-bind id="email-to" value="${to}" name="email-to" label="To"></multi-select>
    <multi-select data-bind id="email-cc" value="${from}" name="email-cc" label="Cc"></multi-select>
    <multi-select data-bind id="email-bcc" value="${subject}" name="email-bcc" label="Bcc"></multi-select>
    -->
    <form action="secure-email" method="post">
      <div style="display: flex; position: sticky; top: 0; z-index: 10;">
        <button class="send-button" type="submit">
          <span><sl-icon name="send"></sl-icon></span>
          Send
        </button>
      </div>
      <div class="fields">
        <label class="field">
          <span class="label">From</span>
          <input data-bind name="from" disabled value="${escapeHyperText(from) || username}"/>
        </label>
        <label class="field">
          <span class="label">To</span>
          <input data-bind name="to" value="${escapeHyperText(to)}"/>
        </label>
        <label class="field">
          <span class="label">Subject</span>
          <input data-bind name="subject" value="${escapeHyperText(subject)}"/>
        </label>
        <label class="field">
          <span class="label">Message</span>
          <textarea data-bind name="message" ${messageHeight ? `style="height: ${messageHeight}px; overflow: hidden;"`:''}>${escapeHyperText(message)}</textarea>
        </label>
      </div>
    </form>

  `
}, {
  beforeUpdate(target) {
    { // convert a query string to new post
      const q = target.getAttribute('q')
      if(!target.initialized) {
        target.initialized = true

        if(q) {
          const message = decodeURIComponent(q)
          $.teach({ message })
        }
      }
    }
  },

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
  }
})
async function mount(target) {
  if(target.mounted) return
  target.mounted = true

  const session = await getSession();
  const apiUrl = session.apiUrl;
  const accountId = session.primaryAccounts["urn:ietf:params:jmap:mail"];

/*
  const contacts = await contactsQuery(apiUrl, accountId)
  debugger
*/
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



$.when('submit', '[action="secure-email"]', (event) => {
  event.preventDefault()
  send();
})

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.when('change', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.when('change', 'multi-select', (event) => {
  console.log('changed', event.target.id)
})

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    overflow: auto;
    background: white;
  }

  & .fields {
    padding: 1rem;
  }

  & .field {
    margin-bottom: .5rem;
  }

  & .field .label {
    padding: .25rem .5rem;
    color: rgba(0,0,0,.5);
    font-weight: bold;
  }

  & .field input {
    padding: .25rem .5rem;
    border-radius: 0;
    border-left-color: transparent;
    border-right-color: transparent;
    border-top-color: transparent;
    border-bottom-color: rgba(0,0,0,.15);
    margin-bottom: 0;
  }

  & .field textarea {
    resize: none;
    border: none;
    display: block;
    width: 100%;
    border-radius: 0;
    color: rgba(0,0,0,.85);
    padding: .25rem .5rem;
    border-bottom: 1px solid rgba(0,0,0,.15);
    text-decoration: none;
    overflow: auto;
    position: relative;
  }

  & [name="message-list"] {
    border-radius: 3px;
    border: 1px solid rgba(255,255,255,.1);
    display: flex;
    flex-direction: column;
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

  & .send-button {
    background: linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.65)), var(--root-theme, dodgerblue);
    color: white;
    font-weight: bold;
    border: none;
    padding: 0 .5rem;
    line-height: 2rem;
    font-size: 1rem;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: .5rem;
    margin: 0;
    transition: background 100ms;
    margin-left: auto;
    position: sticky;
    top: 0;
  }

  & .send-button:hover,
  & .send-button:focus {
    background: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85)), var(--root-theme, dodgerblue);
  }
`)

$.when('focus', '[name="message"]', (event) => {
  $.teach({ messageHeight: event.target.scrollHeight })
});

$.when('input', '[name="message"]', (event) => {
  $.teach({ messageHeight: event.target.scrollHeight })
});

