const socket = io()

const form = document.querySelector('#message-input-form')
const input = form.querySelector('input')
const send = form.querySelector('button')
const messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const sidebar = document.querySelector('#sidebar')
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})

appendMessage = (data, isLocation) => {
    const html = Mustache.render(isLocation?locationTemplate:messageTemplate, {
            message: data.text,
            timestamp: moment(data.createdAt).format("h:mm a"),
            username: data.username
        })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
}

autoscroll = () => {
    const newMessage = messages.lastElementChild
    const newMessageMargin = parseInt(getComputedStyle(newMessage).marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    const visibleHeight = messages.offsetHeight
    const containerHeight = messages.scrollHeight
    const scrollOffset = messages.scrollTop + visibleHeight

    if ((containerHeight - newMessageHeight) <= scrollOffset) 
        messages.scrollTop = messages.scrollHeight
}

socket.on('onConnect', (data)=>{
    appendMessage(data, false)
})

socket.on('receiveMessage', (data)=>{
    appendMessage(data, false)
})

socket.on('receiveLocation', (data)=>{
    appendMessage(data, true)
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    sidebar.innerHTML =  html
})

form.addEventListener('submit', (event)=>{
    event.preventDefault()

    send.setAttribute('disabled', 'disable')

    socket.emit('sendMessage', input.value, (error) =>{
        input.value=""
        input.focus()
        send.removeAttribute('disabled')

        if (error) return console.log(error)
    })
})

const locButton = document.querySelector('#location')
locButton.addEventListener('click', (event) =>{
    if (!navigator.geolocation) return alert("Geolocation not available on your browser.")
    
    locButton.setAttribute('disabled', "disable")
    
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {lat: position.coords.latitude, long:position.coords.longitude}, (ack) =>{
            console.log(ack)
            locButton.removeAttribute('disabled')
        })
    })
})