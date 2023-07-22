require('dotenv').config()

const hostname = process.env.JMAP_HOSTNAME || "api.fastmail.com";
const username = process.env.JMAP_USERNAME;

const authUrl = `https://${hostname}/.well-known/jmap`;
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.JMAP_TOKEN}`,
};

const getSession = async () => {
  const response = await fetch(authUrl, {
    method: "GET",
    headers,
  });
  return response.json();
};

const inboxIdQuery = async (api_url, account_id) => {
  const response = await fetch(api_url, {
    method: "POST",
    headers,
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

const mailboxQuery = async (api_url, account_id, inbox_id) => {
  const response = await fetch(api_url, {
    method: "POST",
    headers,
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
            properties: ["id", "from", "subject", "receivedAt", 'bodyValues', 'textBody'],
            fetchTextBodyValues: true,
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
async function fetchTen(){
  const messages = [];

  // bail if we don't have our ENV set:
  if (!process.env.JMAP_USERNAME || !process.env.JMAP_TOKEN) {
    console.log("Please set your JMAP_USERNAME and JMAP_TOKEN");
    console.log("JMAP_USERNAME=username JMAP_TOKEN=token node hello-world.js");
  }

  return await getSession().then(async(session) => {
    const api_url = session.apiUrl;
    const account_id = session.primaryAccounts["urn:ietf:params:jmap:mail"];
    await inboxIdQuery(api_url, account_id).then(async (inbox_id) => {
      await mailboxQuery(api_url, account_id, inbox_id).then((emails) => {
        emails["methodResponses"][1][1]["list"].forEach((email) => {
          const from = email.from[0].email
          const subject = email.subject
          const timestamp = email.receivedAt
          const parts = email.textBody.map(x => x.partId)
          const textBody = parts.map(id => email.bodyValues[id].value).join('')
          messages.push({
            author: {
              email: from,
              photoUrl: 'https://tychi.me/professional-headshot.jpg',
              name: from,
            },
            subject,
            timestamp,
            textBody,
            content: subject,
            updated: timestamp
          })
        });
      });
    });
    return messages
  });
}

module.exports = { fetchTen }
