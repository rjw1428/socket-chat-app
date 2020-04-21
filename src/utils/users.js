const users = []

const addUser = ({id, username, room}) => {
    if (!username || !room) return { error: "Username and room are required"}
    username = username.trim()
    room = room.trim()
    const exitingUser = users.find(user=>{
        return user.room === room && user.username === username
    })

    if (exitingUser) return { error: "Username is already in use" }

    const user = {
        id: id,
        username,
        room
    }
    users.push(user)
    return {error: undefined, user}
}

const removeUser = (id) =>{
    const index = users.findIndex(user=>user.id === id)
    return (index>=0)?users.splice(index, 1)[0]:{error: "User ID not found"}
}

const getUser = (id) => {
    return users.find(user=>user.id === id)
}

const getUsersInRoom = (room) => {
    if (room)
        return users.filter(user=> user.room===room.trim())
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}