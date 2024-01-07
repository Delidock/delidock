import { goto } from "$app/navigation"
import type { Box, RegisterUser } from "$lib/types"
import { Preferences } from '@capacitor/preferences';
import Cookies, { type Cookie } from "universal-cookie"
import { type Socket, io } from 'socket.io-client'
import { socketListen, socketStop } from "./socket"
import { socketStore } from "$lib/stores"
import { PUBLIC_API_URL } from '$env/static/public';
import { Update } from "./BoxUpdater"

class Delidock {
    api : string = PUBLIC_API_URL ?? "https://delidock-api.stepskop.xyz"
    livekitIp : string = "https://delidock-livekit.stepskop.xyz"
    token : string = ""
    cookies : Cookie = new Cookies()
    socket: Socket | null = null
    login = async (email: string, password: string, remember: boolean) => {
        const res = await fetch(`${this.api}/sign/in`, {
            method: "post",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        })
        if (res.status === 200) {
            this.token = await res.text()
            this.cookies.set("token", this.token, {
                secure: true,
                path: "/",
                sameSite: "strict"
            })
            if (remember) {
                await Preferences.set({
                    key: 'token',
                    value: this.token,
                  });
            }
            this.socketConnect()
        }      
        return res
    }

    logout = async () => {
        this.token = ''
        this.cookies.remove("token", {
            path: "/",
        })
        await Preferences.remove({
            key: 'token',
          });
        if (this.socket) {
            socketStop(this.socket)
        }
        goto("/sign/in", {replaceState: true})
    }

    register = async (email: string) => {
        return await fetch(`${this.api}/sign/up`, {
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
            const token = await fetch(`${this.api}/box/${id}/livekit`, {
                method: "GET",
                headers: {
                    Authorization: "Bearer "+this.cookies.get('token')
                }
            })
            if (token.status === 200) {
                return await token.text()
            } else if (token.status === 401) {
                this.cookies.remove('token', { path: "/"})
                goto("/sign/in", {replaceState: true})
            }
            return false
        } catch (error) {
            return false
        }
        
    }

    confrimPassword = async (registerUser: RegisterUser, password: string, confirmedPass: string) => {
        const user = {...registerUser, password, confirmedPass}
        return await fetch(`${this.api}/sign/up/confirm`, {
            method: "post",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
    }

    checkToken = async () => {   
        if ((this.cookies.get('token'))) {
            this.token = this.cookies.get('token')
            return true
        } else {
            const res = await Preferences.get({
                key: 'token',
            });
            if (res.value) {
                this.token = res.value
                this.cookies.set("token", this.token, {
                    secure: true,
                    path: "/",
                    sameSite: "strict"
                })
                return true
            } else {
                return false
            }
        }
    }

    socketConnect = () => {        
        if (this.token) {
            const socket = io(this.api,{
                auth: {
                    token: this.token
                }
            })
            if (socket) {
                this.socket = socket
                socketStore.set(socket)
                socketListen(socket)
            }
        }
    }
    socketDisconnect = () => {
        if (this.socket) {
            socketStop(this.socket)
        }
        this.socket = null
        socketStore.set(null)
    }

    unlock = (box: Box) =>{
        fetch(`${this.api}/box/${box.id}/unlock`, {
            headers: {
                Authorization: "Bearer "+new Cookies().get('token')
            }
        })
    }
    
    changePin = (box: Box) => {

        //fetch change
        Update(box, 'pin', "321458")
    }
    updateName = async (box: Box, boxName: string) => {
        return await fetch(`${this.api}/box/${box.id}/name`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: "Bearer "+new Cookies().get('token')
            },
            method: 'put',
            body: JSON.stringify({name: boxName})
        })
	}
}
export const delidock = new Delidock