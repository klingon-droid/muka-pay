<template>
    <div class="h-screen bg-gray-100 w-full flex flex-col justify-start items-center">
        <header class="w-full bg-white px-4 py-2 flex items-center justify-between border-b border-gray-300">
            <h1 class="text-lg font-bold">Receive USDC</h1>
            <button @click="goBack()" class="p-2 rounded-full hover:bg-gray-100">
                <iconify-icon class="text-2xl" icon="mdi:arrow-left"></iconify-icon>
            </button>
        </header>

        <main class="w-full h-full flex">

            <div v-if="receive_step == 0" class="w-full h-full grid grid-rows-2">

                <div class="w-full flex flex-col justify-center items-center h-full border-b border-gray-300">
                    <p class="mb-4">Enter Receive Amount</p>

                    <div class="text-4xl font-bold text-center">
                            {{ amount || '0.00' }} USDC
                        </div>
                </div>

                <div class="w-full">
                    <div class="grid grid-cols-3">
                            <button @click="appendNumber('1')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">1</button>
                            <button @click="appendNumber('2')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">2</button>
                            <button @click="appendNumber('3')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">3</button>
                            <button @click="appendNumber('4')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">4</button>
                            <button @click="appendNumber('5')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">5</button>
                            <button @click="appendNumber('6')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">6</button>
                            <button @click="appendNumber('7')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">7</button>
                            <button @click="appendNumber('8')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">8</button>
                            <button @click="appendNumber('9')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">9</button>
                            <button @click="appendNumber('.')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">.</button>
                            <button @click="appendNumber('0')" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">0</button>
                            <button @click="deleteNumber()" class="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] text-2xl font-bold p-6">
                                <iconify-icon icon="mdi:backspace"></iconify-icon>
                            </button>
                        </div>

                        <div class="p-4">
                            <button @click="handleNext()" class="w-full bg-black text-white p-4 rounded-xl text-xl font-bold">
                                Next
                            </button>
                        </div>
                </div>

            </div>

            <div v-if="receive_step == 1" class="w-full h-full grid grid-rows-3">

                <div class="w-full h-full flex-col flex justify-center items-center bg-gray-200">
                    video feed

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

                    <p>isFaceDetected: {{ isFaceDetected }}</p>
                    <p>Progress: {{ captureInfo }}</p>
                </div>

                

                <div class="w-full h-full grid grid-rows-4 row-span-2">

                    <div class="w-full h-full flex justify-center items-center row-span-3">
                        <div class="text-center" v-if="!isFaceDetected">
                            <p  class="text-3xl font-bold mb-4">Detecting Face</p>
                            <p>Please center your face in the frame</p>
                        </div>

                        <div v-if="isFaceDetected && !isPatternVerified" class="w-full h-full flex flex-col justify-center items-center">
                            <p class="text-2xl p-4 font-bold mb-4">Authenticate with your pattern</p>
                            <p v-if="showPatternHint" class="text-sm text-gray-600 mb-4">Invalid pattern. Try again</p>
                            <PatternPad2 ref="patternPad" @pattern-complete="handlePatternComplete" />
                        </div>

                        <div class="text-center w-full h-full flex flex-col justify-end items-center px-4" v-if="isFaceDetected && isPatternVerified">
                            <div class="bg-white rounded-xl w-full">
                                <div class="space-y-2 mb-12 p-4 pt-8">
                                <p class="text-gray-600">Authenticated as</p>
                                <div class="text-3xl font-bold text-black">@{{ payerUsername }}</div>
                            </div>

                            <div class="w-full">
                                <table class="w-full">
                                    <tbody>
                                        <tr class="border-b border-gray-200">
                                            <td class="p-3 text-left text-gray-600">Amount</td>
                                            <td class="p-3 text-right font-bold text-black">{{ amount}} USDC</td>
                                        </tr>
                                        <tr class="border-b border-gray-200">
                                            <td class="p-3 text-left text-gray-600">Recipient</td>
                                            <td class="p-3 text-right font-bold text-black">@{{ recipientUsername }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            </div>
                        </div>

                        
                    </div>

                    <div class="w-full h-full flex justify-center items-center row-span-1 px-4">

                        <button @click="handlePay()" :disabled="!isFaceDetected || !isPatternVerified || payBusy" class="bg-black text-white p-4 rounded-xl text-xl font-bold w-full disabled:opacity-20">

                            <div v-if="payBusy" class="flex justify-center items-center">
                                <iconify-icon icon="mdi:loading" class="animate-spin text-4xl"></iconify-icon>
                            </div>

                            <div v-else>
                                Pay {{ amount}} USDC
                            </div>
                        </button>

                    </div>

                </div>
               
            </div>

        </main>

        <PaymentResultDialog
            :is-open="showPaymentResult"
            :is-success="paymentSuccess"
            :message="paymentMessage"
            @close="handlePaymentClose"
            @retry="handlePaymentRetry"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import PatternPad2 from './PatternPad2.vue'
import PaymentResultDialog from './PaymentResultDialog.vue'
import { generateProof, getUsernameHash, refreshBalance } from '../stores/user'
import { parseUnits } from 'viem'

const receive_step = ref(0)
const isFaceDetected = ref(false)
const isPatternVerified = ref(false)
const showPatternHint = ref(false)
const patternPad = ref(null)
const amount = ref('')
const payBusy = ref(false)
const showPaymentResult = ref(false)
const paymentSuccess = ref(false)
const paymentMessage = ref('')




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
let detectInterval = null;
const payerEmbedding = ref(null);
const payerUsername = ref(null);
const payerPattern = ref(null);
const recipientUsername = ref('yongfeng');
const captureInfo = ref('');
const isFlipped = ref(true);

const goBack = () => {
    window.location.href = '/app'
}

const appendNumber = (number) => {
    amount.value += number
}

const deleteNumber = () => {
    amount.value = amount.value.slice(0, -1)
}

const handleNext = async () => {
    receive_step.value = 1

    captureInfo.value = 'Requesting camera...'
    const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
            facingMode: 'user'
        },
        audio: false
    });
    videoRef.value.srcObject = stream;
    
    await new Promise(resolve => {
        videoRef.value.onloadedmetadata = resolve;
    });
    await videoRef.value.play();
    await checkFaceDetection();
    await searchAccount();


    // // dummy face detected
    // setTimeout(() => {
    //     isFaceDetected.value = true
    // }, 2000)
}


const checkFaceDetection = async () => {
    if (!videoRef.value) return;

    captureInfo.value = 'Initializing face detection...'
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

const searchAccount = async () => {
    captureInfo.value = 'Searching for account...'

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

        const matchedData = await searchPinecone(vresult.face[0].embedding);
        console.log('Matched data:', matchedData);

        if(!matchedData) {
            captureInfo.value = 'No account found, please try again'
        } else {
            payerEmbedding.value = matchedData;
            captureInfo.value = 'Account found, please authenticate with your pattern'
        }
    } catch (error) {
        console.error('Error searching account:', error);
        captureInfo.value = 'Error searching account:' + error
    }

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
    return data.matches[0].score > 0.7 ? data.matches[0] : null;
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

const handlePatternComplete = async (event) => {
    console.log('pattern complete', event)

    const decryptedUsername = await decryptMetadata(payerEmbedding.value.metadata.username, event)
    console.log('decryptedUsername:', decryptedUsername);

    if(decryptedUsername) {
        payerUsername.value = decryptedUsername
        payerPattern.value = event
        isPatternVerified.value = true
        showPatternHint.value = false

        clearInterval(detectInterval)
    } else {
        isPatternVerified.value = false
        showPatternHint.value = true
    }  
    
    // // simulate successful pattern
    // isPatternVerified.value = true
    // showPatternHint.value = false
    
    // // simulate failed pattern
    // isPatternVerified.value = false
    // showPatternHint.value = true

    // // reset the pattern pad
    patternPad.value.clearPattern()
    
    // setTimeout(() => {
    //     showPatternHint.value = false
    // }, 2000)
}

const handlePay = async () => {
    console.log('pay')
    payBusy.value = true


    const proof = await generateProof(payerUsername.value, payerPattern.value)
    console.log('proof:', proof)


    try {

        const response = await fetch('/api/pay', {
            method: 'POST',
            body: JSON.stringify({
                "payment_proof": proof,
                "amount": parseUnits(amount.value, 6).toString(),
                "from_hash": await getUsernameHash(payerUsername.value),
                "to_hash": await getUsernameHash(recipientUsername.value),
            })
        })

        if (!response.ok) {
            paymentSuccess.value = false;
        } else {
            const data = await response.json()
            refreshBalance.set(Date.now());
            console.log('Payment response:', data)
            paymentSuccess.value = true
        }


    } catch (error) {
        console.error('Error paying:', error)
        paymentSuccess.value = false
    }

    paymentMessage.value = paymentSuccess.value 
            ? `Successfully received ${amount.value} USDC`
            : 'Failed to receive payment. Please try again.'

    showPaymentResult.value = true;
    payBusy.value = false;

    // // Simulate payment process
    // setTimeout(() => {
    //     payBusy.value = false
    //     // Simulate random success/failure
    //     paymentSuccess.value = Math.random() > 0.5
    //     paymentMessage.value = paymentSuccess.value 
    //         ? `Successfully received ${amount.value} USDC`
    //         : 'Failed to receive payment. Please try again.'
    //     showPaymentResult.value = true
    // }, 2000)
}

const handlePaymentClose = () => {
    showPaymentResult.value = false
    if (paymentSuccess.value) {
        // Reset the form or navigate away
        receive_step.value = 0
        amount.value = ''
        payerUsername.value = null
        payerPattern.value = null
    }
}

const handlePaymentRetry = () => {
    showPaymentResult.value = false
    // Retry the payment
    handlePay()
}

</script> 