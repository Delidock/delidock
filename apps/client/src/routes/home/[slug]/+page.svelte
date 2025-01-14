<script lang="ts">
    import { goto } from '$app/navigation';
    import { GlobeIcon, GearIcon, EditPenIcon, CheckmarkIcon, CameraIcon, BoxIcon, CrossIcon, ResetIcon, UnlockIcon, BigCrossIcon, PlusIcon, BoxUserIcon, AdminIcon, DemoteIcon, PromoteIcon, OwnerIcon } from '$lib/assets/icons'
	import { StatusWidget, BoxButton, PinBox, InputField, Button} from '$lib/components';
    import type { BoxClient } from '@delidock/types';
	import { tick } from 'svelte';
	import { delidock } from '$lib/utils/delidock.js';
    import { type Participant, RemoteParticipant, Room, RoomEvent, Track, type RoomOptions } from 'livekit-client';
	import { boxes, loggedUser, socketStore } from '$lib/stores/index.js';
	import { slide } from 'svelte/transition';
	import { socketListen } from '$lib/utils/socket/index.js';
    enum LivekitState {
        DISCONNECTED = 0,
        VIEW = 1,
        CONNECTED = 2,
        BOXCONNECTED = 3,
        BOXVIDEO = 4,
    }
    export let data
    
    let box : BoxClient = $boxes[data.boxId]

    let boxName : string = box.name
    let nameInput : HTMLInputElement
    let inputDisabled : boolean = true
    let nameError = false
    let errorUnderline = false

    let boxVideo : HTMLVideoElement

    const editName = async () => {
        inputDisabled = false
        const autofocus = async (nameInput: HTMLInputElement) => {
            await tick();
            nameInput.focus();
            nameInput.setSelectionRange(0, nameInput.value.length)
        };
        autofocus(nameInput)
    }
    const cancelEditName = () => {
        boxName = box.name
        inputDisabled = true
    }
    const regex = /[\p{Letter}\p{Mark}\p{Number}]+/gu
    const updateBoxName = async () => {
        boxName = boxName.match(regex)?.join("") ?? ""
        if (!inputDisabled) {
            if (boxName.length >= 3 && (await delidock.updateName(box,boxName)).status === 200){
                inputDisabled = true
            } else {
                if (boxName.length < 1) {
                    boxName = box.name
                }
                nameError = true
                nameInput.focus()
                setTimeout(()=>{
                    nameError = false

                }, 500)
            }
        }
    }

    $: {
        if ($boxes[data.boxId]) {
            box = $boxes[data.boxId]
        
            if (boxName.length < 3) {
                errorUnderline = true
            } else {
                errorUnderline = false
            }
            if (inputDisabled) {
                boxName = box.name
            }
        }
    }

    $socketStore?.on("boxOffline", (boxId : string) => {
        if (box.id === boxId) {
            liveKit.disconnect()
        }
    })

    let copyText = false


    const changePIN = () => {
        if (!box.offline) {
            copyText = false
            delidock.changePin(box)
        }
    }
    
    const unlockBox = () =>{
        if (!box.offline) {
            delidock.unlock(box)
        }
    }

    //LIVEKIT
    let livekitState : LivekitState = LivekitState.DISCONNECTED

    let currentRoom: Room | undefined;

    const tryConnect = async () => {
        if (box.offline) {
            return
        }
        livekitState = LivekitState.VIEW
        
        let token = await delidock.getLivekitToken(box.id)
        if (!token) {
            livekitState = LivekitState.DISCONNECTED
            return
        }

        const livekitSignal = delidock.livekitIp

        liveKit.connectionPrep(token, livekitSignal)
    }

    const stopConnection = () => {
        liveKit.disconnect()
    }

    const liveKit = {
        connectionPrep: async (token : string, url: string)=>{

            const roomOpts : RoomOptions = {
                adaptiveStream: true,
                dynacast: true,
                publishDefaults: {
                    simulcast: true
                }
            };
            await liveKit.connecToRoom(token, url, roomOpts)
        },
        connecToRoom: async (token : string, url : string, roomOpts: RoomOptions)=>{
            const room = new Room(roomOpts)
            await room.prepareConnection(url, token)
            
            currentRoom = room

            room
            .on(RoomEvent.ParticipantConnected, participantConnected)
            .on(RoomEvent.ParticipantDisconnected, participantDisconnected)
            .on(RoomEvent.TrackSubscribed, (track ,pub, participant)=>{
                renderParticipant(participant);
                
            })
            .on(RoomEvent.TrackUnsubscribed, (_, pub, participant) => {                
                renderParticipant(participant);
            })
            .on(RoomEvent.Connected, () => {  
                livekitState = LivekitState.CONNECTED
                room.participants.forEach((p: RemoteParticipant)=> {
                    if (p.identity === `box:${box.id}`) {
                        renderParticipant(p)
                    }
                })
                              
                
            })
            .on(RoomEvent.TrackMuted, (pub, participant) => {
                renderParticipant(participant);
            })
            .on(RoomEvent.TrackUnmuted, (pub, participant) => {
                renderParticipant(participant);
            })
            .on(RoomEvent.Disconnected, ()=> {
                livekitState = LivekitState.DISCONNECTED
            })

            await room.connect(url, token, {autoSubscribe: true})
        },
        disconnect: async () => {
            livekitState = LivekitState.DISCONNECTED
            if(currentRoom)
                currentRoom.disconnect()
        }
    }

    const participantConnected = (participant: Participant) => {
        renderParticipant(participant)
    }
    const participantDisconnected = (participant: RemoteParticipant)=> {
        renderParticipant(participant, true)
    }
    const renderParticipant = (participant: Participant, remove: boolean = false) => {
        
        if ((!remove && participant instanceof RemoteParticipant) && participant.identity === `box:${box.id}`) {
            livekitState = LivekitState.BOXCONNECTED
            const cameraPub = participant.getTrack(Track.Source.Camera)
            if (cameraPub?.videoTrack) {
                
                cameraPub.videoTrack?.attach(boxVideo)

                if (cameraPub.videoTrack.isMuted) {
                    
                    livekitState = LivekitState.BOXCONNECTED
                } else {
                    livekitState = LivekitState.BOXVIDEO
                }
            } else {
                
                livekitState = LivekitState.BOXCONNECTED
            }
        } else if (remove && participant instanceof RemoteParticipant && participant.identity === `box:${box.id}`) {
            livekitState = LivekitState.CONNECTED
        }
    }

    let addUserPopup : boolean = false
    let inviteError : string
    let inviteUserEmail : string
    const addUserPop = ( )=> {
        addUserPopup = true
    }

    const popOut = () => {
        inviteError = ""
        inviteUserEmail = ""
        addUserPopup = false
    }
    
    const addUser = async () => {
        const res = await delidock.addUser(box.id, inviteUserEmail)
        switch (res.status) {
            case 200:
                popOut()
                return;
            case 401:
                inviteError = ""
                inviteError = "Unauthorized"
                return
            case 404:
                inviteError = ""
                inviteError = "User not found or already added"
                return
            default:
                inviteError = ""
                inviteError = "Something went wrong"
                break;
        }
    }
    
</script>
<div class="w-full min-h-[100svh] relative bg-background flex flex-col" class:blur-sm={addUserPopup} class:grayscale-[100%]={addUserPopup} class:!h-screen={addUserPopup} >
    <div class="sticky top-0 flex flex-row items-center justify-between px-4 h-16 bg-background z-20">
        <button on:click|preventDefault={()=>goto("/home")} class=" active:scale-90 transition-transform ease-in-out"><BigCrossIcon/></button>
        <div class="flex flex-row gap-2" class:invalid={nameError} >
            <input class:text-red={errorUnderline}  spellcheck="false" maxlength="20" on:keydown={(e) => e.key === 'Enter' && updateBoxName()} class=" text-center outline-none text-text_color bg-transparent" disabled='{inputDisabled}' type="text" style="width: {boxName.length}ch" bind:this={nameInput} bind:value={boxName} >
            {#if box.managed}
                {#if inputDisabled}
                    <button class="active:scale-90 transition-transform ease-in-out scale-95" on:click={()=>editName()}>
                        <EditPenIcon/>
                    </button>
                    
                    {:else}
                    <button class="active:scale-90 transition-transform ease-in-out scale-95" on:click={()=>updateBoxName()}>
                        <CheckmarkIcon/>
                    </button>
                    <button class="active:scale-90 transition-transform ease-in-out scale-95" on:click={()=>cancelEditName()}>
                        <CrossIcon/>
                    </button>
                {/if}
            {/if}
        </div>
        <button on:click={()=>goto(`/home/${box.id}/settings`)} class="active:scale-90 transition-transform ease-in-out"><GearIcon/></button>
    </div>

    <section class="w-full min-h-[calc(100svh-4rem)] bg-secondary rounded-t-[2rem] flex flex-col gap-2 pb-4 px-4 pt-2">
        <div class="w-full justify-end flex gap-1">
            <StatusWidget open={box.lastStatus} offline={box.offline}/>
            {#if box.offline}
                <StatusWidget open={box.lastStatus} offline={false}/>
            {/if}
        </div>

        <div class="transition-all ease-in-out text-text_color w-full aspect-[4/3] rounded-lg border border-outline justify-center items-center flex flex-row relative overflow-hidden" class:video-inactive={(livekitState === LivekitState.DISCONNECTED)} class:video-gradient={(livekitState > LivekitState.DISCONNECTED)} >


            {#if livekitState >= LivekitState.VIEW}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video bind:this={boxVideo} class:hidden={(livekitState < LivekitState.BOXVIDEO)} class="w-full overflow-hidden aspect-[4/3]" src=""></video>
                    <button on:click={()=>stopConnection()} class="bg-red rounded-lg p-[1px] absolute top-2 right-2 active:scale-90 transition-transform ease-in-out"><CrossIcon/></button>
                    {#if livekitState === LivekitState.VIEW}
                        <div class="flex flex-row justify-center items-center gap-4">
                            <p>Connecting</p>
                            <div class="animate-spin"><GlobeIcon/></div>
                        </div>
                    {/if}
                    {#if livekitState === LivekitState.CONNECTED}
                        <div class="flex flex-row justify-center items-center gap-4">
                            <p>Waiting for box</p>
                            <div class="animate-bounce"><BoxIcon/></div>
                        </div>
                    {/if}
                    {#if livekitState === LivekitState.BOXCONNECTED}
                        <div class="flex flex-row justify-center items-center gap-4">
                            <p>Waiting for video</p>
                            <div class="animate-pulse"><CameraIcon/></div>
                        </div>
                    {/if}
                {:else}
                <div class="h-16 w-1/3"><BoxButton offline={box.offline} label="View" icon={CameraIcon} on:click={()=>tryConnect()}/></div>
            {/if}
            
        </div>

        <div class="w-full flex flex-col gap-2">
            <div class="h-24">
                <PinBox pin={box.lastPIN} copyText={copyText}/>
            </div>
            <div class="w-full flex flex-row gap-1 h-16">
                <BoxButton offline={box.offline} label="Unlock" icon={UnlockIcon} on:click={()=>unlockBox()}/>
                <BoxButton offline={box.offline} label="Change PIN" icon={ResetIcon} on:click={()=>changePIN()}/>
            </div>
        </div>
        <div class="flex flex-col w-full gap-2 mt-2">
            <div class="flex flex-row h-6">
                <div class="w-1/2 flex justify-start items-center">
                    <p class="text-xs text-text_color">Users:</p>
                </div>
                <div class="w-1/2 flex justify-end">
                    {#if box.managed}
                        <button on:click={()=>addUserPop()} class="transition-transform ease-in-out active:scale-90"><PlusIcon/></button>
                    {/if}
                </div>
            </div>
            <div class="flex flex-col gap-2" class:hidden={addUserPopup}>
                <div class="w-full h-18 bg-btn_secondary flex flex-row gap-2 solid-shadow rounded-lg p-3" class:border-btn_primary={$loggedUser && (box.owner.email === $loggedUser.email)} class:border-2={$loggedUser && (box.owner.email === $loggedUser.email)}>
                    <div class="w-10 justify-center items-center" class:force-svg={$loggedUser && (box.owner.email === $loggedUser.email)}>
                        <BoxUserIcon/>
                    </div>
                    <div class="w-full flex flex-col items-start justify-center">
                        <div class="flex flex-row gap-3">
                            <p class="text-xs text-text_color flex flex-row gap-2 justify-center items-center">{box.owner.name}</p>
                            <div class="h-4 bg-secondary px-1 py-[1px] rounded-[4px] text-[0.5rem] text-center flex items-center gap-1">
                                <OwnerIcon/>
                                <p class="text-text_color">OWNER</p>
                            </div>
                        </div>
                        <p class="text-[10px] text-btn_primary">{box.owner.email}</p>
                    </div>
                    <div class="w-10 flex justify-center items-center">
                        
                    </div>
                </div>
                {#each box.users as boxUser}
                    <div class="w-full h-18 bg-btn_secondary flex flex-row gap-2 solid-shadow rounded-lg p-3" class:border-btn_primary={$loggedUser && (boxUser.email === $loggedUser.email)} class:border-2={$loggedUser && (boxUser.email === $loggedUser.email)}>
                        <div class="w-10 justify-center items-center" class:force-svg={$loggedUser && (boxUser.email === $loggedUser.email)}>
                            <BoxUserIcon/>
                        </div>
                        <div class="w-full flex flex-col items-start justify-center">
                            <div class="flex flex-row gap-2">
                                <p class="text-xs text-text_color flex flex-row gap-2 justify-center items-center">{boxUser.name}</p>
                                {#if boxUser.managing}
                                    <div class="h-4 bg-secondary px-1 py-[1px] rounded-[4px] text-[0.5rem] text-center flex items-center gap-1">
                                        <AdminIcon/>
                                        <p class="text-text_color">ADMIN</p>
                                    </div>
                                {/if}
                            </div>
                            <p class="text-[10px] text-btn_primary">{boxUser.email}</p>
                        </div>
                        <div class="w-10 flex gap-1 justify-center items-center">
                            {#if (($loggedUser && (box.owner.email === $loggedUser.email)) && !boxUser.managing)}
                                    <button on:click={() => delidock.promoteUser(box.id, boxUser.email)} class="transition-transform ease-in-out active:scale-90"><PromoteIcon/></button>
                                {:else if ($loggedUser && (box.owner.email === $loggedUser.email)) && boxUser.managing}
                                <button on:click={() => delidock.demoteUser(box.id, boxUser.email)} class="transition-transform ease-in-out active:scale-90"><DemoteIcon/></button>
                            {/if}
                            {#if (box.managed && !boxUser.managing) || ($loggedUser && (box.owner.email === $loggedUser.email))}
                                <button on:click={() => delidock.removeUser(box.id, boxUser.email)} class="transition-transform ease-in-out active:scale-90"><CrossIcon/></button>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </section>
</div>
{#if addUserPopup}
    <div transition:slide={{axis:"y"}} class="w-full h-[calc(100vh-4rem)] absolute bottom-0 px-2">
        <div class=" bg-secondary rounded-t-[1rem] pt-4 px-4 h-full w-full flex flex-col gap-2">
            {#if addUserPopup}
                <div class="flex flex-row items-center">
                    <div class="w-4/6 flex justify-start text-start text-text_color text-2xl">
                        <p>Add user</p>
                    </div>
                    <div class="w-2/6 flex justify-end">
                        <button on:click|preventDefault={()=>popOut()} class="active:scale-90 transition-transform ease-in-out"><CrossIcon/></button>
                    </div>
                </div>
                <p class="text-text_color text-sm mb-2">Make others able to use your box. Add them via their email.</p>
                <form on:submit|preventDefault={()=>addUser()} class="flex flex-col gap-2">
                    <InputField label="Invitee's email" error={inviteError} bind:value={inviteUserEmail} type="email"/>
                    <Button label="Add user" type='submit'/>
                </form>
            {/if}
        </div>
    </div>
{/if}
<style>
    .video-gradient {
        background: radial-gradient(385.51% 138.87% at 100% 96.36%, #1A1249 0%, rgba(36, 64, 118, 0.33) 51.7%, rgba(84, 54, 204, 0.42) 100%);
        box-shadow: 0px 0px 90px 2px rgba(0, 0, 0, 0.98) inset, 0px 4px 4px 0px rgba(0, 0, 0, 0.25), 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    }
    .video-inactive {
        background: radial-gradient(385.51% 138.87% at 100% 96.36%, #140e388e 0%, rgba(9, 16, 29, 0.719) 51.7%, rgba(18, 12, 39, 0.753) 100%);
        box-shadow: 0px 0px 200px 60px rgba(0, 0, 0, 0.98) inset, 0px 4px 4px 0px rgba(0, 0, 0, 0.25), 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    }
    @keyframes shake {
        0% {
            margin-left: 0rem;
        }
        25% {
            margin-left: 0.5rem;
        }
        75% {
            margin-left: -0.5rem;
        }
        100% {
            margin-left: 0rem;
        }
    }

    .invalid {
    animation: shake 0.2s ease-in-out 0s 2;

    }
</style>