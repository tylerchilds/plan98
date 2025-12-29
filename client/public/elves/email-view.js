import elf from '@silly/elf'
import DOMPurify from 'dompurify';

const secureNodes = {}

const $ = elf('email-view')

const apikey = plan98.env.PLAN98_EMAIL_PASSWORD
const authUrl = plan98.env.PLAN98_EMAIL_URL;
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
        const from = (email.from || [])[0] || {}
        const subject = email.subject
        const timestamp = email.receivedAt

        const textParts = email.textBody.map(x => x.partId)
        const htmlParts = email.htmlBody.map(x => x.partId)
        const textBody = textParts.map(id => email.bodyValues[id].value).join('')
        const htmlBody = htmlParts.map(id => email.bodyValues[id].value).join('')
        messages.push({
          id: email.id,
          author: {
            email: from.email,
            photoUrl: 'https://tychi.me/professional-headshot.jpg',
            name: from.name,
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
    target.lastId = null
    target.dataset.fetched = true
    requestIdleCallback(() => {
      $.teach({ error: null, email: null })
    })
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
    const { id, author, timestamp, subject, textBody, htmlBody } = email
    const formattedTime = new Intl.DateTimeFormat("en-US", {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(timestamp))

    return `
      <div class="message-info">
        <div class="meta-grid">
          <span name="message-email">
            ${escapeHyperText(author.name || author.email)}
          </span>
          <span name="message-timestamp">
            ${formattedTime}
          </span>
        </div>
        <div name="message-subject">
          ${subject}
        </div>
        <div class="mail-body"></div>
      </div>
    `
  }

  return '<div><flying-disk></flying-disk></div>'
}, {
  afterUpdate(target) {
    const { email } = $.learn()
    const container = target.querySelector('.mail-body')
    if(container && email.htmlBody && email.id !== target.lastId || container && !container.innerHTML) {
      target.lastId = email.id

      const sanitizedHtml = clean(email.htmlBody);

      // Step 2 & 3: Create isolated container
      const emailElement = isolate(sanitizedHtml);

      // Step 4: Secure links
      const contentDiv = emailElement.shadowRoot.querySelector('div');
      secure(contentDiv);

      // Add to the page
      container.appendChild(emailElement);

      // Add option to load remote content
      const images = contentDiv.querySelectorAll('img.blocked-remote-content');

      if(images.length > 0) {
        const remoteContentButton = document.createElement('button');
        remoteContentButton.textContent = 'Allow remote content';
        remoteContentButton.classList.add('remote-allow')
        remoteContentButton.onclick = () => {
          images.forEach(img => {
            img.src = img.getAttribute('data-original-src');
          });
          remoteContentButton.style.visibility = 'hidden';
        };

        container.insertBefore(remoteContentButton, emailElement);
      }
    }
  }
})

function clean(htmlContent) {
  // Configure DOMPurify with email-specific settings
  const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      'a', 'b', 'br', 'div', 'em', 'h1', 'h2', 'h3', 'img',
      'li', 'ol', 'p', 'span', 'strong', 'table', 'tbody',
      'td', 'th', 'thead', 'tr', 'u', 'ul'
    ],
    ALLOWED_ATTR: [
      'alt', 'class', 'href', 'id', 'src', 'style', 'target', 'title'
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    ADD_ATTR: ['target'], // For opening links in new tab
    ALLOW_DATA_ATTR: false
  });

  return sanitizedHtml;
}

function isolate(sanitizedHtml) {
  // Create a container with isolated styles
  const container = document.createElement('div');

  // Use inline styles to ensure isolation
  container.style.cssText = `
    all: initial;
    display: block;
    font-family: Arial, sans-serif;
    color: #000;
    line-height: 1.5;
    max-width: 100%;
  `;

  // Create a shadow DOM for style isolation
  const shadow = container.attachShadow({ mode: 'open' });

  // Add base styles to shadow DOM
  const style = document.createElement('style');
  style.textContent = `
    a { color: #0066cc; text-decoration: underline; }
    img { max-width: 100%; height: auto; }
    * { max-width: 100%; word-break: break-word; }
  `;

  shadow.appendChild(style);

  // Add sanitized content
  const content = document.createElement('div');
  content.innerHTML = sanitizedHtml;
  shadow.appendChild(content);

  // Process images for remote content blocking
  processImages(content);

  return container;
}

function processImages(containerElement) {
  const images = containerElement.querySelectorAll('img');

  images.forEach(img => {
    // Replace remote images with placeholders until user allows loading
    if (img.src && !img.src.startsWith('data:') && !img.src.startsWith('cid:')) {
      // Store original source
      img.setAttribute('data-original-src', img.src);

      // Replace with placeholder
      img.src = 'placeholder.png';
      img.classList.add('blocked-remote-content');
    }
  });
}

function secure(containerElement) {
  const links = containerElement.querySelectorAll('a');

  links.forEach(link => {
    // Add target="_blank" to open in new tab
    link.setAttribute('target', '_blank');

    // Add rel="noopener noreferrer" for security
    link.setAttribute('rel', 'noopener noreferrer');

    // Optionally add a warning/confirmation for external links
    link.addEventListener('click', (e) => {
      if (!confirm(`Open this link?\n${link.href}`)) {
        e.preventDefault();
      }
    });
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
    height: 100%;
    padding: 1rem;
    background: white;
  }

  & .mail-body {
    word-break: break-word;
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

  & .message-info {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  & .remote-allow {
    border: 2px solid firebrick;
    background: transparent;
    border-radius: 4px;
    color: firebrick;
    padding: .5rem 1rem;
  }

  & .remote-allow:hover,
  & .remote-allow:focus {
    border-color: transparent;
    background: linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.65)) mediumseagreen;
    color: white;
  }
`)


