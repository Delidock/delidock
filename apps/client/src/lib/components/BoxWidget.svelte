<script lang="ts">
	import { HideEyeIcon, ShowEyeIcon,  ThreeDotIcon, UnlockIcon, ResetIcon } from "$lib/assets/icons";
    import { BoxButton, StatusWidget } from '$lib/components'
    import {  Box } from '$lib/types'

    export let box : Box

    let splittedPin : string = $box.pin.slice(0, ($box.pin.length/2)) + " " + $box.pin.slice(($box.pin.length/2))

    let hiddenCode : boolean = true
    let copyText : boolean = false

    const copy = () => {        
        navigator.clipboard.writeText(splittedPin)
        copyText = true
        setTimeout(() => {
            copyText = false
        }, 500);   
    }
    
    const changePIN = () => {
        copyText = false
        hiddenCode = true
        $box.changePIN()
    }

    const unlockBox = () => {
        $box.unlock()
    }

    $: {
        splittedPin = $box.pin.slice(0, ($box.pin.length/2)) + " " + $box.pin.slice(($box.pin.length/2))
    }
    
</script>
<div class="solid-shadow bg-secondary w-full h-52 rounded-lg p-2 text-text_color gap-2 flex flex-col">
    <div class="flex flex-row justify-between items-center h-[10%]">
        <h4>{$box.name}</h4>
        <StatusWidget open={$box.status}/>
    </div>
    <div class="border-btn_secondary h-[55%] rounded-lg border-[1px] flex justify-center items-center relative">
        {#if !copyText}
                <button class="text-5xl tracking-widest" class:blur={hiddenCode} on:click={()=>copy()}>{splittedPin}</button>
            {:else}
                <p>Copied!</p>        
        {/if}
        {#if hiddenCode}
            <div class="absolute w-full h-full flex justify-center items-center">
                <button class="active:scale-95 transition-transform ease-in-out" on:click={()=>{hiddenCode = false}}><ShowEyeIcon/></button>
            </div>            
        {/if}
        {#if !hiddenCode}
            <button on:click={()=>copy()} class="absolute w-full h-full flex justify-end items-start">
                <button class="active:scale-95 transition-transform ease-in-out p-1" on:click={()=>{hiddenCode = true}}><HideEyeIcon/></button>
            </button>   
        {/if}
    </div>
    <div class="flex flex-row gap-2 h-[35%]">
        <div class="flex flex-row gap-2 w-full">
            <BoxButton on:click={()=>unlockBox()} label="Unlock" icon={UnlockIcon}/>
            <BoxButton on:click={()=>changePIN()} label="Change pin" icon={ResetIcon}/>
        </div>
        <div class="aspect-square h-full">
            <BoxButton icon={ThreeDotIcon}/>
        </div>
    </div>
</div>