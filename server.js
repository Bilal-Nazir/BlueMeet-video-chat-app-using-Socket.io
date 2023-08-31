

const exp = require('constants');
const express = require('express');
const { v4: uuidV4 } = require('uuid');
const path = require('path')

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const http = require('http').createServer(app)

const PORT = 4000;

http.listen(PORT, ()=>{
    console.log(`listening to the port ${PORT}`)
})

app.use(express.static(__dirname+ '/public'))

app.get('/meet',(req, res)=>{
    res.render('room', {
        roomId: null,
        pageTitle: 'chat app'
    })
})
app.get('/',(req, res)=>{
    res.redirect(`/${uuidV4()}`)
})
app.get('/:room', (req, res) => {
    roomId = req.params.room || null;
    res.render('room', {
        roomId: roomId,
        pageTitle: 'chat app'
    })
  })

const io = require('socket.io')(http);


const users = {};


io.on('connection', socket=>{

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        console.log(roomId, userId)
        socket.to(roomId).broadcast.emit('user-connected2', userId)
    })

    socket.on('new-user', name=>{
        users[socket.id]= name;
        socket.broadcast.emit('user-connected', name)
    })
    socket.on('send-chat-message', message=>{
        socket.broadcast.emit('chat-message', {message: message, name:users[socket.id]})
    });
    socket.on('disconnect', ()=>{
        socket.broadcast.emit('user-disconnected', users[socket.id])
        delete users[socket.id]
    })
})