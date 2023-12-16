<script lang="ts">
	import { enhance } from "$app/forms";
    import { PasswordIcon, EmailIcon, InputField, Doggo, Button } from "$lib";

    export let form

    let email : string | FormDataEntryValue
    let password : string
    let rememberMe : boolean = false

    let emailError : null | string
    let passwordError : null | string

    const updateForm = () => {
        passwordError = null
        if (form) {
            if (form.incorrect === true) {
                passwordError = "Invalid password"
                password = ""
                if (form.email) {
                    email = form.email
                }
            }
        }
    }
    $: form, updateForm()
</script>
<section class="w-screen h-full flex flex-col">
    <div class="w-full h-full bg-background rounded-t-[2rem] px-6 pb-8 pt-8 flex flex-col items-center justify-start relative">
        <h1 class="text-text_color text-2xl flex mb-4">Login</h1>
        <form method="post" action="?/login" use:enhance class="flex-col flex w-full gap-2">
            <div class="flex flex-col gap-3">
                <InputField icon={EmailIcon} label="Email" type="email" value={email} error={emailError}/>
                <InputField icon={PasswordIcon} label="Password" type="password" bind:value={password} error={passwordError}/>
            </div>
            <div class="flex flex-row justify-between">
                <div class="flex items-center gap-2">
                    <button type="button" id="remember" class="flex justify-center items-center w-5 h-5 rounded-md bg-secondary border-2 border-btn_secondary" on:click={()=>{rememberMe = !rememberMe}}>
                        {#if rememberMe}
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M2.73483 2.73483C2.88128 2.58839 3.11872 2.58839 3.26517 2.73483L6 5.46967L8.73483 2.73484C8.88128 2.58839 9.11872 2.58839 9.26517 2.73484C9.41161 2.88128 9.41161 3.11872 9.26517 3.26517L6.53033 6L9.26517 8.73483C9.41161 8.88128 9.41161 9.11872 9.26517 9.26517C9.11872 9.41161 8.88128 9.41161 8.73483 9.26517L6 6.53033L3.26517 9.26517C3.11872 9.41161 2.88128 9.41161 2.73484 9.26517C2.58839 9.11872 2.58839 8.88128 2.73484 8.73483L5.46967 6L2.73483 3.26517C2.58839 3.11872 2.58839 2.88128 2.73483 2.73483Z" fill="#E7E7F3"/>
                            </svg>
                        {/if}
                    </button>
                    <input type="checkbox" class="hidden" bind:checked={rememberMe} name="Remember">
                    <label for="remember" class="text-text_color text-xs active:!text-btn_primary">Remember me</label>
                </div>
                <div>
                    <button type="button" class="text-text_color text-xs active:!text-btn_primary">Forgot password?</button>
                </div>
            </div>
            <div class="w-1/2">
                <Button type="submit" label="Log in"/>
            </div>
        </form>
        <div class="absolute w-full h-10 bottom-8 right-0 left-0 flex justify-center">
            <a href="/sign/up"><button class="text-btn_primary text-md active:!text-text_color">Sign up</button></a>
        </div>
    </div>
</section>