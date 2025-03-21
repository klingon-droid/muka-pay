<template>
    <div class="relative w-full h-full flex justify-center items-center flex-col">

        <div :class="[isActive?'w-[300px] h-[300px] bg-black/0':'mb-8 w-[200px] h-[200px] bg-black', searchComplete?'-mt-[100px]':'']" class="  rounded-full flex justify-center items-center duration-500">

            <div :class="[!isActive?'w-[200px] h-[200px]':' w-[300px] h-[300px] overflow-hidden','rounded-full duration-300 delay-75 absolute', faceDetected?'scale-[0.8]':'']">
                <video 
                    ref="videoRef" 
                autoplay 
                muted 
                playsinline 
                :class="[
                    'h-full w-full object-cover transition-transform duration-300',
                    { 'scale-x-[-1]': isFlipped }
                ]"
                ></video>
                <canvas ref="canvasRef" class="absolute inset-0 h-full w-full"></canvas>
            </div>

            <iconify-icon v-if="!isActive" icon="typcn:camera" class="text-white text-[5rem] absolute"></iconify-icon>

        </div>


        
        <!-- Permission and webcam states -->
        <div v-if="!isActive" class="flex flex-col items-center justify-center gap-4">

            
                
            <!-- Initial checking state -->
            <div v-if="permissionStatus === 'checking'" class="text-center">
                <div class=" text-lg mb-4">Checking camera permissions...</div>
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>

            <!-- Permission denied state -->
            <div v-else-if="permissionStatus === 'denied'" class="text-center">
                <div class="text-gray-500 text-xl font-bold mb-4">Can't access your camera</div>
                <p class="text-sm">Please grant permission in your browser settings</p>
            </div>
            
            <!-- Loading state when starting camera -->
            <div v-else-if="isLoading" class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
            </div>

            <!-- Enable request state -->
            <div v-else-if="permissionStatus === 'prompt'" class="text-center cursor-pointer hover:scale-105 transition-all duration-300">
                <button 
                    @click="requestPermission"
                    class="bg-black text-white text-xl font-bold px-4 py-2 rounded-full"
                >
                    Enable
                </button>
            </div>
        </div>

        <div v-if="searchBusy" class="bg-black flex justify-center items-center px-4 py-2 rounded-full">
            <div class="text-white font-bold">Loading...</div>
        </div>

        <div class="flex flex-col items-center justify-center space-y-12" v-if="searchComplete">

            <template v-if="!hasAccount">

                <div class="my-12 text-center">
                    <div class="text-4xl font-bold mb-4">Hello New Face</div>
                    <p class="text-lg">Let's get started!</p>
                </div>
    
                <button class="bg-black text-white text-2xl px-8 py-3 rounded-full">Register New Account</button>
    
                <div class="fixed bottom-0 w-full bg-white p-4 py-12 text-center">
                    <p class="text-xl font-semibold mb-2">Already have an account?</p>
                    <p class="text-sm">Please center your face and come closer</p>
                </div>

            </template>

            <template v-else>

                <div class=" text-center">
                    <div class="text-4xl font-bold mb-4">Welcome Back</div>
                    <p class="text-lg">Draw your secret pattern to login</p>
                </div>

                <PatternPad @pattern-complete="handlePatternComplete" />

                
            </template>
            

        </div>
        
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineEmits, watch } from 'vue';
import { Human } from '@vladmandic/human'
import PatternPad from './PatternPad.vue';

const emit = defineEmits(['started', 'stopped', 'error']);

// State
const isFlipped = ref(true);
const isActive = ref(false);
const permissionDenied = ref(false);
const isLoading = ref(false);
const permissionStatus = ref('checking'); // 'checking' | 'granted' | 'denied' | 'prompt'
const faceDetected = ref(false);
const searchBusy = ref(false);
const searchComplete = ref(false);
const hasAccount = ref(false);

// Refs
const videoRef = ref(null);
const canvasRef = ref(null);
let stream = null;
let detectInterval = null;

// Initialize Human with proper configuration
const human = new Human({
    backend: 'webgl',
    modelBasePath: '/models',
    face: {
        enabled: true,
        detector: {
            enabled: true,
            rotation: true,
            return: true,
            maxDetected: 1,
            minConfidence: 0.5
        },
        mesh: { enabled: false },
        embedding: { enabled: false },
        description: { enabled: false },
        emotion: { enabled: false },
        iris: { enabled: false },
        antispoof: { enabled: false },
        liveness: { enabled: false }
    },
    // Disable other features for better performance
    body: { enabled: false },
    hand: { enabled: false },
    object: { enabled: false },
    gesture: { enabled: false }
});

// Methods
const start = async () => {
    isLoading.value = true;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                facingMode: 'user'
            },
            audio: false
        });
        videoRef.value.srcObject = stream;
        isActive.value = true;
        permissionDenied.value = false;
        permissionStatus.value = 'granted';
        
        await new Promise(resolve => {
            videoRef.value.onloadedmetadata = resolve;
        });
        await videoRef.value.play();
        
        // Start face detection after camera is started
        startFaceDetection();
        
        emit('started', { stream, video: videoRef.value });
        
    } catch (error) {
        console.error('Error accessing webcam:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            permissionDenied.value = true;
            permissionStatus.value = 'denied';
        }
        emit('error', error);
    } finally {
        isLoading.value = false;
    }
};

const startFaceDetection = async () => {
    if (!videoRef.value) return;

    // Initialize Human models
    try {
        await human.load();
        await human.warmup();
    } catch (error) {
        console.error('Error initializing face detection:', error);
        return;
    }

    detectInterval = setInterval(async () => {
        if (videoRef.value.paused || videoRef.value.ended) return;
        
        try {
            const result = await human.detect(videoRef.value);
            // Update face detection status
            faceDetected.value = result.face && result.face.length > 0;
            // console.log(faceDetected.value);
        } catch (error) {
            console.error('Error in face detection:', error);
        }
    }, 100);
};

const stop = () => {
    if (detectInterval) {
        clearInterval(detectInterval);
        detectInterval = null;
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    if (videoRef.value) {
        videoRef.value.srcObject = null;
    }
    if (canvasRef.value) {
        const ctx = canvasRef.value.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    }
    isActive.value = false;
    faceDetected.value = false;
    emit('stopped');
};

const checkPermission = async () => {
    try {
        if (navigator.permissions && navigator.permissions.query) {
            const result = await navigator.permissions.query({ name: 'camera' });
            permissionStatus.value = result.state;
            
            if (result.state === 'granted') {
                start();
            }
            
            // Listen for permission changes
            result.addEventListener('change', (e) => {
                permissionStatus.value = e.target.state;
                if (e.target.state === 'granted') {
                    start();
                } else if (e.target.state === 'denied') {
                    permissionDenied.value = true;
                    stop();
                }
            });
        } else {
            // Fallback for browsers that don't support permissions API
            permissionStatus.value = 'prompt';
        }
    } catch (error) {
        console.error('Error checking camera permission:', error);
        permissionStatus.value = 'prompt';
    }
};

const requestPermission = () => {
    isLoading.value = true;
    start();
};

const handlePatternComplete = (pattern) => {
    console.log('Pattern completed:', pattern);
    // Here you can handle the pattern verification
    // For example, send it to your backend for validation
};

watch(faceDetected, (newVal) => {
    searchBusy.value = true
    setTimeout(() => {
        searchBusy.value = false
        searchComplete.value = true
        hasAccount.value = true
    }, 1000)
})

// Canvas methods
const getCanvas = () => canvasRef.value;
const getContext = () => canvasRef.value?.getContext('2d');
const getVideo = () => videoRef.value;
const isStreamActive = () => isActive.value;
const getStream = () => stream;

// Expose methods and state
defineExpose({
    start,
    stop,
    requestPermission,
    getCanvas,
    getContext,
    getVideo,
    isStreamActive,
    getStream,
    faceDetected
});

onMounted(async () => {
    await checkPermission();
});

onUnmounted(() => {
    stop();
});
</script> 