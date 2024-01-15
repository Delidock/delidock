import express from 'express'
import http from 'http'
import{ Server } from 'socket.io'
import cors from 'cors'
import bodyParser from 'body-parser'
import { socketServer } from './socket'
import 'dotenv/config'

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
export const prisma : PrismaClient = new PrismaClient()
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

app.set('port', process.env.DELIDOCK_API_PORT)

app.use(bodyParser.json())
app.use(cors())


app.use('/sign', signRouter)


app.use('/user', userRouter)


app.use('/box', boxRouter)


app.use('/status', statusRouter)

if (process.env.DELIDOCK_API_SECRET) {
  httpServer.listen(app.get('port') ?? 3000, () => {
    socketServer.startSocket(io)
    console.log("Starting the API on "+process.env.DELIDOCK_API_PORT ?? 3000);
  })
} else
  console.log("Please provide secret");
  