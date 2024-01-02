
export interface RegisterUser {
    firstname: string,
    lastname: string,
    email: string,
}

export enum LivekitDisconnected {
    CONNECTED,
    BOX,
    YOU
}

export enum LivekitState {
    DISCONNECTED = 0,
    VIEW = 1,
    CONNECTED = 2,
    BOXCONNECTED = 3,
    BOXVIDEO = 4,
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
    updateName(newName: string) {
        this.name = newName
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

        
    }
}