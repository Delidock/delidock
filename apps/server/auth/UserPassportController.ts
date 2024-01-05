import { PrismaClient } from '@prisma/client'
import { PassportStatic } from 'passport'
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'
const prisma = new PrismaClient()
export const userPassportController = (passport: PassportStatic) => {
    let options : StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: "jP830iVZxa_9OPKOw4EvSsca4r6lpWNnjsRMwvsVAuM",
    }
    
    passport.use(new Strategy(options, async function(jwt_payload, done) {
        try {
            const user = await prisma.user.findUnique({
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