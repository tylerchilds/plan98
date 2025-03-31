import geckos from '@geckos.io/server'

const io = geckos()

io.listen(5674) // default port is 9208

const rooms = {};
const parties = new Map()
const nicknames = {};

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
    }

     // Notify host only
    if (party.host) {
      party.host.emit('playerList', party.players)
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
