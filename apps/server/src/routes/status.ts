import express from "express";
import passport from "passport";
import { usePassportController } from "../auth";
import { createToken } from "../utils/livekit";
import { ActivationBody, ActivationStatus, BoxChangePinBody, BoxClient, BoxJwtPayload, BoxLoginBody, BoxServer, RoleId, UserUsingBox } from "@delidock/types";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { io, prisma } from "..";
export const statusRouter = express.Router()
usePassportController(passport)

const updateStatus = async (boxId: string, newStatus: boolean) => {
    const newStatusBox = await prisma.box.update({
        where: {
            id: boxId
        },
        data: {
            lastStatus: newStatus
        }
    })
    return newStatusBox
}

const updatePin = async (boxId: string, newPin: string) => {
    const newPinBox = await prisma.box.update({
        where: {
            id: boxId
        },
        data: {
            lastPIN: newPin
        }
    })
    return newPinBox
}


statusRouter.post('/login', async (req, res) => {
    const body : BoxLoginBody = req.body
    try {
        const box = await prisma.box.findUnique({
            where: {
                id: body.id
            }
        })
        if (box && bcrypt.compareSync(body.psk, box.pskHash)) {                
            if (process.env.DELIDOCK_API_SECRET) {
                const jwtPayload : BoxJwtPayload = {id: box.id, role: RoleId.Box}
                res.status(200).send(jwt.sign(jwtPayload, process.env.DELIDOCK_API_SECRET ))
            } else {
                res.status(500).send()
            }
        } else {
            res.status(401).send()
        }
    } catch (error) {
        res.status(404).send()
    }
})
statusRouter.post('/activate', passport.authenticate('box', {session: false}), async (req, res) => {
    const box = req.user as BoxServer | undefined
    const body : ActivationBody = req.body
    if (box) {
        try {
            const user = await prisma.user.update({
                where: {
                    id: body.userId,
                    NOT: { ownedBoxes: {has: box.id}}
                },
                data: {
                    ownedBoxes: {
                        push: box.id
                    }
                }
            })
            if (user && (body.status === ActivationStatus.OK)) {
                const activatedBox = await prisma.box.update({
                    where: {
                        id: box.id
                    },
                    data: {
                        activated: true,
                        owner: user.id
                    }
                })
                let users : UserUsingBox[] = []
                const usersByBox = await prisma.user.findMany({where: {
                    OR: [
                        {
                            allowedBoxes: {has: box.id}
                        },
                        {
                            managedBoxes: {has: box.id}
                        },
                    ],
                    NOT: {
                        id: user.id
                    }
                }})

                for(const userByBox of usersByBox){
                    if (userByBox.managedBoxes.includes(box.id)) {
                        users.push({name: `${userByBox.firstName} ${userByBox.lastName}`, email: userByBox.email, managing: true})
                    } else if (userByBox.allowedBoxes.includes(box.id)) {
                        users.push({name: `${userByBox.firstName} ${userByBox.lastName}`, email: userByBox.email, managing: false})
                    }
                }
                const clientBox : BoxClient = {
                    managed: true,
                    id: box.id,
                    lastPIN: box.lastPIN,
                    lastStatus: box.lastStatus,
                    name: box.name,
                    offline: box.offline,
                    users,
                    owner: {name: `${user.firstName} ${user.lastName}`, email: user.email, managing: true}
                }

                io.of('/ws/users').in(`user:${user.id}`).socketsJoin([`box:managed:${box.id}`,`box:allowed:${box.id}`])
                io.of('/ws/users').to(`user:${body.userId}`).emit('boxAddNew', clientBox)
                res.status(200).send(JSON.stringify({pin: box.lastPIN, name: box.name}))
            } else if (user && (body.status === ActivationStatus.NOT_OK)) {
                io.of('/ws/users').to(`user:${body.userId}`).emit('boxAddFailed')
                res.status(200).send()
            }
            else {
                res.status(404).send()
            }
        } catch (error) {
            res.status(404).send()
        }
    } else {
        res.status(401).send()
    }
})

statusRouter.get('/getLivekit', passport.authenticate('box', {session: false}), (req, res) => {
    if (req.user && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_SECRET) {
        const box = req.user as BoxServer
        res.send(createToken(box.id, box.id, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_SECRET, true))
    } else {
        res.status(401).send()
    }
})

statusRouter.get('/unlocked', passport.authenticate('box', {session: false}), (req, res) => {
    if (req.user) {
        const box = req.user as BoxServer
        try {
            updateStatus(box.id, true)
            io.of('/ws/users').to(`box:allowed:${box.id}`).to(`box:managed:${box.id}`).emit("boxUnlocked", box.id)
            res.status(200).send()
        } catch (error) {
            res.status(404).send()
        }
        
    } else {
        res.status(401).send()
    }
})

statusRouter.get('/closed', passport.authenticate('box', {session: false}), async (req, res) => {
    if (req.user) {
        const box = req.user as BoxServer
        try {
            const updated = await updateStatus(box.id, false)
            if (!updated)
                res.status(404).send()

            io.of('/ws/users').to(`box:allowed:${box.id}`).to(`box:managed:${box.id}`).emit("boxLocked", box.id)
            res.status(200).send()
        } catch (error) {
            res.status(404).send()
        }
    } else {
        res.status(401).send()
    }
})

statusRouter.put('/changed', passport.authenticate('box', {session: false}), async (req, res)=> {
    const body : BoxChangePinBody  = req.body
    if (req.user) {
        const box = req.user as BoxServer
        try {
            const updated = await updatePin(box.id, body.newPin)
            if (!updated) {
                res.status(404).send()
                return
            }
                
            io.of('/ws/users').to(`box:allowed:${box.id}`).to(`box:managed:${box.id}`).emit("boxChanged",box.id, body.newPin)
            res.status(200).send()
        } catch (error) {
            console.log(error);
            
            res.status(404).send()
        }
    } else {
        res.status(401).send()
    }
})