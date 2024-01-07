<script lang="ts">
    import { HideEyeIcon, ShowEyeIcon } from "$lib/assets/icons";

    export let pin : string
    export let copyText : boolean

    const copy = () => {        
        navigator.clipboard.writeText(splittedPin)
        copyText = true
        setTimeout(() => {
            copyText = false
        }, 500);   
    }

    let splittedPin : string = pin.slice(0, (pin.length/2)) + " " + pin.slice((pin.length/2))

    let hiddenCode : boolean = true
    
    $: {
        splittedPin = pin.slice(0, (pin.length/2)) + " " + pin.slice((pin.length/2))
    }
</script>
<div class="border-btn_secondary h-full rounded-lg border-[1px] flex justify-center items-center relative text-text_color ">
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