import geckos from '@geckos.io/server'
import http from 'http'
import express from 'express'

const app = express()
const server = http.createServer(app)
const io = geckos()

io.addServer(server)
// make sure the client uses the same port
// @geckos.io/client uses the port 9208 by default
server.listen(3000)
