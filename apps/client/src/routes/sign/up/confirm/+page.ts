import { registerUser } from "$lib/stores";
import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";

export function load() {
    if (!get(registerUser)) {
        throw redirect(304, '/sign/up')
    }
}
