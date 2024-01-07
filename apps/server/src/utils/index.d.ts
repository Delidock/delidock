import { User } from "@delidock/types";

export * from 'jsonwebtoken'
declare module "jsonwebtoken" {
    export interface JwtPayload {
        id: string
        role: string
        email: string
        firstName: string
        lastName: string
    }
}