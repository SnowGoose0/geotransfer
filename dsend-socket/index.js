const express = require("express");
const cors = require('cors');
const http = require('http');
const ioSocket = require('socket.io')
const identifiers = require("./res/id.json");

const app = express();
const server = http.createServer(app);

const io = ioSocket(server, {
    maxHttpBufferSize: 5e8,
    cors: {
        origin: "*",
        credientials: true,
        methods: ["GET", "POST"],
    }
});

const portNumber = 8080;

let users = {};
let markers = {};

app.get("/", (req, res) => {
    console.log("Server: A user has connected");

    res.json({
        self: username
    });
})

io.on('connection', (socket) => {
    console.log('Socket: a user has connected');

    const username = identifiers.names[Math.floor(Math.random() * identifiers.names.length)];
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
        const rawFile = package.file;

        io.to(recipient).emit('receive-file', rawFile)
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


        socket.broadcast.emit('update-users', {
            list: users,
            markers: markers,
        });
    });
});

server.listen(portNumber, () => {
    console.log(`Server: listening on port ${portNumber}`);
})