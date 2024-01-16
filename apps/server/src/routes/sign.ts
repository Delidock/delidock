import express from "express";
import jwt from 'jsonwebtoken'
import { prisma } from '../index';
import bcrypt from 'bcrypt'
import { LoginRequestBody, RegisterConfirmRequestBody, RegisterRequestBody, User, UserJwtPayload } from "@delidock/types";

export const signRouter = express.Router()

signRouter.post("/up", async (req, res) => {
    const body : RegisterRequestBody = req.body
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        })
        if (user) {
            res.status(409).send()
        }
        res.status(200).send()
    } catch (error) {
        res.status(404).send()
    }
    res.status(404).send()
})

signRouter.post("/up/confirm", async (req, res) => {
    const body : RegisterConfirmRequestBody = req.body
    try {
        const foundUser = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        })
        if (!foundUser && body.password === body.confirmedPass) {
            try {
                const newUser = await prisma.user.create({
                    data: {
                        firstName: body.firstName,
                        lastName: body.lastName,
                        email: body.email,
                        passwordHash: bcrypt.hashSync(body.password, 10),
                        managedBoxes: [],
                        allowedBoxes: []
                    }
                })
                if (newUser) {
                    res.status(200).send()
                }
                res.status(409).send()
            } catch (error) {
                console.log(error);
                
                res.status(404).send()
            }
        }

    } catch (error) {
        res.status(404).send()
    }
    res.status(401).send()
})

signRouter.post("/in", async (req, res) => {
    const body : LoginRequestBody = req.body
    try {
        const user : User | null = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        })
        
        if (!user) {
            res.status(401).send()
            return
        }
        if (user && (bcrypt.compareSync(req.body.password, user.passwordHash))) {
            const jwtPayload : UserJwtPayload = {id: user.id, role: user.role ,email: user.email, firstName: user.firstName, lastName: user.lastName}
            if (process.env.DELIDOCK_API_SECRET) {
                res.status(200).send(jwt.sign(jwtPayload, process.env.DELIDOCK_API_SECRET ))
            }
            
        }
        res.status(401).send()
    } catch (error) {        
        res.status(404).send()
    }
    res.status(401).send()
})