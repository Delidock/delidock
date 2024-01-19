<script lang="ts">
	import { goto } from "$app/navigation";
    import { BigCrossIcon, CheckmarkIcon, PasswordIcon, RoundedCheckmarkIcon } from "$lib/assets/icons";
	import { Button, InputField } from "$lib/components/index.js";
	import { delidock } from "$lib/utils/delidock.js";
    export let data


    let currentPassword : string
    let newPassword : string
    let newPasswordAgain : string

    let currentPasswordError : string
    let newPasswordError : string
    let newPasswordAgainError : string

    let succesMessage : string = ""
    const changePassword = async ()=> {
        resetInputStatus()
        if (newPassword === newPasswordAgain) {
            const res = await delidock.changePassword(currentPassword, newPassword)
            switch (res.status) {
                case 200:
                    succesMessage = "Password has been changed"
                    break;
                case 401:
                    currentPasswordError = "Unauthorized"
                    break;
                default:
                    currentPasswordError = "Something went wrong"
                    newPasswordError = currentPasswordError
                    newPasswordAgainError = currentPasswordError
                    break;
            }
        } else {
            newPasswordError = ""
            newPasswordAgainError = ""
            newPasswordError = "Passwords does not match"
            newPasswordAgainError = "Passwords does not match"
        }
    }
    const resetInputStatus = () => {
        succesMessage = ""
        currentPasswordError =""
        newPasswordError = ""
        newPasswordAgainError = ""
    }
    $: currentPassword, newPassword, newPasswordAgain, resetInputStatus()
</script>
<section class="w-full h-screen bg-background absolute transition-colors ease-in-out">
    <div class="w-full px-4 h-16 flex justify-center items-center">
        <div class="flex flex-row items-center justify-center relative w-full">
            <button on:click|preventDefault={()=>goto("/home")} class="absolute left-0 active:scale-90 transition-transform ease-in-out"><BigCrossIcon/></button>
            <p class="flex text-text_color">{data.user.name}</p>

        </div>
    </div>
    <div class="w-full min-h-[calc(100svh-4rem)] bg-secondary rounded-t-[2rem] flex flex-col gap-2 pb-4 px-4 pt-4">
        <form on:submit={()=>changePassword()} class="flex flex-col gap-2">
            <InputField label="Current password" error={currentPasswordError} icon={PasswordIcon} bind:value={currentPassword} type="password"/>
            <InputField label="New password" succesMessage={succesMessage}  error={newPasswordError} icon={PasswordIcon} bind:value={newPassword} type="password"/>
            <InputField label="New password again" succesMessage={succesMessage}  icon={RoundedCheckmarkIcon} error={newPasswordAgainError} bind:value={newPasswordAgain} type="password"/>
            <Button label="Change password" type="submit"/>
            <Button label="Logout" type="button" forceRed={true} on:click={()=>delidock.logout()}/>
        </form>
    </div>w
</section>