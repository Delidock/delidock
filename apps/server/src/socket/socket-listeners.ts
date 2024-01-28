import { Server, Socket } from "socket.io";
import { prisma } from "..";


export const boxSocketListen = (socket: Socket, io: Server, boxId: string) => {
    socket.on('disconnect', async ()=>{
        try {
            const offlineBox = await prisma.box.update({
                where: {
                    id: boxId
                },
                data: {
                    offline: true
                }
            })
            if (offlineBox) {
                io.of('/ws/users').to(`box:allowed:${offlineBox.id}`).to(`box:managed:${offlineBox.id}`).emit('boxOffline', offlineBox.id)
            }
        } catch (error) {
            
        }
    })


}