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
          <PatternPad2 color="white" @pattern-complete="handlePatternComplete" />
        </div>

        <div>
          <button class="bg-white text-black font-bold text-lg px-6 py-4 rounded-full w-full">Reset Account</button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="w-full grid grid-cols-[2rem_1fr_2rem] justify-center items-center p-4">
        <div></div>
        <p class="text-2xl font-doto text-center w-full">@username</p>
        <div class="w-full flex justify-end items-center">
          <button>
            <iconify-icon icon="mdi:hamburger-menu" class="text-2xl" />
          </button>
        </div>
      </div>

      <div class="w-full h-full flex justify-center items-center flex-col">
        <p class="text-2xl font-doto mb-4">Base USDC Balance</p>
        <h1 class="text-9xl font-doto">1000</h1>
      </div>

      <div class="flex flex-col gap-1 pb-3 w-full px-3">
        <button class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">Send</button>
        <button class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">Receive</button>
        <button class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">Deposit</button>
        <button class="bg-black text-white font-bold text-xl p-4 py-6 rounded-full w-full">History</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PatternPad2 from "./PatternPad2.vue";

const isLocked = ref(true);

const handlePatternComplete = () => {
  isLocked.value = false;
};
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
