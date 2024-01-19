import { goto } from "$app/navigation";
import { AddNewStatus, addingStatus, boxes, loggedUser } from "$lib/stores";
import type { BoxClient, UserJwtPayload, UserUsingBox } from "@delidock/types";
import type { Socket } from "socket.io-client";
import { get } from "svelte/store";
import Cookies from "universal-cookie";
import { Update } from "../BoxUpdater";
import { Preferences } from "@capacitor/preferences";
import { jwtDecode } from "jwt-decode";
import { delidock } from "..";
import { page } from "$app/stores";

export const socketListen = (socket: Socket) => {
    socket.on('disconnect', async (reason) => {
        const cookies = new Cookies()
        switch (reason) {
            case 'io server disconnect':
                cookies.remove('token', { path: '/'})
                await Preferences.remove({ key: 'token'})
                goto('/sign/in', {replaceState: true})
                break;
        
            default:
                break;
        }
    })

    socket.on('boxAdd', (box: BoxClient) => {
        if (!get(boxes).some((b:BoxClient) => b.id === box.id)) {
            boxes.update((b: BoxClient[]) => [...b, box])
        }
    })

    socket.on('boxAddNew', (box: BoxClient)=> {
        addingStatus.set(AddNewStatus.SUCESS)
        if (!get(boxes).some((b:BoxClient) => b.id === box.id)) {
            boxes.update((b: BoxClient[]) => [...b, box])
        }
        
    })

    socket.on('boxAddInvite', (box: BoxClient) => {
        if (!get(boxes).some((b:BoxClient) => b.id === box.id)) {
            boxes.update((b: BoxClient[]) => [...b, box])
        }
        
    })

    socket.on('boxRemove',async  (boxId: string) =>{
        if (get(boxes).some((b:BoxClient) => b.id === boxId)) {
            const currentPage = get(page)
            console.log(currentPage.url.pathname);
            
            if (currentPage.url.pathname === `/home/${boxId}`) {
                goto('/home', {replaceState: true})
                boxes.update((boxArray: BoxClient[]) => boxArray.filter((box) => box.id !== boxId))
            } else {
                boxes.update((boxArray: BoxClient[]) => boxArray.filter((box) => box.id !== boxId))
            }
            
        }
    })

    socket.on('boxAddFailed', ()=> {
        addingStatus.set(AddNewStatus.FAIL)
        // POPUP
    })
    socket.on('boxUnlocked', (id:string) => {
        Update(id, 'lastStatus', true)
    })

    socket.on('boxLocked', (id: string) => {
        Update(id, 'lastStatus', false)
    })
    socket.on('boxNameChanged', (id:string, name: string) => {
        //addingStatus.set(AddNewStatus.SUCESS)
        Update(id, 'name', name)
    })

    socket.on('boxChanged', (id:string, pin: string) => {
        Update(id, 'lastPIN', pin)
    })

    socket.on('boxUserAdd', (id: string, user: UserUsingBox) => {
        let gotBoxes = get(boxes)
        let boxId = gotBoxes.findIndex((e) => e.id === id)
        if (boxId >= 0) {
            Update(id, 'users', [...gotBoxes[boxId].users, user])
        }
    })

    socket.on('boxUserPromoted', (id: string, userEmail: string) => {
        let gotBoxes = get(boxes)
        let boxId = gotBoxes.findIndex((e) => e.id === id)
        if (boxId >= 0) {
            let userId = gotBoxes[boxId].users.findIndex((e) => e.email === userEmail)
            if (userId >= 0) {
                gotBoxes[boxId].users[userId]['managing'] = true
                boxes.set(gotBoxes)

                //WIP-INEFFICIENT
                if (userEmail === (jwtDecode(delidock.token) as UserJwtPayload).email) {
                    Update(id, 'managed', true)
                }
            }
            
        }
    })

    socket.on('boxUserDemoted', (id: string, userEmail: string) => {
        let gotBoxes = get(boxes)
        let boxId = gotBoxes.findIndex((e) => e.id === id)
        if (boxId >= 0) {
            let userId = gotBoxes[boxId].users.findIndex((e) => e.email === userEmail)
            if (userId >= 0) {
                gotBoxes[boxId].users[userId]['managing'] = false
                boxes.set(gotBoxes)

                //WIP-INEFFICIENT
                if (userEmail === (jwtDecode(delidock.token) as UserJwtPayload).email) {
                    Update(id, 'managed', false)
                }
            }
        }
    })

    socket.on('boxUserRemove', (id: string , userEmail: string) => {
        let gotBoxes = get(boxes)
        let boxId = gotBoxes.findIndex((e) => e.id === id)
        if (boxId >= 0) {
            Update(id, 'users', gotBoxes[boxId].users.filter(u => u.email !== userEmail))
        }
    })

    socket.on('initialized', ()=> {
        const user : UserJwtPayload =  jwtDecode(delidock.token)
        loggedUser.set({name: `${user.firstName} ${user.lastName}`, email: user.email})
    })

}

export const socketStop = (socket: Socket) => {
    socket.disconnect()
}