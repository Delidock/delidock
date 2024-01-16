import type { BoxClient, RegisterUser } from "@delidock/types";
import type { Socket } from "socket.io-client";
import { writable, type Writable } from "svelte/store";

export enum AddNewStatus {
    'SUCESS',
    'FAIL',
    'WAITING',
}

export const registerUser : Writable<RegisterUser | null > = writable()
export const boxes : Writable<BoxClient[]> = writable([])
export const socketStore : Writable<Socket|null> = writable(null)
export const addingStatus : Writable<AddNewStatus> = writable(AddNewStatus.WAITING)
