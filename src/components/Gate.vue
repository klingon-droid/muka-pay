<template>
    <div class="relative h-screen w-screen overflow-hidden flex justify-center items-center">
        
        
            <Webcam 
                ref="webcamRef"
                class="h-full w-full"
                @started="onWebcamStarted"
                @stopped="onWebcamStopped"
                @error="onWebcamError"
            />
        
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Webcam from './Webcam.vue';

const webcamRef = ref(null);

const onWebcamStarted = ({ stream, video }) => {
    console.log('Webcam started');
};

const onWebcamStopped = () => {
    console.log('Webcam stopped');
};

const onWebcamError = (error) => {
    console.error('Webcam error:', error);
};
</script>

