const generateMessageObj = (user, text) => {
    return {
        text,
        createdAt: new Date().getTime(),
        username: user.username
    }
}

module.exports = {
    generateMessageObj
}