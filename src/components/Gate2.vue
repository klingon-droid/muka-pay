<template>
    <div class="h-screen w-screen flex flex-col justify-center items-center py-12 space-y-6">


        <button v-if="register_step > 1" @click="cancelRegister()" class="bg-red-500 text-white text-lg px-4 py-2 rounded-full top-4 right-4 fixed">Cancel</button>
        
        <div :class="[ hasCameraPermission? [ isFaceDetected?'scale-[0.8]':'','w-[300px] h-[300px] bg-gray-200']:'w-[200px] h-[200px] bg-black', '  rounded-full flex justify-center items-center duration-300 shrink-0' ]">
            <iconify-icon v-if="!hasCameraPermission" icon="typcn:camera" class="text-white text-[5rem] absolute"></iconify-icon>

            <div v-if="hasCameraPermission" class="w-full h-full flex justify-center items-center flex-col">
                <p>Dummy Camera Feed</p>
                <p>FaceDetected? {{ isFaceDetected }}</p>
                <p>isNewFaceEmbeddingGenerated? {{ isNewFaceEmbeddingGenerated }}</p>
            </div>
        </div>

        <div :class="[isSearchBusy?'h-12':'h-0', 'overflow-hidden']" class="text-center text-sm text-gray-800 animate-bounce duration-500">
            Searching Account
        </div>


        <template v-if="!hasCameraPermission">
            <button @click="requestCameraPermission()" class="mt-12 bg-black text-white px-4 py-2 rounded-md">Enable</button>
        </template>

        <template v-if="isNewUser">


            <template v-if="register_step == 1">
                <div class="grow w-full flex flex-col justify-start items-center">
                    <div class="text-center mb-12">
                        <p class="text-4xl font-bold mb-4">Hello New Face</p>
                        <p class="text-lg">Let's get started!</p>
                    </div>
    
                    <button @click="register_step = 2" class="bg-black text-white px-8 py-4 rounded-full text-2xl">Register New Account</button>
    
                    <div class="text-center absolute bottom-12 w-full">
                        <p class="text-xl font-bold">Already have an account?</p>
                        <p class="text-sm">Please center your face and come closer</p>
                    </div>
                </div>
            </template>

            <template v-if="register_step == 2">


                <div class="grow w-full flex flex-col justify-start items-center">
                    <div class="text-center mb-12 px-4">
                        <p class="text-2xl font-bold mb-4">Pick your username</p>
                        <p class="">This will be used to send and receive payments</p>
                    </div>

                    <div class="w-full flex flex-col justify-center items-center px-8 space-y-4">
                        <input type="text" v-model="username" class="w-full p-4 rounded-full text-2xl border border-gray-300 placeholder:text-center text-center" placeholder="Enter your username...">
                        <button @click="register_step = 3" class="bg-black text-white px-8 py-4 rounded-full text-2xl w-full">Next</button>
                    </div>
                </div>


            </template>

            <template v-if="register_step == 3">
                <div class="grow w-full flex flex-col justify-start items-center">
                    <div class="w-full flex justify-center items-center p-4 flex-col -mt-12">
                        <p class="text-2xl text-center font-bold mb-4">Your Secret Pattern</p>
                        <p class="text-center">This is your password.Make sure it is not easy to guess, and remember it!</p>
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
                                :icon="confirmPattern ? 'mdi:check-circle' : 'mdi:checkbox-blank-circle-outline'"
                                :class="confirmPattern ? 'text-black' : 'text-gray-300'"
                                class="text-xl"
                            />
                            <p>Repeat the pattern</p>
                        </div>
                    </div>

                    <div class="relative w-full flex flex-col justify-center items-center">
                        <PatternPad2 
                            ref="patternPadRef" 
                            @pattern-complete="handlePatternComplete"
                        />

                        <!-- First pattern created, show controls -->
                        <div v-if="patternStep === 1 && firstPattern && firstPattern.length >= 6" class="flex gap-2">
                            <button 
                                @click="resetPattern"
                                class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full text-sm flex items-center gap-2"
                            >
                                <iconify-icon icon="mdi:refresh" />
                                Reset
                            </button>
                            <button 
                                @click="moveToConfirmPattern"
                                class="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-full text-sm flex items-center gap-2"
                            >
                                <iconify-icon icon="mdi:check" />
                                Next
                            </button>
                        </div>

                        <!-- Confirm pattern created, show controls -->
                        <div v-if="patternStep === 2 && confirmPattern" class="flex gap-2 ">
                            <button 
                                @click="resetPattern"
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

                    <div v-if="patternError" class="text-red-500 text-center flex flex-col items-center gap-4 mt-6">
                        <p>{{ patternError }}</p>
                        <button 
                            @click="resetPattern"
                            class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full text-sm flex items-center gap-2"
                        >
                            <iconify-icon icon="mdi:refresh" />
                            Reset
                        </button>
                    </div>
                </div>
            </template>

            <template v-if="register_step == 4">

                <div class="w-full flex flex-col justify-start items-center"> 

                    <div v-if="!isNewFaceEmbeddingGenerated" class="text-center">
                        <p class="text-2xl font-bold mb-2">Hold Still</p>
                        <p>Generating your face signature</p>
                    </div>

                    <div :class="[isNewFaceEmbeddingGenerated?'opacity-100':'opacity-0', 'text-center']">
                        
                        <div class="mb-12">
                            <p class="text-3xl font-bold mb-2">Welcome!</p>
                            <p>{{ username }}, your account is ready!</p>
                        </div>

                        <button @click="completeRegister()" class="bg-black text-white px-6 py-3 rounded-full text-xl w-full">Enter App</button>
                        
                    </div>


                </div>


            </template>
        </template>
    </div>
</template>

<script setup>

    import { ref, watch } from 'vue';
    import PatternPad2 from './PatternPad2.vue';

    const hasCameraPermission = ref(false);
    const isFaceDetected = ref(false);
    const isSearchBusy = ref(false);
    const isNewUser = ref(false);
    const isNewFaceEmbeddingGenerated = ref(false);


    const register_step = ref(0);

    const username = ref('');
    
    // Pattern related refs
    const patternPadRef = ref(null);
    const patternStep = ref(1); // 1: Create, 2: Confirm
    const firstPattern = ref('');
    const confirmPattern = ref('');
    const patternError = ref('');

    const requestCameraPermission = () => {
        hasCameraPermission.value = true;
    }

    // dummy detect face
    
    watch(hasCameraPermission, () => {
        if (hasCameraPermission.value) {
            setTimeout(() => {
                isFaceDetected.value = true;
                searchAccount();


            }, 1000);
        }
    })

    const searchAccount = () => {
        isSearchBusy.value = true;

        setTimeout(() => {
            isSearchBusy.value = false;

            // dummy for new user
            register_step.value = 1;
            isNewUser.value = true;

        }, 1000);
    }

    const cancelRegister = () => {
        register_step.value = 0;
        isNewUser.value = false;
        resetRegistrationState();
        searchAccount();
    }

    const resetRegistrationState = () => {
        username.value = '';
        resetPattern();
    }

    const handlePatternComplete = (pattern) => {
        if (patternStep.value === 1) {
            // First pattern
            if (pattern.length < 6) {
                patternError.value = 'Pattern must be at least 6 dots';
                return;
            }
            firstPattern.value = pattern;
            patternError.value = '';
        } else if (patternStep.value === 2) {
            // Confirm pattern
            if (pattern !== firstPattern.value) {
                patternError.value = 'Patterns do not match. Please try again.';
                patternStep.value = 1;
                firstPattern.value = '';
                confirmPattern.value = '';
                return;
            }
            confirmPattern.value = pattern;
            patternError.value = '';
        }
    }

    const moveToConfirmPattern = () => {
        patternStep.value = 2;
        patternPadRef.value?.clearPattern();
    }

    const resetPattern = () => {
        patternPadRef.value?.clearPattern();
        patternStep.value = 1;
        patternError.value = '';
        firstPattern.value = '';
        confirmPattern.value = '';
    }

    const submitPattern = () => {
        // Here you would submit the username and pattern to your backend
        console.log('metadata:', {
            username: username.value,
            pattern: confirmPattern.value
        });
        
        // Reset and go back to initial state
        register_step.value = 4;
    }

    watch(register_step, () => {

        /// Start generating face embedding when register_step is 4
        // TODO: add detect face orientation: should start when face is looking center
        if (register_step.value == 4) {
            isNewFaceEmbeddingGenerated.value = false;
            setTimeout(() => {
                isNewFaceEmbeddingGenerated.value = true;
            }, 1000);
        }
    })

    const completeRegister = () => {

        // we need to store the user cred so next time come in no need login

        window.location.href = '/app';
    }

</script>