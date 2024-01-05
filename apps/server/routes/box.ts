import express from "express";
import { AccessToken } from "livekit-server-sdk";
import { userPassportController } from "../auth";
import passport from "passport";

export const boxRouter =  express.Router()

userPassportController(passport)

const createToken = (room: string, user:string) => {

    const roomName = `room:${room}`;

    const participantName = user;

    const at = new AccessToken('devkey', 'secret', {
        identity: participantName,
    });
    at.addGrant({ roomJoin: true, room: roomName });

    return at.toJwt();
}


boxRouter.get('/:box/unlock', (req, res) => {

})

boxRouter.get('/:box/change', (req, res) => {

})

boxRouter.get('/:box/livekit', passport.authenticate('jwt', {session: false}), (req, res) => {
    if (req.user) {
        const user : any = req.user
        res.send(createToken(req.params.box, user.id))
    } else {
        res.status(401).send()
    }
})

