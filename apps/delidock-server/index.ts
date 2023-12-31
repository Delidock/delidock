import express, {Express, Request, Response} from 'express'
import { Server, Socket } from 'socket.io'
import { instrument } from "@socket.io/admin-ui";
import cors from 'cors'
import bodyParser from 'body-parser'

const app : Express = express()
const io = new Server(3001, {cors:{
    origin: "*",
    credentials: true
}})

instrument(io, {
    auth: {
        type: "basic",
        username: "admin",
        password: "$2y$10$.xrNVHREo2Bxm2.xEv97SuTRC/Kx4ebbKZ/rcEHqlRPs/kez1/s4a"
    },
  });

let messages : {id: string, content: string}[] = []
let roomMessages : {id: string, content: string, time: string}[] = []

function generateRandomNumber() {
    var minm = 100000;
    var maxm = 999999;
    return Math.floor(Math
    .random() * (maxm - minm + 1)) + minm;
}

io.on("connection", (socket : Socket)=>{

    socket.join(socket.handshake.auth.room)  
    io.to(socket.handshake.auth.room).emit("joinedAck")  

    io.sockets.emit("default", messages)
    io.to(socket.handshake.auth.room).emit("logs", roomMessages)

    socket.on("message", (args: string)=> {
        messages.push({id: socket.id, content: args})
        if (messages.length > 20) {
            messages.shift()
        }
        io.sockets.emit("default", messages)
    })    
    const logs = (a: string) =>{
        roomMessages.push({id: socket.id, content: a, time: new Date().toLocaleTimeString()})
        if (roomMessages.length > 4) {
            roomMessages.shift()
        }
        io.to(socket.handshake.auth.room).emit("logs", roomMessages)

    }

    socket.on("checkOpen", ()=> {        
        io.to(socket.handshake.auth.room).emit("checkOpen")
    })
    socket.on("checkedOpen", (args: string)=>{
        io.to(socket.handshake.auth.room).emit("checkedOpen", args)
    })

    socket.on("openBox", ()=>{         
        io.to(socket.handshake.auth.room).emit("openBox")
        logs("Trying to open")
    })

    socket.on("openedBox", ()=>{
        io.to(socket.handshake.auth.room).emit("openedBox", roomMessages)
        logs("Opened")
    })

    socket.on("changePIN", () => {
        let pin : number = generateRandomNumber()
        io.to(socket.handshake.auth.room).emit("changePIN", pin)
        logs("Trying to change PIN to "+pin)
    })

    socket.on("changedPIN", (args : string) => {
        io.to(socket.handshake.auth.room).emit("changedPIN", args)
        logs("Changed PIN to "+args)
    })
})  
app.use(cors())
app.use(bodyParser.json())

app.post("/api/sign/up", (req, res) => {
    //DB OPERATIONS
    if (req.body.email !== 'skopek.stepan@gmail.com') {
        res.status(200).send()
        
    }
    
    res.status(409).send()
    
})
app.post("/api/sign/up/confirm", (req, res) => {
    //DB OPERATIONS
    if ((req.body.email !== 'skopek.stepan@gmail.com') && (req.body.password === req.body.confirmedPass)) {
        res.status(200).send()
    }
    res.status(401).send()
})

app.post("/api/sign/in", (req, res) => {

    //DB OPERATIONS    
    if (req.body.password === "KOKOT") {
        res.status(200).send("MireckuvUzasnyToken")
    }
    res.status(401).send()
})

app.post("/api/getLivekitToken", async (req, res) => {
    if (req.body.id) {
        const getToken = await fetch("http://localhost:4000/getToken", {
            method: "POST",
            body: req.body.id
        })
        let token = await getToken.text()
        if (token) {
            res.send(token)
        } else
        res.status(404).send()
    } else
    res.status(404).send()
    
})


app.listen(3000, ()=>console.log("POSLOUCHAM na 3000, ws 3001"))
