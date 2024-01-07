import express from 'express'
import http from 'http'
import{ Server } from 'socket.io'
import cors from 'cors'
import bodyParser from 'body-parser'
import { socketServer } from './socket'

import { statusRouter } from "./routes/status";
import { boxRouter } from './routes/box'
import {userRouter} from './routes/user'
import {signRouter} from "./routes/sign";

import { PrismaClient } from '@prisma/client'

const app = express()
const httpServer = http.createServer(app)
export const io : Server = new Server<ClientToServerEvents,ServerToClientEvents,InterServerEvents,SocketData>(httpServer, {
   cors: { 
    origin: '*', 
    credentials: true 
  }
})

export let secret = "jP830iVZxa_9OPKOw4EvSsca4r6lpWNnjsRMwvsVAuM"
export const prisma = new PrismaClient()
interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
  }
  
  interface ClientToServerEvents {
    hello: () => void;
  }
  
  interface InterServerEvents {
    ping: () => void;
  }
  
  interface SocketData {
    name: string;
    age: number;
  }

app.set('port', 3000)

app.use(bodyParser.json())
app.use(cors())


app.use('/sign', signRouter)


app.use('/user', userRouter)


app.use('/box', boxRouter)


app.use('/status', statusRouter)

httpServer.listen(app.get('port'), () => {
    socketServer.startSocket(io)
    console.log("Starting the API on 3000");
})