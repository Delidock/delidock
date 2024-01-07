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

    socket.on('boxUnlocked', (id:string) => {
        const boxIndex = get(boxes).findIndex((b:BoxClient) => b.id === id) 
        if (boxIndex >= 0) {
            
            
            Update(get(boxes)[boxIndex], 'lastStatus', true)
        }
    })

    socket.on('boxNameChanged', (id:string, name: string) => {
        const boxIndex = get(boxes).findIndex((b:BoxClient) => b.id === id) 
        if (boxIndex >= 0) {
            Update(get(boxes)[boxIndex], 'name', name)
        }
    })

}

export const socketStop = (socket: Socket) => {
    socket.disconnect()
}