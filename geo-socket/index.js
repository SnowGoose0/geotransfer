const express = require("express");
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const ioSocket = require('socket.io')
const spareIdentifiers = require("./res/id.json");

const app = express();
const server = http.createServer(app);
const portNumber = 8080;

const users = {};
const markers = {};

app.get('/', (req, res) => {
  res.write('<h1>To err is human</h1>')
});

const io = ioSocket(server, {
  maxHttpBufferSize: 5e8,
  cors: {
    origin: "*",
    credientials: true,
    methods: ["GET", "POST"],
  }
});

io.on('connection', (socket) => {
  console.log('Socket: a user has connected');

  const username = spareIdentifiers.names.shift();
  let markerIndex;

  socket.on('init-location', (coords) => {
    console.log('Socket: a user has initialized location')
    if (markers[coords] === undefined)  {
      markers[coords] = [];
    }

    markerIndex = coords;
    markers[coords].push(socket.id);
    users[socket.id] = username;

    socket.emit('init-user', {
      self: socket.id,
      list: users,
      markers: markers,
    });

    socket.broadcast.emit('update-users', {
      list: users,
      markers: markers,
    });
  });

  socket.on('send-file', (package) => {
    const recipient = package.recipient;
    const cacheFileName = package.sender
      .concat(package.recipient)
      .concat(package.fileName)
    ;

    const cacheFilePath = './cache/'.concat(cacheFileName);

    fs.writeFile(cacheFilePath, package.rawFile, () => {
      console.log('Server: file is saved')
    });

    io.to(recipient).emit('receive-file', {
      from: package.sender,
      file: package.rawFile,
      fileName: package.fileName,
    });
  });

  socket.on('send-message', (package) => {
    const recipient = package.recipient;

    io.to(recipient).emit('receive-message', {
      from: package.sender,
      message: package.message,
    });
  });

  socket.on('disconnect', () => {
    delete users[socket.id];

    if (markers[markerIndex] !== undefined) {
      const index = markers[markerIndex].indexOf(socket.id);

      if (index >= 0) {
        markers[markerIndex].splice(index, 1);
      }
    }

    if (markers[markerIndex].length === 0) {
      console.log('Server: a marker has been cleared')
      delete markers[markerIndex];
    }
    
    spareIdentifiers.names.push(username);

    socket.broadcast.emit('update-users', {
      list: users,
      markers: markers,
    });
  });
});

server.listen(portNumber, () => {
  console.log(`Server: listening on port ${portNumber}`);
});