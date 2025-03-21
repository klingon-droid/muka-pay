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
                            <p class="text-xl font-bold">{{ isSuccess ? 'Payment Successful' : 'Payment Failed' }}</p>
                            <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-red-500 text-white flex justify-center items-center">
                                <iconify-icon class="text-2xl" icon="mdi:close"></iconify-icon>
                            </button>
                        </div>

                        <div class="p-4 py-6 text-center flex flex-col items-center justify-center">
                            <div class="flex justify-center mb-4">
                                <iconify-icon 
                                    :class="isSuccess ? 'text-5xl text-green-500' : 'text-5xl text-red-500'" 
                                    :icon="isSuccess ? 'mdi:check' : 'mdi:close'"
                                ></iconify-icon>
                            </div>
                            <p class="text-xl font-bold mb-2">{{ message }}</p>
                        </div>

                        <div class="p-4 flex gap-2">
                            <template v-if="isSuccess">
                                <button 
                                    @click="$emit('close')" 
                                    class="w-full p-3 bg-black text-white rounded-lg font-medium"
                                >
                                    Close
                                </button>
                            </template>
                            <template v-else>
                                <button 
                                    @click="$emit('retry')" 
                                    class="flex-1 p-3 bg-black text-white rounded-lg font-medium"
                                >
                                    Retry
                                </button>
                                <button 
                                    @click="$emit('close')" 
                                    class="flex-1 p-3 border border-gray-300 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                            </template>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue'

defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    isSuccess: {
        type: Boolean,
        required: true
    },
    message: {
        type: String,
        required: true
    }
})

defineEmits(['close', 'retry'])
</script> 