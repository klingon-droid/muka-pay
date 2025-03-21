<template>
    <div class="w-full h-screen grid grid-rows-2">

        <div class="h-full flex justify-center items-center flex-col relative bg-[#FFE42B]">
            
            <!-- Add wallet connection buttons if not connected -->
            <div v-if="!isConnected" class="absolute top-4 right-4 flex flex-col gap-2">
                <button 
                    v-for="connector in connectors"
                    :key="connector.id"
                    @click="connectWallet(connector)"
                    class="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2"
                >
                    <iconify-icon icon="mdi:wallet"></iconify-icon>
                    {{ connector.name }}
                </button>
            </div>
            <div v-else class="absolute top-4 right-4 flex flex-col gap-2">
                <p>{{ walletAccount?.address?.slice(0, 6) }}...{{ walletAccount?.address?.slice(-4) }}</p>
                <button @click="disconnectWallet" class="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                    <iconify-icon icon="mdi:logout"></iconify-icon>
                    logout
                </button>
            </div>

            <div class="flex justify-center items-center flex-col grow -mt-8">
                <p class="text-yellow-700 mb-2">balance</p>
                <p class="text-6xl font-bold mb-8">{{ usdcBalance }}</p>

                <div class="bg-black px-1 py-1 pr-3 rounded-full text-white">
                    <div class="flex items-center gap-2">
                        <iconify-icon class="text-3xl" icon="token:base"></iconify-icon>
                        USDC
                    </div>
                </div>
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
            <div class="flex justify-center items-center flex-col shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]">
                <div>
                    <iconify-icon class="text-5xl text-green-400" icon="pixelarticons:arrow-down"></iconify-icon>
                </div>
                <p class="text-2xl font-bold mt-2 text-green-700">receive</p>
            </div>
            <div class="flex justify-center items-center flex-col shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]">
                <div>
                    <iconify-icon class="text-5xl text-yellow-400" icon="pixelarticons:plus"></iconify-icon>
                </div>
                <p class="text-2xl font-bold mt-2 text-yellow-700">deposit</p>
            </div>
            <div class="flex justify-center items-center flex-col shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]">
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
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SendDialog from './SendDialog.vue'
import { username, wagmiConfig } from '../stores/user'
import { useStore } from '@nanostores/vue'
import { getAccount, getConnectors, connect, disconnect } from '@wagmi/core'

const isSendDialogOpen = ref(false)
const usdcBalance = ref(0);
// const currentUsername = useStore(username)
const currentUsername = 'bukamuka'

const walletAccount = ref(null);
const isConnected = ref(false);
const connectors = ref([]);

// Enhanced Wagmi hooks

const handleSendPayment = (payment) => {
    // Implement payment logic here
    console.log('Sending payment:', payment)
    isSendDialogOpen.value = false
}

onMounted( async () => {

    const account = getAccount(wagmiConfig)
    console.log('account:', account)
    walletAccount.value = account;
    const _connectors = await getConnectors(wagmiConfig)

    isConnected.value = account.isConnected
    console.log('isConnected:', account.isConnected)

    console.log(_connectors.map(connector => connector.name))
    connectors.value = _connectors;
    console.log('connectors:', connectors.value)

    await getBalance();
})

const connectWallet = async (connector) => {
    await connect(wagmiConfig, { connector })
    const account = getAccount(wagmiConfig)
    console.log('account:', account)
    walletAccount.value = account;
    isConnected.value = account.isConnected;
}

const getBalance = async () => {


    const response = await fetch(`/api/balance/${currentUsername}`);
    const data = await response.json();
    console.log('balance data:', data);
    usdcBalance.value = data.balance / 1e6;

    // await fetch(`https://mukapay-api.fly.dev/api/users/${currentUsername}/balance`, {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json'
    //     }
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log('balance data:', data);
    //     usdcBalance.value = data.balance / 1e6;
    // })
    // .catch(error => {
    //     console.error('Error fetching balance:', error);
    // });
    // usdcBalance.value = 12.34;
    // return usdcBalance.value;
}

const disconnectWallet = () => {
    disconnect(wagmiConfig)
    isConnected.value = false
    walletAccount.value = null
}




</script>