<script lang="ts">
	import { ThreeDotIcon, UnlockIcon, ResetIcon } from "$lib/assets/icons";
    import { BoxButton, StatusWidget } from '$lib/components'
	import type { Box } from "@delidock/types";
	import { delidock } from "$lib/utils";
	import PinBox from "./PINBox.svelte";

    export let box : Box


    let copyText : boolean = false
    
    const changePIN = () => {
        copyText = false
        delidock.changePin(box)
    }

    const unlockBox = () => {
        delidock.unlock(box)
    }

    
    
</script>
<div class="solid-shadow bg-secondary w-full h-52 rounded-lg p-2 text-text_color gap-2 flex flex-col">
    <div class="flex flex-row justify-between items-center h-[10%]">
        <h4>{box.name}</h4>
        <StatusWidget open={box.status}/>
    </div>
    <div class="h-[55%]">
        <PinBox pin={box.pin} copyText={copyText}/>
    </div>
    <div class="flex flex-row gap-2 h-[35%]">
        <div class="flex flex-row gap-2 w-full">
            <BoxButton on:click={()=>unlockBox()} label="Unlock" icon={UnlockIcon}/>
            <BoxButton on:click={()=>changePIN()} label="Change pin" icon={ResetIcon}/>
        </div>
        <div class="aspect-square h-full">
            <BoxButton icon={ThreeDotIcon} on:click/>
        </div>
    </div>
</div>