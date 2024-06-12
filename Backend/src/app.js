const path = require('path');
require('./server/utils/stack-trace');
require('dotenv').config();
const express = require('express');
const { Server } = require('socket.io');
// const Socket = require("./server/utils/socket.io");
// const db = require('./database/models');

// require('./config/mongoose');

const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger/swagger-output.json');

// const bodyParser = require('body-parser');
const cors = require('cors');
// const log = require('./log/logController');

const authRoutes = require("./server/routes/auth.routes")
const productRoutes = require("./server/routes/product.routes")
const testRoutes = require("./server/routes/test.routes")
const adminRoutes = require("./server/routes/admin.routes");
const verificationRouter = require('./server/routes/verification.routes');
const transactionRoutes = require('./server/routes/transaction.routes')
const userRoutes = require('./server/routes/user.routes')
const chatRoutes = require('./server/routes/chat.routes')
const auditLogsRoutes = require('./server/routes/auditLogs.routes')
const ThirdpartyRoutes = require('./server/routes/3rdParty.routes')
const FaqRoutes = require('./server/routes/faq.routes')

const AppError = require('./config/apiError');
const errorHandler = require("./config/error");
const fileUpload = require('express-fileupload')


const app = express();

// MIDDLEWARES
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload());

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.status(200).json({status: 200, message: "System is healthy"})
});
// app.use(log.logRequest);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument)); // define route to swagger document
app.use('/api/v1/tests', testRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/verifications', verificationRouter);
app.use('/api/v1/transactions', transactionRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/chats', chatRoutes)
app.use('/api/v1/audit-logs', auditLogsRoutes)
app.use('/api/v1/3rd-party-services', ThirdpartyRoutes)
app.use('/api/v1/faq', FaqRoutes)
app.use(`/api/v1/healthz`, (req, res) =>
    res.status(200).json({status: 200, message: "System is healthy"})
);
// app.use(log.logResponse)

app.use((req, res, next) => {
    return next(new AppError(`${req.ip} tried to ${req.method} to a resource at ${req.originalUrl} that is not on this server.`, __line, __path.basename(__filename), { status: 404 }));
});

app.use(errorHandler);

const { lookup } = require('dns').promises;
const os = require('os');
// const { ThirdpartyRoutes } = require('./server/routes');


const PORT = process.env.PORT || 2100;
app.enable('trust proxy');
const expressServer = app.listen(PORT, async () => {
    console.log('Nothing test')
    const IP = (await lookup(os.hostname())).address;
    // const socket = new Socket(expressServer);
    // socket.createConnection();

    // await db['postgres'].sync()
    console.log(`Server started at ${process.env.NODE_ENV ==='development' ? 'http' : 'https'}://${IP}:${PORT}`);
})

const io = new Server(expressServer, { cors: { origin: '*' } });

let onlineUsers = []
// // const sockets = require('./server/socket/connection')
// // io.on('connection', sockets.connection);
io.on('connection', socket=>{    
    socket.on(`joinRoom`, async (data) => {
        !onlineUsers.some(user => user.userId === data.userId) &&
        onlineUsers.push({
            ...data,
            socketId: socket.id
        });
        console.log('Joining room', data)
        socket.join(data.sessionId);
        io.emit(`getOnlineUsers`, onlineUsers)
        console.log(io.sockets.in(data.sessionId))
    })
    socket.on(`sendMessage`, async (message) => {
        io.sockets.in(message.sessionId).emit(`getMessage`, message)
    })
    socket.on('disconnect', () => {
        onlineUsers = onlineUsers.filter(user=>user.socketId !== socket.id)
        io.emit(`getOnlineUsers`, onlineUsers)
        socket.leave('room');
        console.log('A user disconnected');
    });
});