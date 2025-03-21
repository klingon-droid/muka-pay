<template>
    <div class="container">
        <h1>Face Recognition System</h1>
        
        <!-- Main Tabs -->
        <div class="main-tabs">
            <button 
                :class="['tab-btn', { active: activeTab === 'add' }]" 
                @click="activeTab = 'add'"
            >
                Add Face
            </button>
            <button 
                :class="['tab-btn', { active: activeTab === 'search' }]" 
                @click="activeTab = 'search'"
            >
                Search Face
            </button>
        </div>

        <!-- Add Face Tab -->
        <div v-if="activeTab === 'add'" class="tab-content">
            <!-- Mode Selection -->
            <div class="mode-selection">
                <button :class="['mode-btn', { active: mode === 'webcam' }]" @click="setMode('webcam')">Webcam</button>
            </div>

            <!-- Webcam Mode -->
            <div class="webcam-section">
                <div class="video-container">
                    <video ref="videoRef" autoplay muted playsinline></video>
                    <canvas ref="canvasRef" class="overlay"></canvas>
                    
                    <!-- Face Capture Guide Overlay -->
                    <div v-if="isWebcamActive && !isCapturing" class="guide-overlay">
                        <button class="start-capture-btn" @click="startCapture" v-if="isFaceDetected && isFaceLargeEnough">
                            Start Face Capture Process
                        </button>
                        <div v-else-if="isFaceDetected" class="guide-message warning">
                            Come closer to the camera
                        </div>
                        <div v-else class="guide-message">
                            Position your face in the center
                        </div>
                    </div>

                    <!-- Capture Process Overlay -->
                    <div v-if="isCapturing" class="capture-overlay">
                        <div class="capture-progress">
                            <div class="progress-bar">
                                <div class="progress" :style="{ width: `${captureProgress}%` }"></div>
                            </div>
                            <div class="progress-steps">
                                <div class="step active">
                                    Hold steady and look straight ahead
                                </div>
                            </div>
                        </div>
                        <div class="current-instruction">
                            Capturing sample {{ capturedFrames.length + 1 }}/5
                        </div>
                    </div>
                </div>
                <div class="webcam-controls">
                    <button class="webcam-btn" @click="toggleWebcam">
                        {{ isWebcamActive ? 'Stop Webcam' : 'Start Webcam' }}
                    </button>
                </div>

                <!-- Add this after the webcam controls div -->
                <div v-if="isWebcamActive" class="search-section">
                    <button class="search-btn" @click="searchFace" :disabled="!isFaceDetected || isSearching">
                        {{ isSearching ? 'Searching...' : 'Search for Face' }}
                    </button>
                </div>
            </div>

            <!-- Results Display -->
            <div v-if="faceDescriptor || capturedFrames.length > 0" class="result-section">
                <!-- Captured Angles Display -->
                <div v-if="capturedFrames.length > 0" class="captured-angles">
                    <h3>Captured Angles:</h3>
                    <div class="angle-grid">
                        <div v-for="frame in capturedFrames" :key="frame.angle" class="angle-item">
                            <div class="angle-header">{{ frame.angle }}</div>
                            <img :src="frame.thumbnail" alt="Face angle" class="angle-thumbnail" />
                            <button class="view-descriptor-btn" @click="viewDescriptor(frame)">
                                View Descriptor
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Final/Selected Descriptor Display -->
                <div v-if="faceDescriptor" class="descriptor-display">
                    <div class="result-header">
                        <h3>{{ selectedAngle ? `${selectedAngle} Angle Descriptor:` : 'Average Face Descriptor:' }}</h3>
                        <div class="result-actions">
                            <button v-if="selectedAngle" class="back-btn" @click="selectedAngle = null">
                                Back to Average
                            </button>
                            <button class="view-toggle" @click="toggleView">
                                {{ isExpandedView ? 'Compact View' : 'Expanded View' }}
                            </button>
                            <button class="copy-btn" @click="copyToClipboard" v-if="faceDescriptor && faceDescriptor !== 'No face detected in the image' && faceDescriptor !== 'Error processing image'">
                                Copy to Clipboard
                            </button>
                        </div>
                    </div>
                    
                    <template v-if="typeof faceDescriptor === 'string'">
                        <div class="error-message">{{ faceDescriptor }}</div>
                    </template>
                    <template v-else>
                        <!-- Compact View -->
                        <div v-if="!isExpandedView" class="compact-view">
                            <div class="embedding-stats">
                                <div>Dimensions: {{ faceDescriptor.length }}</div>
                                <div>Min: {{ Math.min(...faceDescriptor).toFixed(4) }}</div>
                                <div>Max: {{ Math.max(...faceDescriptor).toFixed(4) }}</div>
                                <div>Mean: {{ (faceDescriptor.reduce((a, b) => a + b, 0) / faceDescriptor.length).toFixed(4) }}</div>
                            </div>
                            <pre>[{{ faceDescriptor.map(n => n.toFixed(4)).join(', ') }}]</pre>
                        </div>
                        <!-- Expanded View -->
                        <div v-else class="expanded-view">
                            <div class="embedding-grid">
                                <div v-for="(value, index) in faceDescriptor" :key="index" class="embedding-item">
                                    <div class="embedding-index">{{ index }}:</div>
                                    <div class="embedding-value">{{ value.toFixed(4) }}</div>
                                    <div class="embedding-bar" :style="{ width: `${Math.abs(value * 100)}%`, backgroundColor: value < 0 ? '#ff6b6b' : '#4ecdc4' }"></div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- Add this in the Results Display section, after the descriptor display -->
                <div v-if="faceDescriptor && typeof faceDescriptor !== 'string'" class="save-section">
                    <h3>Save to Database</h3>
                    <div class="save-form">
                        <input 
                            type="text" 
                            v-model="username" 
                            placeholder="Enter username"
                            class="username-input"
                        >
                        <button 
                            class="save-btn" 
                            @click="saveToDatabase" 
                            :disabled="!username || isSaving"
                        >
                            {{ isSaving ? 'Saving...' : 'Save Face Data' }}
                        </button>
                    </div>
                    <div v-if="saveMessage" :class="['save-message', { error: saveError }]">
                        {{ saveMessage }}
                    </div>
                </div>

                <!-- Add this after the save section -->
                <div v-if="searchResults.length > 0" class="search-results">
                    <h3>Search Results</h3>
                    <div class="results-grid">
                        <div v-for="result in searchResults" :key="result.username" class="result-item">
                            <div class="result-info">
                                <div class="result-username">{{ result.username }}</div>
                                <div class="result-score" :class="{ confirmed: result.isConfirmed }">
                                    Distance: {{ result.bestScore.toFixed(4) }}
                                    <span v-if="result.isConfirmed" class="confirmation-badge">Confirmed Match</span>
                                </div>
                                <div class="result-details">
                                    <div v-for="match in result.matches" :key="match.id" class="match-detail">
                                        {{ match.metadata.angle }}: {{ match.score.toFixed(4) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="searchError" class="error-message">
                    {{ searchError }}
                </div>
            </div>
        </div>

        <!-- Search Face Tab -->
        <div v-else class="tab-content">
            <div class="search-section">
                <div class="video-container">
                    <video ref="searchVideoRef" autoplay muted playsinline></video>
                    <canvas ref="searchCanvasRef" class="overlay"></canvas>
                </div>
                <div class="webcam-controls">
                    <button class="webcam-btn" @click="toggleSearchWebcam">
                        {{ isSearchWebcamActive ? 'Stop Webcam' : 'Start Webcam' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
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

// Existing refs
const mode = ref('webcam')
const videoRef = ref(null)
const canvasRef = ref(null)
const faceDescriptor = ref(null)
const isGenerating = ref(false)
const isExpandedView = ref(false)
const isWebcamActive = ref(false)
const isCapturing = ref(false)
const currentStepIndex = ref(0)
const captureProgress = ref(0)
const isFaceDetected = ref(false)
const isStable = ref(false)
const capturedFrames = ref([])
const selectedAngle = ref(null)
const username = ref('')
const isSaving = ref(false)
const saveMessage = ref('')
const saveError = ref(false)
const isFaceLargeEnough = ref(false)
const FACE_SIZE_THRESHOLD = 0.5 // Face should take up at least 30% of the video width
let stream = null
let detectInterval = null
let stabilityCheckTimer = null
let lastLandmarks = null

const captureSteps = [
    { instruction: 'Look straight ahead', angle: 'center' }
]

const currentInstruction = computed(() => {
    return captureSteps[currentStepIndex.value].instruction
})

// Initialize Human models
const initModels = async () => {
    try {
        console.log('Loading Human models...')
        const config = {
            face: {
                enabled: true,
                detector: { enabled: true, rotation: true },
                mesh: { enabled: true },
                embedding: { enabled: true },
                description: { enabled: true }
            }
        }
        await human.load(config)
        console.log('Human models loaded successfully')
        
        // Warmup detection to ensure models are ready
        const canvas = document.createElement('canvas')
        canvas.width = 640
        canvas.height = 480
        await human.warmup()
        console.log('Models warmed up and ready')
    } catch (error) {
        console.error('Error loading Human models:', error)
    }
}

const setMode = (newMode) => {
    if (mode.value === 'webcam' && isWebcamActive.value) {
        stopWebcam()
    }
    mode.value = newMode
    faceDescriptor.value = null
}

const startCapture = () => {
    if (!isFaceDetected.value) return
    isCapturing.value = true
    capturedFrames.value = []
    captureProgress.value = 0
}

const captureFrame = async (face, videoElement) => {
    // Create thumbnail
    const thumbnailCanvas = document.createElement('canvas')
    const size = 150 // thumbnail size
    thumbnailCanvas.width = size
    thumbnailCanvas.height = size
    const ctx = thumbnailCanvas.getContext('2d')
    
    // Calculate crop region around face
    const box = face.box
    const scale = 1.5 // Make crop region 50% larger than face
    const cropWidth = box.width * scale
    const cropHeight = box.height * scale
    const cropX = Math.max(0, box.x + (box.width - cropWidth) / 2)
    const cropY = Math.max(0, box.y + (box.height - cropHeight) / 2)
    
    // Draw the cropped region to the thumbnail canvas
    ctx.drawImage(
        videoElement,
        cropX, cropY, cropWidth, cropHeight,  // Source rectangle
        0, 0, size, size                      // Destination rectangle
    )

    return thumbnailCanvas.toDataURL('image/jpeg', 0.8)
}

const processFrame = async (result) => {
    if (!result.face || result.face.length !== 1) return

    const face = result.face[0]
    const angle = getFaceAngle(face)

    // Capture when face is centered and stable
    if (angle === 'center' && !stabilityCheckTimer) {
        stabilityCheckTimer = setTimeout(async () => {
            if (!videoRef.value) return

            try {
                // Perform a new detection with full configuration
                const detectionResult = await human.detect(videoRef.value, {
                    face: {
                        detector: { enabled: true, rotation: true },
                        mesh: { enabled: true },
                        description: { enabled: true },
                        embedding: { enabled: true }
                    }
                })
                
                if (detectionResult.face && detectionResult.face.length > 0) {
                    const detectedFace = detectionResult.face[0]
                    
                    // Log full face data for debugging
                    console.log('Face detection result:', {
                        hasEmbedding: !!detectedFace.embedding,
                        embeddingLength: detectedFace.embedding?.length,
                        hasMesh: !!detectedFace.mesh,
                        hasRotation: !!detectedFace.rotation,
                        rotation: detectedFace.rotation,
                        box: detectedFace.box
                    })
                    
                    // Verify we have embedding data
                    if (!detectedFace.embedding || detectedFace.embedding.length === 0) {
                        console.error('No embedding data in detection result')
                        stabilityCheckTimer = null
                        return
                    }

                    // Create thumbnail
                    const thumbnailCanvas = document.createElement('canvas')
                    const ctx = thumbnailCanvas.getContext('2d')
                    const size = 150
                    thumbnailCanvas.width = size
                    thumbnailCanvas.height = size

                    // Calculate crop dimensions
                    const box = detectedFace.box
                    const margin = 0.2 // 20% margin
                    const cropSize = Math.max(box.width, box.height) * (1 + margin * 2)
                    const cropX = box.x + box.width/2 - cropSize/2
                    const cropY = box.y + box.height/2 - cropSize/2

                    // Draw the cropped face
                    ctx.drawImage(
                        videoRef.value,
                        cropX, cropY, cropSize, cropSize,
                        0, 0, size, size
                    )

                    const thumbnail = thumbnailCanvas.toDataURL('image/jpeg', 0.8)
                    
                    // Store frame data with valid descriptor
                    const descriptor = Array.from(detectedFace.embedding)
                    if (descriptor.some(val => !isNaN(val))) {
                        capturedFrames.value.push({
                            angle: 'center',
                            descriptor: descriptor,
                            thumbnail
                        })

                        // Update progress
                        captureProgress.value = (capturedFrames.value.length / 5) * 100

                        // If we have 5 samples, finish capture
                        if (capturedFrames.value.length >= 5) {
                            finishCapture()
                        }
                    } else {
                        console.error('Invalid descriptor values detected')
                    }
                }
            } catch (error) {
                console.error('Error during face detection:', error)
            } finally {
                stabilityCheckTimer = null
            }
        }, 500)
    } else if (angle !== 'center' && stabilityCheckTimer) {
        clearTimeout(stabilityCheckTimer)
        stabilityCheckTimer = null
    }
}

const finishCapture = () => {
    isCapturing.value = false
    
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
            faceDescriptor.value = avgDescriptor
        } else {
            console.error('Error: Invalid average descriptor')
            faceDescriptor.value = 'Error: Invalid face descriptor'
        }
    } else {
        console.error('No valid frames to average')
        faceDescriptor.value = 'Error: No valid face descriptors captured'
    }
}

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
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

            // Update face detection status
            isFaceDetected.value = result.face && result.face.length > 0

            // Draw face box and landmarks if detected
            if (isFaceDetected.value) {
                const face = result.face[0]
                
                // Check if face is large enough
                const faceWidth = face.box[2]
                const faceHeight = face.box[3]
                const videoWidth = videoEl.videoWidth
                const videoHeight = videoEl.videoHeight
                
                // Calculate face size relative to video dimensions
                const faceSizeRatio = Math.max(faceWidth / videoWidth, faceHeight / videoHeight)
                isFaceLargeEnough.value = faceSizeRatio >= FACE_SIZE_THRESHOLD
                
                // Draw bounding box with enhanced visibility
                ctx.strokeStyle = isFaceLargeEnough.value ? '#4CAF50' : '#FFA500'
                ctx.lineWidth = 4
                ctx.strokeRect(face.box[0], face.box[1], face.box[2], face.box[3])
                
                // Add semi-transparent fill
                ctx.fillStyle = isFaceLargeEnough.value ? 
                    'rgba(76, 175, 80, 0.1)' : 
                    'rgba(255, 165, 0, 0.1)'
                ctx.fillRect(face.box[0], face.box[1], face.box[2], face.box[3])

                // Draw face mesh/landmarks
                if (face.mesh) {
                    ctx.strokeStyle = '#2196F3'
                    ctx.lineWidth = 1
                    ctx.beginPath()
                    
                    // Draw face mesh lines
                    face.mesh.forEach((point, index) => {
                        if (index === 0) {
                            ctx.moveTo(point[0], point[1])
                        } else {
                            ctx.lineTo(point[0], point[1])
                        }
                    })
                    ctx.stroke()

                    // Draw key facial landmarks
                    ctx.fillStyle = '#FFC107'
                    const keyPoints = [
                        face.mesh[33],  // nose
                        face.mesh[133], // right eye
                        face.mesh[362], // left eye
                        face.mesh[152]  // mouth
                    ]
                    
                    keyPoints.forEach(point => {
                        if (point) {
                            ctx.beginPath()
                            ctx.arc(point[0], point[1], 3, 0, 2 * Math.PI)
                            ctx.fill()
                        }
                    })
                }

                // If we're capturing and face is detected and large enough, process it
                if (isCapturing.value && isFaceLargeEnough.value) {
                    await processFaceCapture(result)
                }
            } else {
                isFaceLargeEnough.value = false
            }
        } catch (error) {
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
        captureProgress.value = (capturedFrames.value.length / 5) * 100

        // If we have enough samples, finish capture
        if (capturedFrames.value.length >= 5) {
            finishCapture()
        }
    } catch (error) {
        console.error('Error processing face capture:', error)
    }
}

const toggleWebcam = async () => {
    if (!isWebcamActive.value) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            })
            videoRef.value.srcObject = stream
            isWebcamActive.value = true
            
            // Wait for video to be ready
            await new Promise(resolve => {
                videoRef.value.onloadedmetadata = resolve
            })
            await videoRef.value.play()
            
            // Start face detection
            startFaceDetection()
        } catch (error) {
            console.error('Error accessing webcam:', error)
        }
    } else {
        stopWebcam()
    }
}

const stopWebcam = () => {
    if (detectInterval) {
        clearInterval(detectInterval)
        detectInterval = null
    }
    if (stabilityCheckTimer) {
        clearTimeout(stabilityCheckTimer)
        stabilityCheckTimer = null
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop())
        stream = null
    }
    if (videoRef.value) {
        videoRef.value.srcObject = null
    }
    if (canvasRef.value) {
        const ctx = canvasRef.value.getContext('2d')
        ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
    isWebcamActive.value = false
    isCapturing.value = false
    currentStepIndex.value = 0
    captureProgress.value = 0
    isFaceDetected.value = false
    lastLandmarks = null
}

const viewDescriptor = (frame) => {
    selectedAngle.value = frame.angle
    faceDescriptor.value = frame.descriptor
}

const copyToClipboard = async () => {
    if (!faceDescriptor.value) return
    
    try {
        const dataToCopy = {
            type: selectedAngle.value ? 'single' : 'average',
            angle: selectedAngle.value,
            descriptor: faceDescriptor.value,
            capturedAngles: capturedFrames.value.map(frame => ({
                angle: frame.angle,
                descriptor: frame.descriptor
            }))
        }
        await navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2))
        alert('Face embedding data copied to clipboard!')
    } catch (err) {
        console.error('Failed to copy:', err)
        alert('Failed to copy to clipboard')
    }
}

const toggleView = () => {
    isExpandedView.value = !isExpandedView.value
}

const saveToDatabase = async () => {
    if (!username.value || !faceDescriptor.value) return
    
    isSaving.value = true
    saveMessage.value = ''
    saveError.value = false

    try {
        // Prepare the data for Pinecone
        const vectors = []
        
        // // Add individual angle vectors
        // capturedFrames.value.forEach((frame, index) => {
        //     vectors.push({
        //         id: `${username.value}_${frame.angle}`,
        //         values: frame.descriptor,
        //         metadata: {
        //             username: username.value,
        //             angle: frame.angle,
        //             timestamp: new Date().toISOString()
        //         }
        //     })
        // })

        // encrypt

        // Add the average vector
        vectors.push({
            id: `${username.value}_average`, // random uuid 
            values: faceDescriptor.value,
            metadata: { // encrypt
                username: username.value,
                angle: 'average',
                timestamp: new Date().toISOString(),
                angles: capturedFrames.value.map(f => f.angle)
            }
        })

        

        // Send to Pinecone
        const response = await fetch('https://face4-ff60525.svc.aped-4627-b74a.pinecone.io/vectors/upsert', {
            method: 'POST',
            headers: {
                'Api-Key': 'pcsk_65jcaw_DxQsFPjgiuo5pTiYBsovpdYo7DsPALMLM5bKMzCxLgnm5rrWh8NxibVMDrCC8qG',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vectors
            })
        })

        if (!response.ok) throw new Error('Failed to save to database')

        saveMessage.value = 'Successfully saved face data!'
        username.value = '' // Clear the input
    } catch (error) {
        console.error('Error saving to database:', error)
        saveMessage.value = 'Failed to save face data'
        saveError.value = true
    } finally {
        isSaving.value = false
    }
}

// Search functionality
const searchResults = ref([])
const isSearching = ref(false)
const searchError = ref(null)

const searchFace = async () => {
    if (!videoRef.value || !isFaceDetected.value) return
    
    isSearching.value = true
    searchError.value = null
    
    try {
        // Get face descriptor using Human
        const result = await human.detect(videoRef.value, {
            face: {
                detector: { enabled: true, rotation: true },
                mesh: { enabled: true },
                embedding: { enabled: true }
            }
        })

        if (!result.face || result.face.length === 0) {
            throw new Error('No face detected')
        }

        console.log('Face detected, searching in database...')

        // Search in Pinecone
        const response = await fetch('https://face4-ff60525.svc.aped-4627-b74a.pinecone.io/query', {
            method: 'POST',
            headers: {
                'Api-Key': 'pcsk_65jcaw_DxQsFPjgiuo5pTiYBsovpdYo7DsPALMLM5bKMzCxLgnm5rrWh8NxibVMDrCC8qG',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vector: Array.from(result.face[0].embedding),
                topK: 5,
                includeMetadata: true
            })
        })

        if (!response.ok) throw new Error('Failed to search database')

        const data = await response.json()
        console.log('Pinecone response:', data)
        
        // Process matches to group by username
        const matchesByUser = {}
        data.matches.forEach(match => {
            console.log('Processing match:', {
                id: match.id,
                score: match.score,
                username: match.metadata.username,
                angle: match.metadata.angle
            })
            
            const username = match.metadata.username
            if (!matchesByUser[username]) {
                matchesByUser[username] = {
                    username,
                    matches: [],
                    bestScore: Infinity,
                    isConfirmed: false
                }
            }
            matchesByUser[username].matches.push(match)
            if (match.score < matchesByUser[username].bestScore) {
                matchesByUser[username].bestScore = match.score
            }
        })

        console.log('Matches grouped by user:', matchesByUser)

        // Convert to array and sort by best score
        searchResults.value = Object.values(matchesByUser)
            .map(user => {
                // Get the match with the highest score
                const bestMatch = user.matches.reduce((best, current) => 
                    current.score > best.score ? current : best
                )
                const result = {
                    username: user.username,
                    bestScore: bestMatch.score,
                    matches: user.matches,
                    isConfirmed: bestMatch.score > 0.7
                }
                console.log('User result:', {
                    username: result.username,
                    bestScore: result.bestScore,
                    isConfirmed: result.isConfirmed
                })
                return result
            })
            .sort((a, b) => b.bestScore - a.bestScore) // Sort by highest score first

        console.log('Final search results:', searchResults.value)

        // decrypt metadata with pin resolve username  

    } catch (error) {
        console.error('Error searching face:', error)
        searchError.value = error.message || 'Failed to search face'
    } finally {
        isSearching.value = false
    }
}

// Add new refs for search functionality
const activeTab = ref('add')
const searchVideoRef = ref(null)
const searchCanvasRef = ref(null)
const isSearchWebcamActive = ref(false)
const isSearchFaceDetected = ref(false)
let searchStream = null
let searchDetectInterval = null

// Add new refs for face tracking
const trackedFaces = ref(new Map()) // Map to store face tracking data
const lastFaceCount = ref(0)
const SEARCH_COOLDOWN = 5000 // 5 seconds cooldown between searches for the same face

// Update the startSearchFaceDetection function
const startSearchFaceDetection = async () => {
    if (!searchVideoRef.value || !searchCanvasRef.value) return

    const videoEl = searchVideoRef.value
    const canvasEl = searchCanvasRef.value
    canvasEl.width = videoEl.videoWidth
    canvasEl.height = videoEl.videoHeight

    let lastSearchTime = 0
    const GLOBAL_SEARCH_COOLDOWN = 2000 // 2 seconds cooldown between global searches

    searchDetectInterval = setInterval(async () => {
        if (!videoEl.paused && !videoEl.ended) {
            try {
                const result = await human.detect(videoEl, {
                    face: {
                        detector: { enabled: true, rotation: true },
                        mesh: { enabled: true },
                        embedding: { enabled: true }
                    }
                })
                const faces = result.face || []
                
                const currentFaceCount = faces.length
                isSearchFaceDetected.value = currentFaceCount > 0

                // Clear and draw
                const ctx = canvasEl.getContext('2d')
                ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

                // If face count changed, clear tracked faces
                if (currentFaceCount !== lastFaceCount.value) {
                    trackedFaces.value.clear()
                    lastFaceCount.value = currentFaceCount
                }
                
                // Process each face
                faces.forEach((face, index) => {
                    const box = face.box
                    
                    // Draw face box with enhanced visibility
                    ctx.strokeStyle = '#4CAF50'
                    ctx.lineWidth = 4
                    ctx.strokeRect(box[0], box[1], box[2], box[3])
                    
                    // Add semi-transparent fill
                    ctx.fillStyle = 'rgba(76, 175, 80, 0.1)'
                    ctx.fillRect(box[0], box[1], box[2], box[3])

                    // Draw face mesh/landmarks
                    if (face.mesh) {
                        ctx.strokeStyle = '#2196F3'
                        ctx.lineWidth = 1
                        ctx.beginPath()
                        
                        // Draw face mesh lines
                        face.mesh.forEach((point, index) => {
                            if (index === 0) {
                                ctx.moveTo(point[0], point[1])
                            } else {
                                ctx.lineTo(point[0], point[1])
                            }
                        })
                        ctx.stroke()

                        // Draw key facial landmarks
                        ctx.fillStyle = '#FFC107'
                        const keyPoints = [
                            face.mesh[33],  // nose
                            face.mesh[133], // right eye
                            face.mesh[362], // left eye
                            face.mesh[152]  // mouth
                        ]
                        
                        keyPoints.forEach(point => {
                            if (point) {
                                ctx.beginPath()
                                ctx.arc(point[0], point[1], 3, 0, 2 * Math.PI)
                                ctx.fill()
                            }
                        })
                    }

                    // Calculate face center for tracking
                    const faceCenter = {
                        x: box[0] + box[2] / 2,
                        y: box[1] + box[3] / 2
                    }

                    // Find closest tracked face or create new tracking
                    let faceId = findClosestTrackedFace(faceCenter)
                    if (!faceId) {
                        faceId = `face_${Date.now()}`
                        trackedFaces.value.set(faceId, {
                            center: faceCenter,
                            lastUpdate: Date.now(),
                            lastSearchTime: 0,
                            searchResult: null,
                            isSearching: false
                        })
                    } else {
                        // Update existing face position
                        const trackedFace = trackedFaces.value.get(faceId)
                        trackedFace.center = faceCenter
                        trackedFace.lastUpdate = Date.now()
                    }

                    // Add label with tracking ID and search result
                    ctx.font = '16px Arial'
                    ctx.fillStyle = '#4CAF50'
                    ctx.fillRect(box[0], box[1] - 40, box[2], 40)
                    ctx.fillStyle = 'white'
                    
                    const trackedFace = trackedFaces.value.get(faceId)
                    if (trackedFace.isSearching) {
                        ctx.fillText('Identifying...', box[0] + 5, box[1] - 25)
                    } else if (trackedFace.searchResult) {
                        const result = trackedFace.searchResult
                        if (result.bestScore > 0.7) {
                            ctx.fillText(result.username, box[0] + 5, box[1] - 25)
                            ctx.fillText(`Score: ${result.bestScore.toFixed(2)}`, box[0] + 5, box[1] - 10)
                        } else {
                            ctx.fillText('No match found', box[0] + 5, box[1] - 25)
                            ctx.fillText(`Score: ${result.bestScore.toFixed(2)}`, box[0] + 5, box[1] - 10)
                        }
                    } else {
                        ctx.fillText('No match found', box[0] + 5, box[1] - 25)
                    }
                })

                // Clean up old tracked faces
                cleanupOldTrackedFaces()

                // Search for new faces
                if (currentFaceCount > 0 && !isSearching.value) {
                    const currentTime = Date.now()
                    if (currentTime - lastSearchTime > GLOBAL_SEARCH_COOLDOWN) {
                        lastSearchTime = currentTime
                        searchNewFaces()
                    }
                }
            } catch (error) {
                console.error('Error in face detection:', error)
            }
        }
    }, 100)
}

// Helper function to find closest tracked face
const findClosestTrackedFace = (faceCenter) => {
    let closestFaceId = null
    let minDistance = Infinity

    trackedFaces.value.forEach((trackedFace, faceId) => {
        const distance = Math.sqrt(
            Math.pow(trackedFace.center.x - faceCenter.x, 2) +
            Math.pow(trackedFace.center.y - faceCenter.y, 2)
        )
        if (distance < minDistance && distance < 50) { // 50px threshold
            minDistance = distance
            closestFaceId = faceId
        }
    })

    return closestFaceId
}

// Helper function to clean up old tracked faces
const cleanupOldTrackedFaces = () => {
    const currentTime = Date.now()
    for (const [faceId, trackedFace] of trackedFaces.value.entries()) {
        if (currentTime - trackedFace.lastUpdate > 1000) { // Remove after 1 second of no updates
            trackedFaces.value.delete(faceId)
        }
    }
}

// Update the searchNewFaces function to continue searching for faces with low scores
const searchNewFaces = async () => {
    if (!searchVideoRef.value) return
    
    isSearching.value = true
    searchError.value = null
    
    try {
        const canvas = document.createElement('canvas')
        canvas.width = searchVideoRef.value.videoWidth
        canvas.height = searchVideoRef.value.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(searchVideoRef.value, 0, 0)

        console.log('Starting face detection for search...')

        // Detect faces using Human
        const result = await human.detect(canvas)
        const faces = result.face || []
        console.log('Detected faces:', faces.length)

        // Process each face
        for (const face of faces) {
            const box = face.box
            const faceCenter = {
                x: box[0] + box[2] / 2,
                y: box[1] + box[3] / 2
            }

            // Find or create face tracking
            let faceId = findClosestTrackedFace(faceCenter)
            if (!faceId) {
                faceId = `face_${Date.now()}`
                trackedFaces.value.set(faceId, {
                    center: faceCenter,
                    lastUpdate: Date.now(),
                    lastSearchTime: 0,
                    searchResult: null,
                    isSearching: true
                })
                console.log('Created new face tracking:', faceId)
            }

            const trackedFace = trackedFaces.value.get(faceId)
            
            // Skip if face was recently searched (2s cooldown)
            const currentTime = Date.now()
            if (trackedFace.lastSearchTime > 0 && 
                currentTime - trackedFace.lastSearchTime < 2000) {
                console.log('Skipping search for face:', faceId, 'Reason: recently searched')
                continue
            }

            // Always search if no result or score is low
            if (!trackedFace.searchResult || trackedFace.searchResult.bestScore <= 0.7) {
                trackedFace.isSearching = true
                console.log('Searching face in Pinecone:', faceId)

                try {
                    // Search in Pinecone
                    const response = await fetch('https://face4-ff60525.svc.aped-4627-b74a.pinecone.io/query', {
                        method: 'POST',
                        headers: {
                            'Api-Key': 'pcsk_65jcaw_DxQsFPjgiuo5pTiYBsovpdYo7DsPALMLM5bKMzCxLgnm5rrWh8NxibVMDrCC8qG',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            vector: Array.from(face.embedding),
                            topK: 5,
                            includeMetadata: true
                        })
                    })

                    if (!response.ok) throw new Error('Failed to search database')

                    const data = await response.json()
                    console.log('Pinecone response for face:', faceId, data)
                    
                    // Process matches
                    const matchesByUser = {}
                    data.matches.forEach(match => {
                        console.log('Processing match for face:', faceId, {
                            id: match.id,
                            score: match.score,
                            username: match.metadata.username,
                            angle: match.metadata.angle
                        })
                        
                        const username = match.metadata.username
                        if (!matchesByUser[username]) {
                            matchesByUser[username] = {
                                username,
                                matches: [],
                                bestScore: Infinity,
                                isConfirmed: false
                            }
                        }
                        matchesByUser[username].matches.push(match)
                        if (match.score < matchesByUser[username].bestScore) {
                            matchesByUser[username].bestScore = match.score
                        }
                    })

                    console.log('Matches grouped by user for face:', faceId, matchesByUser)

                    // Get best match
                    const results = Object.values(matchesByUser)
                        .map(user => {
                            // Get the match with the highest score
                            const bestMatch = user.matches.reduce((best, current) => 
                                current.score > best.score ? current : best
                            )
                            const result = {
                                username: user.username,
                                bestScore: bestMatch.score,
                                matches: user.matches,
                                isConfirmed: bestMatch.score > 0.7
                            }
                            console.log('User result for face:', faceId, {
                                username: result.username,
                                bestScore: result.bestScore,
                                isConfirmed: result.isConfirmed
                            })
                            return result
                        })
                        .sort((a, b) => b.bestScore - a.bestScore) // Sort by highest score first

                    // Update tracked face with result
                    trackedFace.searchResult = results[0] || null
                    trackedFace.isSearching = false
                    trackedFace.lastSearchTime = currentTime
                    console.log('Updated tracked face:', faceId, 'with result:', trackedFace.searchResult)

                } catch (error) {
                    console.error('Error searching face:', faceId, error)
                    trackedFace.isSearching = false
                }
            }
        }

        // Update search results display
        searchResults.value = Array.from(trackedFaces.value.values())
            .map(face => face.searchResult)
            .filter(result => result && result.bestScore > 0.7)

        console.log('Final search results:', searchResults.value)

    } catch (error) {
        console.error('Error in face search:', error)
        searchError.value = error.message || 'Failed to search faces'
    } finally {
        isSearching.value = false
    }
}

const toggleSearchWebcam = async () => {
    if (!isSearchWebcamActive.value) {
        try {
            searchStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            })
            searchVideoRef.value.srcObject = searchStream
            isSearchWebcamActive.value = true
            
            await new Promise(resolve => {
                searchVideoRef.value.onloadedmetadata = resolve
            })
            await searchVideoRef.value.play()
            
            startSearchFaceDetection()
        } catch (error) {
            console.error('Error accessing webcam:', error)
        }
    } else {
        stopSearchWebcam()
    }
}

const stopSearchWebcam = () => {
    if (searchDetectInterval) {
        clearInterval(searchDetectInterval)
        searchDetectInterval = null
    }
    if (searchStream) {
        searchStream.getTracks().forEach(track => track.stop())
        searchStream = null
    }
    if (searchVideoRef.value) {
        searchVideoRef.value.srcObject = null
    }
    if (searchCanvasRef.value) {
        const ctx = searchCanvasRef.value.getContext('2d')
        ctx.clearRect(0, 0, searchCanvasRef.value.width, searchCanvasRef.value.height)
    }
    isSearchWebcamActive.value = false
    isSearchFaceDetected.value = false
    searchResults.value = []
}

onMounted(() => {
    initModels()
})

onUnmounted(() => {
    stopWebcam()
    stopSearchWebcam()
})
</script>

<style scoped>
.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.main-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.tab-btn {
    flex: 1;
    padding: 12px;
    border: none;
    background-color: #f5f5f5;
    color: #666;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s;
}

.tab-btn.active {
    background-color: #4CAF50;
    color: white;
}

.tab-content {
    margin-top: 20px;
}

.mode-selection {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.mode-btn {
    flex: 1;
    padding: 10px;
    border: 2px solid #4CAF50;
    background-color: white;
    color: #4CAF50;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
}

.mode-btn.active {
    background-color: #4CAF50;
    color: white;
}

.upload-section, .webcam-section {
    margin: 20px 0;
}

.preview-section {
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.preview-section img {
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
}

.video-container {
    position: relative;
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
}

.video-container video {
    width: 100%;
    border-radius: 4px;
    
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    
}

.webcam-controls {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 15px;
}

.result-section {
    margin: 20px 0;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 4px;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.result-actions {
    display: flex;
    gap: 10px;
}

.error-message {
    color: #ff6b6b;
    font-weight: bold;
    padding: 10px;
    background-color: #fff;
    border-radius: 4px;
}

.embedding-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
    padding: 10px;
    background-color: #fff;
    border-radius: 4px;
    font-family: monospace;
}

.compact-view pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    background-color: #fff;
    padding: 10px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 14px;
    margin: 0;
}

.expanded-view {
    background-color: #fff;
    padding: 15px;
    border-radius: 4px;
}

.embedding-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
}

.embedding-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
    font-family: monospace;
}

.embedding-index {
    width: 30px;
    color: #666;
}

.embedding-value {
    width: 80px;
}

.embedding-bar {
    height: 4px;
    border-radius: 2px;
    transition: width 0.3s ease;
}

button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.generate-btn, .capture-btn {
    background-color: #4CAF50;
    color: white;
}

.generate-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.copy-btn {
    background-color: #2196F3;
    color: white;
}

.view-toggle {
    background-color: #9c27b0;
    color: white;
}

.webcam-btn {
    background-color: #ff5722;
    color: white;
}

button:hover:not(:disabled) {
    opacity: 0.9;
}

.guide-overlay, .capture-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    color: white;
    pointer-events: none;
}

.guide-overlay button {
    pointer-events: auto;
}

.start-capture-btn {
    background-color: #4CAF50;
    color: white;
    font-size: 1.2em;
    padding: 12px 24px;
}

.capture-progress {
    width: 80%;
    margin-bottom: 20px;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    overflow: hidden;
}

.progress {
    height: 100%;
    background: #4CAF50;
    transition: width 0.3s ease;
}

.progress-steps {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

.step {
    font-size: 1.1em;
    opacity: 0.7;
    transition: all 0.3s ease;
}

.step.active {
    opacity: 1;
    color: #4CAF50;
    font-weight: bold;
}

.current-instruction {
    font-size: 1.5em;
    text-align: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    transition: all 0.3s ease;
}

.guide-message {
    font-size: 1.2em;
    text-align: center;
    padding: 15px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
}

.guide-message.warning {
    background: rgba(255, 165, 0, 0.8);
    color: white;
    font-weight: bold;
}

.captured-angles {
    margin-bottom: 30px;
}

.angle-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 15px;
}

.angle-item {
    background: white;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.angle-header {
    font-weight: bold;
    text-transform: capitalize;
}

.angle-thumbnail {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 4px;
}

.view-descriptor-btn {
    background-color: #9c27b0;
    color: white;
    width: 100%;
}

.back-btn {
    background-color: #607d8b;
    color: white;
}

.descriptor-display {
    background-color: #f5f5f5;
    border-radius: 4px;
    padding: 15px;
}

.save-section {
    margin-top: 30px;
    padding: 20px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.save-form {
    display: flex;
    gap: 10px;
    margin-top: 15px;
}

.username-input {
    flex: 1;
    padding: 8px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s;
}

.username-input:focus {
    outline: none;
    border-color: #4CAF50;
}

.save-btn {
    background-color: #4CAF50;
    color: white;
    min-width: 120px;
}

.save-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.save-message {
    margin-top: 10px;
    padding: 10px;
    border-radius: 4px;
    background-color: #4CAF50;
    color: white;
}

.save-message.error {
    background-color: #ff5252;
}

.search-section {
    display: flex;
    justify-content: center;
    margin-top: 15px;
}

.search-btn {
    background-color: #2196F3;
    color: white;
    font-size: 1.2em;
    padding: 12px 24px;
}

.search-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.search-results {
    margin-top: 30px;
    padding: 20px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 15px;
}

.result-item {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.result-info {
    width: 100%;
    text-align: center;
}

.result-username {
    font-weight: bold;
    font-size: 1.1em;
}

.result-score {
    color: #4CAF50;
    font-weight: bold;
    margin-top: 5px;
}

.result-details {
    margin-top: 10px;
    font-size: 0.9em;
    color: #666;
}

.match-detail {
    margin: 2px 0;
}

.search-results-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    overflow-y: auto;
}

.results-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 80%;
    max-height: 80%;
    overflow-y: auto;
}

.start-search-btn {
    background-color: #2196F3;
    color: white;
    font-size: 1.2em;
    padding: 12px 24px;
    border-radius: 4px;
    cursor: pointer;
}

.result-score.confirmed {
    color: #4CAF50;
}

.confirmation-badge {
    display: inline-block;
    background-color: #4CAF50;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    margin-left: 8px;
}
</style>