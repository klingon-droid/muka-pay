<template>
  <main class="w-[100dvw] h-[100dvh] font-lexend flex flex-col justify-between overflow-hidden bg-gray-50/50 pb-6">
    <!-- Top section with logo and title -->
    <div class="w-full flex justify-center items-center flex-col pt-12">
      <!-- <div 
        class="w-20 h-20 bg-black rounded-2xl shadow-lg mb-4 text-white text-center font-doto text-4xl flex justify-center items-center transform hover:rotate-12 transition-all duration-500"
      >
        S;P
      </div> -->

      <div class="w-20 h-20">
        <img src="/logo.png" alt="Snap Pay" class="w-full h-full object-contain">
      </div>

      <div class="text-center mb-4">
        <p class="text-xs text-black/50 mb-1">Welcome to</p>
        <h1 class="text-4xl font-doto">Snap Pay</h1>
      </div>
    </div>

    <!-- Middle section with acknowledgments -->
    <div class="w-full max-w-sm mx-auto px-5 flex-grow flex items-center">
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 w-full">
        <h2 class="font-bold text-base mb-3 text-center text-gray-800">Please Note</h2>
        
        <div class="space-y-3 text-gray-700">
          <p class="text-xs text-center mb-8">
            By using Snap Pay, you agree to the following:
          </p>
          
          <ul class="space-y-4 text-xs">
            <li>Face Recognition is used to secure on-chain payments</li>
            <li>We don't store images of your face</li>
            <li>Your face embeddings are encrypted with your PIN</li>
            <li>You can delete your data anytime via settings</li>
            <li>Authentication uses secure Zero-Knowledge proofs</li>
          </ul>
          
          <p class="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
            We are not liable for any loss of funds. Use at your own risk.
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom section with button -->
    <div class="w-full text-center p-5">
      <button 
        @click="handleConsent"
        class="bg-black text-white py-3 px-6 text-base rounded-lg flex items-center justify-center w-full max-w-sm mx-auto shadow-md hover:bg-gray-900 transition-all active:scale-98 duration-200"
      >
        <span class="mr-2">I Understand & Agree</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </button>
    </div>
  </main>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // Add fade-in animation when component mounts
  document.querySelector('main').classList.add('animate-fade-in');
});

const handleConsent = () => {
  localStorage.setItem('mukapay-consent', 'true');
  window.location.href = '/';
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
  font-weight: 900;
  font-style: normal;
  font-variation-settings: "wdth" 100;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.active\:scale-98:active {
  transform: scale(0.98);
}
</style>
