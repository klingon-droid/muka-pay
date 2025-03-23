<template>
  <div class="w-full h-full overflow-y-auto">
    
    <nav class="w-full text-center text-white mt-22 p-6 font-doto flex justify-between items-center">
        <div class="w-12"><!-- Empty div for alignment --></div>
        <div class="text-4xl">History</div>
        <button 
            @click="fetchHistory" 
            class="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition duration-150"
            :class="{ 'animate-spin': isLoading }"
        >
            <iconify-icon 
                icon="pixelarticons:reload" 
                class="text-2xl text-white/70"
            ></iconify-icon>
        </button>
    </nav>

    <div class="w-full divide-y divide-white/20">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center items-center p-8">
            <iconify-icon icon="pixelarticons:loader" class="text-5xl text-white/30 animate-spin"></iconify-icon>
        </div>

        <!-- Transactions list -->
        <div v-else v-for="transaction in transactions" :key="transaction.id" 
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
                            <span class="font-doto text-xl ml-2">{{ isAddress(transaction.counterparty) ? transaction.counterparty.slice(0, 6) + '...' + transaction.counterparty.slice(-4) : '@' + transaction.counterparty.slice(0, 6) + '...' + transaction.counterparty.slice(-4) }}</span>
                        </p>
                        <p class="text-sm text-white/30">{{ formatDate(transaction.date) }}</p>

                        <!-- <p class="text-sm text-white">{{ transaction.raw }}</p> -->
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
    import { ref, onMounted, watch, onActivated } from 'vue';
    const currentUsername = ref(null);
    import { username, getUsernameHash, refreshBalance } from '../stores/user';
    import { formatUnits, isAddress } from 'viem';
    import { useStore } from '@nanostores/vue';

    onMounted(async () => {
        currentUsername.value = username.value;
        // currentUsername.value = 'famcafe';
        // console.log(currentUsername.value, await getUsernameHash(currentUsername.value))
        fetchHistory();
    })

    onActivated(async () => {
        console.log('onActivated')
        fetchHistory();
    })

    const refreshBalanceStore = useStore(refreshBalance);
    watch(refreshBalanceStore, async () => {
        console.log('refreshBalanceStore fetchHistory')
        fetchHistory();
    })

    const isLoading = ref(true);

    const fetchHistory = async () => {
        isLoading.value = true;
        try {
            const response = await fetch(`/api/history/${currentUsername.value}`);
            const data = await response.json();
            console.log('history data:', data);
            const userHash = await getUsernameHash(currentUsername.value);

            const outTypes = ['paid', 'withdrawn']
            const inTypes = ['deposited']

            transactions.value = [];
            for(let history of data?.history) {
                if(history.event === 'registered') {
                    continue;
                }

                let _type = outTypes.includes(history.event) ? 'send' : 'receive';
                if(history.event === 'deposited') {
                    _type = 'receive';
                } else {
                    _type = userHash === history?.to_user ? 'receive' : 'send';
                }
                
                
                transactions.value.push({
                    id: history.tx_hash,
                    tx_hash: history.tx_hash,
                    event: history.event,
                    // type: outTypes.includes(history.event) ? 'send' : 'receive',
                    type: _type,
                    from_user: history?.from_user,
                    to_user: history?.to_user,
                    counterparty: userHash === history?.to_user ? history?.from_user : history?.to_user,
                    amount: formatUnits(String(history.amount), 6),
                    date: history.block_time,
                    raw: history,
                });
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            // Add a small delay for smoother loading state
            setTimeout(() => {
                isLoading.value = false;
            }, 500);
        }
    }

    const transactions = ref([]);
    // const transactions = ref([
    //     {
    //         id: 1,
    //         type: 'send',
    //         counterparty: 'alice',
    //         amount: '10.00',
    //         date: '2024-03-20T10:30:00Z'
    //     },
    //     {
    //         id: 2,
    //         type: 'receive',
    //         counterparty: 'bob',
    //         amount: '25.50',
    //         date: '2024-03-19T15:45:00Z'
    //     },
    //     {
    //         id: 3,
    //         type: 'send',
    //         counterparty: 'charlie',
    //         amount: '5.00',
    //         date: '2024-03-18T09:15:00Z'
    //     }
    // ]);

    // // Add more sample transactions
    // for (let i = 0; i < 10; i++) {
    //     transactions.value.push({
    //         id: i + 4,
    //         type: i % 2 === 0 ? 'send' : 'receive',
    //         counterparty: i % 2 === 0 ? 'alice' : 'bob',
    //         amount: ((i + 1) * 5).toFixed(2),
    //         date: new Date(Date.now() - i * 86400000).toISOString()
    //     });
    // }

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