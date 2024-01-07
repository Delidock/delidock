<script lang="ts">
	import { goto } from "$app/navigation";
	import { PasswordIcon } from "$lib/assets/icons";
	import { Button, InputField } from '$lib/components'
	import { registerUser } from "$lib/stores";
	import { delidock } from "$lib/utils";
	import { onMount } from "svelte";

    let confirmedPass: string
    let confirmError : string | null

    let password : string
    let passwordError : string | null

    let greenConfirmed : boolean = false
    onMount(()=> {
        if (!$registerUser) {
            goto('/sign/up', {replaceState: true})
        }
    })
    const checkPasswordMatch = () =>{
        if (!confirmedPass) {
            return
        }
        confirmError = null
        if (confirmedPass === password) {
            confirmError = null
            greenConfirmed = true
        } else {
            greenConfirmed = false
        }
    }

    const handleConfirm = async () => {
        confirmError = ""
        if (!$registerUser) {
            goto("/sign/up", {replaceState: true})
            return
        }
        
        const confirmResponse = await delidock.confrimPassword($registerUser, password, confirmedPass)
        
        switch (confirmResponse.status) {
            case 200:
                $registerUser = null
                goto("/sign/in", { replaceState: true})
                break;
            case 401:
                confirmError = "Password does not match"
                greenConfirmed = false
                break
            case 409:
                $registerUser = null
                confirmError = "Account is already registered"
                greenConfirmed = false
                break
            default:
                confirmError = "Something went wrong"
                greenConfirmed = false
                break;
        }      
    }
    $: confirmedPass, password, checkPasswordMatch()
</script>
<section class="w-screen h-full flex flex-col">
    <div class="w-full h-full bg-background rounded-t-[2rem] px-6 pb-10 pt-8 flex flex-col items-center justify-start relative">
        <h1 class="text-text_color text-2xl flex mb-4">Register</h1>
        <form on:submit|preventDefault={()=>{handleConfirm()}} class="flex-col flex w-full gap-3">
            <div class="flex flex-col gap-3">
                <p class="text-text_color text-sm">Confirm your password to make sure you haven't made a mistake.</p>
                <InputField icon={PasswordIcon} label="Password" type="password" green={greenConfirmed} bind:value={password} error={passwordError}/>
                <InputField icon={PasswordIcon} label="Confirm password" type="password" green={greenConfirmed} bind:value={confirmedPass} error={confirmError}/>
            </div>
            <div class="w-1/2">
                <Button type="submit" label="Register"/>
            </div>
        </form>
        <div class="absolute w-full h-10 bottom-8 right-0 left-0 flex justify-center">
            <a href="/sign/in"><button class="text-btn_primary text-md active:!text-text_color">Log in</button></a>
        </div>
    </div>
</section>