import express from "express";
import { usePassportController } from "../auth";
import passport from "passport";
import { io, prisma } from "../index";
import { BoxAddNewBody, BoxClient, BoxInviteBody, User, UserUsingBox } from "@delidock/types";
import { createToken } from "../utils/livekit";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const boxRouter =  express.Router()

usePassportController(passport)

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
        if (user.managedBoxes.includes(req.params.box) && req.body.name) {
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
    const body : BoxInviteBody = req.body
    if (user && user.managedBoxes.includes(req.params.box)) {
        try {
            const invitee = await prisma.user.update({
                where: {
                    email: body.email,
                    NOT: [
                        {
                            allowedBoxes: {has: req.params.box}
                        },
                        {
                            managedBoxes: {has: req.params.box}
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
            const newBox = await prisma.box.update({
                where: {
                    id: req.params.box,
                    NOT: {
                        users: {has: invitee.id}
                    }
                },
                data: {
                    users: {
                        push: invitee.id
                    }
                }
            })
            if (!newBox) {
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

            const clientBox : BoxClient = {
                managed: false,
                id: newBox.id,
                lastPIN: newBox.lastPIN,
                lastStatus: newBox.lastStatus,
                name: newBox.name,
                users
            }
            
            const usingUser : UserUsingBox = {name: `${invitee.firstName} ${invitee.lastName}`, email: invitee.email, managing: false}
            io.of('/ws/users').to(`user:${invitee.id}`).emit('boxAddInvite', clientBox)
            io.of('/ws/users').to(`box:managed:${newBox.id}`).to(`box:allowed:${newBox.id}`).emit('userAdd', newBox.id, usingUser)
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

boxRouter.get('/:box/livekit', passport.authenticate('user', {session: false}), (req, res) => {
    if (req.user && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_SECRET) {
        const user = req.user as User
        res.send(createToken(req.params.box, user.id, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_SECRET))
    } else {
        res.status(401).send()
    }
})

