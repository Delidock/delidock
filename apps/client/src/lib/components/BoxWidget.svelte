<script lang="ts">
	import { HideEyeIcon, ShowEyeIcon,  ThreeDotIcon, UnlockIcon, ResetIcon } from "$lib/assets/icons";
    import { BoxButton, StatusWidget } from '$lib/components'
	import { Box } from "$lib/types";
	import PinBox from "./PINBox.svelte";

    export let boxData : any

    const box : Box = new Box(boxData.name, boxData.id, boxData.pin, boxData.livekitToken, boxData.livekitServer, boxData.opened)
    let copyText : boolean = false
    
    const changePIN = () => {
        copyText = false
        box.changePIN()
    }

    const unlockBox = () => {
        box.unlock()
    }
    
</script>
<div class="solid-shadow bg-secondary w-full h-52 rounded-lg p-2 text-text_color gap-2 flex flex-col">
    <div class="flex flex-row justify-between items-center h-[10%]">
        <h4>{$box.name}</h4>
        <StatusWidget open={$box.status}/>
    </div>
    <div class="h-[55%]">
        <PinBox box={$box} copyText={copyText}/>
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