<template>
  <div :class="[isLocked ? (isFreshLogin ? 'bg-white' : 'p-2') : 'grid grid-cols-1 grid-rows-[auto_1fr_auto]']" class="w-full h-screen font-lexend">
    <template v-if="isLocked">

      <template v-if="isFreshLogin">


        <Gate2 @login-success="handleLoginSuccess" @register-success="handleRegisterSuccess" />

      </template>

      <template v-else>
        <div class="bg-black w-full h-[95vh] rounded-xl">
          <div class="w-full h-full flex justify-center items-center p-8 flex-col">
            <div class="w-full text-center space-y-2">
              <p class="text-2xl font-doto text-white">Account Locked</p>
    
              <div class="text-center">
                <p class="text-sm text-gray-400">You data is encrypted and only accessible with your secret pattern</p>
              </div>
            </div>
    
            <div class="w-full flex justify-center items-center grow flex-col">
              <PatternPad2 ref="patternPadRef" color="white" @pattern-complete="handlePatternComplete" />
            </div>
    
            <div>
              <button @click="deleteLocalStorage()" class="bg-white text-black font-bold text-lg px-6 py-4 rounded-full w-full">Reset Account</button>
            </div>
          </div>
        </div>
    </template>
    </template>

    <template v-else>
      <div class="w-full grid grid-cols-[1fr_4fr_1fr] justify-center items-center p-4">
        <div class="w-full flex justify-start items-center">

          <!-- <div class=" text-black font-doto flex justify-center items-center text-xl">SnapPay</div> -->


        </div>
        <div class="w-full flex justify-center items-center relative">

          <!-- <div class="bg-blue-500/50 -mt-[12rem] w-[20rem] h-[20rem] absolute rounded-full blur-[5rem] z-10"></div> -->

          <p class="text-4xl font-doto text-center w-full z-20 text-blue-500">@{{ currentUsername }}</p>
        </div>
        <div class="w-full flex justify-end items-center">
          <button @click="isMenuOpen = true">
            <iconify-icon icon="mdi:hamburger-menu" class="text-3xl" />
          </button>
        </div>
      </div>

      <div @click="tapToRefreshBalance('wave')" class="w-full h-full flex justify-center items-center flex-col">
        <p class="text-2xl font-doto mb-4">Base USDC Balance</p>
        
        <div v-if="isLoading && refreshAnimation === 'wave'" class="grid grid-cols-3 text-9xl font-doto">
          <template v-if="isRareExpression">
            <div class="col-span-3 animate-wave-1 text-7xl">{{ currentSymbol }}</div>
          </template>
          <template v-else>
            <div class="animate-wave-1">{{ currentSymbol }}</div>
            <div class="animate-wave-2">{{ currentSymbol }}</div>
            <div class="animate-wave-3">{{ currentSymbol }}</div>
          </template>
        </div>
        <div v-else class="text-8xl font-doto">
          {{ usdcBalance }}
        </div>

        <iconify-icon :class="isLoading ? ( refreshAnimation === 'wave' ? 'scale-0' : 'animate-spin' ) : 'scale-100'" icon="pixelarticons:loader" class="text-5xl text-black/30 my-4 duration-300"></iconify-icon>
      </div>

      

      <div class="flex flex-col gap-1 w-full mb-8">
        <!-- <button @click="isSendDialogOpen = true" class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">Send</button> -->

        <ExpandableButton :button-id="'receive'" @close="handleReceiveClose" @open="handleReceiveOpen">
          <template #button_text>Receive</template>

          <template #content>
            <Receive2 ref="receiveRef" @close="handleReceiveClose" />
          </template>
        </ExpandableButton>

        

        <ExpandableButton :button-id="'send'" @close="tapToRefreshBalance('spinner')">
          <template #button_text>Send</template>

          <template #content>
            <Send2  />
          </template>
        </ExpandableButton>

        <ExpandableButton :button-id="'deposit'" @close="tapToRefreshBalance('spinner')">
          <template #button_text>Deposit</template>

          <template #content>
            <Deposit />
          </template>
        </ExpandableButton>

        <ExpandableButton @close="tapToRefreshBalance('spinner')">
          <template #button_text>History</template>

          <template #content>
            <History4 />
          </template>
        </ExpandableButton>

        <ExpandableButton :button-id="'faucet'">
          <template #button_text>Faucet</template>

          <template #content>
            <Faucet />
          </template>
        </ExpandableButton>

        <!-- <button @click="isSendDialogOpen = true" class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">Send</button>
        <button @click="gotoReceive()" class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">Receive</button>
        <button @click="gotoDeposit()" class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">Deposit</button>
        <button @click="isHistoryDialogOpen = true" class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">History</button> -->
      </div>
    </template>

    <!-- Use the imported SendDialog component -->
    <SendDialog :is-open="isSendDialogOpen" @close="isSendDialogOpen = false" @send="handleSendPayment" />

    <!-- Use the imported HistoryDialog component -->
    <HistoryDialog :is-open="isHistoryDialogOpen" @close="isHistoryDialogOpen = false" />

    <!-- Menu Dialog -->
    <TransitionRoot appear :show="isMenuOpen" as="template">
      <Dialog as="div" @close="handleMenuClose" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center flex-col">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                

                <div class="text-center py-22">
                  <div class="mb-6">
                    <span class="text-2xl font-lexend">Hey, </span>
                    <span class="text-3xl font-doto">@{{ currentUsername }}</span>
                  </div>

                  <p class="text-lg text-gray-500">Things in here are quite spicy, be careful!</p>
                </div>

                <div class="flex flex-col space-y-2 divide-y divide-gray-500 border-y border-gray-500">
                  <button 
                    @click="handleLogout" 
                    class="text-black font-bold text-xl p-3 py-6 w-full underline"
                  >
                    Logout
                  </button>
                  
                  <button 
                    @click="handleDeleteAccount" 
                    class=" text-black underline font-bold text-xl p-3 py-6 w-full"
                  >
                    Delete Account
                  </button>

                  <button 
                    @click="handleCheckUpdate" 
                    :disabled="isUpdating"
                    class="text-black underline font-bold text-xl p-3 py-6 w-full flex items-center justify-center gap-2"
                  >
                    <template v-if="!isUpdating">
                      Force Update
                    </template>
                    <template v-else>
                      <iconify-icon class="text-2xl animate-spin" icon="pixelarticons:loader" />
                      Updating...
                    </template>
                  </button>

                  <button 
                    @click="handleLockWallet" 
                    class="text-black underline font-bold text-xl p-3 py-6 w-full"
                  >
                    Lock Wallet
                  </button>
                </div>


                <div class="w-full p-4">
                  <button 
                    @click="handleMenuClose" 
                    class="bg-red-600 text-white p-4 w-full max-w-md mt-4 rounded-2xl text-xl font-bold"
                  >
                    Close
                  </button>
                </div>


              </DialogPanel>
            </TransitionChild>
            
            
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from "vue";
import PatternPad2 from "./PatternPad2.vue";
import { setUsername, refreshBalance, wagmiConfig, walletAccount } from "../stores/user";
import HistoryDialog from "./HistoryDialog.vue";
import SendDialog from "./SendDialog.vue";
import Faucet from "./Faucet.vue";
import { useStore } from "@nanostores/vue";
import ExpandableButton from "./ExpandableButton.vue";
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue';
import { registerSW } from 'virtual:pwa-register'
import { getAccount, getConnectors, connect, disconnect, switchChain, reconnect } from '@wagmi/core'
import { baseSepolia } from 'wagmi/chains'

import Gate2 from "./Gate2.vue";

const isLocked = ref(true);
const matchedEmbedding = ref(null);
const currentUsername = ref(null);
const usdcBalance = ref(0);
const isSendDialogOpen = ref(false);
const isHistoryDialogOpen = ref(false);
const isMenuOpen = ref(false);
const patternPadRef = ref(null);

const refreshBalanceStore = useStore(refreshBalance);

import Receive2 from "./Receive2.vue";
import Deposit from "./Deposit.vue";
import Send2 from "./Send2.vue";
import History4 from "./History4.vue";

const isFreshLogin = ref(false);

const isRefreshing = ref(false);
const isLoading = ref(true);
const isUpdating = ref(false);

const refreshAnimation = ref('wave');

const receiveRef = ref(null);

// Add random symbols array with single characters
const loadingSymbols = ['.', '*', '!', '?', '#', '@', '$', '%', '&', '+', '-', '='];
const rareExpressions = ['^_^', '>_<', '=.=', ':-)'];
const currentSymbol = ref('.');
const previousSymbol = ref('');
const isRareExpression = ref(false);

const getRandomSymbol = () => {
  let newSymbol;
  let isRare;
  
  // 20% chance to get a rare expression
  isRare = Math.random() < 0.5;
  
  if (isRare) {
    do {
      newSymbol = rareExpressions[Math.floor(Math.random() * rareExpressions.length)];
    } while (newSymbol === previousSymbol.value);
  } else {
    do {
      newSymbol = loadingSymbols[Math.floor(Math.random() * loadingSymbols.length)];
    } while (newSymbol === previousSymbol.value);
  }
  
  previousSymbol.value = newSymbol;
  isRareExpression.value = isRare;
  return newSymbol;
};

const updateLoadingSymbols = () => {
  currentSymbol.value = getRandomSymbol();
};

// Add wallet connection state
const isConnected = ref(false);
const walletAccountStore = useStore(walletAccount);

// Add wallet connection methods
const connectWallet = async () => {
    const _connectors = getConnectors(wagmiConfig)
    // If window.ethereum is undefined, use WalletConnect (second connector)
    const connector = window.ethereum ? _connectors[0] : _connectors[1]
    await connect(wagmiConfig, { connector })
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
    return walletAccountStore?.value?.chainId === baseSepolia.id;
})

onMounted(async () => {
  /// get face embedding from local storage
  const faceEmbedding = localStorage.getItem("mukapay-face");
  if (faceEmbedding) {
    isFreshLogin.value = false;
    matchedEmbedding.value = JSON.parse(faceEmbedding);
  } else {
    isFreshLogin.value = true;
  }

  // Watch the store value
  watch(refreshBalanceStore, (newValue) => {
    console.log("refreshBalance changed to:", newValue);
    if (currentUsername.value) {
      getBalance();
    }
  });
  
  // remove loading container
  let loadingContainer = document.getElementById('loading-container')
  if (loadingContainer) {
    loadingContainer.remove();
  }
  
  // Add wallet connection listener
  window.addEventListener('connect-wallet', connectWallet);
  window.addEventListener('disconnect-wallet', disconnectWallet);
  window.addEventListener('switch-to-base', switchToBase);

  // Reconnect wallet if previously connected
  reconnect(wagmiConfig);
  const account = getAccount(wagmiConfig)
  if(account) {
    console.log('account:', account)
    walletAccount.set(account);
    isConnected.value = account.isConnected;
  }
});

// Clean up event listeners
onUnmounted(() => {
    window.removeEventListener('connect-wallet', connectWallet);
    window.removeEventListener('disconnect-wallet', disconnectWallet);
    window.removeEventListener('switch-to-base', switchToBase);
});

// Add these helper functions at the top of your script section
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Helper function to convert base64 to string
function base64ToString(base64) {
  return atob(base64);
}

// Function to get encryption key from password
async function getEncryptionKey(password) {
  const keyMaterial = await window.crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("your-secure-salt"), // Use a secure salt
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Decryption function
async function decryptMetadata(encryptedData, pin) {
  try {
    const encryptionKey = pin;
    const key = await getEncryptionKey(encryptionKey);

    // Convert base64 to Uint8Array
    const encryptedArray = new Uint8Array(
      base64ToString(encryptedData)
        .split("")
        .map((c) => c.charCodeAt(0))
    );

    // Extract IV and encrypted content
    const iv = encryptedArray.slice(0, 12);
    const content = encryptedArray.slice(12);

    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      content
    );

    return JSON.parse(decoder.decode(decryptedData));
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
    // throw error;
  }
}

const handlePatternComplete = async (pattern) => {
  const decryptedUsername = await decryptMetadata(matchedEmbedding.value.metadata.username, pattern);
  console.log("decryptedUsername:", decryptedUsername);

  if (decryptedUsername) {
    setUsername(decryptedUsername);
    currentUsername.value = decryptedUsername;
    isLocked.value = false;
    getBalance();
  } else {
    isLocked.value = true;
    patternPadRef.value?.clearPattern();
    alert("Wrong pattern");
  }

  // isLocked.value = false;
};

const getBalance = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`${window.location.origin}/api/balance/${currentUsername.value}`);
    const data = await response.json();
    console.log("balance data:", data);
    usdcBalance.value = data.balance / 1e6;
    if(Number.isNaN(usdcBalance.value)) {
      usdcBalance.value = 0;
    }
  } catch (error) {
    console.error("Error fetching balance:", error);
    usdcBalance.value = 0;
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 1000); // Keep loading state for at least 1 second for smooth animation
  }
};

const gotoReceive = () => {
  window.location.href = "/receive";
};

const gotoDeposit = () => {
  window.location.href = `/deposit?username=${currentUsername.value}`;
};

const handleSendPayment = (payment) => {
    // Implement payment logic here
    console.log('Sending payment:', payment)
    isSendDialogOpen.value = false
}

async function deletePineconeRecord(id) {

  const answer = confirm('Are you sure you want to delete this record?')
  if(!answer) return;
  
    try {
        const response = await fetch('https://face4-ff60525.svc.aped-4627-b74a.pinecone.io/vectors/delete', {
            method: 'POST',
            headers: {
                'Api-Key': 'pcsk_65jcaw_DxQsFPjgiuo5pTiYBsovpdYo7DsPALMLM5bKMzCxLgnm5rrWh8NxibVMDrCC8qG',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ids: [id]
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to delete: ${response.statusText}`);
        }
        localStorage.removeItem('mukapay-face');
        alert('Record deleted successfully')
        window.location.href = '/';
        return await response.json();
    } catch (error) {
        console.error('Error deleting Pinecone record:', error);
        throw error;
    }
}

const deleteLocalStorage = () => {
  console.log('deleteLocalStorage called')
  // localStorage.removeItem('mukapay-face');
  // window.location.href = '/';
}

const handleLogout = () => {

  let answer = confirm('Are you sure you want to logout?')
  if(!answer) return;

  localStorage.removeItem('mukapay-face');
  
  // delete local storage
  // deleteLocalStorage();

  isMenuOpen.value = false;
  isLocked.value = true;
  
  window.location.reload();
}

const handleDeleteAccount = async () => {

  // let answer = confirm('Are you sure you want to delete your account?')
  // if(!answer) return;

  console.log('matchedEmbedding.value', matchedEmbedding.value, !matchedEmbedding.value)
  // return;

  if(!matchedEmbedding.value) {
    deleteLocalStorage();
    return;
  }

  console.log('handleDeleteAccount called', matchedEmbedding.value.id)
  await deletePineconeRecord(matchedEmbedding.value.id);

  return;

  if (matchedEmbedding.value && matchedEmbedding.value.id) {
    await deletePineconeRecord(matchedEmbedding.value.id);
  } else {
    deleteLocalStorage();
  }
  // deleteLocalStorage();
  isMenuOpen.value = false;
}

const handleLoginSuccess = (username) => {
  setUsername(username);
    currentUsername.value = username;
    isLocked.value = false;
    matchedEmbedding.value = localStorage.getItem('mukapay-face');
    getBalance();
}

const handleRegisterSuccess = (username) => {
  setUsername(username);
  currentUsername.value = username;
  isLocked.value = false;
  getBalance();
}

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  }
})

const handleCheckUpdate = async () => {
  if (updateSW) {
    isUpdating.value = true;
    await updateSW();
    // The app will reload automatically after update
    window.location.reload();
  }

  isUpdating.value = false;
}

const handleLockWallet = () => {
  isMenuOpen.value = false;
  isLocked.value = true;
  isFreshLogin.value = false;
  patternPadRef.value?.clearPattern();
}

const tapToRefreshBalance = async (animation) => {
  refreshAnimation.value = animation;
  if (!isLoading.value) {
    updateLoadingSymbols();
    await getBalance();
  }
}

const handleMenuClose = () => {
  isMenuOpen.value = false;
  if (!isLoading.value) {
    tapToRefreshBalance('spinner');
  }
}

const handleReceiveOpen = () => {
    console.log('Wallet2: handleReceiveOpen called');
    if (receiveRef.value) {
        console.log('Wallet2: Found receiveRef, calling resetReceive');
        receiveRef.value.resetReceive();
    }
}

const handleReceiveClose = () => {
    console.log('Wallet2: handleReceiveClose called');
    if (receiveRef.value) {
        console.log('Wallet2: Found receiveRef, calling closeReceive');
        receiveRef.value.closeReceive();
    }
    tapToRefreshBalance('spinner');
}

const handleFaucet = () => {


  console.log('handleFaucet handleFaucet handleFaucet')


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

@keyframes wave {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-wave-1 {
  animation: wave 1s ease-in-out infinite;
  animation-delay: 0s;
}

.animate-wave-2 {
  animation: wave 1s ease-in-out infinite;
  animation-delay: 0.2s;
}

.animate-wave-3 {
  animation: wave 1s ease-in-out infinite;
  animation-delay: 0.4s;
}
</style>
