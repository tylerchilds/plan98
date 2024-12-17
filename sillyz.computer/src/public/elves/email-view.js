import elf from '@silly/elf'
import { render } from '@sillonious/saga'
const $ = elf('email-view')

const apikey = plan98.env.FASTMAIL_API_KEY
const hostname = "api.fastmail.com";
const authUrl = `https://${hostname}/.well-known/jmap`;
function headers(){
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apikey}`,
  }
}

window.fetchEmailById = async (emailId = 'M738091f069bc342d3ba60d6a') => {
    const response = await fetch(`https://${hostname}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apikey}`
        },
        body: JSON.stringify({
            "using": ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
            "methodCalls": [
                ["Email/get", { "ids": [emailId] }, "0"]
            ]
        })
    });
    const result = await response.json();
    return result.methodResponses[0][1];
};

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

async function mailboxQuery(apikey, api_url, account_id, email_id) {
  const response = await fetch(api_url, {
    method: "POST",
    headers: headers(apikey),
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [
        [
          "Email/get",
          {
            accountId: account_id,
            properties: ["id", "from", "subject", "receivedAt", 'bodyValues', 'htmlBody', 'textBody'],
            fetchAllBodyValues: true,
            "ids": [email_id],
          },
          "0",
        ],
      ],
    }),
  });

  const data = await response.json();

  return await data;
};

async function fetchOne(apikey, email_id){
  const messages = [];

  // bail if we don't have our ENV set:
  if (!apikey) {
    console.log("Please set the apikey");
  }

  return await getSession(apikey).then(async(session) => {
    const api_url = session.apiUrl;
    const account_id = session.primaryAccounts["urn:ietf:params:jmap:mail"];
    await mailboxQuery(apikey, api_url, account_id, email_id).then((emails) => {
      emails["methodResponses"][0][1]["list"].forEach((email) => {
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

    return messages[0] ? messages[0] : null
  });
}

$.draw((target) => {
  if(!target.dataset.fetched) {
    target.dataset.fetched = true
    fetchOne(apikey, target.id).then(email => {
      if(!email) {
        $.teach({ error: 'No Email Found' })
      } else {
        $.teach({ email })
      }
    })
  }

  const { error, email } = $.learn()

  if(error) {
    return error
  }

  if(email) {
    const { id, author, timestamp, subject, textBody } = email
    return `
      ${author.email}
      ${timestamp}
      ${subject}
      <div class="mail-body">${render(textBody)}</div>
    `
  }

  return '...'
})

$.style(`
  & {
    display: block;
    height: 100%;
    padding: 1rem;
  }

  & .mail-body {
    white-space: pre-wrap;
  }
`)


