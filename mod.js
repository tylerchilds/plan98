import express from 'npm:express'
import request from "npm:request"
import session from 'npm:express-session'
import bodyParser from 'npm:body-parser'

const app = express()
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(bodyParser.raw())

// Create the HTTP server
app.listen(3000, () => console.log('http://localhost:3000'))
