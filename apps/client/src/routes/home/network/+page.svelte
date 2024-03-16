<script lang="ts">
	import { goto } from "$app/navigation";
	import { BigCrossIcon } from "$lib/assets/icons";
	import Button from "$lib/components/Button.svelte";
    import { CapacitorWifi, type ScanResult } from "capacitorjs-plugin-wifi";
	import { onDestroy, onMount } from "svelte";

    let foundBoxes : ScanResult[] = []
    let scanAvailable : boolean = true
    let scanTimeOut : number = 15

    const scanWifiNow = async () => {
        scanAvailable = false
        scanTimeOut = 15
        const timeOutInterval = setInterval(()=> {
            if (scanTimeOut > 0) {
                scanTimeOut -= 1
            }
        }, 1000)
        let networkScan = await CapacitorWifi.wifiScan();
        foundBoxes = []
        if (!networkScan.error) {
            for(const network of networkScan.networks) {
                if (network.SSID.includes("DELIDOCK_SETUP")) {
                    foundBoxes = [...foundBoxes, network]
                }
            }
        }

        setTimeout(() => {
            clearInterval(timeOutInterval)
            scanAvailable = true
        }, 10000);
    }

    onMount(async ()=>{
        try {
            let perms = await CapacitorWifi.checkPermission();
            if (!perms.status) {
                CapacitorWifi.requestPermission()
                if (!(await CapacitorWifi.checkPermission()).status) {
                    goto("/home", {replaceState: true})
                }
            }
            await scanWifiNow()

        } catch (error) {
            
        }
    })

</script>
<section class="w-full h-screen bg-background absolute transition-colors ease-in-out">
    <div class="w-full px-4 h-16 flex justify-center items-center">
        <div class="flex flex-row items-center justify-center relative w-full">
            <button on:click|preventDefault={()=>goto("/home")} class="absolute left-0 active:scale-90 transition-transform ease-in-out"><BigCrossIcon/></button>
            <p class="flex text-text_color">Network setup</p>
        </div>
    </div>
    <div class="flex flex-col gap-4 h-[calc(100vh-4rem)] w-full bg-secondary rounded-t-[2rem] p-4 relative">
        <p class="text-text_color text-sm">On the box make sure that the device is in pairing mode. If not you can do so by turning the box off and holding the <span class="font-bold">pairing button</span>, while turing the device back on. Hold the button till you can see the <span class="font-bold italic">Setup</span> </p>
        <p class="text-text_color text-md">Found devices: </p>
        <div class="w-full h-full flex flex-col gap-2">
            {#if !scanAvailable && foundBoxes.length === 0}
                <div class="w-full h-full flex justify-end items-center">
                    <p class="text-text_color text-sm w-full text-center">Scanning for devices...</p> 
                </div>
                {:else}
                {#if foundBoxes.length > 0}
                    {#each foundBoxes as box}
                        <button on:click={()=>goto(`/home/network/${box.SSID}`)} class="w-full h-18 bg-btn_secondary flex flex-row gap-2 solid-shadow rounded-lg p-3 transition-transform active:bg-btn_pressed active:scale-95">
                            <div class="w-full flex flex-col items-start justify-center">
                                <div class="flex flex-row gap-2">
                                    <p class="text-xs text-text_color flex flex-row gap-2 justify-center items-center">Delidock V1</p>
                                </div>
                                <p class="text-[10px] text-btn_primary">{box.SSID} {box.BSSID}</p>
                            </div>
                        </button>
                    {/each}
                    {:else}
                    <div class="w-full h-full flex justify-end items-center">
                        <p class="text-text_color text-sm w-full text-center">No devices found</p> 
                    </div>
                {/if}
            {/if}
        </div>
        {#if scanAvailable}
            <div class="h-10">
                <Button label="Scan for devices" on:click={()=>scanWifiNow()}/>
            </div>
            {:else}
            <div class="text-text_color w-full flex items-center justify-center">
                <p class="w-full text-center">Wait {scanTimeOut} seconds before next scan</p>
            </div>
        {/if}
    </div>
</section>