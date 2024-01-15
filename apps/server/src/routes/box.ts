import express, { Request } from "express";
import { usePassportController } from "../auth";
import passport from "passport";

import { io, prisma } from "../index";
import { User } from "@delidock/types";
import { createToken } from "../utils/livekit";

export const boxRouter =  express.Router()

usePassportController(passport)

boxRouter.get('/:box/unlock', passport.authenticate('user', {session: false}), (req: Request, res) => {
    
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

boxRouter.get('/:box/livekit', passport.authenticate('user', {session: false}), (req, res) => {
    if (req.user && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_SECRET) {
        const user = req.user as User
        res.send(createToken(req.params.box, user.id, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_SECRET))
    } else {
        res.status(401).send()
    }
})

