import express from "express";
import jwt from 'jsonwebtoken'
import { secret } from '..';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const signRouter = express.Router()

signRouter.post("/up", async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: req.body.email
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
    try {
        const foundUser = await prisma.user.findUnique({
            where: {
                email: req.body.email
            }
        })
        if (!foundUser && req.body.password === req.body.confirmedPass) {
            try {
                const newUser = await prisma.user.create({
                    data: {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        passwordHash: req.body.password,
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
    console.log("LOGGING");
    
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: req.body.email
            }
        })
        if (user && (user.passwordHash === req.body.password))
            res.status(200).send(jwt.sign({_id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName}, secret))
        res.status(401).send()
    } catch (error) {
        console.log(error);
        
        res.status(404).send()
    }
    res.status(401).send()
})