const { Server } = require('socket.io');

class Socket{
   constructor(server) {
      this.server = server;
      this.onlineUsers = [];
      this.io = null;
   }
   createConnection(){
      this.io = new Server(this.server, {cors:true}); // setting up socket connection

      //just a basic middleware stoirng a key email with the
      // value passed by the client while making connection.
      this.io.use((socket, next)=>{
         
         console.log(socket.handshake.auth.email);
         socket['email'] = socket.handshake.auth.email;
         next();
      })

      this.io.on("connection", (socket) => {
         console.log(`New connection ${socket.id}`);
         socket.join(socket.email);
         socket.on("disconnect", (reason) => {
            console.log(reason);
            this.onlineUsers = this.onlineUsers.filter(user=>user.socketId !== socket.id)
            this.getIo().emit(`getOnlineUsers`, this.onlineUsers)            
         });
      });

   }
   getIo(){
      return this.io;
   }
}

module.exports = Socket;