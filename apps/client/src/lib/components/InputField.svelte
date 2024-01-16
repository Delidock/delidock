<script lang="ts">
    import { EmailIcon } from "$lib/assets/icons";
	import type { ComponentType } from "svelte";
    export let label : string = "Input"
    export let value : string | FormDataEntryValue
    export let type = "text"
    export let error : string | null
    export let icon : ComponentType = EmailIcon
    export let green : boolean = false
    export let id : string = ""


    let formInvalid : boolean
    let title = label
    $: {        
        if (error) {
            formInvalid = true
            title = error
        } else {
            formInvalid = false
            title = label+":"
        }
    }

    const displayError = () =>{
        if (error) return error
        if (value) return "Invalid email"
        switch (type) {
            case "email":
                return "Email is required"
            case "password":
                return "Password is required"
            default:
                return `${label} is required`
        }
    }
    const onInput = () => {
        error = null
    }
    
</script>
<div id={id} class="shadow">
    <p class:!text-red={formInvalid} class="text-xs text-text_color mb-1">{title}</p>
    <div class:!border-red={formInvalid} class:!border-green={green} class="transition-colors ease-in-out w-full h-16 bg-secondary border-2 border-btn_secondary rounded-lg text-text_color text-base flex-row flex px-3 items-center gap-3">
        <svelte:component this={icon}/>
        <input {...{type}} class="w-full h-full bg-secondary outline-none" name={label} bind:value={value} on:invalid|preventDefault={ ()=> {error = displayError()}} on:input={()=> onInput()} required>
    </div>
</div>
<style>
    .shadow {
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25); 
    }
</style>