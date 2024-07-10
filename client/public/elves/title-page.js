import module from '@silly/tag'
const $ = module('title-page')

$.draw((target) => {
  const title = target.getAttribute('title')
  const author = target.getAttribute('author')
  const contact = target.getAttribute('contact')
  const agent = target.getAttribute('agent')

  return `
    <div name="cover">
      <div name="main">
        <div name="title">
          ${title}
        </div>
        by
        <div name="author">
          ${author}
        </div>
      </div>
      <div name="contact">
        ${markup(contact) || '' }
      </div>
      <div name="agent">
        ${markup(agent) || '' }
      </div>
    </div>
  `
})

function markup(string) {
  return string && string.replaceAll('\\', '<br>')
}

$.style(`
  & {
    height: 9in;
    display: block;
  }
	& [name="cover"] {
		display: grid;
		grid-template-areas:
			"main main"
			"contact agent";
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr auto;
		width: 100%;
		height: 100%;
	}

	& [name="main"] {
		place-self: center;
		grid-area: main;
		text-align: center;
	}

	& [name="title"] {
		margin-bottom: 1rem;
	}

	& [name="author"],
	& [name="title"] {
		display: block;
	}

	& [name="contact"] {
		grid-area: contact;
	}

	& [name="agent"] {
		grid-area: agent;
	}
`)
