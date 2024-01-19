import { loggedUser } from "$lib/stores";
import { get } from "svelte/store";
import type { PageLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
export const load: PageLoad = async () => {
    const currentUser = get(loggedUser)
    if (!currentUser) {
        throw redirect(301, "/home");
    }
    return{
        user: currentUser
    }
};