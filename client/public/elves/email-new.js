import elf from '@silly/elf'
import { showModal } from '@plan98/modal'

const key = plan98.env.FASTMAIL_API_KEY
const username = plan98.env.FASTMAIL_USERNAME

const hostname = "api.fastmail.com";

const authUrl = `https://${hostname}/.well-known/jmap`;

function headers(key){
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  }
}

const $ = elf('email-new', { to: '', from: '', subject: '', message: '' })

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

const draftResponse = async (apiUrl, accountId, draftId, identityId) => {
  const { message, to, from, subject } = $.learn()

  const draftObject = {
    from: [{ email: from }],
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
  const { to, from, subject, message } = $.learn()

  return `
    <!--
    <multi-select data-bind id="email-to" value="${to}" name="email-to" label="To"></multi-select>
    <multi-select data-bind id="email-cc" value="${from}" name="email-cc" label="Cc"></multi-select>
    <multi-select data-bind id="email-bcc" value="${subject}" name="email-bcc" label="Bcc"></multi-select>
    -->
    <form action="secure-email" method="post">
      <button type="submit">
        Send
      </button>
      <label class="field">
        <span class="label">To</span>
        <input data-bind name="to" value="${escapeHyperText(to)}"/>
      </label>
      <label class="field">
        <span class="label">From</span>
        <input data-bind name="from" value="${escapeHyperText(from)}"/>
      </label>
      <label class="field">
        <span class="label">Subject</span>
        <input data-bind name="subject" value="${escapeHyperText(subject)}"/>
      </label>
      <label class="field">
        <span class="label">Message</span>
        <textarea data-bind name="message">${escapeHyperText(message)}</textarea>
      </label>
    </form>

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
  }
})

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
`)
