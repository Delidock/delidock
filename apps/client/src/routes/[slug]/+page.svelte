<script lang="ts">
    import { goto } from '$app/navigation';
    import { GearIcon, LeftArrowIcon, EditPenIcon, CheckmarkIcon, CameraIcon } from '$lib/assets/icons'
	import { StatusWidget } from '$lib/components';
    import { Box } from '$lib/types/index.js';
    import placeholder from '$lib/assets/placeholder.mp4'

	import { onMount, tick } from 'svelte';
	import PinBox from '$lib/components/PINBox.svelte';
    export let data

    const box = new Box(data.box.name, data.box.id, data.box.pin, data.box.livekitToken, data.box.livekitServer, data.box.opened)
    
    let boxName : string = "LMAO"
    let nameInput : HTMLInputElement
    let inputDisabled : boolean = true
    let nameError = false
    let errorUnderline = false
    let livekitConnected = false
    
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
    const tryConnect = () => {
        livekitConnected = true
    }

    let copyText = false
    const changePIN = () => {
        copyText = false
        box.changePIN()
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

        <div class="w-full aspect-video rounded-lg border border-outline video-gradient justify-center items-center flex relative">
            {#if livekitConnected}
                    <video src={placeholder} class="w-full h-full" autoplay>
                        <track kind="captions">
                    </video>
                    <button class="active:scale-90 transition-transform ease-in-out absolute bottom-2 right-2"><GearIcon/></button>
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