const users = [];

const addUser = ({id, username, roomname}) => {
    username = username.trim().toLowerCase();
    roomname = roomname.trim().toLowerCase();

    if(!username || !roomname){
        return {
            error: 'Usernamd and Room are required!'          
        }
    }

    const existingUser = users.find((user) => {
        return user.roomname === roomname && user.username === username
    })

    if(existingUser){
        return {
            error: 'Duplicated entry...!'          
        }
    } 

    const user = {id, username, roomname};
    users.push(user);
    return({user});
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
 
    if(index !== -1){
        return users.splice(index, 1);
    }
}

const getUserById = (id) => {
    return users.find((user) => {
        return user.id === id;
    })
}

const getUserInRoom = (roomname) => {
    return users.filter((user) => {
        return user.roomname === roomname;
    })
}

module.exports = {
    addUser,
    removeUser,
    getUserById,
    getUserInRoom
}