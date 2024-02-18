import { BoxClient, BoxServer, User, UserPasswordChangeBody, UserUsingBox } from "@delidock/types";
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

userRouter.get('/resume', passport.authenticate('user', {session: false}), async (req, res) => {
    const user = req.user as User
    const updatedBoxes : BoxClient[] = []

    const fillUpdatedBoxes = async (box : BoxServer, allUsersUsingBoxes : User[], managed : boolean) => {

        const owner = allUsersUsingBoxes.find(u => u.ownedBoxes.includes(box.id))
        const users = allUsersUsingBoxes.filter(u => u.managedBoxes.includes(box.id) || u.allowedBoxes.includes(box.id))
        
        const usersUsingBox : UserUsingBox[] = []
        for(const boxUser of users){
            if (boxUser.managedBoxes.includes(box.id)) {
                usersUsingBox.push({name: `${boxUser.firstName} ${boxUser.lastName}`, email: boxUser.email, managing: true})
            } else if (boxUser.allowedBoxes.includes(box.id)) {
                usersUsingBox.push({name: `${boxUser.firstName} ${boxUser.lastName}`, email: boxUser.email, managing: false})
            }
        }
        updatedBoxes.push({
            id: box.id,
            name: box.name,
            managed,
            offline: box.offline,
            lastStatus: box.lastStatus,
            lastPIN: box.lastPIN,
            owner: {name: `${owner!.firstName} ${owner!.lastName}`, email: owner!.email, managing: true},
            users: usersUsingBox
        })
    }

    if (user) {
        const boxes = user.allowedBoxes.concat(user.managedBoxes).concat(user.ownedBoxes)
        try {
            const allBoxes = await prisma.box.findMany({
                where: {
                    id: {
                        in: boxes
                    }
                }
            })

            const allUsersUsingBoxes = await prisma.user.findMany({
                where: {
                    OR: [
                        {
                            allowedBoxes: {
                                hasSome: boxes
                            }
                        },
                        {
                            managedBoxes: {
                                hasSome: boxes
                            }
                        },
                        {
                            ownedBoxes: {
                                hasSome: boxes
                            }
                        }
                    ]
                }
            })

            if (allBoxes) {
                for(const box of allBoxes) {
                    if (user.allowedBoxes.includes(box.id)) {
                        fillUpdatedBoxes(box, allUsersUsingBoxes, false)
                    } else if (user.managedBoxes.includes(box.id)) {
                        fillUpdatedBoxes(box, allUsersUsingBoxes, true)
                    } else if (user.ownedBoxes.includes(box.id)){
                        fillUpdatedBoxes(box, allUsersUsingBoxes, true)
                    }
                }
                res.status(200).send(updatedBoxes)
            }
        } catch (error) {
            res.status(404).send()
        }

    } else {
        res.status(404).send()
    }
})