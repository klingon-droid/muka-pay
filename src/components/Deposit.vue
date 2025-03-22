<template>
  <div class="w-full h-screen overflow-y-auto bg-black text-white font-lexend grid grid-rows-[auto_1fr_auto]">
    <nav class="w-full text-right text-white p-6 font-doto text-4xl">
      Deposit
    </nav>
    
    <div v-if="!currentUsername" class="w-full flex flex-col items-center justify-center text-center">
      <div class="bg-white/10 p-8 rounded-xl w-[90%] max-w-md">
        <p class="text-xl font-bold text-red-500">Invalid deposit link</p>
        <p class="text-white/50 mt-4">Please use a valid deposit link with a username parameter</p>
      </div>
    </div>

    <div v-else class="w-full flex flex-col items-center p-4 overflow-y-auto">
      <div class="mb-6 text-center flex justify-center items-center">
        <p class="text-white text-xl">Depositing to</p>  
        <div class="ml-2 bg-white text-black py-2 px-4 rounded-full text-xl inline-block">@{{ currentUsername }}</div>
      </div>

      <div class="px-8 py-12 font-normal text-white/50 flex justify-between items-center space-x-4">
        <p>You can also open this page in your wallet app to deposit.</p>

        <button @click="copyLink" class=" bg-white text-black font-medium p-3 rounded-xl hover:bg-white/90 active:bg-white/80 transition-colors px-4 text-sm whitespace-nowrap">
          Copy Link
        </button>

      </div>



      <!-- Wallet Connection Card -->
      <div class="w-[90%] max-w-md border border-white/20 rounded-xl mb-4 p-6 cursor-pointer hover:border-white/40 transition-all duration-200"
           :class="{ 'ring-2 ring-white ring-offset-2 ring-offset-black': isConnected }">
        <div class="flex items-center flex-col">
          <iconify-icon icon="mdi:wallet" class="text-5xl mb-4"></iconify-icon>
          <p class="text-2xl font-doto mb-4">Connect Wallet</p>
          
          <div v-if="!isConnected" class="w-full bg-white/10 p-3 rounded-xl text-center text-white/50 mb-4">
            Address: Not Connected
          </div>
          
          <div v-else class="w-full bg-white/10 p-3 rounded-xl text-center text-green-500 mb-4">
            <p class="truncate">Connected: {{ walletAccount?.value?.address }}</p>
          </div>
          
          <div class="w-full space-y-2">
            <button v-if="!isConnected" @click="connectWallet" class="w-full bg-white text-black font-medium p-3 rounded-xl hover:bg-white/90 active:bg-white/80 transition-colors">
              Connect
            </button>
            <button v-if="isConnected && !isBaseNetwork" @click="switchToBase" class="w-full bg-white text-black font-medium p-3 rounded-xl hover:bg-white/90 active:bg-white/80 transition-colors">
              Switch to Base
            </button>
            <button v-if="isConnected && isBaseNetwork" @click="disconnectWallet" class="w-full bg-white/10 border border-red-500 text-red-500 font-medium p-3 rounded-xl hover:bg-red-500/20 active:bg-red-500/30 transition-colors">
              Disconnect
            </button>
          </div>
        </div>
      </div>

      <!-- Combined Amount and Deposit Card -->
      <div class="w-[90%] max-w-md border border-white/20 rounded-xl mb-4 p-6 cursor-pointer hover:border-white/40 transition-all duration-200"
           :class="[
             { 'opacity-50 pointer-events-none': !(isConnected && isBaseNetwork) }
           ]">
        <div class="flex items-center flex-col">
          <iconify-icon icon="mdi:bank-transfer" class="text-5xl mb-4"></iconify-icon>
          <p class="text-2xl font-doto mb-4">Deposit Base USDC</p>
          
          <div class="w-full bg-white/10 p-3 rounded-xl flex items-center mb-4">
            <input 
              v-model="inputAmount"
              type="number" 
              class="bg-transparent w-full text-white text-xl focus:outline-none"
              placeholder="Enter USDC amount"
            />
            <p class="font-doto text-white/50">USDC</p>
          </div>
          
          <div class="w-full grid grid-cols-1 gap-3">
            <button 
              @click="handleApproval" 
              :disabled="isApprovalSufficient || !inputAmount" 
              class="w-full bg-white text-black font-medium p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-50"
              :class="{'bg-green-500 text-white': isApprovalSufficient}"
            >
              <iconify-icon icon="mdi:check-circle" class="text-xl"></iconify-icon>
              {{ isApprovalSufficient ? `Approved ${inputAmount} USDC` : `Approve ${inputAmount} USDC` }}
            </button>
            
            <button 
              @click="handleDeposit" 
              :disabled="!isApprovalSufficient || !inputAmount" 
              class="w-full bg-white text-black font-medium p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-50"
            >
              <iconify-icon icon="mdi:bank-transfer" class="text-xl"></iconify-icon>
              Deposit {{ inputAmount }} USDC
            </button>
          </div>
        </div>
      </div>

      <!-- Share Link Card -->
      <!-- <div class="w-[90%] max-w-md border border-white/20 rounded-xl mb-4 p-6 cursor-pointer hover:border-white/40 transition-all duration-200">
        <div class="flex items-center flex-col">
          <iconify-icon icon="mdi:share" class="text-5xl mb-4"></iconify-icon>
          <p class="text-2xl font-doto mb-4">Share Deposit Link</p>
          
          <button 
            @click="copyLink" 
            class="w-full bg-white/10 text-white font-medium p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 active:bg-white/30 transition-colors"
          >
            <iconify-icon icon="mdi:content-copy" class="text-xl"></iconify-icon>
            Copy Deposit Link
          </button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue';

    const isConnected = ref(false);
    const isAmountConfirmed = ref(false);
    const isApprovalSufficient = ref(false);
    const currentUsername = ref('');
    const inputAmount = ref(0);

    import { wagmiConfig, walletAccount, ERC20_ABI, VAULT_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS, getUsernameHash, VAULT_ABI, username } from '../stores/user'
    import { useStore } from '@nanostores/vue'
    import { getAccount, getConnectors, connect, disconnect, switchChain, reconnect, writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core'
    import { baseSepolia } from 'wagmi/chains'
    import { formatUnits, parseUnits } from 'viem'


    onMounted(() => {
        const urlParams = new URLSearchParams(window.location.search);
        currentUsername.value = urlParams.get('username') || username.value;
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
            alert(`Please approve the deposit first to proceed.`)
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

            isAmountConfirmed.value = false;
            isApprovalSufficient.value = false;
            inputAmount.value = 0;
            alert('Deposit successful');

        } catch (error) {
            console.error('Error depositing:', error)
        }
    }


    const copyLink = () => {
        const link = `${window.location.origin}?username=${currentUsername.value}`;
        navigator.clipboard.writeText(link);
        alert('Link copied to clipboard');
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
  font-weight: 400;
  font-style: normal;
  font-variation-settings: "wdth" 100;
}
</style>