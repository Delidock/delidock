import { User, UserPasswordChangeBody } from "@delidock/types";
import express from "express";
import passport, { use } from "passport";
import { prisma } from "..";
import bcrypt from 'bcrypt'
import { usePassportController } from "../auth";

export const userRouter = express.Router()
usePassportController(passport)

userRouter.put('/password', passport.authenticate('user', {session: false}), async (req, res) => {
    const body : UserPasswordChangeBody = req.body
    const user = req.user as User
    if (user && bcrypt.compareSync(body.oldPassword, user.passwordHash)) {
         try {
            const newUser = await prisma.user.update({ 
                where: {
                    id: user.id,
                },
                data: {
                    passwordHash: bcrypt.hashSync(body.newPassword, 10)
                }
            })
            if (!user) {
                res.status(404).send()
            } else {
                res.status(200).send()
            }
         } catch (error) {
            res.status(404).send()
         }
    } else{
        res.status(401).send()
    }
})