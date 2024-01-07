
export interface RegisterUser {
    firstName: string,
    lastName: string,
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
export interface Box {
    status: boolean
    name: string
    id: string;
    pin: string;
    managed: boolean
}