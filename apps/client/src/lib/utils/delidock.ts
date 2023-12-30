import { goto } from "$app/navigation"
import type { RegisterUser } from "$lib/types"
import Cookies from "universal-cookie"

class Delidock {
    login = async (email: string, password: string) => {
        return await fetch("/api/sign/in", {
            method: "post",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        })
    }

    logout = () => {
        const cookies = new Cookies()
        cookies.remove("token", {
            path: "/",
        })
        goto("/sign/in", {replaceState: true})
    }

    register = async (email: string) => {
        return await fetch("/api/sign/up", {
        method: "post",
        body: JSON.stringify({email}),
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
    })   
    }

    confrimPassword = async (registerUser: RegisterUser, password: string, confirmedPass: string) => {
        return await fetch("/api/sign/up/confirm", {
            method: "post",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({...registerUser, password, confirmedPass})
        })
    }
}

export const delidock = new Delidock