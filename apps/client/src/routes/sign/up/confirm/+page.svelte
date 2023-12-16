<script lang="ts">
	import { enhance } from "$app/forms";
	import { Button, InputField, PasswordIcon} from "$lib";
	import { registerUser } from "$lib/stores/store.js";

    let confirmedPass: string
    let confirmError : string | null

    let passwordError : string | null
    let password : string

    let greenConfirmed : boolean = false

    export let form

    const updateForm = () => {
        if (form) {
            if (form.incorrect) {
                confirmError="Password do not match"
            }
        }
    }

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

    const clearRegisterUser = () => {
        $registerUser = null
    }
    $: confirmedPass, checkPasswordMatch()
    $: form, updateForm()
</script>
<section class="w-screen h-full flex flex-col">
    <div class="w-full h-full bg-background rounded-t-[2rem] px-6 pb-10 pt-8 flex flex-col items-center justify-start relative">
        <h1 class="text-text_color text-2xl flex mb-4">Register</h1>
        <form on:submit={()=>{clearRegisterUser()}} action="?/register" method="post" use:enhance class="flex-col flex w-full gap-3">
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