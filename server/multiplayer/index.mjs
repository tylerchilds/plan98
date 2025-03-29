import geckos from '@geckos.io/server'

const io = geckos()

io.listen(5674) // default port is 9208

const rooms = {};

console.log('ready')

io.onConnection(channel => {
  let currentRoom = null;

   channel.on('chat message', data => {
    console.log(`got ${data} from "chat message"`)
    // emit the "chat message" data to all channels in the same room
    io.room(channel.roomId).emit('chat message', data)
  })

  channel.on('joinRoom', roomName => {
    console.log(`User ${channel.id} joined room: ${roomName}`); // Log room join
    if (currentRoom) {
      channel.leave(currentRoom);
      if (rooms[currentRoom]) {
        rooms[currentRoom].users = rooms[currentRoom].users.filter(user => user !== channel.id);
      }
    }

    console.log('joining', roomName)
    currentRoom = roomName;
    channel.join(roomName);

    if (!rooms[roomName]) {
      rooms[roomName] = { messages: [], users: [channel.id] };
    } else {
      rooms[roomName].users.push(channel.id);
    }

    console.log(roomName, rooms[roomName])

    if (rooms[roomName].messages) {
      rooms[roomName].messages.forEach(message => {
        console.log('emitting', message)
        channel.emit('chatMessage', message);
      });
    }

    io.room(roomName).emit('userList', rooms[roomName].users);
  });

  channel.on('chatMessage', message => {
    console.log(`Received message in ${currentRoom}: ${message}`); // Log message
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].messages.push(message);
      io.room(currentRoom).emit('chatMessage', message);
    }
  });

  channel.on('disconnect', () => {
    console.log(`User ${channel.id} disconnected`); // Log disconnect
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].users = rooms[currentRoom].users.filter(user => user !== channel.id);
      io.room(currentRoom).emit('userList', rooms[currentRoom].users);
    }
  });
});
