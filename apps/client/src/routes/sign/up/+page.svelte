<script lang="ts">
	import { goto } from "$app/navigation";
    import { Button, InputField } from "$lib/components";
    import { PersonIcon, EmailIcon } from "$lib/assets/icons";
	import { registerUser } from "$lib/stores";
	import { delidock } from "$lib/utils";
	import { onMount } from "svelte";

    onMount(()=>{
        if ($registerUser) {
            email = $registerUser.email
            firstName = $registerUser.firstName
            lastName = $registerUser.lastName
        }
    })
    
    let email : string
    let firstName : string
    let lastName: string

    let emailError : string | null
    

    const handleRegister= async (email: string) => {
        const registerRespose = await delidock.register(email)
         switch (registerRespose.status) {
            case 409:
                emailError = "Account already exists"
                break;
            case 200:
                $registerUser = {email, firstName, lastName}     
                goto('/sign/up/confirm', {replaceState : true}) 
                break
            default:
                break;
         }
    }

</script>
<section class="w-screen h-full flex flex-col">
    <div class="w-full h-full bg-background rounded-t-[2rem] px-6 pb-10 pt-8 flex flex-col items-center justify-start relative">
        <h1 class="text-text_color text-2xl flex mb-4">Register</h1>
            <form on:submit|preventDefault={()=>handleRegister(email)} class="flex-col flex w-full gap-3" >
                <div class="flex flex-col gap-3">
                    <InputField icon={PersonIcon} label="Firstname" type="text" bind:value={firstName} error={null}/>
                    <InputField icon={PersonIcon} label="Lastname" type="text" bind:value={lastName} error={null}/>
                    <InputField icon={EmailIcon} label="Email" type="email" bind:value={email} error={emailError} id="register"/>
                </div>
                <div class="w-1/2">
                    <Button type="submit" label="Register" />
                </div>
            </form>
        <div class="absolute w-full h-10 bottom-8 right-0 left-0 flex justify-center">
            <a href="/sign/in"><button class="text-btn_primary text-md active:!text-text_color">Log in</button></a>
        </div>
    </div>
</section>