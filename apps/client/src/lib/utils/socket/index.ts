import { goto } from "$app/navigation";
import { boxes } from "$lib/stores";
import type { Box } from "$lib/types";
import type { Socket } from "socket.io-client";
import { get } from "svelte/store";
import Cookies from "universal-cookie";


export const socketListen = (socket: Socket) => {
    socket.on('disconnect', (reason) => {
        const cookies = new Cookies()
        switch (reason) {
            case 'io server disconnect':
                console.log('invalid token');
                cookies.remove('token', { path: '/'})
                goto('/sign/in', {replaceState: true})
                break;
        
            default:
                break;
        }
    })

    socket.on('boxAdd', (box: Box) => {
        if (!get(boxes).some((b:Box) => b.id === box.id)) {
            boxes.update((b: Box[]) => [...b, box])
        }
    })
}

export const socketStop = (socket: Socket) => {
    socket.disconnect()
}