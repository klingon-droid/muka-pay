<template>
  <div class="w-full h-full overflow-y-auto">
    
    <nav class="w-full text-center text-white mt-22 p-6 font-doto text-4xl">
        History
    </nav>

    <div class="w-full divide-y divide-white/20">

        <!-- row of transaction -->
        <div v-for="transaction in transactions" :key="transaction.id" 
             class="p-4 hover:bg-gray-800 transition duration-150 cursor-pointer">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        transaction.type === 'send' ? 'bg-red-100/10' : 'bg-green-100/10'
                    ]">
                        <iconify-icon 
                            :icon="transaction.type === 'send' ? 'pixelarticons:arrow-up' : 'pixelarticons:arrow-down'"
                            :class="transaction.type === 'send' ? 'text-red-500' : 'text-green-500'"
                            class="text-2xl"
                        ></iconify-icon>
                    </div>
                    <div>
                        <p class=" text-white">
                            {{ transaction.type === 'send' ? 'To' : 'From' }}
                            <span class="font-doto text-xl ml-2">@{{ transaction.counterparty }}</span>
                        </p>
                        <p class="text-sm text-white/30">{{ formatDate(transaction.date) }}</p>
                    </div>
                </div>
                <div :class="[
                    '',
                    transaction.type === 'send' ? 'text-red-500' : 'text-green-500'
                ]">
                    {{ transaction.type === 'send' ? '-' : '+' }}{{ transaction.amount }} USDC
                </div>
            </div>
        </div>

    </div>

  </div>
</template>

<script setup>
    import { ref } from 'vue';

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
        }
    ]);

    // Add more sample transactions
    for (let i = 0; i < 10; i++) {
        transactions.value.push({
            id: i + 4,
            type: i % 2 === 0 ? 'send' : 'receive',
            counterparty: i % 2 === 0 ? 'alice' : 'bob',
            amount: ((i + 1) * 5).toFixed(2),
            date: new Date(Date.now() - i * 86400000).toISOString()
        });
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
</script>