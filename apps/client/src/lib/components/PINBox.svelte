<script lang="ts">
    import { Box } from "$lib/types";
    import { HideEyeIcon, ShowEyeIcon,  ThreeDotIcon, UnlockIcon, ResetIcon } from "$lib/assets/icons";

    export let box : Box

    const copy = () => {        
        navigator.clipboard.writeText(splittedPin)
        copyText = true
        setTimeout(() => {
            copyText = false
        }, 500);   
    }

    let splittedPin : string = $box.pin.slice(0, ($box.pin.length/2)) + " " + box.pin.slice(($box.pin.length/2))

    let hiddenCode : boolean = true
    export let copyText : boolean

    $: {
        splittedPin = $box.pin.slice(0, ($box.pin.length/2)) + " " + $box.pin.slice(($box.pin.length/2))
        hiddenCode
    }
</script>
<div class="border-btn_secondary h-[55%] rounded-lg border-[1px] flex justify-center items-center relative text-text_color ">
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