import { PrismaClient } from "@prisma/client"
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
export const createBox = async (name, psk) => {

    function generateRandomNumber() {
        var minm = 100000;
        var maxm = 999999;
        return Math.floor(Math
        .random() * (maxm - minm + 1)) + minm;
    }

    const newBox = await prisma.box.create({
        data: {
            name: name,
            pskHash: bcrypt.hashSync(psk, 10),
            lastPIN: generateRandomNumber().toString()
        }
    })
}

createBox("Subjekt", "subjekt-psk")
createBox("Subjektka", "subjektka-psk")