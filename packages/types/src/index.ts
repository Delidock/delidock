export enum RoleId {
    User = '000000000000000000000001',
    Box = '000000000000000000000002'
}
export interface RegisterUser {
    firstName: string,
    lastName: string,
    email: string,
}
export interface RegisterRequestBody {
    email: string
}
export interface RegisterConfirmRequestBody extends RegisterUser{
    password: string,
    confirmedPass: string
}
export interface LoginRequestBody {
    email: string
    password: string
}

export interface User{
    id: string,
    createdAt: Date
    updatedAt: Date
    role: string
    email: string,
    firstName: string
    lastName: string
    passwordHash: string
    allowedBoxes: string[]
    managedBoxes: string[]
}

export interface UserJwtPayload {
    id: string
    role: string
    email: string
    firstName: string
    lastName: string
}
export interface BoxJwtPayload {
    id: string
    role: string
}
export interface Box {
    id: string
    lastPIN: string
    lastStatus: boolean
    name: string
}
export interface BoxClient extends Box {
    managed: boolean
}
export interface BoxServer extends Box {
    createdAt: Date
    updatedAt: Date
    activated: boolean
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
