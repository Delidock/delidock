import { registerUser } from "$lib/stores/store";
import { redirect } from "@sveltejs/kit";

export function load() {
    registerUser.subscribe((e)=>{
        if (!e) {
            throw redirect(302, "/sign/up")
        }
    })
}