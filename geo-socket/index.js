const express = require("express");
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const ioSocket = require('socket.io')
const spareIdentifiers = require("./res/id.json");

const app = express();
const server = http.createServer(app);


const PORT_NUMBER = 8080;
const USERS = {};
const MARKERS = {};

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
    if (MARKERS[coords] === undefined)  {
      MARKERS[coords] = [];
    }

    markerIndex = coords;
    MARKERS[coords].push(socket.id);
    USERS[socket.id] = username;

    socket.emit('init-user', {
      self: socket.id,
      list: USERS,
      markers: MARKERS,
    });

    socket.broadcast.emit('update-users', {
      list: USERS,
      markers: MARKERS,
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
    delete USERS[socket.id];

    if (MARKERS[markerIndex] !== undefined) {
      const index = MARKERS[markerIndex].indexOf(socket.id);

      if (index >= 0) {
        MARKERS[markerIndex].splice(index, 1);
      }
    }

    if (MARKERS[markerIndex].length === 0) {
      console.log('Server: a marker has been cleared')
      delete MARKERS[markerIndex];
    }
    
    spareIdentifiers.names.push(username);

    socket.broadcast.emit('update-users', {
      list: USERS,
      markers: MARKERS,
    });
  });
});

server.listen(PORT_NUMBER, () => {
  console.log(`Server: listening on port ${PORT_NUMBER}`);
});