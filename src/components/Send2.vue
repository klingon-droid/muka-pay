<template>
  <div class="w-full h-full overflow-y-auto bg-black text-white font-lexend grid grid-rows-[auto_1fr_auto]">
    <nav class="w-full text-right text-white p-6 font-doto text-4xl">
        Send
    </nav>
    
    <div v-if="currentStep !== 'summary' && currentStep !== 'result' && currentStep !== 'type'" class="text-center space-y-8 text-white mt-22">
      <div v-if="currentStep === 'amount'" class="text-5xl font-bold break-all flex justify-center items-center flex-wrap font-doto">
        <p v-if="amount">{{ amount }}</p>
        <p v-else class="text-white/20 whitespace-nowrap p-4">Enter amount</p>
        <p class="ml-2 text-4xl text-white/50">Base USDC</p>
      </div>
      
      <div v-if="currentStep === 'recipient'" class="flex flex-col items-center gap-4">
        <p class="text-2xl">Send {{ amount }} USDC to: AAAAAAA</p>
        <div class="flex items-center">
          <span class="text-2xl mr-2">@</span>
          <input 
            v-model="recipient" 
            type="text" 
            class="bg-white/10 text-white rounded-xl p-4 text-2xl"
            placeholder="username"
          />
        </div>
      </div>
    </div>

    <div v-if="currentStep === 'amount'" class="h-[50vh] grid grid-rows-[1fr_auto] w-full">
      <div class="w-full h-full p-4">
        <div class="w-full h-full grid grid-cols-3 grid-rows-4 gap-2">
          <button 
            v-for="key in keypadKeys" 
            :key="key"
            @click="handleKeyPress(key)"
            class="bg-white/10 text-white hover:bg-gray-200 active:bg-gray-300 rounded-xl flex items-center justify-center text-3xl font-bold transition-colors duration-100 font-doto"
          >
            {{ key }}
          </button>
        </div>
      </div>

      <div class="p-4 w-full pb-8">
        <button 
          @click="submitAmount"
          :disabled="!amount || Number(amount) <= 0"
          class="bg-white text-black rounded-xl p-4 w-full text-lg hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>

    <div v-if="currentStep === 'type'" class="w-full h-full flex justify-end items-center flex-col">

      <p class="w-full text-center text-white text-2xl mb-12">Select Receipient Type</p>

      <div class="w-full h-[50vh] grid grid-rows-2 p-4 gap-2">
        
        <div 
          @click="selectType('username')" 
          class="w-full h-full flex justify-between items-center border border-white/20 rounded-xl text-2xl font-doto flex-col p-4 cursor-pointer transition-all duration-200"
          :class="{ 'ring-2 ring-white ring-offset-2 ring-offset-black': selectedType === 'username' }"
        >
          <div class="flex items-center flex-col grow justify-center" >
            <iconify-icon icon="mdi:at" class="text-4xl mb-6"></iconify-icon>
            <p>Username</p>
          </div>

          <div :class="[selectedType === 'username'?'h-12':'h-0']" class="w-full duration-200 overflow-hidden">
            <input v-model="recipient" type="text" class="bg-white/10 text-white rounded-xl p-2 px-4 w-full" placeholder="Enter username">
          </div>
        </div>
  
        <div 
          @click="selectType('ethereum')" 
          class="w-full h-full flex justify-between items-center border border-white/20 rounded-xl text-2xl font-doto flex-col p-4 cursor-pointer transition-all duration-200"
          :class="{ 'ring-2 ring-white ring-offset-2 ring-offset-black': selectedType === 'ethereum' }"
        >
          <div class="flex items-center flex-col grow justify-center">
            <iconify-icon icon="mdi:ethereum" class="text-4xl mb-6"></iconify-icon>
            <p>Ethereum Address</p>
          </div>

          <div :class="[selectedType === 'ethereum'?'h-12':'h-0']" class="w-full duration-200 overflow-hidden">
            <input v-model="recipient" type="text" class="bg-white/10 text-white rounded-xl p-2 px-4 w-full" placeholder="Enter ethereum address">
          </div>
        </div>

      </div>

      <div class="w-full grid grid-cols-2 gap-2 p-4 pt-0">
        <button 
          @click="goBackFromType"
          class="bg-white/10 text-white rounded-xl p-4 w-full text-lg hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          Back
        </button>
        <button 
          @click="submitReceipient"
          :disabled="!selectedType"
          class="bg-white text-black rounded-xl p-4 w-full text-lg hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      

    </div>
    
    <div v-if="currentStep === 'summary'" class="w-full p-4 grid grid-rows-[1fr_auto]">
      
      <div class="w-full h-full flex flex-col justify-start items-center">
        <div class="py-22 text-center">
          <p class="text-white text-4xl">Going to send</p>  

          <div class="flex justify-center items-center flex-wrap space-x-4 py-12 font-doto">
            <p class="text-5xl">{{ amount }}</p>
            <p class="text-3xl text-white/50">Base USDC</p>
          </div>

          <div class="flex justify-center items-center flex-wrap space-x-4">
            <div class="text-4xl">To</div>
            <div class="ml-2 bg-white text-black py-2 px-4 rounded-full text-xl ">{{ computedRecipient }}</div>
          </div>
        </div>

        
        
      </div>



      <div class="w-full">

        
        <button v-if="!isSending" @click="clickDialog()" class="pointer-events-auto bg-white text-black p-4 rounded-xl gap-2 disabled:opacity-50 hover:bg-white/90 active:bg-white/80 transition-colors w-full flex justify-center items-center text-xl mb-4">
            <p>Sign and Send</p>
            <iconify-icon class="text-4xl" icon="mage:dots-menu" />
        </button>
        <button v-if="isSending" class="pointer-events-auto bg-white text-black p-4 rounded-xl gap-2 disabled:opacity-50 hover:bg-white/90 active:bg-white/80 transition-colors w-full flex justify-center items-center text-xl mb-4">
            <p>Signing...</p>
            <iconify-icon :class="isSending ? 'animate-[spin_3s_linear_infinite]' : ''" class="text-4xl" icon="mage:dots-menu" />
        </button>

        <Teleport to="body">
            <PatternSignDialog 
                :is-open="showPatternDialog"
                @close="closePatternDialog"
                @pattern-complete="handlePatternComplete"
            />
        </Teleport>

        <button 
          @click="goBackFromType"
          :disabled="isSending"
          class="bg-white/10 text-white rounded-xl p-4 w-full text-lg hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          Back
        </button>
        
      </div>
    </div>

    <div v-if="currentStep === 'result'" class="w-full h-full grid grid-rows-[1fr_auto]">

      <div class="w-full h-full flex flex-col justify-center items-center">
        <div class="py-22 text-center">
          <p class="text-white text-4xl">Sent</p>  

          <div class="flex justify-center items-center flex-wrap space-x-4 py-12 font-doto">
            <p class="text-5xl">{{ amount }}</p>
            <p class="text-3xl text-white/50">Base USDC</p>
          </div>

          <div class="flex justify-center items-center flex-wrap space-x-4">
            <div class="text-4xl">To</div>
            <div class="ml-2 bg-white text-black py-2 px-4 rounded-full text-xl ">{{ computedRecipient }}</div>
          </div>
        </div>

        
        
      </div>

      <div class="w-full p-4">
        <button @click="done" class="bg-white text-black rounded-xl p-4 text-lg hover:bg-white/10 active:bg-white/20 transition-colors w-full">
          <p>Done</p>
        </button>
      </div>


    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useEventBus } from '@vueuse/core'
import { generateProof, username, refreshBalance, getUsernameHash } from '../stores/user';
import { parseUnits, isAddress } from 'viem';

const isSending = ref(false);
const eventBus = useEventBus('expButton');
const amount = ref('');
const recipient = ref('');
const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '←'];
const currentStep = ref('amount');
const selectedType = ref('');
const showPatternDialog = ref(false);

import PatternSignDialog from './PatternSignDialog.vue';

const handleKeyPress = (key) => {
  if (key === '←') {
    amount.value = amount.value.slice(0, -1);
  } else if (key === '.') {
    if (!amount.value.includes('.')) {
      amount.value += '.';
    }
  } else {
    amount.value += key;
  }
};

const submitAmount = () => {
  if (!amount.value || Number(amount.value) <= 0) return;
  currentStep.value = 'type';
};

const selectType = (type) => {
  selectedType.value = type;
};

const goToRecipientStep = () => {
  if (!amount.value || !selectedType.value) return;
  currentStep.value = 'recipient';
};

const submitReceipient = () => {
  if (!amount.value || !selectedType.value) return;

  if(selectedType.value === 'ethereum') {
    if(!isAddress(recipient.value)) {
      alert('Invalid ethereum address');
      return;
    }
  }
  currentStep.value = 'summary';
};

const goToAmountStep = () => {
  currentStep.value = 'amount';
};

const goBackFromType = () => {
  if(isSending.value) return;
  currentStep.value = 'amount';
};

const handleConfirm = () => {
  if (!amount.value || !recipient.value) return;
  console.log('Sending', amount.value, 'USDC to', recipient.value, 'via', selectedType.value);
  // Add additional logic for confirming payment
};

const clickDialog = () => {
    console.log('clickDialog')

    isSending.value = true;
    showPatternDialog.value = true;
}


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
    console.log('handlePatternComplete')
    showPatternDialog.value = false;

    const candidate = JSON.parse(localStorage.getItem('mukapay-face'));
    const decryptedUsername = await decryptMetadata(candidate.metadata.username, pattern);
    if(decryptedUsername !== username.value){
      isSending.value = false;
      alert('Invalid pattern')
      return;
    }

    const proof = await generateProof(username.value, pattern)
    console.log('proof:', proof)

    if(selectedType.value === 'username') {
      await handleSend(proof);
    } else if (selectedType.value === 'ethereum') {
      await handleWithdraw(proof);
    }

    // resetSend();
    // currentStep.value = 'result';
}

const done = (event) => {
  document.getElementById(`close-send`).click();
  resetSend();
}

const closePatternDialog = (_action) => {
  if(_action === 'cancel') {
    isSending.value = false;
  }
  showPatternDialog.value = false;
}

const handleSend = async (_proof) => {
  console.log('handleSend')
  // currentStep.value = 'result';

  try {

    console.log('amount:', amount.value)
    console.log('recipient:', recipient.value)

    const payload = {
        "proof": _proof,
        "amount": parseUnits(String(amount.value), 6).toString(),
        "to_hash": await getUsernameHash(recipient.value),
    }
    console.log('payload:', payload)

    const response = await fetch(`${window.location.origin}/api/pay`, {
        method: 'POST',
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        console.log('Failed to send:', response)
    } else {
        const data = await response.json()
        refreshBalance.set(Date.now());
        console.log('Payment response:', data)
        currentStep.value = 'result';
    }

    } catch (error) {
      console.error('Error paying:', error)
      console.log('Failed to send:', error)
    }
}

const handleWithdraw = async(_proof) => {
  console.log('handleWithdraw')
  // currentStep.value = 'result';

  try {

    console.log('amount:', amount.value)
    console.log('recipient:', recipient.value)

    const payload = {
        "proof": _proof,
        "amount": parseUnits(String(amount.value), 6).toString(),
        "to_user_address": recipient.value,
    }
    console.log('payload:', payload)

    const response = await fetch('/api/withdraw', {
        method: 'POST',
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        console.log('Failed to send:', response)
    } else {
        const data = await response.json()
        refreshBalance.set(Date.now());
        console.log('Payment response:', data)
        currentStep.value = 'result';
    }

    } catch (error) {
      console.error('Error paying:', error)
      console.log('Failed to send:', response)
    }

}


const computedRecipient = computed(() => {
  if (selectedType.value === 'username') {
    return '@' + recipient.value;
  } else {
    return recipient.value;
  }
})

const resetSend = () => {
  amount.value = '';
  recipient.value = '';
  currentStep.value = 'amount';
  selectedType.value = '';
  showPatternDialog.value = false;
  isSending.value = false;
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