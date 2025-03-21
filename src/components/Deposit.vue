<template>
    <div class="w-full h-full p-4 space-y-4 pb-[25vh] overflow-y-auto">
        <div v-if="!currentUsername" class="w-full p-8 text-center space-y-4">
            <p class="text-xl font-bold text-red-500">Invalid deposit link</p>
            <p class="text-gray-600">Please use a valid deposit link with a username parameter</p>
        </div>

        <div v-else class="w-full p-8 text-center space-y-4">
            <div class="mb-12">
                <h1 class="text-2xl font-medium text-gray-600 mb-2">Deposit Base USDC to</h1>
                <p class="text-4xl font-bold">@{{ currentUsername }}</p>
            </div>

            <div class="flex gap-2 max-w-4xl mx-auto">
                <button @click="copyLink" class="flex-1 bg-white border border-gray-200 hover:border-gray-300 transition-colors text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
                    <iconify-icon icon="mdi:content-copy" class="text-lg"></iconify-icon>
                    Copy link
                </button>
            </div>
        </div>

        <div class="w-full bg-gray-200 p-4 rounded-xl">

            <p class="text-center mb-8">Connect Wallet to Base</p>

            <div v-if="!isConnected" class="w-full flex justify-center items-center bg-white p-4 rounded-xl mb-4">
                <p>Address: Not Connected</p>
            </div>

            <div class="w-full space-y-2">
                <button v-if="!isConnected" @click="connectWallet" class="w-full bg-black text-xl text-white p-4 rounded-xl">Connect</button>
                <button v-if="isConnected && !isBaseNetwork" @click="switchToBase" class="w-full bg-black text-xl text-white p-4 rounded-xl">Switch to Base</button>

                <button v-if="isConnected && isBaseNetwork" @click="disconnectWallet" class="w-full bg-red-500 text-xl text-white p-4 rounded-xl">Disconnect</button>
            </div>

        </div>

        <div :class="[(isConnected && isBaseNetwork) ? '' : 'opacity-10 pointer-events-none']" class="w-full bg-gray-200 p-4 rounded-xl">
            <p class="text-center mb-8">Enter Amount to Deposit</p>

            <div class="w-full flex justify-center items-center gap-2 bg-white p-4 rounded-xl mb-4">
                <input 
                    v-model="inputAmount"
                    type="number" 
                    class="flex-1 "
                    placeholder="Enter USDC amount"
                />
                <p class="font-medium">USDC</p>
            </div>

            <div class="w-full space-y-2">
                <button @click="confirmAmount" class="w-full bg-black text-xl text-white p-4 rounded-xl">Next</button>
            </div>
        </div>

        <div :class="[(isConnected && isBaseNetwork && isAmountConfirmed) ? '' : 'opacity-10 pointer-events-none']" class="w-full bg-gray-200 p-4 rounded-xl">
            <p class="text-center mb-8">Approve and Deposit USDC</p>

            <div class="w-full grid grid-cols-2 gap-4">
                <button @click="handleApproval" :disabled="isApprovalSufficient" class="w-full bg-black text-xl text-white p-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-10">
                    <iconify-icon icon="mdi:check-circle" class="text-2xl"></iconify-icon>
                    Approve
                </button>

                <button @click="handleDeposit" :disabled="!isApprovalSufficient" class="w-full bg-blue-500 text-xl text-white p-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-10">
                    <iconify-icon icon="mdi:bank-transfer" class="text-2xl"></iconify-icon>
                    Deposit
                </button>
            </div>
        </div>


    </div>
</template>

<script setup>

    import { ref, onMounted, computed } from 'vue';

    const isConnected = ref(false);
    // const isBaseNetwork = ref(false);
    const isAmountConfirmed = ref(false);
    const isApprovalSufficient = ref(false);
    const currentUsername = ref('');
    const inputAmount = ref(0);

    import { wagmiConfig, walletAccount, ERC20_ABI, VAULT_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS, getUsernameHash, VAULT_ABI } from '../stores/user'
    import { useStore } from '@nanostores/vue'
    import { getAccount, getConnectors, connect, disconnect, switchChain, reconnect, writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core'
    import { baseSepolia } from 'wagmi/chains'
    import { formatUnits, parseUnits } from 'viem'


    onMounted(() => {
        const urlParams = new URLSearchParams(window.location.search);
        currentUsername.value = urlParams.get('username') || '';
        reconnect(wagmiConfig);

        const account = getAccount(wagmiConfig)
        if(account) {
            console.log('account:', account)
            walletAccount.set(account);
            isConnected.value = account.isConnected;
        }

    });

    const connectWallet = async () => {
        const _connectors = getConnectors(wagmiConfig)
        await connect(wagmiConfig, { connector: _connectors[0] })
        const account = getAccount(wagmiConfig)
        if(account) {
            console.log('account:', account)
            walletAccount.set(account);
            isConnected.value = account.isConnected;
        }
    }

    const disconnectWallet = () => {
        disconnect(wagmiConfig)
        isConnected.value = false;
        walletAccount.set(null);
    }

    const switchToBase = () => {
        switchChain(wagmiConfig, { chainId: baseSepolia.id })
        const account = getAccount(wagmiConfig)
        if(account) {
            console.log('account:', account)
            walletAccount.set(account);
            isConnected.value = account.isConnected;
        }
    }

    const isBaseNetwork = computed(() => {
        return walletAccount?.value?.chainId === baseSepolia.id;
    })

    const confirmAmount = () => {
        isAmountConfirmed.value = true;
    }

    const checkApproval = async () => {
        const allowance = await readContract(wagmiConfig, {
            address: USDC_CONTRACT_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [
                walletAccount.value.address,
                VAULT_CONTRACT_ADDRESS
            ]
        })
        console.log('allowance:', allowance)
        return Number(formatUnits(allowance, 6)) >= Number(inputAmount.value);
    }

    const handleApproval = async () => {

        const allowed = await checkApproval();
        if(allowed) {
            isApprovalSufficient.value = true;
            return;
        }

        try {

            const tx = await writeContract(wagmiConfig, {
                address: USDC_CONTRACT_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [
                    VAULT_CONTRACT_ADDRESS, 
                    String(Number(inputAmount.value) * 1e6)
                ]
            })

            const receipt = await waitForTransactionReceipt(wagmiConfig, {
                hash: tx
            })

            console.log('receipt:', receipt)
            isApprovalSufficient.value = receipt.status === 'success';

        } catch (error) {
            console.error('Error approving:', error)
        }
    }

    const handleDeposit = async () => {
        
        try {
            const usernameHash = await getUsernameHash(currentUsername.value);
            console.log('usernameHash:', usernameHash)

            const tx = await writeContract(wagmiConfig, {
                address: VAULT_CONTRACT_ADDRESS,
                abi: VAULT_ABI,
                functionName: 'deposit',
                args: [
                    usernameHash, 
                    String(Number(inputAmount.value) * 1e6)
                ]
            })

            const receipt = await waitForTransactionReceipt(wagmiConfig, {
                hash: tx
            })

            console.log('receipt:', receipt)
            // isDepositSufficient.value = receipt.status === 'success';
            alert('Deposit successful');

        } catch (error) {
            console.error('Error depositing:', error)
        }
    }


    const copyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link);
        alert('Link copied to clipboard');
    }


</script>