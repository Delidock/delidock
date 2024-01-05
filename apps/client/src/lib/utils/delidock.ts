import { goto } from "$app/navigation"
import type { RegisterUser } from "$lib/types"
import Cookies from "universal-cookie"

const api : string = "https://delidock-api.stepskop.xyz"
class Delidock {
    login = async (email: string, password: string) => {
        return await fetch(`${api}/sign/in`, {
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
        return await fetch(`${api}/sign/up`, {
        method: "post",
        body: JSON.stringify({email}),
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
    })   
    }

    getLivekitToken = async (id: string) => {
        try {
            const token = await fetch(`${api}/box/${id}/livekit`, {
                method: "GET",
                headers: {
                    Authorization: "Bearer "+new Cookies().get('token')
                }
            })
            if (token.status === 200) {
                return await token.text()
            } else if (token.status === 401) {
                new Cookies().remove('token', { path: "/"})
                goto("/sign/in", {replaceState: true})
            }
            return false
        } catch (error) {
            return false
        }
        
    }

    confrimPassword = async (registerUser: RegisterUser, password: string, confirmedPass: string) => {
        const user = {...registerUser, password, confirmedPass}
        return await fetch(`${api}/sign/up/confirm`, {
            method: "post",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
    }

    checkToken = () => {
        console.log("Checking token");
        
        const isValid = true
        if ((new Cookies().get('token')) && (isValid)) {
            return true
        } else
            return false
    }

    socketConnection = () => {
        
    }
}

export const delidock = new Delidock