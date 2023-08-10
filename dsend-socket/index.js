const express = require("express");
const cors = require('cors');
const http = require('http');
const ioSocket = require('socket.io')
const identifiers = require("./res/id.json");
const { log } = require("console");

const app = express();
const server = http.createServer(app);
//app.use(cors({ origin: '*' }));

const io = ioSocket(server, {
    cors: {
        origin: "*",
        credientials: true,
        methods: ["GET", "POST"],
    }
});

const portNumber = 8080;

let users = [];

app.get("/", (req, res) => {
    console.log("Server: A user has connected");

    res.json({
        self: username
    });
})

io.on('connection', (socket) => {
    console.log('Socket: a user has connected');

    const username = identifiers.names[Math.floor(Math.random() * identifiers.names.length)];
    users.push(username);

    io.emit('user-update', users);

    socket.on('disconnect', () => {
        const userIndex = users.indexOf(username);
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
        }

        io.emit('user-update', users);
    });
});


server.listen(portNumber, () => {
    console.log(`Server: listening on port ${portNumber}`);
})