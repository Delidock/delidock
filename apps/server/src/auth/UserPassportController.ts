import { User, UserJwtPayload } from '@delidock/types'
import { PrismaClient } from '@prisma/client'
import { PassportStatic } from 'passport'
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'
const prisma = new PrismaClient()
export const userPassportController = (passport: PassportStatic) => {
    let options : StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.DELIDOCK_API_SECRET,
    }
    
    passport.use(new Strategy(options, async function(jwt_payload : UserJwtPayload, done) {
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
}