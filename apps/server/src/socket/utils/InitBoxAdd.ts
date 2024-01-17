import { BoxClient, BoxServer, User, UserUsingBox } from "@delidock/types"
import { Socket } from "socket.io"

export const emitBoxes = (boxesArray : BoxServer[], allUsersByBoxes: User[], managed: boolean,  iAmOwner : boolean, user: User, socket : Socket, socketRoomSubId: string) => {
    for (const box of boxesArray) {
        if (box.activated && box.lastPIN){

            let users : UserUsingBox[] = []
            for(const userByBox of allUsersByBoxes){
                if (userByBox.managedBoxes.includes(box.id)) {
                    users.push({name: `${userByBox.firstName} ${userByBox.lastName}`, email: userByBox.email, managing: true})
                } else if (userByBox.allowedBoxes.includes(box.id)) {
                    users.push({name: `${userByBox.firstName} ${userByBox.lastName}`, email: userByBox.email, managing: false})
                }
            }
            
            
            let owner : UserUsingBox
            if (iAmOwner) {
                owner = { name: `${user.firstName} ${user.lastName}`, email: user.email, managing: true}
            } else {
                const ownerUser = allUsersByBoxes.find((u)=> u.ownedBoxes.includes(box.id))
                owner = { name: `${ownerUser!.firstName} ${ownerUser!.lastName}`, email: ownerUser!.email, managing: true}
            }

            const clientBox : BoxClient = {
                id: box.id,
                lastPIN: box.lastPIN,
                name: box.name,
                lastStatus: box.lastStatus,
                managed: managed,
                users,
                owner
            }
            socket.join(`box:${socketRoomSubId}:${box.id}`)
            socket.emit('boxAdd', clientBox)
        }
    }
}