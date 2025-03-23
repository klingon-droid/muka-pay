<template>
    <div class="w-full h-full overflow-y-auto text-white font-lexend grid grid-rows-[auto_1fr_auto]">
      <nav class="w-full text-right text-white p-6 font-doto text-4xl">
        Faucet
      </nav>
  
      <div class="w-full flex flex-col items-center p-4 overflow-y-auto">
        <div class="mb-6 text-center">
          <p class="text-white text-xl">Get test USDC on Base Sepolia</p>
        </div>
  
        <!-- Wallet Connection Card -->
        <div class="w-full max-w-md border border-white/20 rounded-xl mb-4 p-6 cursor-pointer hover:border-white/40 transition-all duration-200"
             :class="{ 'ring-2 ring-white ring-offset-2 ring-offset-black': isConnectedStore }">
          <div class="flex items-center flex-col">
            <iconify-icon icon="mdi:wallet" class="text-5xl mb-4"></iconify-icon>
            <p class="text-2xl font-doto mb-4">Wallet Connection</p>
            
            <!-- Address Display -->
            <div v-if="isConnectedStore" class="w-full bg-white/10 p-3 rounded-xl text-center mb-4">
              <p class="truncate text-green-500">{{ walletAddress }}</p>
            </div>
            
            <!-- Action Buttons -->
            <div class="w-full space-y-2">
              <!-- Connect Buttons - Only show when disconnected -->
              <div v-if="!isConnectedStore" class="w-full space-y-2">
                <button @click="handleConnectWallet('browser')" 
                        :disabled="isConnectingBrowser || isConnectingWalletConnect"
                        class="w-full bg-white text-black font-medium p-3 rounded-xl hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <template v-if="!isConnectingBrowser">
                    <iconify-icon icon="mdi:web" class="text-xl"></iconify-icon>
                    Injected
                  </template>
                  <template v-else>
                    <iconify-icon class="text-2xl animate-spin" icon="pixelarticons:loader" />
                    Connecting...
                  </template>
                </button>
  
                <button @click="handleConnectWallet('walletconnect')" 
                        :disabled="isConnectingBrowser || isConnectingWalletConnect"
                        class="w-full bg-white/10 border border-white/20 text-white font-medium p-3 rounded-xl hover:bg-white/20 active:bg-white/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <template v-if="!isConnectingWalletConnect">
                    <iconify-icon icon="simple-icons:walletconnect" class="text-xl"></iconify-icon>
                    WalletConnect
                  </template>
                  <template v-else>
                    <iconify-icon class="text-2xl animate-spin" icon="pixelarticons:loader" />
                    Connecting...
                  </template>
                </button>
              </div>
  
              <!-- Network Switch Button - Only show when connected but wrong network -->
              <button v-if="isConnectedStore && !isBaseNetworkStore" 
                      @click="switchToBase" 
                      class="w-full bg-white text-black font-medium p-3 rounded-xl hover:bg-white/90 active:bg-white/80 transition-colors">
                Switch to Base Network
              </button>
  
              <!-- Disconnect Button - Always show when connected -->
              <button v-if="isConnectedStore" 
                      @click="disconnectWallet" 
                      class="w-full bg-white/10 border border-red-500 text-red-500 font-medium p-3 rounded-xl hover:bg-red-500/20 active:bg-red-500/30 transition-colors">
                Disconnect
              </button>
            </div>
          </div>
        </div>
  
        <!-- Faucet Request Card -->
        <div class="w-full max-w-md border border-white/20 rounded-xl mb-4 p-6 cursor-pointer hover:border-white/40 transition-all duration-200"
             :class="[
               { 'opacity-50 pointer-events-none': !(isConnectedStore && isBaseNetworkStore) }
             ]">
          <div class="flex items-center flex-col">
            <iconify-icon icon="mdi:water" class="text-5xl mb-4"></iconify-icon>
            <p class="text-2xl font-doto mb-4">Request Test USDC</p>
            
            <div class="w-full text-center mb-4">
              <p class="text-white/50">You can request 10 USDC every 24 hours</p>
            </div>
            
            <button 
              @click="handleFaucetRequest" 
              :disabled="isRequesting" 
              class="w-full bg-white text-black font-medium p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-50"
            >
              <template v-if="!isRequesting">
                <iconify-icon icon="mdi:water" class="text-xl"></iconify-icon>
                Request 10 USDC
              </template>
              <template v-else>
                <iconify-icon class="text-2xl animate-spin" icon="pixelarticons:loader" />
                Requesting...
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useStore } from '@nanostores/vue'
    import { 
        isConnected, 
        isConnecting, 
        walletAccount, 
        connectWallet, 
        disconnectWallet, 
        switchToBase, 
        isBaseNetwork,
        initializeWallet
    } from '../stores/wallet'
    import { getAccount, writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core'
    import { wagmiConfig, ERC20_ABI, USDC_CONTRACT_ADDRESS } from '../stores/user';
    
    // Store values
    const isConnectedStore = useStore(isConnected)
    const isConnectingStore = useStore(isConnecting)
    const walletAccountStore = useStore(walletAccount)
    const isBaseNetworkStore = useStore(isBaseNetwork)
    
    // Component state
    const isConnectingBrowser = ref(false)
    const isConnectingWalletConnect = ref(false)
    const isRequesting = ref(false)
    
    // Computed
    const walletAddress = computed(() => {
        return walletAccountStore?.value?.address || '';
    });
    
    onMounted(async () => {
        await initializeWallet();
    });
    
    const handleConnectWallet = async (type) => {
        if (type === 'browser') {
            isConnectingBrowser.value = true
        } else {
            isConnectingWalletConnect.value = true
        }
        try {
            await connectWallet(type)
        } finally {
            if (type === 'browser') {
                isConnectingBrowser.value = false
            } else {
                isConnectingWalletConnect.value = false
            }
        }
    }
    
    const handleFaucetRequest = async () => {
        if (!walletAccountStore?.value?.address) {
            alert('Please connect your wallet first');
            return;
        }
    
        isRequesting.value = true;
        try {
            
            const tx = await writeContract(wagmiConfig, {
                address: USDC_CONTRACT_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'mint',
                args: [
                    walletAccountStore?.value?.address, 
                    String(10 * 1e6)
                ]
            })

            await waitForTransactionReceipt(wagmiConfig, {
                hash: tx
            })
    
            alert('Successfully requested test USDC!');
        } catch (error) {
            console.error('Error requesting from faucet:', error);
            alert('Failed to request test USDC. Please try again later.');
        } finally {
            isRequesting.value = false;
        }
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