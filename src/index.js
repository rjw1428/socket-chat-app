const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const { generateMessageObj} = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')
const port = process.env.PORT || 3000
const dir = path.join(__dirname, '../public')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(dir))


io.on('connection', (socket) =>{
   
    socket.on('join', (options, callback) => {
        socket.join(options.room.trim())
        const {error, user} = addUser({id: socket.id, ...options})
        if (error) return callback(error)
        const admin = {id: 0, username: "Admin", room: user.room}
        const count = getUsersInRoom(user.room).length -1
        const countMessage = count ==0?"no other people":count==1?"1 other person":(count+" other people")
        socket.emit('onConnect', generateMessageObj(admin, `Welcome to the chat, there ${count==1?"is":"are"} currently ${countMessage} online...`))
        socket.broadcast.to(user.room).emit("onConnect", generateMessageObj(admin, `${user.username} has joined...`))
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
        callback()
    })

    socket.on('sendMessage', (data, callback) =>{
        let user = getUser(socket.id)
        io.to(user.room).emit('receiveMessage', generateMessageObj(user, data))
        callback()
    })

    socket.on('sendLocation', (data, callback) =>{
        let user = getUser(socket.id)
        socket.broadcast.to(user.room).emit('receiveLocation', generateMessageObj(user, `https://google.com/maps?q=${data.lat},${data.long}`))
        io.to(user.id).emit("receiveMessage", generateMessageObj(user, "Location Sent"))
        callback(generateMessageObj('Location Shared'))
    })

    socket.on('disconnect', ()=>{
        let user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('onConnect', generateMessageObj({id: 0, username: "Admin", room: user.room}, `${user.username} has left the building...`))
            io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})    
        }
    })
})


// START SERVER LISTENING
server.listen(port, () =>{
    console.log(`Server has started on port ${port}`)
})