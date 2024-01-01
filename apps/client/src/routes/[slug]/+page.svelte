<script lang="ts">
    import { goto } from '$app/navigation';
    import { GearIcon, LeftArrowIcon, EditPenIcon, CheckmarkIcon, CameraIcon } from '$lib/assets/icons'
	import { StatusWidget } from '$lib/components';
    import { Box } from '$lib/types/index.js';

	import { tick } from 'svelte';
	import PinBox from '$lib/components/PINBox.svelte';
	import { delidock } from '$lib/utils/delidock.js';

    import { Participant, RemoteParticipant, Room, RoomEvent, Track, VideoPresets, type RoomOptions } from 'livekit-client';
	import ResetIcon from '$lib/assets/icons/ResetIcon.svelte';

    export let data

    const box : Box = new Box(data.box.name, data.box.id, data.box.pin, data.box.livekitToken, data.box.livekitServer, data.box.opened)

    let boxName : string = "LMAO"
    let nameInput : HTMLInputElement
    let inputDisabled : boolean = true
    let nameError = false
    let errorUnderline = false

    let livekitConnected = false
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
    const regex = /[\p{Letter}\p{Mark}]+/gu
    const updateBoxName = () => {

        boxName = boxName.match(regex)?.join("") ?? ""
        if (!inputDisabled) {
            if (boxName.length >= 3){
                inputDisabled = true
                box.updateName(boxName)
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
        if (boxName.length < 3) {
            errorUnderline = true
        } else {
            errorUnderline = false
        }
    }

    //Livekit
    const tryConnect = async () => {
        livekitConnected = true

        let token = await (await delidock.getLivekitToken($box.id, "mirek")).text()
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6InJvb206cWhkS0tUMSJ9LCJpYXQiOjE3MDQxNDU0MjgsIm5iZiI6MTcwNDE0NTQyOCwiZXhwIjoxNzA0MTY3MDI4LCJpc3MiOiJkZXZrZXkiLCJzdWIiOiJtaXJlayIsImp0aSI6Im1pcmVrIn0.LV3yXr-AIaiV_cTbGuVjfQ9814CeCy7BtMLhKhCYSzI"
        
        const livekitSignal = $box.livekitIP
        
        console.log(livekitSignal);
        console.log(token);

        handleConnect(token, livekitSignal)

    }

    let copyText = false
    const changePIN = () => {
        copyText = false
        box.changePIN()
    }



    //LIVEKIT
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
                audioOutput: {
                    deviceId: "046d:0aba",
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
            livekitConnected = false
        }
    }
</script>
<div class="w-full min-h-screen bg-background pt-4 flex flex-col gap-4">
    <div class="flex flex-row items-center justify-between px-4">
        <button on:click|preventDefault={()=>goto("/")} class=" active:scale-90 transition-transform ease-in-out"><LeftArrowIcon/></button>
        <div class="flex flex-row gap-2" class:invalid={nameError} >
            <input class:text-red={errorUnderline}  spellcheck="false" maxlength="20" on:keydown={(e) => e.key === 'Enter' && updateBoxName()} class=" text-center outline-none text-text_color bg-transparent" disabled='{inputDisabled}' type="text" style="width: {boxName.length}ch" bind:this={nameInput} bind:value={boxName} >
            {#if inputDisabled}
                <button class="active:scale-90 transition-transform ease-in-out scale-95" on:click={()=>editName()}>
                    <EditPenIcon/>
                </button>
                {:else}
                <button class="active:scale-90 transition-transform ease-in-out scale-95" on:click={()=>updateBoxName()}>
                    <CheckmarkIcon/>
                </button>
            {/if}

        </div>
        <button class="active:scale-90 transition-transform ease-in-out"><GearIcon/></button>
    </div>

    <section class="w-full h-screen bg-secondary rounded-t-[2rem] flex flex-col gap-2 px-4 pt-4">
        <div class="w-full justify-end flex">
            <StatusWidget open={$box.opened} />
        </div>

        <div class="w-full min-h-[12rem] rounded-lg border border-outline video-gradient justify-center items-center flex relative overflow-hidden">
            {#if livekitConnected}
                    <!-- svelte-ignore a11y-media-has-caption -->
                    <video bind:this={boxVideo} class:hidden={!isVideo} class="w-full overflow-hidden" src="">
                    </video>
                    {#if !isVideo}
                        <div class="animate-spin absolute w-full h-full justify-center items-center flex">
                            <ResetIcon/>
                        </div>
                        {:else}
                        <button class="active:scale-90 transition-transform ease-in-out absolute bottom-2 right-2"><GearIcon/></button>
                    {/if}
                    
                {:else}
                    <button on:click={()=>tryConnect()} class="active:scale-90 transition-transform ease-in-out"><CameraIcon/></button>
            {/if}
        </div>

        <div class="w-full h-48">
            <PinBox box={$box} copyText={copyText}/>
        </div>
    </section>
</div>
<style>

    .video-gradient {
        background: radial-gradient(385.51% 138.87% at 100% 96.36%, #1A1249 0%, rgba(36, 64, 118, 0.33) 51.7%, rgba(84, 54, 204, 0.42) 100%);
        box-shadow: 0px 0px 156.3px 23px rgba(0, 0, 0, 0.98) inset, 0px 4px 4px 0px rgba(0, 0, 0, 0.25), 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
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