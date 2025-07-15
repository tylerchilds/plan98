import geckos from '@geckos.io/server'
import http from 'http'
import express from 'express'
//import {http_server as braidify} from 'braid-http'

import braid_text from 'braid-text'
import createStore from './storage.mjs'

function notify(namespace, state) {
  //console.log('updated:', { this: this, namespace, state: JSON.stringify(state) })
}

const shortCodes = {};
const rooms = {};
const parties = new Map()
const nicknames = {};
const tables = new Map()

const app = express()
const server = http.createServer(app)
const io = geckos()

// FREE THE CORS!
function free_the_cors (req, res, next) {
  res.setHeader('Range-Request-Allow-Methods', 'PATCH, PUT')
  res.setHeader('Range-Request-Allow-Units', 'json')
  var free_the_cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, HEAD, GET, PUT, UNSUBSCRIBE",
    "Access-Control-Allow-Headers": "subscribe, peer, version, parents, merge-type, content-type, patches, cache-control"
  }
  Object.entries(free_the_cors).forEach(x => res.setHeader(x[0], x[1]))
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
  } else
    next()
}
app.use(free_the_cors)

function auth(req, res, next) {
  /*
  if (req.method == "PUT" || req.method == "POST" || req.method == "PATCH") {

    if (!req.headers.cookie?.split(/;/).map(x => x.trim()).some(x => x === 'fuzzydoodle')) {
        console.log("Blocked PUT:", { cookie: req.headers.cookie })
        res.statusCode = 401
        return res.end()
    }
  }
  */

  next()
}
app.use(auth)
app.use(braid_text.serve)

//app.use(braidify)
io.addServer(server)

io.onConnection(channel => {
  let currentRoom = null;
  let currentParty = null;

   channel.on('chat message', data => {
    console.log(`got ${data} from "chat message"`)
    // emit the "chat message" data to all channels in the same room
    io.room(channel.roomId).emit('chat message', data)
  })

  channel.on('joinRoom', ({ roomName, nickname }) => {
    if (currentRoom) {
      channel.leave(currentRoom);
      if (rooms[currentRoom]) {
        rooms[currentRoom].users = rooms[currentRoom].users.filter(user => user.id !== channel.id);
      }
    }

    currentRoom = roomName;
    channel.join(roomName);

    if (!rooms[roomName]) {
      rooms[roomName] = { messages: [], users: [{
        id: channel.id,
        nickname
      }] };
    } else {
      rooms[roomName].users.push({
        id: channel.id,
        nickname
      });
    }


    if (rooms[roomName].messages) {
      rooms[roomName].messages.forEach(message => {
        channel.emit('chatMessage', message);
      });
    }

    io.room(roomName).emit('userList', rooms[roomName].users);
  });

  channel.on('chatMessage', message => {
    console.log(message, currentRoom, rooms[currentRoom])
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].messages.push(message);
      io.room(currentRoom).emit('chatMessage', message);
    }
  });

  channel.on('changeNickname', ({oldNickname, newNickname, password }) => {
    if (!nicknames[nickname]) {
      channel.emit('setNickSuccess', {
        nickname: nickname,
        password: crypto.randomUUID()
      });
    }
  });

  channel.on('setNick', nickname => {
    if (!nicknames[nickname]) {
      channel.emit('setNickSuccess', {
        nickname: nickname,
        password: crypto.randomUUID()
      });
    } else {
      channel.emit('setNickError', "Nickname taken");
    }
  });


  /* couch-coop */

  channel.on('joinParty', ({ partyId, slot }) => {
    if (currentParty) {
      channel.leave(currentParty);
      if (parties[currentParty]) {
        parties[currentParty].players = parties[currentParty].players.filter(user => user.id !== channel.id);
      }
    }

    currentParty = partyId;
    channel.join(currentParty);

    if (!parties.has(partyId)) {
      parties.set(partyId, {
        host: null,
        players: new Array(4).fill(null),
        channels: new Array(4).fill(null),
      })
    }

    const party = parties.get(partyId)

    if (slot === 'host') {
      channel.isHost = true
      party.host = channel
    } else {
      channel.slot = slot
      party.players[slot] = {
        id: channel.id,
        gamepad: {}
      }
      party.channels[slot] = channel

    }

     // Notify host only
    if (party.host) {
      party.host.emit('playerList', party.players)
    }
  });

  channel.on('gamestateUpload', (data) => {
    if(currentParty && parties.has(currentParty)) {
      const party = parties.get(currentParty)
      party.channels.forEach(channel => {
        if(channel) {
          channel.emit('gamestateDownload', data)
        }
      })
    }
  });

  channel.on('gamepadSnapshot', ({ gamepad, slot }) => {
    if(currentParty && parties.has(currentParty)) {
      const party = parties.get(currentParty)
      if (party.host) {
        party.host.emit('gamepadUpdate', { gamepad, slot, id: channel.id })
      }
    }
  });

  channel.on('linkState', ({ table, id, data }) => {
    const room = `${table}/${id}`
    channel.join(room);

    if (!tables.has(room)) {
      tables.set(room, {
        channels: [],
        store: createStore(data || {}, notify.bind(room))
      })
    }

    const party = tables.get(room)

    party.channels.push(channel)

    channel.emit('stateCache', {
      table,
      id,
      data: party.store.get(table)
    })
  });

  channel.on('stateUpload', ({ id, data }) => {
    const { table, knowledge, serializedNuance } = data

    const room = `${table}/${id}`
    if(tables.has(room)) {
      const party = tables.get(room)
      party.channels.forEach(channel => {
        if(channel) {
          channel.emit('stateDownload', data)
        }
      })

      try {
        const merge = typeof serializedNuance === 'object'
          ? objectFunction(serializedNuance)
          : stringFunction(serializedNuance)

        party.store.set(table, knowledge, merge)
      } catch(e) {
        console.error(e)
      }
    }
  });

  channel.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].users = rooms[currentRoom].users.filter(user => user.id !== channel.id);
      io.room(currentRoom).emit('userList', rooms[currentRoom].users);
    }

    if(currentParty && parties.has(currentParty)) {
      const { isHost, slot } = channel
      const party = parties.get(currentParty)

      if (isHost) {
        party.host = null
      } else {
        party.players[slot] = null
        party.channels[slot] = null
      }

      if (party.host) {
        party.host.emit('playerList', party.players)
      }

      if (!party.host && party.players.every(p => p === null)) {
        parties.delete(currentParty)
      }
    }
  });
});

function objectFunction({ mergeHandler, parameters }) {
  return stringFunction(mergeHandler).apply(null, parameters)
}

function stringFunction(s) {
  return new Function('return ' + s)()
}

// make sure the client uses the same port
// @geckos.io/client uses the port 9208 by default
console.log('relay running on 9208')
server.listen(9208)
