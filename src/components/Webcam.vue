<template>
    <div class="relative w-full h-full flex justify-center items-center flex-col">

        <div :class="[isActive?'w-[300px] h-[300px] bg-black/0':'mb-8 w-[200px] h-[200px] bg-black', searchComplete?'-mt-[100px]':'']" class="  rounded-full flex justify-center items-center duration-500">

            <div :class="[!isActive?'w-[200px] h-[200px]':' w-[300px] h-[300px] overflow-hidden','rounded-full duration-300 delay-75 absolute', faceDetected? ( isRegistering? 'scale-[0.5]':'scale-[0.8]'):'']">
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

                <div v-if="!isRegistering" class="my-12 text-center">
                    <div class="text-4xl font-bold mb-4">Hello New Face</div>
                    <p class="text-lg">Let's get started!</p>
                </div>

                <template v-if="!isRegistering">
                    <button @click="isRegistering = true" class="bg-black text-white text-2xl px-8 py-3 rounded-full">Register New Account</button>
                </template>

                <template v-else>
                    <!-- Registration Steps -->
                    <div class="w-full max-w-md space-y-8 relative">
                        <!-- Back Button - Now positioned as a close button -->
                        <button 
                            @click="() => {
                                if (registrationStep === 0) {
                                    isRegistering = false;
                                } else {
                                    registrationStep = 0;
                                    registrationError = '';
                                    firstPattern = '';
                                }
                            }"
                            class="fixed top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                            Cancel
                        </button>

                        <!-- Username Step -->
                        <div v-if="registrationStep === 0" class="space-y-4">
                            <h3 class="text-2xl font-bold text-center">Pick a username</h3>
                            <div class="flex flex-col space-y-2">
                                <input 
                                    type="text" 
                                    v-model="username"
                                    class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                                    placeholder="Enter username"
                                />
                                <button 
                                    @click="registrationStep = 1"
                                    :disabled="!username.trim()"
                                    class="bg-black text-white px-6 py-2 rounded-lg disabled:bg-gray-300"
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        <!-- Pattern Setup Steps -->
                        <div v-else class="space-y-4">
                            <!-- Step Indicators -->
                            <!--<div v-if="registrationStep !== 3" class="flex justify-center gap-4 mb-6">
                                <div class="flex flex-col items-center">
                                    <div :class="[
                                        'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2',
                                        registrationStep === 1 ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-400'
                                    ]">
                                        1
                                    </div>
                                    <div class="text-sm mt-1" :class="registrationStep === 1 ? 'text-black' : 'text-gray-400'">Setup</div>
                                </div>
                                <div class="flex flex-col items-center">
                                    <div :class="[
                                        'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2',
                                        registrationStep === 2 ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-400'
                                    ]">
                                        2
                                    </div>
                                    <div class="text-sm mt-1" :class="registrationStep === 2 ? 'text-black' : 'text-gray-400'">Repeat</div>
                                </div>
                            </div>-->

                            <!-- <template v-if="registrationStep === 3">
                                <div class="text-center text-green-600 font-bold text-xl animate-pulse">
                                    Registering...
                                </div>
                            </template> -->

                            <template v-if="registrationStep != 3">

                                <div class="w-full flex justify-center items-center p-4 flex-col -mt-12">
                                    <p class="text-3xl text-center font-bold mb-4">Your Secret Pattern</p>
                                    <p class="text-center underline">This is your password.</p>
                                    <p class="text-center text-gray-600 px-4">Make sure it is not easy to guess, and remember it!</p>
                                </div>


                                <div class="w-full flex justify-center flex-col items-center text-center space-y-2">
                                    <div class="flex items-center gap-2">
                                        <iconify-icon 
                                            :icon="firstPattern && firstPattern.length >= 6 ? 'mdi:check-circle' : 'mdi:checkbox-blank-circle-outline'"
                                            :class="firstPattern && firstPattern.length >= 6 ? 'text-black' : 'text-gray-300'"
                                            class="text-xl"
                                        />
                                        <p>Minimum 6 dots</p>
                                    </div>
                                    <div v-if="firstPattern && firstPattern.length >= 6" class="flex items-center gap-2">
                                        <iconify-icon 
                                            :icon="registrationStep === 3 || confirmPattern ? 'mdi:check-circle' : 'mdi:checkbox-blank-circle-outline'"
                                            :class="registrationStep === 3 || confirmPattern ? 'text-black' : 'text-gray-300'"
                                            class="text-xl"
                                        />
                                        <p>Repeat the pattern</p>
                                    </div>
                                </div>

                                
                                
                                <div class="relative w-full flex justify-center items-center">
                                    <PatternPad 
                                        ref="patternPadRef" 
                                        @pattern-complete="handlePatternComplete"
                                        :isConfirmStep="registrationStep === 2"
                                    />
                                    <div v-if="registrationStep === 1 && firstPattern && firstPattern.length >= 6" class="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                                        <button 
                                            @click="() => {
                                                $refs.patternPadRef?.clearPattern();
                                                registrationStep = 1;
                                                registrationError = '';
                                                firstPattern = '';
                                            }"
                                            class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full text-sm flex items-center gap-2"
                                        >
                                            <iconify-icon icon="mdi:refresh" />
                                            Reset
                                        </button>
                                        <button 
                                            @click="() => {
                                                $refs.patternPadRef?.clearPattern();
                                                registrationStep = 2;
                                            }"
                                            class="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-full text-sm flex items-center gap-2"
                                        >
                                            <iconify-icon icon="mdi:check" />
                                            Next
                                        </button>
                                    </div>
                                    <div v-if="registrationStep === 2 && confirmPattern" class="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                                        <button 
                                            @click="() => {
                                                $refs.patternPadRef?.clearPattern();
                                                registrationStep = 1;
                                                registrationError = '';
                                                firstPattern = '';
                                                confirmPattern = '';
                                            }"
                                            class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full text-sm flex items-center gap-2"
                                        >
                                            <iconify-icon icon="mdi:refresh" />
                                            Reset
                                        </button>
                                        <button 
                                            @click="submitPattern"
                                            class="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-full text-sm flex items-center gap-2"
                                        >
                                            <iconify-icon icon="mdi:check" />
                                            Confirm
                                        </button>
                                    </div>
                                </div>

                                <div v-if="registrationError" class="text-red-500 text-center flex flex-col items-center gap-4">
                                    <p>{{ registrationError }}</p>
                                    <button 
                                        @click="() => {
                                            $refs.patternPadRef?.clearPattern();
                                            registrationStep = 1;
                                            registrationError = '';
                                            firstPattern = '';
                                        }"
                                        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full text-sm flex items-center gap-2"
                                    >
                                        <iconify-icon icon="mdi:refresh" />
                                        Reset
                                    </button>
                                </div>
                            </template>
                        </div>
                    </div>
                </template>
    
                <div v-if="!isRegistering" class="fixed bottom-0 w-full bg-white p-4 py-12 text-center">
                    <p class="text-xl font-semibold mb-2">Already have an account?</p>
                    <p class="text-sm">Please center your face and come closer</p>
                </div>

            </template>

            <template v-else>

                <div class=" text-center">
                    <div class="text-4xl font-bold mb-4">Welcome Back</div>
                    <p class="text-lg">Login with your secret pattern</p>
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

// Registration state
const isRegistering = ref(false);
const registrationStep = ref(0); // 0: username, 1: pattern, 2: confirm pattern
const username = ref('');
const firstPattern = ref('');
const registrationError = ref('');
const confirmPattern = ref('');

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

const submitPattern = () => {
    // Registration successful
    console.log('Registration successful:', {
        username: username.value,
        pattern: confirmPattern.value
    });
    registrationStep.value = 3; // New step for showing only the registering message
    isRegistering.value = false;
    searchComplete.value = false;
    registrationStep.value = 0;
    username.value = '';
    firstPattern.value = '';
    confirmPattern.value = '';
};

const handlePatternComplete = (pattern) => {
    if (isRegistering.value) {
        if (registrationStep.value === 1) {
            // First pattern entry
            if (pattern.length < 6) {
                registrationError.value = 'Pattern must be at least 6 dots';
                return;
            }
            // Only store the pattern temporarily, don't advance step
            firstPattern.value = pattern;
            registrationError.value = '';
            // Step will be advanced by the confirm button
        } else if (registrationStep.value === 2) {
            // Confirm pattern
            if (pattern !== firstPattern.value) {
                registrationError.value = 'Patterns do not match. Please try again.';
                registrationStep.value = 1;
                firstPattern.value = '';
                confirmPattern.value = '';
                return;
            }
            // Store the confirmed pattern but don't submit yet
            confirmPattern.value = pattern;
            registrationError.value = '';
        }
    } else {
        console.log('Pattern completed:', pattern);
        // Here you can handle the pattern verification
        // For example, send it to your backend for validation
    }
};

watch(faceDetected, (newVal) => {
    searchBusy.value = true
    setTimeout(() => {
        searchBusy.value = false
        searchComplete.value = true
        hasAccount.value = false
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