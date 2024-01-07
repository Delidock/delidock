import express, { Request } from "express";
import { AccessToken } from "livekit-server-sdk";
import { userPassportController } from "../auth";
import passport from "passport";

import { io, prisma } from "../index";
import { User } from "@delidock/types";

export const boxRouter =  express.Router()

userPassportController(passport)

const createToken = (room: string, user:string, apiKey: string, secret: string) => {

    const roomName = `room:${room}`;

    const participantName = user;

    const at = new AccessToken(apiKey, secret, {
        identity: participantName,
    });
    at.addGrant({ roomJoin: true, room: roomName });

    return at.toJwt();
}

boxRouter.get('/:box/unlock', passport.authenticate('jwt', {session: false}), (req: Request, res) => {
    
    if (req.user) {
        const user = req.user as User
        const boxes = user.allowedBoxes.concat(user.managedBoxes)
        if (boxes.includes(req.params.box)) {
            
            
            io.of('/ws/users').to(`box:allowed:${req.params.box}`).to(`box:managed:${req.params.box}`).emit("boxUnlocked", req.params.box)
            res.send().status(200)
        } else {
            res.status(401).send()
        }
    } else {
        res.status(401).send()
    }

})

boxRouter.get('/:box/change', (req, res) => {

})

boxRouter.put('/:box/name', passport.authenticate('jwt', {session: false}), async (req, res) => {
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

boxRouter.get('/:box/livekit', passport.authenticate('jwt', {session: false}), (req, res) => {
    if (req.user && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_SECRET) {
        const user = req.user as User
        res.send(createToken(req.params.box, user.id, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_SECRET))
    } else {
        res.status(401).send()
    }
})

