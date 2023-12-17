import { boxes } from "$lib/stores/store";

export interface RegisterUser {
    firstname: string,
    lastname: string,
    email: string,
}

export class Box {
    status: boolean
    name: string
    id: string;
    pin: string;
    livekitToken: string;
    livekitIP: string;
    constructor(Name : string, Identifier : string, PINCode : string, LiveKitToken : string, LiveKitIP : string , Opened: boolean) {
        this.name = Name
        this.id = Identifier
        this.pin = PINCode
        this.livekitToken = LiveKitToken
        this.livekitIP = LiveKitIP
        this.status = Opened
    }
    unlock() {
        this.status = true
        this.notify()
        this.update()
    }
    changePIN() {
        let randomNumber = Math.floor(Math.random() * 1000000);
        this.pin = randomNumber.toString().padStart(6, '0');
        this.notify()
        this.update()
    }
    subscribers = new Set()
    notify = () => {
        this.subscribers.forEach((sub : any) => sub(this))
    }
    subscribe = (sub : any) => {
        this.subscribers.add(sub)
        sub(this)
        return () => this.subscribers.delete(sub)
    }
    private update = () => {
        boxes.subscribe((x) => {
            let thisBoxId= x?.findIndex((box) => box.id === this.id)  
            if (thisBoxId) {
                x[thisBoxId] = this
            }
        })
    }
}