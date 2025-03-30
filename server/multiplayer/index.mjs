import geckos from '@geckos.io/server'

const io = geckos()

io.listen(5674) // default port is 9208

const rooms = {};
const nicknames = {};


io.onConnection(channel => {
  let currentRoom = null;

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

  channel.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].users = rooms[currentRoom].users.filter(user => user.id !== channel.id);
      io.room(currentRoom).emit('userList', rooms[currentRoom].users);
    }
  });
});
