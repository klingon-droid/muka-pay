<template>
    <div class="w-full h-screen grid grid-rows-2 font-lexend">

        <div class="h-full flex justify-center items-center flex-col relative ">

            <div class="flex justify-center items-center flex-col grow -mt-8">
                <p class="text-black mb-2">balance</p>
                <p class="text-[20vw] font-doto">{{ usdcBalance }}</p>

                <!-- <div class="bg-black px-1 py-1 pr-3 rounded-full text-white">
                    <div class="flex items-center gap-2">
                        <iconify-icon class="text-3xl" icon="token:base"></iconify-icon>
                        USDC
                    </div>
                </div> -->
                <p class="font-doto text-3xl text-blue-500">Base USDC</p>
            </div>

            <div class="absolute bottom-0 p-4 flex justify-between w-full items-center">
                <div>
                    <p class="-mt-2 text-gray-400">username</p>
                    <div class="text-2xl font-bold">{{ currentUsername }}</div>
                </div>
                

                <div class="flex justify-end items-center gap-2">

                    <button class="bg-white text-black text-3xl w-12 h-12 flex justify-center items-center space-x-1 rounded-full">
                        <iconify-icon icon="mdi:hamburger-menu"></iconify-icon>
                    </button>

                    <button class="bg-red-500 text-white text-2xl w-12 h-12 flex justify-center items-center space-x-1 rounded-full">
                        <iconify-icon icon="mdi:logout"></iconify-icon>
                    </button>

                </div>
            </div>
            
        </div>

        <div class="w-full h-full grid grid-cols-2 ">
            <div @click="isSendDialogOpen = true" class="flex justify-center items-center flex-col shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] cursor-pointer hover:bg-gray-50">
                <div>
                    <iconify-icon class="text-5xl text-blue-400" icon="pixelarticons:arrow-up"></iconify-icon>
                </div>
                <p class="text-2xl font-bold mt-2 text-blue-700">send</p>
            </div>
            <div @click="gotoReceive()" class="flex justify-center items-center flex-col shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] cursor-pointer hover:bg-gray-50">
                <div>
                    <iconify-icon class="text-5xl text-green-400" icon="pixelarticons:arrow-down"></iconify-icon>
                </div>
                <p class="text-2xl font-bold mt-2 text-green-700">receive</p>
            </div>
            <div @click="gotoDeposit()" class="flex justify-center items-center flex-col shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]">
                <div>
                    <iconify-icon class="text-5xl text-yellow-400" icon="pixelarticons:plus"></iconify-icon>
                </div>
                <p class="text-2xl font-bold mt-2 text-yellow-700">deposit</p>
            </div>
            <div @click="isHistoryDialogOpen = true" class="flex justify-center items-center flex-col shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]">
                <div>
                    <iconify-icon class="text-5xl text-gray-400" icon="pixelarticons:article-multiple"></iconify-icon>
                </div>
                <p class="text-2xl font-bold mt-2">history</p>
            </div>
        </div>

        <!-- Use the imported SendDialog component -->
        <SendDialog 
            :is-open="isSendDialogOpen" 
            @close="isSendDialogOpen = false"
            @send="handleSendPayment"
        />

        <!-- Use the imported HistoryDialog component -->
        <HistoryDialog 
            :is-open="isHistoryDialogOpen" 
            @close="isHistoryDialogOpen = false"
        />
        
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SendDialog from './SendDialog.vue'
import { username } from '../stores/user'
import HistoryDialog from './HistoryDialog.vue'
import { useStore } from '@nanostores/vue'

const isSendDialogOpen = ref(false)
const isHistoryDialogOpen = ref(false)
const usdcBalance = ref(0);
// const currentUsername = useStore(username)
const currentUsername = 'yf'

const handleSendPayment = (payment) => {
    // Implement payment logic here
    console.log('Sending payment:', payment)
    isSendDialogOpen.value = false
}




onMounted( async () => {
    await getBalance();
})


const getBalance = async () => {
    const response = await fetch(`${window.location.origin}/api/balance/${currentUsername}`);
    const data = await response.json();
    console.log('balance data:', data);
    usdcBalance.value = data.balance / 1e6;
}

const gotoReceive = () => {
    window.location.href = '/receive'
}

const gotoDeposit = () => {
    window.location.href = `/deposit?username=${currentUsername}`
}

</script>

<style>
.font-lexend {
    font-family: "Lexend", sans-serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
    font-variation-settings: "wdth" 100;
}

.font-doto {
    font-family: "Doto", sans-serif;
    font-optical-sizing: auto;
    font-weight: 600;
    font-style: normal;
    font-variation-settings: "wdth" 100;
}
</style>
