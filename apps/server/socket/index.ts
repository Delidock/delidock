import { instrument } from "@socket.io/admin-ui";
import { Server, Socket } from "socket.io";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { secret } from "..";
import { PrismaClient } from "@prisma/client";



export const startSocket = (io : Server) => {
    const prisma = new PrismaClient()
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

    io.on("connection", async (socket : Socket)=>{
        try {
            if (!jwt.verify(socket.handshake.auth.token, secret)   ) {
                socket.disconnect()    
            }
            const userPayload = jwt.decode(socket.handshake.auth.token, { json: true})
            if (userPayload) {
                try {
                    const user = await prisma.user.findUnique({
                        where:{
                            id: userPayload._id
                        }
                    })
                    if (user && user.role === '000000000000000000000001') {
                        const allowedBoxesIds = user?.allowedBoxes
                        const managedBoxesIds = user?.managedBoxes

                        const allowedBoxes = await prisma.box.findMany({where:{
                            id: {in: allowedBoxesIds}
                        }})

                        const managedBoxes = await prisma.box.findMany({where: {
                            id: {in: managedBoxesIds}
                        }})

                        for (const allowedBox of allowedBoxes) {
                            socket.join(`box:allowed:${allowedBox.id}`)
                            socket.emit('boxAdd', {id: allowedBox.id, name: allowedBox.name, status: allowedBox.lastStatus, pin: allowedBox.lastPIN, managed: false})
                            
                        }
                        for (const managedBox of managedBoxes) {
                            socket.join(`box:managed:${managedBox.id}`)
                            socket.emit('boxAdd', {id: managedBox.id, name: managedBox.name, status: managedBox.lastStatus, pin: managedBox.lastPIN, managed: true})
                        }

                    } else {
                        socket.disconnect()  
                    }
                } catch (error) {
                    console.log(error);
                    
                    socket.disconnect()  
                }  
            }else {
                socket.disconnect()  
            }
            
            
        } catch (error) {
            socket.disconnect()     
        }
        
    })
}