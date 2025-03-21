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
                            <p class="text-xl font-bold">Transaction History</p>
                            <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-red-500 text-white flex justify-center items-center">
                                <iconify-icon class="text-2xl" icon="mdi:close"></iconify-icon>
                            </button>
                        </div>

                        <div class="max-h-[90vh] overflow-y-auto">
                            <div v-for="transaction in transactions" :key="transaction.id" 
                                class="p-4 border-b last:border-b-0 border-gray-200 hover:bg-gray-50">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div :class="[
                                            'w-10 h-10 rounded-full flex items-center justify-center',
                                            transaction.type === 'send' ? 'bg-red-100' : 'bg-green-100'
                                        ]">
                                            <iconify-icon 
                                                :icon="transaction.type === 'send' ? 'pixelarticons:arrow-up' : 'pixelarticons:arrow-down'"
                                                :class="transaction.type === 'send' ? 'text-red-500' : 'text-green-500'"
                                                class="text-2xl"
                                            ></iconify-icon>
                                        </div>
                                        <div>
                                            <p class="font-medium">
                                                {{ transaction.type === 'send' ? 'Sent to' : 'Received from' }}
                                                <span class="font-bold">{{ transaction.counterparty }}</span>
                                            </p>
                                            <p class="text-sm text-gray-500">{{ formatDate(transaction.date) }}</p>
                                        </div>
                                    </div>
                                    <div :class="[
                                        'font-bold',
                                        transaction.type === 'send' ? 'text-red-500' : 'text-green-500'
                                    ]">
                                        {{ transaction.type === 'send' ? '-' : '+' }}{{ transaction.amount }} USDC
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    }
})

const emits = defineEmits(['close'])

// Dummy data for demonstration
const transactions = ref([
    {
        id: 1,
        type: 'send',
        counterparty: 'alice',
        amount: '10.00',
        date: '2024-03-20T10:30:00Z'
    },
    {
        id: 2,
        type: 'receive',
        counterparty: 'bob',
        amount: '25.50',
        date: '2024-03-19T15:45:00Z'
    },
    {
        id: 3,
        type: 'send',
        counterparty: 'charlie',
        amount: '5.00',
        date: '2024-03-18T09:15:00Z'
    },
    // Add more dummy transactions as needed
])

for (let i = 0; i < 10; i++) {
    transactions.value.push({
        id: i + 4,
        type: 'send',
        counterparty: 'alice',
        amount: '10.00',
        date: '2024-03-20T10:30:00Z'
    })
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script> 