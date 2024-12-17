import module from '@silly/tag'

const $ = module('email-list')
function query(target, key) {
  if(target.lastKey === key) return
  fetchTen(key)
  target.lastKey = key
}


$.draw(target => {
  const { key, messages } = $.learn()
  query(target, key)

  if(!messages) {
    return `
      <form>
        <input name="key" value="${key}" />
      </form>
    `

  }

  const log = messages.map(({ from, body }) => `
      <div>${from}: ${body}</div>
    `).join('')

  return `
    ${log}
    <form>
      <input name="key" value="${key}" />
    </form>
  `
})

const hostname = "api.fastmail.com";

const authUrl = `https://${hostname}/.well-known/jmap`;
const headers = (apikey) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${apikey}`,
});

const getSession = async (apikey) => {
  const response = await fetch(authUrl, {
    method: "GET",
    headers: headers(apikey),
  });
  return response.json();
};

const inboxIdQuery = async (apikey, api_url, account_id) => {
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

  inbox_id = data["methodResponses"][0][1]["ids"][0];

  if (!inbox_id.length) {
    console.error("Could not get an inbox.");
    process.exit(1);
  }

  return await inbox_id;
};

const mailboxQuery = async (apikey, api_url, account_id, inbox_id) => {
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
            limit: 10,
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
      await mailboxQuery(apikey, api_url, account_id, inbox_id).then((emails) => {
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

    $.write({ messages })
  });
}
