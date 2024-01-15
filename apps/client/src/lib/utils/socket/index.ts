import { goto } from "$app/navigation";
import { boxes } from "$lib/stores";
import type { BoxClient } from "@delidock/types";
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
        if (!get(boxes).some((b:BoxClient) => b.id === box.id)) {

            //CONTINUE SETUP

            boxes.update((b: BoxClient[]) => [...b, box])
        } else {
            //ALREADY ADDED
        }
    })
    socket.on('boxAddFailed', ()=> {
        //STOP ADDING
    })
    socket.on('boxUnlocked', (id:string) => {
        Update(id, 'lastStatus', true)
    })

    socket.on('boxLocked', (id: string) => {
        Update(id, 'lastStatus', false)
    })
    socket.on('boxNameChanged', (id:string, name: string) => {
        Update(id, 'name', name)
    })

    socket.on('boxChanged', (id:string, pin: string) => {
        Update(id, 'lastPIN', pin)
    })

}

export const socketStop = (socket: Socket) => {
    socket.disconnect()
}