import express from "express";
import { usePassportController } from "../auth";
import passport from "passport";
import { io, prisma } from "../index";
import { BoxAddNewBody, BoxClient, BoxInviteUserBody, BoxJwtPayload, BoxRemoveUserBody, User, UserJwtPayload, UserUsingBox } from "@delidock/types";
import { createToken } from "../utils/livekit";
import jwt from "jsonwebtoken";

export const boxRouter =  express.Router()

usePassportController(passport)

const hasManaged = (boxId: string, user: User) => user.managedBoxes.includes(boxId)
const hasAllowed = (boxId: string, user: User) => user.allowedBoxes.includes(boxId)
const hasOwned = (boxId: string, user: User) => user.ownedBoxes.includes(boxId)

boxRouter.post('/activate', passport.authenticate('user', {session: false}), async (req, res) => {
    const body : BoxAddNewBody = req.body
    if (req.user && body) {
        const user = req.body as User
        try {
            const newBox = await prisma.box.findUnique({
                where: {
                    id: body.id
                }
            })
            if (newBox && !newBox.activated) {
                io.of('/ws/boxes').to(`box:${newBox.id}`).emit('activate', user.id, body.generatedToken)
                res.status(200).send()
            } else {
                res.status(400).send()
            }
        } catch (error) {
            res.status(404).send()
        }
    } else {
        res.status(401).send()
    }
})

boxRouter.get('/:box/unlock', passport.authenticate('user', {session: false}), (req, res) => {
    
    if (req.user) {
        const user = req.user as User
        const boxes = user.allowedBoxes.concat(user.managedBoxes)
        if (boxes.includes(req.params.box)) {
            
            io.of('/ws/boxes').to(`box:${req.params.box}`).emit('unlock')
            res.send().status(200)
        } else {
            res.status(401).send()
        }
    } else {
        res.status(401).send()
    }

})

boxRouter.get('/:box/change', passport.authenticate('user', {session: false}), (req, res) => {

    if (req.user) {
        const user = req.user as User
        const boxes = user.allowedBoxes.concat(user.managedBoxes)
        if (boxes.includes(req.params.box)) {

            io.of('/ws/boxes').to(`box:${req.params.box}`).emit('change')
            res.send().status(200)
        } else {
            res.status(401).send()
        }
    } else {
        res.status(401).send()
    }
    
})

boxRouter.put('/:box/name', passport.authenticate('user', {session: false}), async (req, res) => {
    if (req.user) {
        const user = req.user as User
        if ((user.managedBoxes.includes(req.params.box) || user.ownedBoxes.includes(req.params.box)) && req.body.name) {
            try {
                const box = await prisma.box.update({ 
                    where: { id: req.params.box},
                    data: {
                        name: req.body.name
                    }
                })
                if (box) {
                    io.of('/ws/users').to(`box:allowed:${req.params.box}`).to(`box:managed:${req.params.box}`).emit("boxNameChanged", req.params.box, req.body.name)
                    res.send().status(200)
                } else {
                    res.send().status(404)
                }
            } catch (error) {
                res.status(404).send()
            }
        } else {
            res.status(401).send()
        }
    } else {
        res.status(401).send()
    }
})

boxRouter.post('/:box/invite', passport.authenticate('user', {session: false}), async(req, res) => {
    const user = req.user as User
    const body : BoxInviteUserBody = req.body
    if (user && (user.managedBoxes.includes(req.params.box) || user.ownedBoxes.includes(req.params.box))) {
        try {
            const newBox = await prisma.box.findUnique({
                where: {
                    id: req.params.box,
                    activated: true
                }
            })
            if (!newBox) {
                res.status(404).send()
                return 
            }
            const invitee = await prisma.user.update({
                where: {
                    email: body.email,
                    NOT: [
                        {
                            allowedBoxes: {has: req.params.box}
                        },
                        {
                            managedBoxes: {has: req.params.box}
                        },
                        {
                            ownedBoxes: {has: req.params.box}
                        }
                    ]
                },
          
                data: {
                    allowedBoxes: {
                        push: req.params.box
                    }
                }
            })

            if (!invitee) {
                res.status(404).send()
                return 
            }
            

            let users : UserUsingBox[] = []
            const usersByBox = await prisma.user.findMany({where: {
                OR: [
                    {
                        allowedBoxes: {has: newBox.id}
                    },
                    {
                        managedBoxes: {has: newBox.id}
                    },
                    {
                        ownedBoxes: {has: newBox.id}
                    }
                ],
                NOT: {
                    id: invitee.id
                }
            }})

            for(const userByBox of usersByBox){
                if (userByBox.managedBoxes.includes(newBox.id)) {
                    users.push({name: `${userByBox.firstName} ${userByBox.lastName}`, email: userByBox.email, managing: true})
                } else if (userByBox.allowedBoxes.includes(newBox.id)) {
                    users.push({name: `${userByBox.firstName} ${userByBox.lastName}`, email: userByBox.email, managing: false})
                }
            }

            let owner : UserUsingBox
            if (user.ownedBoxes.includes(newBox.id)) {
                owner = { name: `${user.firstName} ${user.lastName}`, email: user.email, managing: true}
            } else{
                const ownerUser = usersByBox.find((u)=> u.ownedBoxes.includes(newBox.id))
                owner = { name: `${ownerUser!.firstName} ${ownerUser!.lastName}`, email: ownerUser!.email, managing: true}
            }
            
            const clientBox : BoxClient = {
                managed: false,
                id: newBox.id,
                lastPIN: newBox.lastPIN,
                lastStatus: newBox.lastStatus,
                name: newBox.name,
                users,
                owner
            }
            
            const usingUser : UserUsingBox = {name: `${invitee.firstName} ${invitee.lastName}`, email: invitee.email, managing: false}
            io.of('/ws/users').to(`user:${invitee.id}`).emit('boxAddInvite', clientBox)
            io.of('/ws/users').to(`box:managed:${newBox.id}`).to(`box:allowed:${newBox.id}`).emit('boxUserAdd', newBox.id, usingUser)
            
            //WIP-INEFFICIENT
            io.of('/ws/users').sockets.forEach(s => {
                if ((jwt.decode(s.handshake.auth.token, { json: true}) as UserJwtPayload).email === invitee.email) {
                    s.join(`box:allowed:${req.params.box}`)
                }
            })
            res.status(200).send()

        } catch (error : any) {
            if (error.code && (error.code === 'P2025')) {
                res.status(404).send()
            }
            res.status(500).send()
        }
    } else {
        res.status(401).send()
    }
})

boxRouter.post('/:box/removeuser', passport.authenticate('user', {session: false}), async (req, res) => {
    const user = req.user as User
    const body : BoxRemoveUserBody = req.body
    if (user && (hasManaged(req.params.box, user) || hasOwned(req.params.box, user))) {
        try {
            const toBeRemoved = await prisma.user.findUnique({where: {
                email: body.email
            }})

            if (!toBeRemoved) {
                res.status(404).send()
                return
            }
            if (toBeRemoved.allowedBoxes.includes(req.params.box)) {
                const removedUser = await prisma.user.update({
                    where: {
                        email: body.email
                    },
                    data: {
                        allowedBoxes: toBeRemoved.allowedBoxes.filter((boxId) => boxId !== req.params.box)
                    }
                })
            } else if (toBeRemoved.managedBoxes.includes(req.params.box) && hasOwned(req.params.box, user)) {
                const removedUser = await prisma.user.update({
                    where: {
                        email: body.email
                    },
                    data: {
                        managedBoxes: toBeRemoved.managedBoxes.filter((boxId) => boxId !== req.params.box)
                    }
                })
            } else {
                res.status(401).send()
                return
            }

            io.of('/ws/users').to(`user:${toBeRemoved.id}`).emit('boxRemove', req.params.box)
            
            //WIP-INEFFICIENT
            io.of('/ws/users').sockets.forEach(s => {
                if ((jwt.decode(s.handshake.auth.token, { json: true}) as UserJwtPayload).email === toBeRemoved.email) {
                    s.leave(`box:allowed:${req.params.box}`)
                    s.leave(`box:managed:${req.params.box}`)
                }
            })

            io.of('/ws/users').to(`box:managed:${req.params.box}`).to(`box:allowed:${req.params.box}`).emit('boxUserRemove', req.params.box, toBeRemoved.email)
            
            res.status(200).send()
        } catch (error) {
            res.status(404).send()
        }
    } else {
        res.status(401).send()
    }

})

boxRouter.get('/:box/livekit', passport.authenticate('user', {session: false}), (req, res) => {
    if (req.user && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_SECRET) {
        const user = req.user as User
        res.send(createToken(req.params.box, user.id, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_SECRET))
    } else {
        res.status(401).send()
    }
})

