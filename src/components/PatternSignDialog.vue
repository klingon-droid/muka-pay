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
                <div class="fixed inset-0 bg-black/50 backdrop-blur-2xl" aria-hidden="true" />
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
                    <DialogPanel class="w-full max-w-md ">

                        <div class="rounded-3xl bg-white shadow-2xl w-full">
                            <div class="p-8 text-center flex flex-col items-center justify-center">
    
                                <div class="mb-12">
                                    <p class="text-2xl font-bold">Sign with Pattern</p>
                                </div>
    
                                <!-- <p class="text-xl font-bold mb-2">Draw your Secret Pattern</p> -->
                                <PatternPad2 ref="patternPadRef" @pattern-complete="handlePatternComplete"/>
                            </div>
    
    
                            <div class="p-4 text-center px-8">
                                <div class="flex justify-center items-center mb-2 ">
                                    <iconify-icon class="text-3xl mr-2 text-green-600" icon="uim:lock" />
                                    <p class=" font-bold text-green-700">Protected with ZK</p>
                                    </div>
                                    <p class="text-sm text-gray-500">Your pattern is only used to generate ZK proofs and is destroyed when closed.</p>
                            </div>

                        </div>

                        <button @click="$emit('close')" class="bg-red-600 text-white p-4 w-full mt-4 rounded-2xl text-xl font-bold">cancel</button>
                        

                    </DialogPanel>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup>
import { ref } from 'vue'
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue'
import PatternPad2 from './PatternPad2.vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    }
})

const emits = defineEmits(['close', 'pattern-complete'])

const patternPadRef = ref(null)

const handlePatternComplete = (pattern) => {
    emits('pattern-complete', pattern)
    emits('close')
}
</script> 