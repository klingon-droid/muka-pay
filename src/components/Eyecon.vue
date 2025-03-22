<template>
    <div class="w-6 h-6 relative">
        <svg ref="eyeIcon" viewBox="0 0 24 24" class="w-full h-full">
            <!-- Eye outline -->
            <path
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            />
            <!-- Pupil -->
            <circle
                ref="pupil"
                cx="12"
                cy="12"
                r="3"
                fill="currentColor"
            />
        </svg>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import anime from 'animejs';

const eyeIcon = ref(null);
const pupil = ref(null);
let animation = null;

onMounted(() => {
    animation = anime({
        targets: pupil.value,
        cx: [
            { value: 10, duration: 500, delay: 250 },
            { value: 14, duration: 500, delay: 250 },
            { value: 12, duration: 500, delay: 250 }
        ],
        easing: 'easeInOutSine',
        loop: true
    });
});

onUnmounted(() => {
    if (animation) {
        animation.pause();
    }
});
</script> 