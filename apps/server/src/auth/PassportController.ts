import { BoxJwtPayload, BoxServer, BoxUserOperationBody, User, UserJwtPayload } from '@delidock/types'
import { PrismaClient } from '@prisma/client'
import { PassportStatic } from 'passport'
import { ExtractJwt, Strategy, StrategyOptions, VerifiedCallback } from 'passport-jwt'
const prisma = new PrismaClient()
export const usePassportController = (passport: PassportStatic) => {
    let options : StrategyOptions = {
        
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.DELIDOCK_API_SECRET,
        passReqToCallback: true
    }

    passport.use("owner" ,new Strategy(options, async (req : Request, jwt_payload : UserJwtPayload, done: VerifiedCallback) => {
        try {
            interface BoxOwnerOperationBody extends BoxUserOperationBody{
                boxId: string
            } 
            const reqestBody = req.body as any as BoxOwnerOperationBody
    
            if (!reqestBody || !reqestBody.boxId) {
                done("Something went wrong", false)
            }
            
            
            const user : User | null = await prisma.user.findUnique({
                where: {
                    email: jwt_payload.email,
                    ownedBoxes: {has: reqestBody.boxId}
                }
            })
            if (user) {
                done(null, user)
            } else {
                done(null, false)
            }
        } catch (error) {
            done("Something went wrong", false)
        }
    }))

    passport.use("user" ,new Strategy(options, async function(req : Request, jwt_payload : UserJwtPayload, done: VerifiedCallback) {
        try {
            const user : User | null = await prisma.user.findUnique({
                where: {
                    email: jwt_payload.email
                }
            })
            if (user) {
                done(null, user)
            } else {
                done(null, false)
            }
        } catch (error) {
            done("Something went wrong", false)
        }
    }))

    passport.use("box", new Strategy(options, async (req : Request, jwt_payload : BoxJwtPayload, done: VerifiedCallback)=>{
        try {
            const box : BoxServer | null = await prisma.box.findUnique({
                where: {
                    id: jwt_payload.id
                }
            })
            if (box) {
                done(null, box)
            } else {
                done(null, false)
            }
        } catch (error) {
            done("Something went wrong", false)
        }
    }))
}