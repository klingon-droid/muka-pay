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
                    <DialogPanel :class="[receive_step==0?'w-full max-w-md':'', receive_step==1?'w-full h-auto':'']" class="w-full rounded-lg bg-white shadow-xl">
                        <!-- <div class="p-4 text-center flex items-center justify-between border-b border-gray-300">
                            <p class="text-xl font-bold">Receive</p>
                            <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-red-500 text-white flex justify-center items-center">
                                <iconify-icon class="text-2xl" icon="mdi:close"></iconify-icon>
                            </button>
                        </div> -->

                        <template v-if="receive_step === 0">
                            <div class="p-4">
                                <p class="text-2xl font-bold text-center mt-12 mb-4">Enter receive amount</p>
                                <div class="flex items-center gap-2">
                                    <input type="number" class="flex-1 p-2 rounded-lg border border-gray-300" placeholder="Enter USDC amount" v-model="receive_amount" />
                                    <p>USDC</p>
                                </div>

                                <button @click="receive_step = 1" class="mt-4 w-full p-2 rounded-lg bg-blue-500 text-white font-bold text-xl">Next</button>
                            </div>
                        </template>

                        <template v-if="receive_step === 1">

                            <div class="w-full h-[90vh] rounded-lg overflow-hidden justify-center items-center">

                                <div :class="[face_detected?'h-1/2':'h-full']" class="w-full bg-gray-200 flex justify-center items-center duration-300">
                                    <p>Video Feed</p>
                                    Face detected: {{ face_detected }}
                                </div>

                                <div :class="[face_detected?'h-1/2':'h-0', 'overflow-hidden w-full duration-300 flex flex-col justify-center items-center']">


                                    <div v-if="pattern_step === 0">
                                        <p class="text-xl font-bold text-center mt-2 mb-4">Provide your Secret Pattern</p>
    
                                        <div class="w-full flex flex-col justify-center items-center">
                                            <PatternPad2 ref="patternPadRef" @pattern-complete="handlePatternComplete"/>
                                        </div>
                                    </div>

                                    <!-- Loading State -->
                                    <div v-if="pattern_step === 1">
                                        <div class="flex flex-col items-center justify-center gap-4">
                                            <div class="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
                                            <p class="text-lg font-bold">Verifying...</p>
                                        </div>
                                    </div>

                                </div>


                            </div>


                        </template>

                        <template v-if="receive_step === 2">

                            <div class="w-full">

                                <p class="text-xl font-bold text-center w-full p-8">Are you sure to pay?</p>

                                <div class="mt-8 mb-8">
                                    <table class="w-full">
                                        <tr class="border-b border-b-gray-300">
                                            <td class="p-4 text-gray-600">From</td>
                                            <td class="p-4 text-right font-bold">@payer</td>
                                        </tr>
                                        <tr class="border-b border-b-gray-300">
                                            <td class="p-4 text-gray-600">To</td>
                                            <td class="p-4 text-right font-bold">@recipient</td>
                                        </tr>
                                        <tr class="border-b border-b-gray-300">
                                            <td class="p-4 text-gray-600">Amount</td>
                                            <td class="p-4 text-right font-bold">{{ receive_amount }} USDC</td>
                                        </tr>
                                    </table>
                                </div>

                                <button class="w-full p-4 rounded-lg bg-blue-500 text-white font-bold text-xl">Confirm</button>
                                
                            </div>


                        </template>
                        
                        
                        
                    </DialogPanel>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue'
import PatternPad2 from './PatternPad2.vue'

const receive_step = ref(0)
const face_detected = ref(false)
const receive_amount = ref(0)

const pattern_step = ref(0)

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    }
})

const emits = defineEmits(['close'])

const patternPadRef = ref(null)

const handlePatternComplete = (pattern) => {
    console.log(pattern)
    pattern_step.value = 1
    setTimeout(() => {
        // dummy verification success
        
        //reset pattern step
        pattern_step.value = 0
        // advance receive step
        receive_step.value = 2
    }, 1000)
}

watch(receive_step, (newVal) => {
    if (newVal === 1) {
        setTimeout(() => {
            face_detected.value = true
        }, 1000)
    }
})

</script> 