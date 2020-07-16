const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const moment = require('moment');
const {addUser, removeUser, getUserById, getUserInRoom} = require('./utils/users');

const port = normalizePort(process.env.PORT || '3000');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

//define path for express config
const publicDirPath = path.join(__dirname, '../public');
const templatesDirPath = path.join(__dirname, './templates');

// setup handlebars engine & views path
//app.set('view engine', 'hbs');
//app.set('views', templatesDirPath);

//setup static directory for express to serve
app.use(express.static(publicDirPath));

io.on('connection', (socket) => {
    socket.on('join', ({username, roomname}, callback) => {
        const {error, user} = addUser({
            id: socket.id,
            username,
            roomname
        });     

        if(error){
            return callback(error);
        }

        socket.join(user.roomname);

        //a welcome message to a new user  
        socket.emit('welcomeMsg',{text: "Welcome to Zultan's chat room...", name: username, timeStamp: moment(new Date().getTime()).format('HH:mm')});
        socket.broadcast.to(user.roomname).emit('welcomeMsg', {text: `${user.username} has joined.`, name: username, timeStamp: moment(new Date().getTime()).format('HH:mm')});

        io.to(user.roomname).emit('roomDet', {
            roomname: user.roomname,
            users:getUserInRoom(user.roomname)
        });

        callback();
    }); 

    socket.on('messageInput', (msg, callback) => {
        const thisUser = getUserById(socket.id);

        if(thisUser){
            var filter = new Filter();

            if(filter.isProfane(msg)){
                return callback('Profanity is not allow!');
            }
    
            io.to(thisUser.roomname).emit('welcomeMsg', {text: msg, name: thisUser.username, timeStamp: moment(new Date().getTime()).format('HH:mm')});
        }
    });

    socket.on('shareLocation', (sharelocationObj, callback) => {
        const thisUser = getUserById(socket.id);

        if(thisUser){
            io.to(thisUser.roomname).emit('shareLocationToAll', {locationDet: sharelocationObj, name: thisUser.username, timeStamp: moment(new Date().getTime()).format('HH:mm')});
            callback();   
        }
    });

    socket.on('disconnect', () => {
        const thisUser = getUserById(socket.id);
        const user = removeUser(socket.id);

        if(thisUser){
            io.to(thisUser.roomname).emit('welcomeMsg', {text: `${thisUser.username} has left ${thisUser.roomname}.`, name: thisUser.username, timeStamp: moment(new Date().getTime()).format('HH:mm')});
            io.to(thisUser.roomname).emit('roomDet', {
                roomname: thisUser.roomname,
                users:getUserInRoom(thisUser.roomname)
            });    
        }
    });     
});

server.listen(port, () => {
    console.log('web server is up on port ' + port);
});