<template>
  <div :class="[isLocked ? (isFreshLogin ? 'bg-white' : 'bg-black') : 'grid grid-cols-1 grid-rows-[auto_1fr_auto]']" class="w-full h-screen font-lexend">
    <template v-if="isLocked">

      <template v-if="isFreshLogin">


        <Gate2 @login-success="handleLoginSuccess" @register-success="handleRegisterSuccess" />

      </template>

      <template v-else>
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
    </template>
    </template>

    <template v-else>
      <div class="w-full grid grid-cols-[1fr_4fr_1fr] justify-center items-center p-4">
        <div class="w-full flex justify-start items-center">

          <!-- <div class=" text-black font-doto flex justify-center items-center text-xl">SnapPay</div> -->


        </div>
        <div class="w-full flex justify-center items-center relative">

          <div class="bg-blue-500/50 -mt-[12rem] w-[20rem] h-[20rem] absolute rounded-full blur-[5rem] z-10"></div>

          <p class="text-4xl font-doto text-center w-full z-20 text-blue-500">@{{ currentUsername }}</p>
        </div>
        <div class="w-full flex justify-end items-center">
          <button @click="isMenuOpen = true">
            <iconify-icon icon="mdi:hamburger-menu" class="text-3xl" />
          </button>
        </div>
      </div>

      <div class="w-full h-full flex justify-center items-center flex-col">
        <p class="text-2xl font-doto mb-4">Base USDC Balance</p>
        <h1 class="text-9xl font-doto">{{ usdcBalance }}</h1>
      </div>

      <div class="flex flex-col gap-1 w-full mb-8">
        <!-- <button @click="isSendDialogOpen = true" class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">Send</button> -->

        <ExpandableButton :button-id="'receive'">
          <template #button_text>Receive</template>

          <template #content>
            <Receive2 />
          </template>
        </ExpandableButton>

        <ExpandableButton :button-id="'deposit'">
          <template #button_text>Deposit</template>

          <template #content>
            <Deposit />
          </template>
        </ExpandableButton>

        <ExpandableButton :button-id="'send'">
          <template #button_text>Send</template>

          <template #content>
            <Send2  />
          </template>
        </ExpandableButton>

        <ExpandableButton>
          <template #button_text>History</template>

          <template #content>
            <History4 />
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
      <Dialog as="div" @close="isMenuOpen = false" class="relative z-50">
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
                </div>


                <div class="w-full p-4">
                  <button 
              @click="isMenuOpen = false" 
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
import { ref, onMounted, watch } from "vue";
import PatternPad2 from "./PatternPad2.vue";
import { setUsername, refreshBalance } from "../stores/user";
import HistoryDialog from "./HistoryDialog.vue";
import SendDialog from "./SendDialog.vue";
import { useStore } from "@nanostores/vue";
import ExpandableButton from "./ExpandableButton.vue";
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue';

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

onMounted(() => {
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
  const response = await fetch(`${window.location.origin}/api/balance/${currentUsername.value}`);
  const data = await response.json();
  console.log("balance data:", data);
  usdcBalance.value = data.balance / 1e6;
  if(Number.isNaN(usdcBalance.value)) {
    usdcBalance.value = 0;
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
        deleteLocalStorage();
        alert('Record deleted successfully')
        return await response.json();
    } catch (error) {
        console.error('Error deleting Pinecone record:', error);
        throw error;
    }
}

const deleteLocalStorage = () => {
  localStorage.removeItem('mukapay-face');
  window.location.href = '/app';
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

  let answer = confirm('Are you sure you want to delete your account?')
  if(!answer) return;

  if (matchedEmbedding.value && matchedEmbedding.value.id) {
    await deletePineconeRecord(matchedEmbedding.value.id);
  } else {
    deleteLocalStorage();
  }
  isMenuOpen.value = false;
}

const handleLoginSuccess = (username) => {
  setUsername(username);
    currentUsername.value = username;
    isLocked.value = false;
    getBalance();
}

const handleRegisterSuccess = (username) => {
  setUsername(username);
  currentUsername.value = username;
  isLocked.value = false;
  getBalance();
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
