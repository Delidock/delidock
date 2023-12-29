import { registerUser } from "$lib/stores";
import { redirect } from "@sveltejs/kit";

export function load() {
    registerUser.subscribe((e)=>{
        if (!e) {
            throw redirect(302, "/sign/up")
        }
    })
}