<template>
    <div class="h-[100dvh] w-screen flex flex-col justify-center items-center py-12 space-y-6">


        <button v-if="register_step > 1" @click="cancelRegister()" class="bg-red-500 text-white text-lg px-4 py-2 rounded-full top-4 right-4 fixed">Cancel</button>
        
        <div :class="[ hasCameraPermission? [ isFaceDetected?'scale-[0.8]':'','w-[250px] h-[250px] bg-gray-200']:'w-[180px] h-[180px] bg-black', '  rounded-full flex justify-center items-center duration-300 shrink-0' ]">
            <iconify-icon v-if="!hasCameraPermission" icon="typcn:camera" class="text-white text-[5rem] absolute"></iconify-icon>

            <div class="w-full h-full flex justify-center items-center flex-col">

                <div :class="[!isActive?'w-[180px] h-[180px]':' w-[250px] h-[250px] overflow-hidden','rounded-full duration-300 delay-75 absolute', '']">
                    <video 
                        ref="videoRef" 
                        autoplay 
                        muted 
                        playsinline 
                        :class="[
                            'h-full w-full object-cover transition-transform duration-300',
                            { 'scale-x-[-1]': isFlipped }
                        ]"
                    >
                    </video>
                    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full"></canvas>
                </div>
                <!-- <p>Dummy Camera Feed</p> -->
                <!-- <p>FaceDetected? {{ isFaceDetected }}</p>
                <p>isNewFaceEmbeddingGenerated? {{ isNewFaceEmbeddingGenerated }}</p> -->
            </div>
        </div>

        <div :class="[isSearchBusy?'h-12':'h-0', 'overflow-hidden']" class="text-center text-sm text-gray-800 animate-bounce duration-500">
            Searching Account
        </div>

        <!-- Loading indicator for model initialization -->
        <div v-if="isModelLoading" class="flex flex-col items-center justify-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
            <p class="text-lg font-medium">Loading face recognition models...</p>
            <p class="text-sm text-gray-500">This may take a few moments</p>
        </div>

        <!-- Camera permission button - only show after models are loaded -->
        <template v-if="!hasCameraPermission && !matchedEmbedding && !isModelLoading">
            <button @click="requestCameraPermission()" class="mt-12 bg-black text-white px-4 py-2 rounded-md">Enable Camera</button>
        </template>

        <template v-if="isNewUser">
            <template v-if="register_step == 1">
                <div class="grow w-full flex flex-col justify-between items-center">                        
                    <div class="text-center mb-12">
                        <p class="text-4xl font-bold mb-4">Hello New Face</p>
                        <p class="text-lg">Let's get started!</p>
                    </div>
    
                    <button @click="register_step = 2" class="bg-black text-white px-8 py-4 rounded-full text-2xl">Register New Account</button>
    
                    <div class="text-center w-full mt-auto mb-12">
                        <p class="text-xl font-bold">Already have an account?</p>
                        <p class="text-sm">Please center your face and come closer</p>
                        <button @click="searchAccount" class="mt-4 bg-black text-white px-6 py-2 rounded-full text-sm">Search Account</button>
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
                        <button @click="submitUsername()" class="bg-black text-white px-8 py-4 rounded-full text-2xl w-full">Next</button>
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

        <template v-if="!isNewUser">
            <div class="w-full flex flex-col justify-start items-center">
                
                <div class="flex flex-col justify-center items-center" v-if="login_step == 1">
                    <p class="text-2xl font-bold mb-2">Welcome back!</p>
                    <p>Draw your secret pattern to login</p>

                    <PatternPad2 ref="patternPadRef" @pattern-complete="handleExistingUserLogin" />

                    <div class="mt-8 text-center">
                        <p class="text-sm text-gray-600">Not you?</p>
                        <button @click="searchAccount" class="mt-2 bg-black text-white px-6 py-2 rounded-full text-sm">Search Again</button>
                    </div>
                </div>

                <div v-if="login_step == 2">

                    <div>
                        <p class="mb-8 text-center text-2xl font-bold">Verifying...</p>
                    </div>

                    <div class="flex justify-center items-center">
                        <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
                    </div>
                </div>

                <div class="flex flex-col justify-center items-center" v-if="login_step == 3">
                    
                    <div class="mb-8 text-center">
                        <p class="text-2xl font-bold mb-2">Login failed</p>
                        <p>Is your pattern correct? Please try again</p>
                    </div>

                    <button @click="login_step = 1" class="bg-black text-white px-6 py-3 rounded-full text-xl ">Try again</button>
                    
                </div>

            </div>
        </template>


    </div>
</template>

<script setup>

    import { Human } from '@vladmandic/human'
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
            mesh: { enabled: true },
            embedding: {
                enabled: true,
                return: true
            },
            description: { enabled: true },
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
    })
    const FACE_SIZE_THRESHOLD = 0.5 // Face should take up at least 30% of the video width


    const videoRef = ref(null);
    const canvasRef = ref(null)
    let detectInterval = null;

    const checkFaceDetection = async () => {
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
                isFaceDetected.value = result.face && result.face.length > 0;
                // console.log(faceDetected.value);
            } catch (error) {
                console.error('Error in face detection:', error);
            }
        }, 100);
    };





    import { ref, watch, onMounted } from 'vue';
    import PatternPad2 from './PatternPad2.vue';
    import { setUsername, generateProof } from '../stores/user';

    const emit = defineEmits(['login-success', 'register-success']);

    const hasCameraPermission = ref(false);
    const isFaceDetected = ref(false);
    const isFaceLargeEnough = ref(false);
    const faceDescriptor = ref(null);
    const isSearchBusy = ref(false);
    const isNewUser = ref(false);
    const isNewFaceEmbeddingGenerated = ref(false);
    const lastFaceDetectedState = ref(false);


    const register_step = ref(0);
    const login_step = ref(0);

    const username = ref('');
    
    // Pattern related refs
    const patternPadRef = ref(null);
    const patternStep = ref(1); // 1: Create, 2: Confirm
    const firstPattern = ref('');
    const confirmPattern = ref('');
    const patternError = ref('');

    const isCapturing = ref(false);
    const capturedFrames = ref([]);
    const captureInfo = ref('');
    const isActive = ref(false);
    const isFlipped = ref(true);
    const autoCheckInterval = ref(null);

    const matchedEmbedding = ref(null);

    const isModelLoading = ref(true);
    const isModelLoaded = ref(false);

    onMounted(async () => {
        // Initialize Human models
        try {
            await human.load();
            await human.warmup();
            isModelLoaded.value = true;
        } catch (error) {
            console.error('Error initializing face detection:', error);
        } finally {
            isModelLoading.value = false;
        }

        /// get face embedding from local storage
        const faceEmbedding = localStorage.getItem('mukapay-face');
        if (faceEmbedding) {
            matchedEmbedding.value = [JSON.parse(faceEmbedding)]; // Store as array to be consistent
            isNewUser.value = false;
            window.location.href = '/app';
        }
    })

    const requestCameraPermission = async () => {
        if (!isModelLoaded.value) {
            console.error('Models not loaded yet');
            return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                facingMode: 'user'
            },
            audio: false
        });
        isActive.value = true;
        isCapturing.value = true;
        hasCameraPermission.value = true;
        videoRef.value.srcObject = stream;
        
        await new Promise(resolve => {
            videoRef.value.onloadedmetadata = resolve;
        });
        await videoRef.value.play();
        await checkFaceDetection();

        // search account
        await searchAccount();
    }

    // dummy detect face
    
    watch(hasCameraPermission, async () => {
        if (hasCameraPermission.value) {

            // checkFaceDetection();
            // setTimeout(() => {
            //     isFaceDetected.value = true;
            //     searchAccount();
            // }, 1000);

        }
    })

    const searchAccount = async () => {
        isSearchBusy.value = true;

        try {
            const vresult = await human.detect(videoRef.value, {
                face: {
                    detector: { enabled: true, rotation: true },
                    mesh: { enabled: true },
                    embedding: { enabled: true }
                }
            })

            if (!vresult.face || vresult.face.length === 0) {
                throw new Error('No face detected')
            }
            console.log('Face detected, searching in database...', vresult);

            const candidates = await searchPinecone(vresult.face[0].embedding);
            console.log('Matched candidates:', candidates);

            if(!candidates || candidates.length === 0) {
                register_step.value = 1;
                isNewUser.value = true;    
            } else {
                console.log('User candidates found, waiting for login...')
                localStorage.setItem('mukapay-candidates', JSON.stringify(candidates));
                matchedEmbedding.value = candidates;
                isNewUser.value = false;
                login_step.value = 1;
                // window.location.href = '/app';
            }

        } catch (error) {
            console.error('Error searching account:', error);
            register_step.value = 1;
            isNewUser.value = true;
        } finally {
            isSearchBusy.value = false;
        }

        // try {

        //     // dummy for existing user
        //     isNewUser.value = false;
        //     login_step.value = 1;

        //     // dummy for new user
        //     // register_step.value = 1;
        //     // isNewUser.value = true;


        // }

        // setTimeout(() => {
        //     isSearchBusy.value = false;
        //     // dummy for new user
        //     register_step.value = 1;
        //     isNewUser.value = true;
        // }, 1000);


    }


    const searchPinecone = async (_faceEmbedding) => {
        // Search in Pinecone
        const response = await fetch('https://face4-ff60525.svc.aped-4627-b74a.pinecone.io/query', {
            method: 'POST',
            headers: {
                'Api-Key': 'pcsk_65jcaw_DxQsFPjgiuo5pTiYBsovpdYo7DsPALMLM5bKMzCxLgnm5rrWh8NxibVMDrCC8qG',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vector: Array.from(_faceEmbedding),
                topK: 5,
                includeMetadata: true
            })
        })

        if (!response.ok) throw new Error('Failed to search database')

        const data = await response.json()
        console.log('Pinecone response:', data)
        
        // Return all matches with a score above threshold (instead of just the top one)
        const candidates = data.matches.filter(match => match.score > 0.7);
        return candidates.length > 0 ? candidates : null;
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

    // Watch for face detection state changes
    watch(isFaceDetected, (newState) => {
        if (newState && !lastFaceDetectedState.value) {
            // Face just became detected
            searchAccount();
        } else if (!newState && lastFaceDetectedState.value) {
            // Face detection lost
            resetFormState();
        }
        lastFaceDetectedState.value = newState;
    });

    const resetFormState = () => {
        // Reset registration state
        register_step.value = 0;
        isNewUser.value = false;
        resetRegistrationState();
        
        // Reset login state
        login_step.value = 0;
        matchedEmbedding.value = null;
        localStorage.removeItem('mukapay-candidates');
        
        // Reset pattern state
        resetPattern();
    }

    // Watch for register_step 4 to start face embedding generation
    watch(register_step, (newStep) => {
        if (newStep === 4) {
            isNewFaceEmbeddingGenerated.value = false;
            captureInfo.value = 'Detecting your face...';
            startFaceDetection();
        }
    });

    const startFaceDetection = async () => {
        if (!videoRef.value || !canvasRef.value) return

        const videoEl = videoRef.value
        const canvasEl = canvasRef.value
        
        // Set canvas size to match video
        const updateCanvasSize = () => {
            canvasEl.width = videoEl.videoWidth
            canvasEl.height = videoEl.videoHeight
        }
        updateCanvasSize()

        detectInterval = setInterval(async () => {
            if (videoEl.paused || videoEl.ended) return
            
            try {
                // Detect face with full configuration
                const result = await human.detect(videoEl, {
                    face: {
                        detector: { enabled: true, rotation: true },
                        mesh: { enabled: true },
                        embedding: { enabled: true }
                    }
                })
                const ctx = canvasEl.getContext('2d')
                // ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

                // Update face detection status
                isFaceDetected.value = result.face && result.face.length > 0

                // Draw face box and landmarks if detected
                if (isFaceDetected.value) {
                    captureInfo.value = "Face detected...";
                    const face = result.face[0]
                    
                    // Check if face is large enough
                    const faceWidth = face.box[2]
                    const faceHeight = face.box[3]
                    const videoWidth = videoEl.videoWidth
                    const videoHeight = videoEl.videoHeight
                    
                    // Calculate face size relative to video dimensions
                    const faceSizeRatio = Math.max(faceWidth / videoWidth, faceHeight / videoHeight)
                    isFaceLargeEnough.value = faceSizeRatio >= FACE_SIZE_THRESHOLD
                    
                    // // Draw bounding box with enhanced visibility
                    // ctx.strokeStyle = isFaceLargeEnough.value ? '#4CAF50' : '#FFA500'
                    // ctx.lineWidth = 4
                    // ctx.strokeRect(face.box[0], face.box[1], face.box[2], face.box[3])
                    
                    // // Add semi-transparent fill
                    // ctx.fillStyle = isFaceLargeEnough.value ? 
                    //     'rgba(76, 175, 80, 0.1)' : 
                    //     'rgba(255, 165, 0, 0.1)'
                    // ctx.fillRect(face.box[0], face.box[1], face.box[2], face.box[3])

                    // // Draw face mesh/landmarks
                    // if (face.mesh) {
                    //     ctx.strokeStyle = '#2196F3'
                    //     ctx.lineWidth = 1
                    //     ctx.beginPath()
                        
                    //     // Draw face mesh lines
                    //     face.mesh.forEach((point, index) => {
                    //         if (index === 0) {
                    //             ctx.moveTo(point[0], point[1])
                    //         } else {
                    //             ctx.lineTo(point[0], point[1])
                    //         }
                    //     })
                    //     ctx.stroke()

                    //     // Draw key facial landmarks
                    //     ctx.fillStyle = '#FFC107'
                    //     const keyPoints = [
                    //         face.mesh[33],  // nose
                    //         face.mesh[133], // right eye
                    //         face.mesh[362], // left eye
                    //         face.mesh[152]  // mouth
                    //     ]
                        
                    //     keyPoints.forEach(point => {
                    //         if (point) {
                    //             ctx.beginPath()
                    //             ctx.arc(point[0], point[1], 3, 0, 2 * Math.PI)
                    //             ctx.fill()
                    //         }
                    //     })
                    // }

                    // If we're capturing and face is detected and large enough, process it
                    if (isCapturing.value && isFaceLargeEnough.value) {
                        await processFaceCapture(result)
                    }
                } else {
                    isFaceLargeEnough.value = false
                    captureInfo.value = "Please come closer and center your face..."
                }
            } catch (error) {
                captureInfo.value = "Error in face detection..."
                console.error('Error in face detection:', error)
            }
        }, 100)
    }

    const processFaceCapture = async (result) => {
        if (!result.face || result.face.length === 0 || !videoRef.value) return
        
        const face = result.face[0]
        
        // Only capture if we have embedding data
        if (!face.embedding || face.embedding.length === 0) {
            console.error('No embedding data available')
            return
        }

        try {
            captureInfo.value = "Capturing...";
            // Create thumbnail
            const thumbnailCanvas = document.createElement('canvas')
            const size = 150
            thumbnailCanvas.width = size
            thumbnailCanvas.height = size
            const ctx = thumbnailCanvas.getContext('2d')

            // Calculate crop dimensions with padding
            const box = face.box
            const padding = 0.3 // 30% padding
            const cropSize = Math.max(box[2], box[3]) * (1 + padding * 2)
            const cropX = Math.max(0, box[0] + box[2]/2 - cropSize/2)
            const cropY = Math.max(0, box[1] + box[3]/2 - cropSize/2)

            // Draw the cropped region directly from the video
            ctx.drawImage(
                videoRef.value,
                cropX, cropY, cropSize, cropSize,  // Source rectangle
                0, 0, size, size                   // Destination rectangle
            )

            // Add a white background to ensure visibility
            ctx.fillStyle = 'white'
            ctx.globalCompositeOperation = 'destination-over'
            ctx.fillRect(0, 0, size, size)
            ctx.globalCompositeOperation = 'source-over'

            // Create frame data
            const frameData = {
                angle: 'center',
                descriptor: Array.from(face.embedding),
                thumbnail: thumbnailCanvas.toDataURL('image/jpeg', 0.8)
            }

            // Add to captured frames
            capturedFrames.value.push(frameData)

            // If we have enough samples, finish capture
            if (capturedFrames.value.length >= 5) {
                captureInfo.value = "Capture complete! Registering your account...";
                finishCapture()
            }
        } catch (error) {
            console.error('Error processing face capture:', error)
            captureInfo.value = "Error capturing face. Please try again."
        }
    }

    const finishCapture = () => {
        isCapturing.value = false
        captureInfo.value = 'Averaging your face...';

        // Filter out any frames with invalid descriptors
        const validFrames = capturedFrames.value.filter(frame => 
            frame.descriptor && frame.descriptor.every(val => !isNaN(val))
        )
        
        if (validFrames.length > 0) {
            // Get the descriptor length from the first valid frame
            const descriptorLength = validFrames[0].descriptor.length
            const avgDescriptor = new Array(descriptorLength).fill(0)
            
            // Sum up all valid descriptors
            validFrames.forEach(frame => {
                frame.descriptor.forEach((val, i) => {
                    avgDescriptor[i] += val / validFrames.length
                })
            })
            
            // Verify the average descriptor has valid values
            if (avgDescriptor.every(val => !isNaN(val))) {
                faceDescriptor.value = avgDescriptor;
                saveToDatabase();
                captureInfo.value = 'Face captured successfully!';
            } else {
                console.error('Error: Invalid average descriptor')
                faceDescriptor.value = 'Error: Invalid face descriptor'
            }
        } else {
            console.error('No valid frames to average')
            faceDescriptor.value = 'Error: No valid face descriptors captured'
        }
    }

    const saveToDatabase = async () => {
        if (!username.value || !faceDescriptor.value) return;
        
        try {
            const vectors = [];
            
            // Add the average vector with encrypted metadata
            const metadata = {
                username: await encryptMetadata(username.value, confirmPattern.value),
                angle: 'average',
                timestamp: new Date().toISOString(),
                // angles: capturedFrames.value.map(f => f.angle)
            };

            const array = new Uint8Array(16);
            const timestamp = Date.now().toString(36);
            window.crypto.getRandomValues(array);
            const uuid = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
            const id = `${timestamp}_${uuid}`;

            const payload = {
                // id: `${username.value}_average`,
                id: id,
                values: faceDescriptor.value,
                metadata: metadata
            }
            console.log('Payload:', payload);

            vectors.push(payload);

            const proof = await generateProof(username.value, confirmPattern.value);
            console.log('Proof:', proof);

            // Send to Pinecone
            const response = await fetch('https://face4-ff60525.svc.aped-4627-b74a.pinecone.io/vectors/upsert', {
                method: 'POST',
                headers: {
                    'Api-Key': 'pcsk_65jcaw_DxQsFPjgiuo5pTiYBsovpdYo7DsPALMLM5bKMzCxLgnm5rrWh8NxibVMDrCC8qG',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ vectors })
            });

            if (!response.ok) throw new Error('Failed to save to database');

            const register = await fetch(`${window.location.origin}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ proof })
            });

            if (!register.ok) throw new Error('Failed to register');
            
        } catch (error) {
            console.error('Error saving to database:', error);
        } finally {
            isNewFaceEmbeddingGenerated.value = true;
        }
    };



    const completeRegister = () => {

        // we need to store the user cred so next time come in no need login

        // window.location.href = '/app';
        closeGate();
        emit('register-success', username.value);
    }

    const handleExistingUserLogin = async (pattern) => {
        console.log('pattern:', pattern);
        login_step.value = 2;

        const candidates = matchedEmbedding.value;
        let loginSuccessful = false;

        // Try each candidate in order of highest score
        for (const candidate of candidates) {
            try {
                const decryptedUsername = await decryptMetadata(candidate.metadata.username, pattern);
                console.log('Trying candidate:', candidate.id, 'Result:', decryptedUsername);
                
                if (decryptedUsername) {
                    // Found the right match
                    console.log('Login successful with candidate:', candidate);
                    setUsername(decryptedUsername);
                    
                    // Store only the successful candidate for future use
                    localStorage.setItem('mukapay-face', JSON.stringify(candidate));

                    closeGate();
                    
                    loginSuccessful = true;
                    clearInterval(detectInterval);
                    // remove all candidates
                    matchedEmbedding.value = [];
                    localStorage.removeItem('mukapay-candidates');
                    // window.location.href = '/app';
                    emit('login-success', decryptedUsername);
                    break;
                }
            } catch (error) {
                console.error('Error trying candidate:', error);
                // Continue to next candidate
            }
        }

        if (!loginSuccessful) {
            login_step.value = 3;
        }
    }

    const closeGate = () => {
        // Stop all video tracks from the stream
        if (videoRef.value && videoRef.value.srcObject) {
            console.log('stopping video tracks')
            const tracks = videoRef.value.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.value.srcObject = null;
            console.log('video tracks stopped')
        }
    }

    
    // Add these helper functions at the top of your script section
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper function to convert string to base64
    function stringToBase64(str) {
        return btoa(str);
    }

    // Helper function to convert base64 to string
    function base64ToString(base64) {
        return atob(base64);
    }


    // Function to get encryption key from password
    async function getEncryptionKey(password) {
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        return window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode('your-secure-salt'),  // Use a secure salt
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // Encryption function
    async function encryptMetadata(metadata, pin) {
        try {
            const encryptionKey = pin; // your-secure-encryption-key
            const key = await getEncryptionKey(encryptionKey);
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encodedData = encoder.encode(JSON.stringify(metadata));

            const encryptedData = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                encodedData
            );

            // Combine IV and encrypted data
            const encryptedArray = new Uint8Array(iv.length + encryptedData.byteLength);
            encryptedArray.set(iv);
            encryptedArray.set(new Uint8Array(encryptedData), iv.length);

            // Convert to base64 for storage
            return stringToBase64(String.fromCharCode.apply(null, encryptedArray));
        } catch (error) {
            console.error('Encryption error:', error);
            throw error;
        }
    }

    // Decryption function
    async function decryptMetadata(encryptedData, pin) {
        try {
            const encryptionKey = pin;
            const key = await getEncryptionKey(encryptionKey);

            // Convert base64 to Uint8Array
            const encryptedArray = new Uint8Array(
                base64ToString(encryptedData).split('').map(c => c.charCodeAt(0))
            );

            // Extract IV and encrypted content
            const iv = encryptedArray.slice(0, 12);
            const content = encryptedArray.slice(12);

            const decryptedData = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                content
            );

            return JSON.parse(decoder.decode(decryptedData));
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
            // throw error;
        }
    }


    const submitUsername = async () => {

        const response = await fetch(`/api/${username.value}`);
        const data = await response.json();
        console.log('data:', data);

        if(!data.exists) {
            register_step.value = 3
        } else {
            alert('Username already exists')
        }
        // register_step.value = 3
    }

</script>