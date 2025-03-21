<template>
    <div class="h-screen bg-gray-100 w-full flex flex-col justify-start items-center">
        <header class="w-full bg-white px-4 py-2 flex items-center justify-between border-b border-gray-300">
            <h1 class="text-lg font-bold">Receive USDC</h1>
            <button @click="goBack()" class="p-2 rounded-full hover:bg-gray-100">
                <iconify-icon class="text-2xl" icon="mdi:arrow-left"></iconify-icon>
            </button>
        </header>

        <main class="w-full h-full flex">

            <div v-if="receive_step == 0" class="w-full h-full grid grid-rows-2">

                <div class="w-full flex flex-col justify-center items-center h-full border-b border-gray-300">
                    <p class="mb-4">Enter Receive Amount</p>

                    <div class="text-4xl font-bold text-center">
                            {{ amount || '0.00' }} USDC
                        </div>
                </div>

                <div class="w-full">
                    <div class="grid grid-cols-3">
                            <button @click="appendNumber('1')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">1</button>
                            <button @click="appendNumber('2')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">2</button>
                            <button @click="appendNumber('3')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">3</button>
                            <button @click="appendNumber('4')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">4</button>
                            <button @click="appendNumber('5')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">5</button>
                            <button @click="appendNumber('6')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">6</button>
                            <button @click="appendNumber('7')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">7</button>
                            <button @click="appendNumber('8')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">8</button>
                            <button @click="appendNumber('9')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">9</button>
                            <button @click="appendNumber('.')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">.</button>
                            <button @click="appendNumber('0')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">0</button>
                            <button @click="deleteNumber()" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">
                                <iconify-icon icon="mdi:backspace"></iconify-icon>
                            </button>
                        </div>

                        <div class="p-4">
                            <button @click="handleNext()" class="w-full bg-black text-white p-4 rounded-xl text-xl font-bold">
                                Next
                            </button>
                        </div>
                </div>

            </div>

            <div v-if="receive_step == 1" class="w-full h-full grid grid-rows-3">

                <div class="w-full h-full flex-col flex justify-center items-center bg-gray-200">
                    video feed

                    <p>isFaceDetected: {{ isFaceDetected }}</p>
                </div>

                

                <div class="w-full h-full grid grid-rows-4 row-span-2">

                    <div class="w-full h-full flex justify-center items-center row-span-3">
                        <div class="text-center" v-if="!isFaceDetected">
                            <p  class="text-3xl font-bold mb-4">Detecting Face</p>
                            <p>Please center your face in the frame</p>
                        </div>

                        <div v-if="isFaceDetected && !isPatternVerified" class="w-full h-full flex flex-col justify-center items-center">
                            <p class="text-2xl p-4 font-bold mb-4">Authenticate with your pattern</p>
                            <p v-if="showPatternHint" class="text-sm text-gray-600 mb-4">Invalid pattern. Try again</p>
                            <PatternPad2 ref="patternPad" @pattern-complete="handlePatternComplete" />
                        </div>

                        <div class="text-center w-full h-full flex flex-col justify-end items-center px-4" v-if="isFaceDetected && isPatternVerified">
                            <div class="bg-white rounded-xl w-full">
                                <div class="space-y-2 mb-12 p-4 pt-8">
                                <p class="text-gray-600">Authenticated as</p>
                                <div class="text-3xl font-bold text-black">@payer</div>
                            </div>

                            <div class="w-full">
                                <table class="w-full">
                                    <tbody>
                                        <tr class="border-b border-gray-200">
                                            <td class="p-3 text-left text-gray-600">Amount</td>
                                            <td class="p-3 text-right font-bold text-black">123 USDC</td>
                                        </tr>
                                        <tr class="border-b border-gray-200">
                                            <td class="p-3 text-left text-gray-600">Recipient</td>
                                            <td class="p-3 text-right font-bold text-black">@Recipient</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            </div>
                        </div>

                        
                    </div>

                    <div class="w-full h-full flex justify-center items-center row-span-1 px-4">

                        <button @click="handlePay()" :disabled="!isFaceDetected || !isPatternVerified || payBusy" class="bg-black text-white p-4 rounded-xl text-xl font-bold w-full disabled:opacity-20">

                            <div v-if="payBusy" class="flex justify-center items-center">
                                <iconify-icon icon="mdi:loading" class="animate-spin text-4xl"></iconify-icon>
                            </div>

                            <div v-else>
                                Pay 1234 USDC
                            </div>
                        </button>

                    </div>

                </div>
               
            </div>

        </main>

        <PaymentResultDialog
            :is-open="showPaymentResult"
            :is-success="paymentSuccess"
            :message="paymentMessage"
            @close="handlePaymentClose"
            @retry="handlePaymentRetry"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import PatternPad2 from './PatternPad2.vue'
import PaymentResultDialog from './PaymentResultDialog.vue'

const receive_step = ref(0)
const isFaceDetected = ref(false)
const isPatternVerified = ref(false)
const showPatternHint = ref(false)
const patternPad = ref(null)
const amount = ref('')
const payBusy = ref(false)
const showPaymentResult = ref(false)
const paymentSuccess = ref(false)
const paymentMessage = ref('')

const appendNumber = (number) => {
    amount.value += number
}

const deleteNumber = () => {
    amount.value = amount.value.slice(0, -1)
}

const handleNext = () => {
    receive_step.value = 1

    // dummy face detected
    setTimeout(() => {
        isFaceDetected.value = true
    }, 2000)
}

const handlePatternComplete = (event) => {
    console.log('pattern complete', event)
    
    // simulate successful pattern
    isPatternVerified.value = true
    showPatternHint.value = false
    
    
    // // simulate failed pattern
    // isPatternVerified.value = false
    // showPatternHint.value = true
    // // reset the pattern pad
    // patternPad.value.clearPattern()
    
    // setTimeout(() => {
    //     showPatternHint.value = false
    // }, 2000)
}

const handlePay = () => {
    console.log('pay')
    payBusy.value = true
    
    // Simulate payment process
    setTimeout(() => {
        payBusy.value = false
        // Simulate random success/failure
        paymentSuccess.value = Math.random() > 0.5
        paymentMessage.value = paymentSuccess.value 
            ? `Successfully received ${amount.value} USDC`
            : 'Failed to receive payment. Please try again.'
        showPaymentResult.value = true
    }, 2000)
}

const handlePaymentClose = () => {
    showPaymentResult.value = false
    if (paymentSuccess.value) {
        // Reset the form or navigate away
        receive_step.value = 0
        amount.value = ''
    }
}

const handlePaymentRetry = () => {
    showPaymentResult.value = false
    // Retry the payment
    handlePay()
}

</script> 