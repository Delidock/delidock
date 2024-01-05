import { instrument } from "@socket.io/admin-ui";
import { Server, Socket } from "socket.io";

export const startSocket = (io : Server) => {
    instrument(io, {
        auth: {
            type: "basic",
            username: "admin",
            password: "$2y$10$.xrNVHREo2Bxm2.xEv97SuTRC/Kx4ebbKZ/rcEHqlRPs/kez1/s4a"
        },
      });

    let messages : {id: string, content: string}[] = []
    let roomMessages : {id: string, content: string, time: string}[] = []

    function generateRandomNumber() {
        var minm = 100000;
        var maxm = 999999;
        return Math.floor(Math
        .random() * (maxm - minm + 1)) + minm;
    }

    io.on("connection", (socket : Socket)=>{

        socket.join(socket.handshake.auth.room)  
        io.to(socket.handshake.auth.room).emit("joinedAck")  

        io.sockets.emit("default", messages)
        io.to(socket.handshake.auth.room).emit("logs", roomMessages)

        socket.on("message", (args: string)=> {
            messages.push({id: socket.id, content: args})
            if (messages.length > 20) {
                messages.shift()
            }
            io.sockets.emit("default", messages)
        })    
        const logs = (a: string) =>{
            roomMessages.push({id: socket.id, content: a, time: new Date().toLocaleTimeString()})
            if (roomMessages.length > 4) {
                roomMessages.shift()
            }
            io.to(socket.handshake.auth.room).emit("logs", roomMessages)

        }

        socket.on("checkOpen", ()=> {        
            io.to(socket.handshake.auth.room).emit("checkOpen")
        })
        socket.on("checkedOpen", (args: string)=>{
            io.to(socket.handshake.auth.room).emit("checkedOpen", args)
        })

        socket.on("openBox", ()=>{         
            io.to(socket.handshake.auth.room).emit("openBox")
            logs("Trying to open")
        })

        socket.on("openedBox", ()=>{
            io.to(socket.handshake.auth.room).emit("openedBox", roomMessages)
            logs("Opened")
        })

        socket.on("changePIN", () => {
            let pin : number = generateRandomNumber()
            io.to(socket.handshake.auth.room).emit("changePIN", pin)
            logs("Trying to change PIN to "+pin)
        })

        socket.on("changedPIN", (args : string) => {
            io.to(socket.handshake.auth.room).emit("changedPIN", args)
            logs("Changed PIN to "+args)
        })
    })
}