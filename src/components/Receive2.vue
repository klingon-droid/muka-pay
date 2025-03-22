<template>
    <div :class="[submitSuccess?'bg-green-500':'bg-green-500/0']" class="w-screen h-screen flex flex-col justify-end items-center font-lexend duration-1000 delay-500">

        <div class="fixed top-0 left-0 w-full p-4 pointer-events-none flex justify-between items-center">

            <button @click="handleCancel" class="bg-black/10 text-black py-2 px-4 rounded-full pointer-events-auto    ">Cancel</button>

            <button @click="handleEdit" class="underline font-bold py-2 px-4 pointer-events-auto">Edit</button>
            
        </div>


        <!-- <div class="w-[70vw] h-[70vw] bg-white rounded-2xl shadow-2xl relative flex justify-center items-center">

            <p class="text-lg absolute top-4 animate-pulse">Looking for a Face</p>

        </div>


        <div class="p-8 text-2xl space-y-4 text-center">
            <p class="">please pay @username</p>
            <p>1234 USDC</p>
        </div> -->

        <div :class="[isEditMode?'h-[50vh] flex flex-col justify-center items-center':'']" class="text-center space-y-8">
            <div class="flex justify-center items-center">
                <p v-if="!submitSuccess" class="text-3xl">pay </p>
                <p v-else class="text-3xl">paid</p>
                <div class="ml-2 bg-black text-white py-2 px-4 rounded-full text-xl ">@username</div>
            </div>
            <p v-if="!isEditMode" class="text-6xl font-bold">{{ amount }} USDC</p>
            <p v-if="isEditMode" class="text-5xl font-bold break-all flex justify-center items-center flex-wrap">
                <p v-if="amount">{{ amount }}</p>
                <p v-else class="text-gray-400 whitespace-nowrap">Enter amount</p>
                <p class="ml-2">USDC</p>
            </p>
            
            <!-- <p class="text-2xl">to @username</p> -->
        </div>

        <div v-if="isEditMode" class="h-[50vh] grid grid-rows-[1fr_auto] w-full">
            <div class="w-full h-full p-4">
                <div class="w-full h-full grid grid-cols-3 grid-rows-4 gap-2">
                    <button 
                        v-for="key in keypadKeys" 
                        :key="key"
                        @click="handleKeyPress(key)"
                        class="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl flex items-center justify-center text-3xl font-bold transition-colors duration-100"
                    >
                        {{ key }}
                    </button>
                </div>
            </div>

            <div class="p-4 w-full">
                <button 
                    @click="handleConfirm"
                    class="bg-black text-white rounded-xl p-4 w-full text-lg font-bold hover:bg-black/90 active:bg-black/80 transition-colors"
                >
                    Confirm
                </button>
            </div>
        </div>


        <div v-if="!isEditMode" :class="[
            
            submitSuccess?'h-[50vh]':(
                accountFound?['h-[70vh]', isVerified?'pb-[5vh]':'pb-[20vh]']:'h-[60vh] pb-24'
            ),]" class="flex justify-end items-center flex-col duration-300">


            <template v-if="!submitSuccess">

                <div :class="[isIdentifyingFace?'w-[18vh] h-[18vh]':'w-[15vh] h-[15vh]']" class=" bg-gray-200 rounded-full mb-8 duration-300">
    
                </div>
    
                <div v-if="isDetectingFace" class="flex flex-col items-center gap-2">
                    <Eyecon />
                    <p class="animate-pulse text-gray-400">Looking for a Face</p>
                </div>
    
                <div v-if="isIdentifyingFace" class="flex flex-col items-center gap-2">
                    <p class="animate-pulse text-gray-400">Searching Account</p>
                </div>


            </template>

            <template v-if="!submitSuccess">

                <div v-if="accountFound && !isVerified" class="flex flex-col items-center gap-2">
                    <button :disabled="submitBusy" @click="showPatternDialog = true" class="bg-black text-white py-2 px-4 pr-2 rounded-xl flex items-center gap-2 disabled:opacity-50">
                            <p>Sign with Pattern</p>
                            <iconify-icon class="text-4xl" icon="mage:dots-menu" />
                    </button>
                </div>

                <div v-if="accountFound && isVerified" class="flex flex-col items-center gap-2">
                    
                    <div class="mb-12 text-center px-8">
                        <p class="text-2xl font-bold mb-4">Hello @payer</p>
                        <p class="text-red-500">This is the final step.<br>Sign again to confirm.</p>
                    </div>

                    <button :disabled="submitBusy" @click="showPatternDialog = true" class="bg-black text-white p-4 px-8 pr-4 text-lg rounded-xl flex items-center justify-center disabled:opacity-50 w-[80vw]">

                        <template v-if="!submitBusy">
                            <span class="mr-4">Pay 1234 USDC</span>
                            <iconify-icon class="text-4xl" icon="mage:dots-menu" />
                        </template>
                        <template v-else>
                            <span class="mr-4">Signing...</span>
                            <iconify-icon class="text-4xl animate-[spin_3s]" icon="mage:dots-menu" />
                        </template>

                    </button>

                    <button @click="handleSignOutAndCancel" class="border-2 p-4 px-8 text-lg rounded-xl flex items-center justify-center w-full max-w-sm">Cancel & Sign Out</button>

                </div>
                
            </template>
            <template v-if="submitSuccess">
                <div class="flex flex-col justify-center items-center gap-2 h-full">
                    <iconify-icon class="text-6xl text-black" icon="fluent:checkmark-12-filled" />
                    <p class="text-2xl">Paid</p>
                </div>
            </template>

        </div>
        
        <PatternSignDialog 
            :is-open="showPatternDialog"
            @close="showPatternDialog = false"
            @pattern-complete="handlePatternComplete"
        />
    </div>
</template>

<script setup>

import { ref, onMounted } from 'vue';
import Eyecon from './Eyecon.vue';
import PatternSignDialog from './PatternSignDialog.vue';

const isEditMode = ref(true);
const amount = ref('');
const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '←'];

const isDetectingFace = ref(false);
const isIdentifyingFace = ref(false);
const accountFound = ref(false);
const showPatternDialog = ref(false);
const isVerified = ref(false);
const submitBusy = ref(false);

const submitSuccess = ref(false);

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

const handleConfirm = () => {
    if (!amount.value) return;
    console.log('Confirmed amount:', amount.value);
    isEditMode.value = false;


    isDetectingFace.value = true;
    setTimeout(() => {
        isDetectingFace.value = false;
        isIdentifyingFace.value = true;

        setTimeout(() => {
            isIdentifyingFace.value = false;
            accountFound.value = true;
        }, 2000);

    }, 2000);
};



const handlePatternComplete = (pattern) => {

    if(!isVerified.value){
        isVerified.value = true;
    }else{
        
        console.log('Pattern completed:', pattern);
        // Handle the pattern completion here
        submitBusy.value = true;
    
        setTimeout(() => {
            submitSuccess.value = true;
            submitBusy.value = false;
        }, 2000);
    }
    
};

const handleCancel = () => {
    window.location.href = '/app';
}

const handleEdit = () => {
    isEditMode.value = true;
    
    // reset all other flags
    isDetectingFace.value = false;
    isIdentifyingFace.value = false;
    accountFound.value = false;
    submitSuccess.value = false;
}

const handleSignOutAndCancel = () => {
    isVerified.value = false;
    accountFound.value = false;
    isDetectingFace.value = true
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
</style>

