<script lang="ts">
	import { ThreeDotIcon, UnlockIcon, ResetIcon } from "$lib/assets/icons";
    import { BoxButton, StatusWidget } from '$lib/components'
	import type { BoxClient } from "@delidock/types";
	import { delidock } from "$lib/utils";
	import PinBox from "./PINBox.svelte";

    export let box : BoxClient    
    export let detailed : boolean = false

    let copyText : boolean = false
    
    const changePIN = () => {
        copyText = false
        delidock.changePin(box)
    }
    
</script>
<div class="solid-shadow bg-secondary w-full h-52 rounded-lg p-2 text-text_color gap-2 flex flex-col">
    {#if !detailed}
        <div class="flex flex-row justify-between items-center h-[10%]">
            <h4>{box.name}</h4>
            <StatusWidget open={box.lastStatus}/>
        </div>
    {/if}
    <div class="h-[55%]">
        <PinBox pin={box.lastPIN} copyText={copyText}/>
    </div>
    <div class="flex flex-row gap-2 h-[35%]">
        <div class="flex flex-row gap-2 w-full">
            <BoxButton on:click={()=>delidock.unlock(box)} label="Unlock" icon={UnlockIcon}/>
            <BoxButton on:click={()=>changePIN()} label="Change pin" icon={ResetIcon}/>
        </div>
        {#if !detailed}
            <div class="aspect-square h-full">
                <BoxButton icon={ThreeDotIcon} on:click/>
            </div>
        {/if}
    </div>
</div>