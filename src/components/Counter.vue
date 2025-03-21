<template>
  <div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-y-4">
    <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
    <p class="text-3xl font-bold text-blue-600">{{ count }}</p>
    <div class="flex space-x-3">
      <button 
        @click="decrement" 
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Decrease
      </button>
      <button 
        @click="increment" 
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Increase
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Vue Counter'
  },
  initialCount: {
    type: Number,
    default: 0
  }
});

const count = ref(props.initialCount);

function increment() {
  count.value++;
}

function decrement() {
  count.value--;
}
</script> 