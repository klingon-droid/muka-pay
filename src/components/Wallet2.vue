<template>
  <div :class="[isLocked ? 'bg-black' : 'grid grid-cols-1 grid-rows-[auto_1fr_auto]']" class="w-full h-screen font-lexend">
    <template v-if="isLocked">
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
          <button class="bg-white text-black font-bold text-lg px-6 py-4 rounded-full w-full">Reset Account</button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="w-full grid grid-cols-[2rem_1fr_2rem] justify-center items-center p-4">
        <div></div>
        <p class="text-2xl font-doto text-center w-full">@{{ currentUsername }}</p>
        <div class="w-full flex justify-end items-center">
          <button>
            <iconify-icon icon="mdi:hamburger-menu" class="text-2xl" />
          </button>
        </div>
      </div>

      <div class="w-full h-full flex justify-center items-center flex-col">
        <p class="text-2xl font-doto mb-4">Base USDC Balance</p>
        <h1 class="text-9xl font-doto">{{ usdcBalance }}</h1>
      </div>

      <div class="flex flex-col gap-1 pb-3 w-full px-3">
        <button @click="isSendDialogOpen = true" class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">Send</button>
        <button @click="gotoReceive()" class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">Receive</button>
        <button @click="gotoDeposit()" class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">Deposit</button>
        <button @click="isHistoryDialogOpen = true" class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">History</button>
      </div>
    </template>

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
import { ref, onMounted, watch } from "vue";
import PatternPad2 from "./PatternPad2.vue";
import { setUsername, refreshBalance } from "../stores/user";
import HistoryDialog from './HistoryDialog.vue'
import SendDialog from './SendDialog.vue'
import { useStore } from '@nanostores/vue'

const isLocked = ref(true);
const matchedEmbedding = ref(null);
const currentUsername = ref(null);
const usdcBalance = ref(0);
const isSendDialogOpen = ref(false)
const isHistoryDialogOpen = ref(false)
const patternPadRef = ref(null);

const refreshBalanceStore = useStore(refreshBalance);

onMounted(() => {
  /// get face embedding from local storage
  const faceEmbedding = localStorage.getItem('mukapay-face');
  if (faceEmbedding) {
      matchedEmbedding.value = JSON.parse(faceEmbedding);
  }

  // Watch the store value
  watch(refreshBalanceStore, (newValue) => {
      console.log('refreshBalance changed to:', newValue);
      if(currentUsername.value) {
        getBalance();
      }
  });


})




// Add these helper functions at the top of your script section
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Helper function to convert base64 to string
function base64ToString(base64) {
    return atob(base64);
}


// Function to get encryption key from password
async function getEncryptionKey(password) {
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('your-secure-salt'),  // Use a secure salt
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// Decryption function
async function decryptMetadata(encryptedData, pin) {
    try {
        const encryptionKey = pin;
        const key = await getEncryptionKey(encryptionKey);

        // Convert base64 to Uint8Array
        const encryptedArray = new Uint8Array(
            base64ToString(encryptedData).split('').map(c => c.charCodeAt(0))
        );

        // Extract IV and encrypted content
        const iv = encryptedArray.slice(0, 12);
        const content = encryptedArray.slice(12);

        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            content
        );

        return JSON.parse(decoder.decode(decryptedData));
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
        // throw error;
    }
}

const handlePatternComplete = async (pattern) => {

  const decryptedUsername = await decryptMetadata(matchedEmbedding.value.metadata.username, pattern)
  console.log('decryptedUsername:', decryptedUsername);

  if(decryptedUsername) {
      setUsername(decryptedUsername);
      currentUsername.value = decryptedUsername;
      isLocked.value = false; 
      getBalance();
  } else {
    isLocked.value = true;
    patternPadRef.value?.clearPattern();
    alert('Wrong pattern');
  }
  
  // isLocked.value = false;
};




const getBalance = async () => {
    const response = await fetch(`${window.location.origin}/api/balance/${currentUsername.value}`);
    const data = await response.json();
    console.log('balance data:', data);
    usdcBalance.value = data.balance / 1e6;
}

const gotoReceive = () => {
    window.location.href = '/receive'
}

const gotoDeposit = () => {
    window.location.href = `/deposit?username=${currentUsername.value}`
}


const handleSendPayment = (payment) => {
    // Implement payment logic here
    console.log('Sending payment:', payment)
    isSendDialogOpen.value = false
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
