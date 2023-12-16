<script lang="ts">
    import { PasswordIcon, EmailIcon, InputField, Doggo, Button } from "$lib";

    let email : string
    let password : string
    let rememberMe : boolean = false

    let emailError : null | string
    let passwordError : null | string

    const loginSubmit = () => {
        console.log(email);
        console.log(password);
        
        emailError = "KOKOTE"
        email=""
        password=""
    }

</script>
<section class="w-full h-[100svh] flex flex-col">
    <div class="h-1/4 w-full flex justify-center items-center">
        <img src={Doggo} class="h-20" alt="Logo">
    </div>
    <div class="w-full h-3/4 bg-background rounded-t-[2rem] px-6 pb-10 pt-10 flex flex-col items-center justify-start">
        <h1 class="text-text_color text-3xl flex mb-4">Login</h1>
        <form on:submit={()=>loginSubmit()} class="flex-col flex w-full gap-2 mb-14">
            <div class="flex flex-col gap-4">
                <InputField icon={EmailIcon} label="Email" type="email" bind:value={email} error={emailError}/>
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

        <div class="w-full h-10 bottom-14 right-0 left-0 flex justify-center">
            <button class="text-btn_primary text-md active:!text-text_color">Sign up</button>
        </div>
    </div>
</section>