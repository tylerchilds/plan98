import geckos from '@geckos.io/server'
import http from 'http'
import express from 'express'
import { getQuickJS } from "quickjs-emscripten"

import createStore from './storage.mjs'

const QuickJS = await getQuickJS()

function secureEval(query, variables = {}) {
  let res
  const vm = QuickJS.newContext()

  for (const [key, value] of Object.entries(variables)) {
    const handle = vm.newString(value)
    vm.setProp(vm.global, key, handle)
    handle.dispose()
  }

  const evaluation = vm.evalCode(query)
  if(evaluation.error) {
    res = {
      error: vm.dump(evaluation.error),
      data: null
    }
    evaluation.error.dispose()
  } else {
    res = {
      error: null,
      data: vm.dump(evaluation.value)
    }
    evaluation.value.dispose()
  }

  vm.dispose()

  return res
}

function notify(namespace, state) {
  //console.log('updated:', { this: this, namespace, state: JSON.stringify(state) })
}

const shortCodes = {};
const rooms = {};
const parties = new Map()
const nicknames = {};
const elves = new Map()

const app = express()
const server = http.createServer(app)
const io = geckos()

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
app.use('/public', express.static('public'))

io.addServer(server)

io.onConnection(channel => {
  let currentRoom = null;
  let currentParty = null;

  channel.on('chat message', data => {
    console.log(`got ${data} from "chat message"`)
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

  channel.on('linkState', ({ elf, id, data }) => {
    const room = `${elf}/${id}`
    channel.join(room);

    if (!elves.has(room)) {
      elves.set(room, {
        channels: [],
        store: createStore(data || {}, notify.bind(room), secureEval)
      })
    }

    const party = elves.get(room)

    party.channels.push(channel)

    channel.emit('stateCache', {
      elf,
      id,
      data: party.store.get(elf)
    })
  });

  channel.on('stateUpload', ({ id, data }) => {
    const { elf, knowledge, serializedNuance } = data

    const room = `${elf}/${id}`
    if(elves.has(room)) {
      const party = elves.get(room)
      party.channels.forEach(channel => {
        if(channel) {
          channel.emit('stateDownload', data)
        }
      })

      try {
        const merge = typeof serializedNuance === 'object'
          ? sandbox(serializedNuance, secureEval)
          : serializedNuance

        party.store.set(elf, knowledge, merge)
      } catch(e) {
        console.error('Error processing stateUpload:', e)
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

function sandbox({ mergeHandler, parameters }, secureEval) {
  const mergeHandlerStr = mergeHandler.toString();
  const paramsStr = JSON.stringify(parameters);

  const result = secureEval(`
    '(function(prev, payload) {' +
      ' return (' + ${JSON.stringify(mergeHandlerStr)} + ')' +
      ' .apply(null, ' + paramStr + ')' +
      ' (prev, payload);' +
    '})';
  `, {
    paramStr: paramsStr,
  });

  if (result.error) {
    console.error('Failed to create merge function:', result.error);
    console.error('Handler:', mergeHandlerStr);
    console.error('Params:', parameters);
    return false;
  }

  console.log('Server generated merge function:', result.data);
  return result.data;
}

console.log('relay running on 9208')
server.listen(9208)
