<template>
    <TransitionRoot :show="isOpen" as="template">
        <Dialog as="div" @close="$emit('close')" class="relative z-50">
            <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="duration-200 ease-in"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
            </TransitionChild>

            <div class="fixed inset-0 flex w-screen items-center justify-center p-4">
                <TransitionChild
                    as="template"
                    enter="duration-300 ease-out"
                    enter-from="opacity-0 scale-95"
                    enter-to="opacity-100 scale-100"
                    leave="duration-200 ease-in"
                    leave-from="opacity-100 scale-100"
                    leave-to="opacity-0 scale-95"
                >
                    <DialogPanel class="w-full max-w-md rounded-lg bg-white shadow-xl">

                        <div class="p-4 text-center flex items-center justify-between border-b border-gray-300">
                            <p class="text-xl font-bold">Send</p>
                            <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-red-500 text-white flex justify-center items-center">
                                <iconify-icon class="text-2xl" icon="mdi:close"></iconify-icon>
                            </button>
                        </div>

                        <!-- Step 0: Select recipient type -->
                        <div v-if="currentStep === 0">
                            <div class="p-4 py-6 text-center">
                                <p class="text-2xl font-bold mb-2">Select recipient type</p>
                            </div>

                            <div class="flex flex-col border-t border-gray-300 divide-y divide-gray-300">
                                <button @click="selectRecipientType('username')" class="p-4 flex justify-center items-center gap-2">
                                    <iconify-icon class="text-3xl text-gray-500" icon="mdi:at"></iconify-icon>
                                    <p class="text-xl font-bold">Username</p>
                                </button>
                                <button @click="selectRecipientType('ethereum')" class="p-4 flex justify-center items-center gap-2">
                                    <iconify-icon class="text-3xl text-gray-500" icon="mdi:ethereum"></iconify-icon>
                                    <p class="text-xl font-bold">Ethereum Address</p>    
                                </button>
                            </div>
                        </div>

                        <!-- Step 1: Enter recipient and amount -->
                        <div v-if="currentStep === 1">
                            <div class="p-4 py-6 text-center">
                                <p class="text-xl font-bold mb-2">Send USDC on Base</p>
                            </div>

                            <div class="flex flex-col px-4 pb-4">
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        {{ recipientType === 'username' ? 'Username' : 'Ethereum Address' }}
                                    </label>
                                    <div class="flex items-center border border-gray-300 rounded-lg p-2">
                                        <iconify-icon 
                                            class="text-xl text-gray-500 mr-2" 
                                            :icon="recipientType === 'username' ? 'mdi:at' : 'mdi:ethereum'"
                                        ></iconify-icon>
                                        <input 
                                            v-model="recipient"
                                            class="flex-1 outline-none"
                                            :placeholder="recipientType === 'username' ? 'username' : '0x...'" 
                                        />
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Amount (USDC)</label>
                                    <div class="flex items-center border border-gray-300 rounded-lg p-2">
                                        <iconify-icon class="text-xl text-gray-500 mr-2" icon="mdi:currency-usd"></iconify-icon>
                                        <input 
                                            v-model="amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            class="flex-1 outline-none"
                                            placeholder="0.00" 
                                        />
                                    </div>
                                </div>

                                <div class="flex gap-2 mt-4">
                                    <button @click="currentStep = 0" class="flex-1 p-3 border border-gray-300 rounded-lg font-medium">
                                        Back
                                    </button>
                                    <button 
                                        @click="handleSend" 
                                        :disabled="!isValidForm"
                                        class="flex-1 p-3 bg-blue-500 text-white rounded-lg font-medium disabled:bg-blue-300"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: PIN State -->

                        <div v-if="currentStep === 2">
                            <div class="p-4 py-6 text-center flex flex-col items-center justify-center">
                                
                                <p class="text-xl font-bold mb-2">Provide your Secret Pattern to Proceed</p>

                                <PatternPad2 ref="patternPadRef" @pattern-complete="handlePatternComplete"/>
                            </div>
                        </div>

                        <!-- Step 3: Sending State -->

                        <div v-if="currentStep === 3">

                            <div class="flex justify-center mt-12 py-4">
                                    <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                </div>

                            <div class="p-4 py-6 text-center flex flex-col items-center justify-center">
                                <p class="text-xl font-bold mb-2">Sending {{ amount }} USDC to {{ recipient }}</p>
                            </div>
                        </div>

                        <!-- Step 4: Success State -->

                        <div v-if="currentStep === 4">

                            <div class="flex justify-center mt-12 py-4">
                                <iconify-icon class="text-5xl text-green-500" icon="mdi:check"></iconify-icon>
                            </div>
                            <div class="p-4 py-6 text-center flex flex-col items-center justify-center">
                                <p class="text-xl font-bold mb-2">Sent {{ amount }} USDC to {{ recipient }}</p>
                            </div>
                        </div>

                        <!-- Step 5: Error State -->

                        <div v-if="currentStep === 5">

                            <div class="flex justify-center mt-12 py-4">
                                <iconify-icon class="text-5xl text-red-500" icon="mdi:close"></iconify-icon>
                            </div>

                            <div class="p-4 py-6 text-center flex flex-col items-center justify-center">
                                <p class="text-xl font-bold mb-2">Failed to send</p>
                                <p>Error Message here</p>
                            </div>

                            <div class="w-full flex justify-center items-center pb-4">
                                <button @click="retrySend" class="px-4 py-2 bg-black text-white rounded-full font-medium">Retry</button>
                            </div>
                        </div>

                    </DialogPanel>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import PatternPad2 from './PatternPad2.vue'
import { generateProof, getUsernameHash } from '../stores/user'
import { parseUnits } from 'viem'

const patternPad = ref(null)
const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    }
})

const emits = defineEmits(['close', 'send'])

// Form state
const currentStep = ref(0)
const recipientType = ref('username') // 'username' or 'ethereum'
const recipient = ref('')
const amount = ref('')

const payerUsername = ref('yf')


// Computed properties
const isValidForm = computed(() => {
    const numAmount = parseFloat(amount.value)
    return recipient.value && !isNaN(numAmount) && numAmount > 0
})

// Methods
const selectRecipientType = (type) => {
    recipientType.value = type
    currentStep.value = 1
}

const handleSend = () => {
    if (!isValidForm.value) return

    // emits('send', {
    //     recipientType: recipientType.value,
    //     recipient: recipient.value,
    //     amount: parseFloat(amount.value)
    // })
    
    // Reset form and close dialog
    // resetForm()
    // emits('close')
    currentStep.value = 2
}

const handlePatternComplete = async (pattern) => {
    console.log('Pattern complete:', pattern)
    currentStep.value = 3

    const proof = await generateProof(payerUsername.value, pattern)
    console.log('proof:', proof)

    try {

        console.log('amount:', amount.value)
        console.log('recipient:', recipient.value)

        const payload = {
            "payment_proof": proof,
            "amount": parseUnits(String(amount.value), 6).toString(),
            "from_hash": await getUsernameHash(payerUsername.value),
            "to_hash": await getUsernameHash(recipient.value),
        }
        console.log('payload:', payload)

        const response = await fetch('/api/pay', {
            method: 'POST',
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            currentStep.value = 5
        } else {
            const data = await response.json()
            console.log('Payment response:', data)
            currentStep.value = 4
        }
        
    } catch (error) {
        console.error('Error paying:', error)
        currentStep.value = 5
    }

    // // dummy delay
    // setTimeout(() => {
    //     // dummy success
    //     // currentStep.value = 4

    //     // dummy error
    //     currentStep.value = 5
    // }, 3000)
}

const resetForm = () => {
    currentStep.value = 0
    recipientType.value = 'username'
    recipient.value = ''
    amount.value = ''
}

const retrySend = () => {
    currentStep.value = 1
}

</script>
