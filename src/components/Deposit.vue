<template>
  <div class="w-full h-full overflow-y-auto  text-white font-lexend grid grid-rows-[auto_1fr_auto]">
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
            <div v-if="!isConnectedStore" class="w-full grid grid-cols-2 gap-2">
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

      <!-- Combined Amount and Deposit Card -->
      <div class="w-[90%] max-w-md border border-white/20 rounded-xl mb-4 p-6 cursor-pointer hover:border-white/40 transition-all duration-200"
           :class="[
             { 'opacity-50 pointer-events-none': !(isConnectedStore && isBaseNetworkStore) }
           ]">
        <div class="flex items-center flex-col">
          <iconify-icon icon="mdi:bank-transfer" class="text-5xl mb-4"></iconify-icon>
          <p class="text-2xl font-doto mb-4">Deposit Base USDC</p>
          
          <!-- Balance Display -->
          <div v-if="isConnectedStore" class="w-full flex justify-end items-center mb-4">
            <div class="flex items-center gap-2 text-sm text-white/50">
              <span>Balance: {{ usdcBalance }} USDC</span>
              <button @click="refreshBalance"
                      class="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center"
                      :disabled="isRefreshingBalance">
                <iconify-icon :class="{ 'animate-spin': isRefreshingBalance }" icon="mdi:refresh" class="text-white text-xl" />
              </button>
            </div>
          </div>
          
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
              :disabled="isApprovalSufficient || !inputAmount || isApproving" 
              class="w-full bg-white text-black font-medium p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-50"
              :class="{'bg-green-500 text-white': isApprovalSufficient}"
            >
              <template v-if="!isApproving">
                <iconify-icon icon="mdi:check-circle" class="text-xl"></iconify-icon>
                {{ isApprovalSufficient ? `Approved ${inputAmount} USDC` : `Approve ${inputAmount} USDC` }}
              </template>
              <template v-else>
                <iconify-icon class="text-2xl animate-spin" icon="pixelarticons:loader" />
                Approving...
              </template>
            </button>
            
            <button 
              @click="handleDeposit" 
              :disabled="!isApprovalSufficient || !inputAmount || isDepositing" 
              class="w-full bg-white text-black font-medium p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-50"
            >
              <template v-if="!isDepositing">
                <iconify-icon icon="mdi:bank-transfer" class="text-xl"></iconify-icon>
                Deposit {{ inputAmount }} USDC
              </template>
              <template v-else>
                <iconify-icon class="text-2xl animate-spin" icon="pixelarticons:loader" />
                Depositing...
              </template>
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
    import { ref, onMounted, computed, watch } from 'vue';
    import { useStore } from '@nanostores/vue'
    import { 
      isConnected, 
      isConnecting, 
      isSwitchingNetwork, 
      walletAccount, 
      connectWallet, 
      disconnectWallet, 
      switchToBase, 
      isBaseNetwork,
      initializeWallet,
      isAutoConnecting
    } from '../stores/wallet'
    import { 
      ERC20_ABI, 
      VAULT_CONTRACT_ADDRESS, 
      USDC_CONTRACT_ADDRESS, 
      getUsernameHash, 
      VAULT_ABI, 
      username,
      wagmiConfig 
    } from '../stores/user'
    import { getAccount, writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core'
    import { baseSepolia } from 'wagmi/chains'
    import { formatUnits } from 'viem'

    // Store values
    const isConnectedStore = useStore(isConnected)
    const isConnectingStore = useStore(isConnecting)
    const isSwitchingNetworkStore = useStore(isSwitchingNetwork)
    const walletAccountStore = useStore(walletAccount)
    const isBaseNetworkStore = useStore(isBaseNetwork)
    const isAutoConnectingStore = useStore(isAutoConnecting)

    // Add individual loading states for each button
    const isConnectingBrowser = ref(false)
    const isConnectingWalletConnect = ref(false)

    const isAmountConfirmed = ref(false);
    const isApprovalSufficient = ref(false);
    const currentUsername = ref('');
    const inputAmount = ref(0);
    const isApproving = ref(false);
    const isDepositing = ref(false);
    const usdcBalance = ref('0');
    const isRefreshingBalance = ref(false);

    // Add a computed property for the wallet address
    const walletAddress = computed(() => {
        return walletAccountStore?.value?.address || '';
    });

    const fetchUSDCBalance = async () => {
        if (!walletAccountStore?.value?.address) return;
        
        isRefreshingBalance.value = true;
        try {
            const balance = await readContract(wagmiConfig, {
                address: USDC_CONTRACT_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [walletAccountStore.value.address]
            });
            console.log('Raw balance:', balance);
            usdcBalance.value = Number(formatUnits(balance, 6)).toFixed(2);
        } catch (error) {
            console.error('Error fetching USDC balance:', error);
            usdcBalance.value = '0';
        } finally {
            isRefreshingBalance.value = false;
        }
    };

    const refreshBalance = () => {
        fetchUSDCBalance();
    };

    onMounted(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        currentUsername.value = urlParams.get('username') || username.value;
        
        // Auto-connect wallet
        await initializeWallet();
    });

    // Watch for wallet connection changes to update balance
    watch([isConnectedStore, walletAccountStore], async ([newIsConnected, newAccount]) => {
        console.log('Wallet state changed:', {
            isConnected: newIsConnected,
            account: newAccount
        });
        if (newIsConnected && newAccount?.address) {
            await fetchUSDCBalance();
        }
    });

    const confirmAmount = () => {
        isAmountConfirmed.value = true;
    }

    const checkApproval = async () => {
        if (!walletAccountStore?.value?.address) {
            console.error('No wallet address available');
            return false;
        }

        try {
            const allowance = await readContract(wagmiConfig, {
                address: USDC_CONTRACT_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [
                    walletAccountStore.value.address,
                    VAULT_CONTRACT_ADDRESS
                ]
            })
            console.log('allowance:', allowance)
            return Number(formatUnits(allowance, 6)) >= Number(inputAmount.value);
        } catch (error) {
            console.error('Error checking allowance:', error);
            return false;
        }
    }

    const handleApproval = async () => {
        if (!walletAccountStore?.value?.address) {
            alert('Please connect your wallet first');
            return;
        }

        if (!inputAmount.value || inputAmount.value <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const allowed = await checkApproval();
        if(allowed) {
            isApprovalSufficient.value = true;
            return;
        }

        isApproving.value = true;
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
        } finally {
            isApproving.value = false;
        }
    }

    const handleDeposit = async () => {
        if (!walletAccountStore?.value?.address) {
            alert('Please connect your wallet first');
            return;
        }

        if (!inputAmount.value || inputAmount.value <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (!isApprovalSufficient.value) {
            alert('Please approve the USDC amount first');
            return;
        }

        isDepositing.value = true;
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

            isAmountConfirmed.value = false;
            isApprovalSufficient.value = false;
            inputAmount.value = 0;
            await fetchUSDCBalance(); // Refresh balance after successful deposit
            alert('Deposit successful');

        } catch (error) {
            console.error('Error depositing:', error)
            alert('Failed to deposit. Please try again.');
        } finally {
            isDepositing.value = false;
        }
    }

    const copyLink = () => {
        const link = `${window.location.origin}?username=${currentUsername.value}`;
        navigator.clipboard.writeText(link);
        alert('Link copied to clipboard');
    }

    // Update the connectWallet function to handle individual loading states
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