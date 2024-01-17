import { instrument } from "@socket.io/admin-ui";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { BoxJwtPayload, RoleId, UserJwtPayload } from "@delidock/types"
import { emitBoxes } from "./utils/InitBoxAdd";
class SocketServer{
    io : Server | null = null
    userSocket : Socket | null = null
    boxSocket : Socket | null = null
    getUserSocket = () => {
        return this.userSocket
    }
    getBoxSocket = () => {
        return this.boxSocket
    }

    startSocket = (io : Server) => {
        const prisma = new PrismaClient()
        instrument(io, {
            auth: {
                type: "basic",
                username: "admin",
                password: "$2y$10$.xrNVHREo2Bxm2.xEv97SuTRC/Kx4ebbKZ/rcEHqlRPs/kez1/s4a"
            },
          });
    
        
        io.of("/ws/boxes").on("connection", async (socket : Socket) => {
            this.boxSocket = socket
            if (!jwt.verify(socket.handshake.auth.token, process.env.DELIDOCK_API_SECRET ?? "")   ) {
                socket.disconnect()    
            }
            const boxPayload = jwt.decode(socket.handshake.auth.token, { json: true}) as BoxJwtPayload | null

            if (boxPayload && (boxPayload.role === RoleId.Box)) {
                socket.join(`box:${boxPayload.id}`)
                try {
                    const box = await prisma.box.findUnique({
                        where: {
                            id: boxPayload.id
                        }
                    })
                    if (box) {
                        socket.emit('initializing')
                        if (box.activated) {
                            socket.emit('initialized', {pin: box.lastPIN})
                        } else if (!box.activated) {
                            socket.emit('activation')
                        }
                    } else {
                        socket.disconnect()
                    }
                } catch (error) {
                    socket.disconnect()
                }
            } else {
                socket.disconnect()
            }
        })

        io.of("/ws/users").on("connection", async (socket : Socket)=>{
            this.userSocket = socket
            try {
                if (!jwt.verify(socket.handshake.auth.token, process.env.DELIDOCK_API_SECRET ?? "")   ) {
                    socket.disconnect()    
                }
                const userPayload = jwt.decode(socket.handshake.auth.token, { json: true}) as UserJwtPayload | null
                if (userPayload && (userPayload.role === RoleId.User)) {
                    try {
                        const user = await prisma.user.findUnique({
                            where:{
                                id: userPayload.id
                            }
                        })
                        if (user && user.role === RoleId.User) {
                            const allowedBoxesIds = user.allowedBoxes
                            const managedBoxesIds = user.managedBoxes
                            const ownedBoxesIds = user.ownedBoxes
    
                            const allBoxesIds = allowedBoxesIds.concat(managedBoxesIds).concat(ownedBoxesIds)

                            const allUsersByBoxes = await prisma.user.findMany({where: {
                                OR: [
                                    {
                                        allowedBoxes: {hasSome: allBoxesIds}
                                    },
                                    {
                                        managedBoxes: {hasSome: allBoxesIds}
                                    },
                                    {
                                        ownedBoxes: {hasSome: allBoxesIds}
                                    }
                                ], 
                                NOT: {
                                    id: user.id
                                }
                            }})

                            const allowedBoxes = await prisma.box.findMany({where:{
                                id: {in: allowedBoxesIds}
                            }})
    
                            const managedBoxes = await prisma.box.findMany({where: {
                                id: {in: managedBoxesIds}
                            }})

                            const ownedBoxes = await prisma.box.findMany({where: {
                                id: {in: ownedBoxesIds}
                            }})

                            socket.emit('initializing')

                            socket.join(`user:${user.id}`)
                            
                            emitBoxes(allowedBoxes, allUsersByBoxes,false, false, user, socket, 'allowed')
                            emitBoxes(managedBoxes, allUsersByBoxes,true, false, user, socket, 'managed')
                            emitBoxes(ownedBoxes, allUsersByBoxes,true, true, user, socket, 'managed')
                            socket.emit('initialized')
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
}
export const socketServer = new SocketServer()
