import { goto } from "$app/navigation";
import { AddNewStatus, addingStatus, boxes } from "$lib/stores";
import type { BoxClient, UserUsingBox } from "@delidock/types";
import type { Socket } from "socket.io-client";
import { get } from "svelte/store";
import Cookies from "universal-cookie";
import { Update } from "../BoxUpdater";
import { Preferences } from "@capacitor/preferences";


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
            socket.emit('rejoin', box.id)
        }
        
    })

    socket.on('boxAddInvite', (box: BoxClient) => {
        if (!get(boxes).some((b:BoxClient) => b.id === box.id)) {
            boxes.update((b: BoxClient[]) => [...b, box])
            socket.emit('rejoin', box.id)
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

    socket.on('userAdd', (id: string, user: UserUsingBox) => {
        let gotBoxes = get(boxes)
        let boxId = gotBoxes.findIndex((e) => e.id === id)
        if (boxId >= 0) {
            Update(id, 'users', [...gotBoxes[boxId].users, user])
        }
        
    })

}

export const socketStop = (socket: Socket) => {
    socket.disconnect()
}