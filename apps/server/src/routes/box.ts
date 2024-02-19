import express from "express";
import { usePassportController } from "../auth";
import passport from "passport";
import { io, prisma } from "../index";
import { BoxAddNewBody, BoxClient, BoxOwnershipChangeBody, BoxUserOperationBody, User, UserJwtPayload, UserUsingBox } from "@delidock/types";
import { createToken } from "../utils/livekit";

export const boxRouter =  express.Router()

usePassportController(passport)

const hasManaged = (boxId: string, user: User) => user.managedBoxes.includes(boxId)
const hasAllowed = (boxId: string, user: User) => user.allowedBoxes.includes(boxId)
const hasOwned = (boxId: string, user: User) => user.ownedBoxes.includes(boxId)

const getBox = async (boxId: string) => {
    return await prisma.box.findUnique({
        where: {
            id: boxId
        }
    })
}
boxRouter.get('/:box/deactivate',(req, res, next) => {req.body['boxId'] = req.params.box; next()}, passport.authenticate('owner', {session: false}), async (req, res) => {
    const owner = req.user as User
    if (owner) {
        try {
            const allUsersFromBox = await prisma.user.findMany({
                where: {
                    OR: [
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
                }
            })
            const deactivatedBox = await prisma.box.update({
                where: {
                    id: req.params.box
                },
                data: {
                    activated: false,
                    owner: null
                }
            })
            io.of('/ws/boxes').to(`box:${req.params.box}`).emit('activation')
            if (allUsersFromBox) {
                const userRooms : string[] = []
                for(const boxUser of allUsersFromBox){
                    if (hasAllowed(req.params.box, boxUser)) {
                        const newUser = await prisma.user.update({
                            where: {
                                id: boxUser.id
                            },
                            data: {
                                allowedBoxes: { set: boxUser.allowedBoxes.filter((b: string) => b !== req.params.box) }
                            }
                        })
                    } else if (hasManaged(req.params.box, boxUser)) {
                        const newUser = await prisma.user.update({
                            where: {
                                id: boxUser.id
                            },
                            data: {
                                managedBoxes: { set: boxUser.managedBoxes.filter((b: string) => b !== req.params.box) }
                            }
                        })
                    } else if (hasOwned(req.params.box, boxUser)) {
                        const newUser = await prisma.user.update({
                            where: {
                                id: boxUser.id
                            },
                            data: {
                                ownedBoxes: { set: boxUser.ownedBoxes.filter((b: string) => b !== req.params.box) }
                            }
                        })

                    }
                    if (!userRooms.includes(`user:${boxUser.id}`)) {
                        userRooms.push(`user:${boxUser.id}`)
                    }
                }
                io.of('/ws/users').to(userRooms).emit('boxRemove', req.params.box)
                io.of('/ws/users').in(userRooms).socketsLeave([`box:allowed:${req.params.box}`,`box:managed:${req.params.box}`])
                res.status(200).send()
            }
        } catch (error) {
            res.status(404).send()
        }
    } else {
        res.status(401).send()
    }
})

boxRouter.post('/:box/transfer', (req, res, next) => {req.body['boxId'] = req.params.box; next()}, passport.authenticate('owner', {session: false}), async (req, res) => {
    const body : BoxOwnershipChangeBody = req.body
    const owner = req.user as User
    if (owner) {
        try {
            const newOwner = await prisma.user.findUnique({
                where: {
                    email: body.newOwnerEmail,
                }
            })
            if (newOwner) {
                if (newOwner.id === owner.id) {
                    res.status(409).send()
                    return
                }
                const updatedOwner = await prisma.user.update({
                    where: {
                        id: newOwner.id
                    }, 
                    data: {
                        ownedBoxes: {
                            set: [...newOwner.ownedBoxes, req.params.box]
                        },
                        allowedBoxes: { set: newOwner.allowedBoxes.filter((b: string) => b !== req.params.box) },
                        managedBoxes: { set: newOwner.managedBoxes.filter((b: string) => b !== req.params.box) }
                    }
                })
                const updatedBox = await prisma.box.update({
                    where: {
                        id: req.params.box
                    },
                    data: {
                        owner: newOwner.id
                    }
                })
                if (updatedBox) {
                    const oldOwner = await prisma.user.update({
                        where: {
                            id: owner.id
                        }, data: {
                            ownedBoxes: { set: owner.ownedBoxes.filter((b: string) => b !== req.params.box) },
                            allowedBoxes: { push: req.params.box },
                        }
                    })

                    if (oldOwner) {
                        const newOwnerClient : UserUsingBox = { name: `${newOwner.firstName} ${newOwner.lastName}`, email: newOwner.email, managing: true }
                        io.of('/ws/users').to([`box:managed:${req.params.box}`, `box:allowed:${req.params.box}`]).emit('boxTransfer', req.params.box, newOwnerClient)
                        res.status(200).send()
                    } else {
                        res.status(404).send()
                    }
                } else {
                    res.status(404).send()
                }
            } else {
                res.status(403).send()
            }
        } catch (error) {
            res.status(404).send()
        }
    } else {
        res.status(401).send()
    }
})

boxRouter.get('/:box/leave', passport.authenticate('user', {session: false}), async (req, res) => {
    const user = req.user as User
    if (user) {
        try {
            if (hasAllowed(req.params.box, user)) {
                const updatedUser = await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        allowedBoxes: { set: user.allowedBoxes.filter((b: string) => b !== req.params.box) }
                    }
                })
                if (updatedUser) {
                    io.of('/ws/users').to(`user:${updatedUser.id}`).emit('boxRemove', req.params.box)
                    io.of('/ws/users').to([`box:allowed:${req.params.box}`,`box:managed:${req.params.box}`]).emit('boxUserRemove', req.params.box, updatedUser.email)
                    io.of('/ws/users').in(`user:${updatedUser.id}`).socketsLeave([`box:allowed:${req.params.box}`,`box:managed:${req.params.box}`])
                    res.status(200).send()
                }
            } else if (hasManaged(req.params.box, user)) {
                const updatedUser = await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        allowedBoxes: { set: user.managedBoxes.filter((b: string) => b !== req.params.box) }
                    }
                })
                if (updatedUser) {
                    io.of('/ws/users').to(`user:${updatedUser.id}`).emit('boxRemove', req.params.box)
                    io.of('/ws/users').to([`box:allowed:${req.params.box}`,`box:managed:${req.params.box}`]).emit('boxUserRemove', req.params.box, updatedUser.email)
                    io.of('/ws/users').in(`user:${updatedUser.id}`).socketsLeave([`box:allowed:${req.params.box}`,`box:managed:${req.params.box}`])
                    res.status(200).send()
                }
            } else {
                res.status(403).send()
            }
        } catch (error) {
            res.status(404).send()
        }
    } else {
        res.status(401).send()
    }
})

boxRouter.post('/activate', passport.authenticate('user', {session: false}), async (req, res) => {
    const body : BoxAddNewBody = req.body
    if (req.user && body) {
        const user = req.user as User
        try {
            const newBox = await getBox(body.id)
            if (newBox && !newBox.activated && !newBox.offline) {
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

boxRouter.get('/:box/unlock', passport.authenticate('user', {session: false}), async (req, res) => {
    
    if (req.user) {
        const user = req.user as User
        const boxes = user.allowedBoxes.concat(user.managedBoxes).concat(user.ownedBoxes)
        if (boxes.includes(req.params.box)) {
            try {
                const box = await getBox(req.params.box)
                if (box && box.activated && !box.offline) {
                    io.of('/ws/boxes').to(`box:${req.params.box}`).emit('unlock')
                    res.status(200).send()
                } else {
                    res.status(404).send()
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

boxRouter.get('/:box/change', passport.authenticate('user', {session: false}), async (req, res) => {

    if (req.user) {
        const user = req.user as User
        const boxes = user.allowedBoxes.concat(user.managedBoxes).concat(user.ownedBoxes)
        if (boxes.includes(req.params.box)) {
            try {
                const box = await getBox(req.params.box)
                if (box && box.activated && !box.offline) {
                    io.of('/ws/boxes').to(`box:${req.params.box}`).emit('change')
                    res.status(200).send()
                } else {
                    res.status(404).send()
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
                    io.of('/ws/boxes').to(`box:${req.params.box}`).emit("nameSet", req.body.name)
                    io.of('/ws/users').to([`box:allowed:${req.params.box}`,`box:managed:${req.params.box}`]).emit("boxNameChanged", req.params.box, req.body.name)
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
    const body : BoxUserOperationBody = req.body
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
                const ownerUser = usersByBox.find((u : User)=> u.ownedBoxes.includes(newBox.id))
                owner = { name: `${ownerUser!.firstName} ${ownerUser!.lastName}`, email: ownerUser!.email, managing: true}
            }
            
            const clientBox : BoxClient = {
                managed: false,
                id: newBox.id,
                lastPIN: newBox.lastPIN,
                lastStatus: newBox.lastStatus,
                name: newBox.name,
                offline: newBox.offline,
                users,
                owner
            }
            
            const usingUser : UserUsingBox = {name: `${invitee.firstName} ${invitee.lastName}`, email: invitee.email, managing: false}
            io.of('/ws/users').to(`user:${invitee.id}`).emit('boxAddInvite', clientBox)
            io.of('/ws/users').to([`box:managed:${newBox.id}`,`box:allowed:${newBox.id}`]).emit('boxUserAdd', newBox.id, usingUser)
            io.of('/ws/users').in(`user:${invitee.id}`).socketsJoin(`box:allowed:${req.params.box}`)
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
    const body : BoxUserOperationBody = req.body
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
                        allowedBoxes: toBeRemoved.allowedBoxes.filter((boxId : string) => boxId !== req.params.box)
                    }
                })
            } else if (toBeRemoved.managedBoxes.includes(req.params.box) && hasOwned(req.params.box, user)) {
                const removedUser = await prisma.user.update({
                    where: {
                        email: body.email
                    },
                    data: {
                        managedBoxes: toBeRemoved.managedBoxes.filter((boxId : string) => boxId !== req.params.box)
                    }
                })
            } else {
                res.status(401).send()
                return
            }

            io.of('/ws/users').to(`user:${toBeRemoved.id}`).emit('boxRemove', req.params.box)
            io.of('/ws/users').in(`user:${toBeRemoved.id}`).socketsLeave([`box:allowed:${req.params.box}`, `box:managed:${req.params.box}`])
            io.of('/ws/users').to([`box:managed:${req.params.box}`, `box:allowed:${req.params.box}`]).emit('boxUserRemove', req.params.box, toBeRemoved.email)
            
            res.status(200).send()
        } catch (error) {
            res.status(404).send()
        }
    } else {
        res.status(401).send()
    }

})

boxRouter.put('/:box/promote',(req, res, next) => {req.body['boxId'] = req.params.box; next()} , passport.authenticate('owner', {session: false}), async (req, res) => {
    const user = req.user as User
    const body : BoxUserOperationBody = req.body
    if (user) {
        try {
            const toBePromoted = await prisma.user.findUnique({
                where: {
                    email: body.email,
                    allowedBoxes: {has: req.params.box},
                }
            })
            if (!toBePromoted) {
                res.status(404).send()
                return
            }
            const promotedUser = await prisma.user.update({
                where: {
                    email: body.email,
                    allowedBoxes: {has: req.params.box}
                },
                data: {
                    allowedBoxes: toBePromoted.managedBoxes.filter((b: string) => b !== req.params.box),
                    managedBoxes: { push: req.params.box }
                }
            })
            if (!promotedUser) {
                res.status(404).send()
            }
            io.of('/ws/users').to([`box:managed:${req.params.box}`, `box:allowed:${req.params.box}`]).emit('boxUserPromoted', req.params.box, promotedUser.email)
            res.status(200).send()

        } catch (error) {
            res.status(404).send()
        }
    } else {
        res.status(401).send()
    }
})
boxRouter.put('/:box/demote',(req, res, next) => {req.body['boxId'] = req.params.box; next()}, passport.authenticate('owner', {session: false}), async (req, res) => {
    const user = req.user as User
    const body : BoxUserOperationBody = req.body
    if (user) {
        try {
            const toBeDemoted = await prisma.user.findUnique({
                where: {
                    email: body.email,
                    managedBoxes: {has: req.params.box}
                }
            })
            if (!toBeDemoted) {
                res.status(404).send()
                return
            }
            const demotedUser = await prisma.user.update({
                where: {
                    email: body.email,
                    managedBoxes: {has: req.params.box}
                },
                data: {
                    managedBoxes: toBeDemoted.managedBoxes.filter((b: string) => b !== req.params.box),
                    allowedBoxes: { push: req.params.box}
                }
            })
            if (!demotedUser) {
                res.status(404).send()
            }
            io.of('/ws/users').to([`box:managed:${req.params.box}`,`box:allowed:${req.params.box}`]).emit('boxUserDemoted', req.params.box, demotedUser.email)
            res.status(200).send()

        } catch (error) {
            res.status(404).send()
        }
    } else {
        res.status(401).send()
    }
})

boxRouter.get('/:box/livekit', passport.authenticate('user', {session: false}), async (req, res) => {
    if (req.user && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_SECRET) {
        const user = req.user as User
        try {
            const box = await getBox(req.params.box)
            if (box && box.activated && !box.offline) {
                res.send(createToken(req.params.box, user.id, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_SECRET))
            } else {
                res.status(404).send()
            }
        } catch (error) {
            res.status(404).send()
        }
    } else {
        res.status(401).send()
    }
})

