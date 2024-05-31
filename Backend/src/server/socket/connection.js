// const { postgres } = require('../../database/models');
const Logger = require('../../config/winston-log');

let onlineUsers = []
exports.connection = async(socket) => {
    Logger.info(`Socket ${socket.id} connected`);
    // let notificationCount;
    // let newNotification;
    // socket.on('get-session-users', async (data) => {
    //     console.log(data)
    //     for(let participant of data.participants) {
    //         const chatSession = await postgres.models.ChatSession.findOrCreate({
    //             where: { userId: participant.userId, sessionId: data.sessionId },
    //             defaults: {
    //                 userId: participant.userId, tenantId: participant.tenantId, sessionId: data.sessionId ,
    //             },
    //         },);
    //         console.log(chatSession.id);
    //     }
    //     socket.emit('session-users', data);
    // });
    // socket.on('get-session-chats', async (data) => {
    //     console.log(data)
    //     const chatSession = await postgres.models.ChatMessage.findAndCountAll({
    //         where: { sessionId: data.sessionId },
    //     },);
    //     console.log(chatSession);
    //     socket.emit('session-users', data);
    // });
    socket.on(`addNewUser`, async ({userId, sessionId}) => {
        !onlineUsers.some(user => (user.userId === userId && user.sessionId === sessionId)) &&
        onlineUsers.push({
            userId, sessionId,
            socketId: socket.id
        });
        console.log(onlineUsers)
        // io.emit(`getOnlineUsers`, onlineUsers)
        socket.emit(`getOnlineUsers`, onlineUsers)
    })
    socket.on('disconnect', () => {
        Logger.info('A user disconnected');
        // clearInterval(notificationCount);
        // clearInterval(newNotification);
    });
}
