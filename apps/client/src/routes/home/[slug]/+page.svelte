<script lang="ts">
    import { goto } from '$app/navigation';
    import { GlobeIcon, GearIcon, EditPenIcon, CheckmarkIcon, CameraIcon, BoxIcon, CrossIcon, ResetIcon, UnlockIcon, BigCrossIcon } from '$lib/assets/icons'
	import { StatusWidget, BoxButton, PinBox} from '$lib/components';
    import type { BoxClient } from '@delidock/types';
	import { tick } from 'svelte';
	import { delidock } from '$lib/utils/delidock.js';

    import { type Participant, RemoteParticipant, Room, RoomEvent, Track, type RoomOptions } from 'livekit-client';
	import { boxes } from '$lib/stores/index.js';
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
    const regex = /[\p{Letter}\p{Mark}]+/gu
    const updateBoxName = async () => {

        boxName = boxName.match(regex)?.join("") ?? ""
        if (!inputDisabled) {
            if (boxName.length >= 3 && (await delidock.updateName(box,boxName)).status === 200){
                inputDisabled = true
            } else {
                nameError = true
                nameInput.focus()
                setTimeout(()=>{
                    nameError = false

                }, 500)
            }
        }
    }

    $: {
        box = $boxes[data.boxId]
        
        if (boxName.length < 3) {
            errorUnderline = true
        } else {
            errorUnderline = false
        }
    }
    
    let copyText = false


    const changePIN = () => {
        copyText = false
        delidock.changePin(box)
    }

    //LIVEKIT
    let livekitState : LivekitState = LivekitState.DISCONNECTED

    let currentRoom: Room | undefined;

    const tryConnect = async () => {
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
        } else if (remove && participant instanceof RemoteParticipant) {
            
            
            livekitState = LivekitState.CONNECTED
        }
    }
</script>
<div class="w-full min-h-screen bg-background pt-4 flex flex-col gap-4">
    <div class="flex flex-row items-center justify-between px-4 h-8">
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
        <button class="active:scale-90 transition-transform ease-in-out"><GearIcon/></button>
    </div>

    <section class="w-full min-h-[calc(100svh-4rem)] bg-secondary rounded-t-[2rem] flex flex-col gap-2 px-4 pt-4">
        <div class="w-full justify-end flex">
            <StatusWidget open={box.lastStatus} />
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
                <div class="h-16 w-1/3"><BoxButton label="View" icon={CameraIcon} on:click={()=>tryConnect()}/></div>
            {/if}
            
        </div>

        <div class="w-full h-48 flex flex-col gap-2">
            <div class="h-1/2">
                <PinBox pin={box.lastPIN} copyText={copyText}/>
            </div>
            <div class="w-full flex flex-row gap-1 h-1/3">
                <BoxButton label="Unlock" icon={UnlockIcon} on:click={()=>delidock.unlock(box)}/>
                <BoxButton label="Change PIN" icon={ResetIcon} on:click={()=>changePIN()}/>
            </div>
        </div>
    </section>
</div>
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