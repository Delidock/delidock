import type { BoxClient, RegisterUser } from "@delidock/types";
import type { Socket } from "socket.io-client";
import { writable, type Writable } from "svelte/store";

export const registerUser : Writable<RegisterUser | null > = writable()
export const boxes : Writable<BoxClient[]> = writable([])
export const socketStore : Writable<Socket|null> = writable(null)

