import type { Box, RegisterUser } from "$lib";
import { writable, type Writable } from "svelte/store";

export const registerUser : Writable<RegisterUser | null > = writable()
export const boxes : Writable<Box[]> = writable()
export const session = writable()