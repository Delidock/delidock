<script lang="ts">
    import { EmailIcon } from "$lib";
    export let label : string = "Input"
    export let value : string
    export let type = "text"
    export let error : string | null
    export let icon : any

    let formInvalid : boolean
    let title = label
    $: {
        if (typeof(error) === "string") {
            formInvalid = true
            title = error
        } else {
            formInvalid = false
            title = label
        }
    }

    const displayError = () =>{
        if (!error) {
            if (!value) {
                if (type === "email") {
                    return "Empty email"
                }
                return "Empty password"
            }
            return "Invalid email"
            
        }
        return error
    }
    
</script>
<div>
    <p class:!text-red-500={formInvalid} class="text-xs text-text_color mb-1">{title}:</p>
    <div class:!border-red-500={formInvalid} class="w-full h-16 bg-secondary border-2 border-btn_secondary rounded-lg text-text_color text-base flex-row flex px-3 items-center gap-3">
        <svelte:component this={icon}/>
        <input {...{type}} class="w-full h-full bg-secondary outline-none"  bind:value={value} on:invalid|preventDefault={ ()=> {error = displayError()}} on:input={()=> {error = null}} required>
    </div>
</div>