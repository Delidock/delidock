<script lang="ts">
	import { goto } from "$app/navigation";
    import { BigCrossIcon, CameraIcon, CrossIcon, IdenityIcon, TicketIcon } from "$lib/assets/icons";
	import { Button, InputField } from "$lib/components";
	import { delidock } from "$lib/utils";
    import QrScanner from "qr-scanner";
	import { onDestroy, onMount } from "svelte";
	import { slide } from "svelte/transition";
    import placeholder from '$lib/assets/images/placeholder.png'


    let qrVideoElement : HTMLVideoElement | null = null
    let qrScanner : QrScanner | null = null
    
    let newBoxIdentity : string
    let newBoxToken: string
    let enterManually : boolean = false
    let notScanning : boolean = false
    let videoVisible : boolean = false
    onMount(()=>{
        startScanning()
    })
    const startScanning = () => {
        if (qrVideoElement) {
            qrScanner = new QrScanner(qrVideoElement, (result)=>qrCodeScanned(result),{
                returnDetailedScanResult: true,
                highlightScanRegion: true,
                
            })
            qrError = ""
            videoVisible = true
            qrScanner.start()
        }
    }
    const stopScanning = () => {
        videoVisible = false
        qrScanner?.stop()
        qrScanner?.destroy()
    }
    
    const qrCodeScanned = (result: QrScanner.ScanResult)=> {
        newBoxIdentity = result.data.split(':')[0]
        newBoxToken = result.data.split(':')[1]
        addNewBox()
        stopScanning()
    }

    const doEnterManually = () => {
        enterManually = true
        stopScanning()
    }
    const doNotEnterManually = () => {
        if (enterManually) {
            enterManually = false
            startScanning()
        }
    }
    let errorIdentity : string | null = null
    let errorToken : string | null = null

    let qrError : string = ""
    const tryQrAgain = (err: string) => {
        qrError = err
    }


    const addNewBox = async () => {
        if (enterManually) {
            if (!newBoxIdentity) {
                errorIdentity = ""
                errorIdentity = "Identity is required"
            }
            if (!newBoxToken) {
                errorToken = ""
                errorToken = "Token is required"
            }
        }
        if (!newBoxIdentity || !newBoxToken) {
            if (!enterManually) {
                newBoxIdentity = ""
                newBoxToken = ""
                tryQrAgain("Invalid QR code")
            }
            return
        }
        const res = await delidock.addNew(newBoxIdentity, newBoxToken)
        switch (res.status) {
            case 200:
                newBoxIdentity = ""
                newBoxToken = ""
                goto("/home/add/waiting", {replaceState: true})
                break;
            case 401: 
                if (enterManually) {
                    errorToken = ""
                    errorIdentity = ""
                    errorToken = "Unauthorized"
                    errorIdentity = "Unouthorized"
                } else {
                    tryQrAgain("Unauthorized user account")
                }
                
                return;

            case 400:
                if (enterManually) {
                    errorIdentity = ""
                    errorIdentity = "Invalid box idenitity"
                } else {
                    tryQrAgain("Invalid box idenitity")
                }
                return
            default:
                if (enterManually) {
                    errorToken = ""
                    errorIdentity = ""
                    errorToken = "Something went wrong"
                    errorIdentity = "Something went wrong"
                } else {
                    tryQrAgain("Invalid QR code")
                }
                return;
        }
    }

    onDestroy(()=>{
        stopScanning()
    })
    
    
</script>
<section class="w-full h-screen bg-background absolute transition-colors ease-in-out" class:blur-sm={enterManually} class:grayscale-[100%]={enterManually}>
    <div class="w-full px-4 h-16 flex justify-center items-center">
        <div class="flex flex-row items-center justify-center relative w-full">
            <button on:click|preventDefault={()=>goto("/home")} class="absolute left-0 active:scale-90 transition-transform ease-in-out"><BigCrossIcon/></button>
            <p class="flex text-text_color">Add box</p>
        </div>
    </div>
    <div class="flex flex-col gap-4 h-[calc(100vh-4rem)] w-full bg-secondary rounded-t-[2rem] pt-4 px-4 relative">
        <div class="relative aspect-square w-full rounded-lg border border-outline overflow-hidden qr-gradient">
            <!-- svelte-ignore a11y-media-has-caption -->
            <video placeholder={placeholder} class=" h-full object-cover overflow-hidden aspect-square"class:hidden={!videoVisible} bind:this={qrVideoElement} src=""></video>
            {#if qrError}
                <div class="absolute w-full h-full top-0 bottom-0 flex flex-col justify-center items-center gap-2">
                    <p class="text-text_color text-lg">{qrError}</p>
                    <div class="w-32"><Button label="Try again" on:click={()=>startScanning()}/></div>
                </div>
                {:else if (!qrError && notScanning)}
                <div class="absolute w-full h-full top-0 bottom-0 flex flex-col justify-center items-center gap-2">
                    <div class="w-32"><Button label="Scan now" on:click={()=>startScanning()}/></div>
                </div>
            {/if}
        </div>
        <div class="flex flex-col w-full">
            <p class="text-text_color text-sm">Scan the QR code on the device to link it to your account</p>
            <div class="relative flex py-5 items-center">
                <div class="flex-grow border-t border-gray-400"></div>
                <span class="flex-shrink mx-4 text-gray-400">OR</span>
                <div class="flex-grow border-t border-gray-400"></div>
            </div>
            
            <button on:click|preventDefault={()=>doEnterManually()} class="active:text-text_color text-btn_primary transition-color ease-in-out">enter manually</button>        
        </div>
        <!-- <div class="w-full absolute bottom-4">
            <p class="text-text_color text-sm">Isn't your box connected to internet? then start <button class="active:text-text_color text-btn_primary transition-color ease-in-out">network setup</button></p>
        </div> -->
    </div>
    
</section>
{#if enterManually}
    <div transition:slide={{axis:"y"}} class="w-full h-[calc(100vh-4rem)] absolute bottom-0 px-2">
        <div class=" bg-secondary rounded-t-[1rem] pt-4 px-4 h-full w-full flex flex-col gap-2">
            <div class="flex flex-row items-center">
                <div class="w-4/6 flex justify-start text-start text-text_color text-2xl">
                    <p>Add manually</p>
                </div>
                <div class="w-2/6 flex justify-end">
                    <button on:click|preventDefault={()=>doNotEnterManually()} class="active:scale-90 transition-transform ease-in-out"><CrossIcon/></button>
                </div>
            </div>
            <p class="text-text_color text-sm mb-2">Please fill out box identity and generated token that you see on the screen</p>
            <InputField label="Identity" icon={IdenityIcon} bind:value={newBoxIdentity} error={errorIdentity}/>
            <InputField label="Token" icon={TicketIcon} bind:value={newBoxToken} error={errorToken}/>
            <Button label="Add box" on:click={()=>addNewBox()}/>
        </div>
    </div>
{/if}

<style>
    .qr-gradient {
        background: radial-gradient(385.51% 138.87% at 100% 96.36%, #140e388e 0%, rgba(9, 16, 29, 0.719) 51.7%, rgba(18, 12, 39, 0.753) 100%);
        box-shadow: 0px 0px 200px 60px rgba(0, 0, 0, 0.98) inset, 0px 4px 4px 0px rgba(0, 0, 0, 0.25), 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    }
    
</style>
