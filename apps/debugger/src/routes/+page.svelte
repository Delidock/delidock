<script lang="ts">
    import { Participant, RemoteParticipant, Room, RoomEvent, Track, VideoPresets, type RoomOptions } from 'livekit-client';
    import { Socket, io } from "socket.io-client";
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
    let userIdFromServer = "superUniqueId"
    onMount(()=>{
        try {
            
            const connection : Socket= io("wss://2f15-86-49-9-122.ngrok-free.app", {
                auth: {
                    room: userIdFromServer
                }
            })
            socket = connection

            let currentPIN = localStorage.getItem("currentPIN")
            if (!currentPIN) {
                socket.emit("changePIN")
            }

            socket.emit("checkOpen")
            
        } catch (error) {
            
        }
    })
    
    //default
    type Message = {
        id: string,
        content: string
    }
    let socketId : string | undefined
    let msg : string
    let socket : Socket | undefined
    let localMessages : Message[] = []
    let roomMessages : any[] = []
    let status : any
    let showPIN : boolean = false
    let boxOpened : boolean = false

    const sendMessage = (a : string, sock: Socket | undefined) =>{
        if (a && sock) {
            msg = ""
            sock.emit("message", a)
        }
    }
    const openBox = (sock: Socket | undefined) =>{
        if (sock) {
            sock.emit("openBox")
        }
    }
    const changePIN = (sock: Socket | undefined) =>{
        if (sock) {
            sock.emit("changePIN")
        }
    }
    $: {
        if (socket) {
            socket.on("joinedAck", ()=>{
                console.log("Succesfully joined the room");
            })
            socket.on("default", (args: Message[])=>{     
                socketId = socket?.id     
                localMessages = args
            })
            socket.on("logs", (args)=>{
                roomMessages = args.reverse()
            })
            socket.on("connect", () => {
                status = socket?.connected // true
            });
            socket.on("disconnect", () => {
                status = socket?.connected// true
            }); 

            socket.on("openedBox", ()=>{
                socket?.emit("checkOpen")
            })

            socket.on("closedBox", ()=> {
                socket?.emit("checkOpen")
            })

            socket.on("changedPIN", (args)=>{
                localStorage.setItem("currentPIN", args)
            })     
            
            socket.on("checkedOpen", (args)=> {
                boxOpened = args
            })

        }
    }
    

    //LiveKit
    let token : string
    let url = "ws://localhost:7880"
    let boxVideo : HTMLVideoElement
    let isVideo : boolean
    const handleConnect = (token: string, url: string) => {
        actions.connectionPrep(token, url)
    }

    const actions = {
        connectionPrep: async (token : string, url: string)=>{

            const roomOpts : RoomOptions = {
                adaptiveStream: true,
                dynacast: true,
                videoCaptureDefaults: {
                    resolution: VideoPresets.h720.resolution,
                },
            };
            await actions.connecToRoom(token, url, roomOpts)
        },
        connecToRoom: async (token : string, url : string, roomOpts: RoomOptions)=>{
            const room = new Room(roomOpts)
            await room.prepareConnection(url, token)

            room
            .on(RoomEvent.ParticipantConnected, participantConnected)
            .on(RoomEvent.ParticipantDisconnected, participantDisconnected)
            .on(RoomEvent.TrackSubscribed, (track ,pub, participant)=>{
                renderParticipant(participant);
                isVideo = true
            })
            .on(RoomEvent.TrackUnsubscribed, (_, pub, participant) => {
                renderParticipant(participant);
            })

            await room.connect(url, token, {autoSubscribe: true})
        }

    }

    const participantConnected = (participant: Participant) => {
        renderParticipant(participant)
    }
    const participantDisconnected = (participant: RemoteParticipant)=> {
        renderParticipant(participant, true)
    }
    const renderParticipant = (participant: Participant, remove: boolean = false) => {
        if (!remove && participant instanceof RemoteParticipant) {
            const cameraPub = participant.getTrack(Track.Source.Camera)
            if (cameraPub?.videoTrack) {
                cameraPub.videoTrack?.attach(boxVideo)
            } else {
                isVideo = false
            }
        } else if (remove && participant instanceof RemoteParticipant) {
            isVideo = false
        }
    }
</script>
<div class=" bg-gray-800 w-full min-h-screen flex justify-center items-center flex-col gap-5 pt-[calc(20vh)] pb-32">
    <div class="w-1/2 text-white text-center flex flex-col items-center gap-5">
        <h1 class="text-5xl font-bold font-mono">This is DeliDock debugger</h1>
        <p class="w-2/3 text-xl">Please sit back and enjoy this rollercoaster experience.<br><strong>DON'T WORRY, BUGS INCLUDED! ☕</strong><br><a href="https://admin.socket.io/" class="underline !text-sm">Visit admin panel for more</a></p>
        <div class="flex flex-row gap-2 mt-5 items-center">
            <p>Server status:</p>
            <div class="rounded-full bg-red-600 h-5 aspect-square" class:!bg-green-500={status}></div>
        </div>
    </div>

    <div class="flex flex-col gap-10 w-1/2">
        <div class="flex flex-col gap-2">
            <p class="text-white w-full text-center">Simple chat simulation across all connected clients</p>
            <hr>
            <section class="w-full h-96 bg-slate-300 rounded-md flex-col flex justify-end items-start p-5 gap-3 overflow-hidden">
                {#each localMessages as line}
                    <div transition:fade class="w-full justify-start flex" class:!justify-end={line.id === socketId} >
                        <div class="bg-gray-500 py-1 px-3 rounded-md" class:!bg-blue-400={line.id === socketId}>
                            <p class="text-white">{line.content}</p>
                        </div>  
                    </div>
                {/each}
                <form class="w-full h-10 flex flex-row gap-2">
                    <input type="text"  class="text-black rounded-md p-1 h-full w-4/5" bind:value={msg}>
                    <button type="button" on:click={()=>sendMessage(msg, socket)} class="transition-colors ease-in-out bg-blue-500 py-2 px-5 w-1/5 rounded-md text-white hover:bg-blue-400">Send</button>
                </form>
            </section>
        </div>
        <div class="flex flex-col gap-2">
            <p class="text-white w-full text-center">Temporary control center, this will be replaced by mobile app</p>
            <hr>
            <section class="w-full h-96 bg-slate-300 rounded-md flex-col flex p-5 gap-3 overflow-hidden">
                <div class="w-full h-full flex flex-col gap-2">
                    <div class="flex flex-row gap-2">Token (room id): <strong>{userIdFromServer}</strong> 
                        <div class="w-fit bg-red-500 text-white text-xs rounded-full py-1 px-2" class:!bg-green-500={boxOpened}>
                            {#if boxOpened}
                                Opened
                                {:else}
                                Closed
                            {/if}
                        </div>
                    </div>
                    {#each roomMessages as roomMessage}
                        <div class:!bg-orange-400={roomMessage.content.startsWith("Trying")} class="rounded-md bg-green-500 p-2 justify-end flex flex-row"><span class="w-2/3 text-start">{roomMessage.content}</span> <span class="text-end w-1/3">{roomMessage.time}</span></div>
                    {/each}
                </div>
                
                <div class="w-full flex-row flex justify-start items-end gap-3">
                    <button on:click={()=>{openBox(socket)}} class="transition-colors ease-in-out bg-blue-500 py-2 px-5 rounded-md text-white hover:bg-blue-400">Open</button>
                    <button on:click={()=>{changePIN(socket)}} class="transition-colors ease-in-out bg-blue-500 py-2 px-5 rounded-md text-white hover:bg-blue-400">Change PIN</button>
                    <button on:click={()=>{showPIN = !showPIN}} title="This is actually stored on each device" class="transition-colors ease-in-out bg-blue-500 py-2 px-5 rounded-md text-white hover:bg-blue-400">
                        {#if showPIN}
                            {localStorage.getItem("currentPIN")}
                            {:else}
                            Show PIN
                        {/if}
                </button>
                </div>
            </section>
        </div>
        <div class="flex flex-col gap-2">
            <p class="text-white w-full text-center">Live video preview</p>
            <hr>
            <p class="text-white w-full text-start">Livekit token:</p>
            <form on:submit={()=>handleConnect(token, url)}>
                <input class="text-black rounded-md p-1 h-full w-4/5" type="text" bind:value={token} required>
                <button type="submit"class="transition-colors ease-in-out bg-blue-500 py-2 px-5 rounded-md text-white hover:bg-blue-400" >Connect to LiveKit</button>
            </form>
            <section class="p-5 aspect-video bg-slate-300 rounded-md flex-col flex justify-senter items-center gap-3 overflow-hidden">
                <!-- svelte-ignore a11y-media-has-caption -->
                <video class="h-full rounded-lg" class:hidden={!isVideo} bind:this={boxVideo} src="" ></video>
            </section>
        </div>
    </div>
</div>

