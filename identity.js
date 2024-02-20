import express from "npm:express@4.18.2"
import request from "npm:request"

import Gun from 'https://esm.sh/gun@0.2020.1237'

import OAuth from "npm:oauth-1.0a"
import session from 'npm:express-session'
import bodyParser from 'npm:body-parser'
import originalG from 'npm:grant'

import { config } from "https://deno.land/x/dotenv/mod.ts";

const ENVIRONMENT = config()

const gun = Gun();

const timeMachine = gun.get('time')
const zero = timeMachine.get(0)
zero.put('second')

zero.on(value => console.log(value))
console.log('first')

const oauthConfig = {
  "defaults": {
    "origin": ENVIRONMENT['ORIGIN'] || "http://localhost:8000",
    "transport": "session"
  },
  "smugmug": {
    "key": ENVIRONMENT['SMUGMUG_API_KEY'],
    "secret": ENVIRONMENT['SMUGMUG_API_SECRET'],
    "callback": "http://localhost:3000/api/smugmug/callback"
  }
}

console.log(oauthConfig)
const oauth = OAuth({
  consumer: {
    key: ENVIRONMENT['SMUGMUG_API_KEY'], // Replace with your actual consumer key
    secret: ENVIRONMENT['SMUGMUG_API_SECRET'], // Replace with your actual consumer secret
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto
      .createHmac("sha1", key)
      .update(base_string)
      .digest("base64");
  },
});

const grant = originalG.express()
console.log(grant)

const app = express();

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(bodyParser.raw())

// REQUIRED: any session store - see /examples/handler-express
app.use(session({secret: 'grant', saveUninitialized: true, resave: false}))
app.use(grant(oauthConfig))

app.get('/api/:provider/callback', (req, res) => {
  const { provider } = req.params
  const { access_token, access_secret } = req.session.grant.response

  timeMachine.get(provider).put({ access_token, access_secret })

  res.redirect(`/?mode=callback&provider=${provider}&access_token=${access_token}&access_secret=${access_secret}`)
})



const proxies = {
	smugmug: function smugmug(req, res) {
		const { url } = req.body

		try {
			// Set up the OAuth 1.0a parameters
			const requestData = {
				url,
				method: "GET",
			};

			const headers = oauth.toHeader(oauth.authorize(requestData, req.body.token));
			// Make the HTTP GET request using the 'request' package
			request.get(
				{
					url,
					headers,
					json: true,
				},
				(error, response, body) => {
					if (error) {
						return res.status(500).json({ error: "Internal server error" });
					}

					// Check if the request was successful (status code 200)
					if (response.statusCode === 200) {
						// Respond with the albums data
						res.json(body);
					} else {
						// Respond with an error message if the request failed
						res.status(response.statusCode).json({ error: "Request failed" });
					}
				}
			);
		} catch (error) {
			console.error(error)
			// Handle any errors that occurred during the request
			res.status(500).json({ error: 'whoops' });
		}
	}
}

app.post("/proxy", (req, res) => {
	const provider = req.body.provider

	if(proxies[provider]) {
		proxies[provider](req, res)
		return
	}

	res.status(500).json({
		error: `no configured provider for ${provider}`
	});
})

app.use(express.static('client'))

app.listen(3000);
