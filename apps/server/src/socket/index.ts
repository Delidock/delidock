import { instrument } from "@socket.io/admin-ui";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { BoxClient, RoleId, UserJwtPayload } from "@delidock/types"
class SocketServer{
    io : Server | null = null
    socket : Socket | null = null
    getSocket = () => {
        return this.socket
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
    
        let messages : {id: string, content: string}[] = []
        let roomMessages : {id: string, content: string, time: string}[] = []
    
        function generateRandomNumber() {
            var minm = 100000;
            var maxm = 999999;
            return Math.floor(Math
            .random() * (maxm - minm + 1)) + minm;
        }
        io.of("/ws/users").on("connection", async (socket : Socket)=>{
            this.socket = socket
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
                            const allowedBoxesIds = user?.allowedBoxes
                            const managedBoxesIds = user?.managedBoxes
    
                            const allowedBoxes = await prisma.box.findMany({where:{
                                id: {in: allowedBoxesIds}
                            }})
    
                            const managedBoxes = await prisma.box.findMany({where: {
                                id: {in: managedBoxesIds}
                            }})
    
                            for (const allowedBox of allowedBoxes) {
                                if (allowedBox.activated && allowedBox.lastPIN){
                                    const box : BoxClient = {
                                        id: allowedBox.id,
                                        lastPIN: allowedBox.lastPIN,
                                        name: allowedBox.name,
                                        lastStatus: allowedBox.lastStatus,
                                        managed: false
                                    }
                                    socket.join(`box:allowed:${allowedBox.id}`)
                                    socket.emit('boxAdd', box)
                                }
                            }
                            for (const managedBox of managedBoxes) {
                                if (managedBox.activated && managedBox.lastPIN){
                                    const box : BoxClient = {
                                        id: managedBox.id,
                                        lastPIN: managedBox.lastPIN,
                                        name: managedBox.name,
                                        lastStatus: managedBox.lastStatus,
                                        managed: true
                                    }
                                    socket.join(`box:managed:${managedBox.id}`)
                                    socket.emit('boxAdd', box)
                                }
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
}
export const socketServer = new SocketServer()
