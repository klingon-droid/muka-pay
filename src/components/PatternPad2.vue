<template>
    <div class="relative w-[300px] h-[300px] touch-none">
        <!-- Pattern dots container -->
        <div class="grid grid-cols-3 gap-8 w-full h-full p-4">
            <div v-for="i in 9" :key="i-1" 
                class="relative flex items-center justify-center">
                <div :class="[
                    'w-8 h-8 rounded-full transition-all duration-200',
                    selectedDots.includes(i-1) ? 'bg-black scale-75' : 'bg-gray-300'
                ]"></div>
            </div>
        </div>

        <!-- Canvas for drawing lines -->
        <canvas 
            ref="canvas" 
            class="absolute inset-0 w-full h-full" 
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="endDrawing"
            @mouseleave="endDrawing"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
        ></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const emit = defineEmits(['pattern-complete']);

// Refs
const canvas = ref(null);
const ctx = ref(null);
const isDrawing = ref(false);
const selectedDots = ref([]);
const dots = ref([]);
const patternCache = ref(null); // Add cache for frozen pattern

// Initialize dot positions
const initDots = () => {
    if (!canvas.value) return;
    
    const rect = canvas.value.getBoundingClientRect();
    const gap = rect.width / 3;
    const offset = gap / 2;

    dots.value = [];
    for (let i = 0; i < 9; i++) {
        const row = Math.floor(i / 3);
        const col = i % 3;
        dots.value.push({
            x: col * gap + offset,
            y: row * gap + offset,
            index: i
        });
    }
};

// Canvas setup
onMounted(() => {
    if (canvas.value) {
        canvas.value.width = canvas.value.offsetWidth;
        canvas.value.height = canvas.value.offsetHeight;
        ctx.value = canvas.value.getContext('2d');
        initDots();
    }
});

// Drawing functions
const startDrawing = (e) => {
    if (!canvas.value) return;
    
    isDrawing.value = true;
    const point = getPoint(e);
    const dot = findClosestDot(point);
    if (dot) {
        selectedDots.value = [dot.index];
    }
    drawPattern();
};

const draw = (e) => {
    if (!isDrawing.value || !canvas.value) return;
    
    const point = getPoint(e);
    const dot = findClosestDot(point);
    
    if (dot) {
        // Only prevent touching the immediately previous dot
        const lastDot = selectedDots.value[selectedDots.value.length - 1];
        if (dot.index !== lastDot) {
            selectedDots.value.push(dot.index);
        }
    }
    
    drawPattern(point);
};

const endDrawing = () => {
    if (!isDrawing.value) return;
    isDrawing.value = false;
    
    // Cache the final pattern
    cacheCurrentPattern();
    // Redraw the clean pattern
    drawFrozenPattern();
    const pattern = selectedDots.value.join('');
    console.log('pattern', pattern);
    emit('pattern-complete', pattern);
};

// Touch event handlers
const handleTouchStart = (e) => {
    e.preventDefault();
    startDrawing(e.touches[0]);
};

const handleTouchMove = (e) => {
    e.preventDefault();
    draw(e.touches[0]);
};

const handleTouchEnd = (e) => {
    e.preventDefault();
    endDrawing();
};

// Helper functions
const getPoint = (e) => {
    if (!canvas.value) return { x: 0, y: 0 };
    
    const rect = canvas.value.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
};

const findClosestDot = (point) => {
    const threshold = 30; // Detection radius
    return dots.value.find(dot => {
        const distance = Math.sqrt(
            Math.pow(dot.x - point.x, 2) + 
            Math.pow(dot.y - point.y, 2)
        );
        return distance < threshold;
    });
};

// Cache the pattern
const cacheCurrentPattern = () => {
    if (!canvas.value || !ctx.value) return;
    patternCache.value = selectedDots.value.slice(); // Create a copy of selected dots
};

// Draw the frozen pattern
const drawFrozenPattern = () => {
    if (!canvas.value || !ctx.value) return;
    
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    
    if (!patternCache.value || patternCache.value.length === 0) return;
    
    ctx.value.beginPath();
    
    // Create gradient
    const gradient = ctx.value.createLinearGradient(0, 0, canvas.value.width, canvas.value.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(40, 40, 40, 0.8)');
    gradient.addColorStop(1, 'rgba(80, 80, 80, 0.9)');
    
    ctx.value.strokeStyle = gradient;
    ctx.value.lineWidth = 12;
    ctx.value.lineCap = 'round';
    ctx.value.lineJoin = 'round';
    
    ctx.value.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.value.shadowBlur = 10;
    ctx.value.shadowOffsetX = 2;
    ctx.value.shadowOffsetY = 4;
    
    // Draw only the lines between dots from the cache
    patternCache.value.forEach((dotIndex, i) => {
        const dot = dots.value[dotIndex];
        if (i === 0) {
            ctx.value.moveTo(dot.x, dot.y);
        } else {
            ctx.value.lineTo(dot.x, dot.y);
        }
    });
    
    ctx.value.stroke();
};

const drawPattern = (currentPoint = null) => {
    if (!canvas.value || !ctx.value) return;
    
    // Show frozen pattern when not actively drawing
    if (!isDrawing.value && patternCache.value) {
        drawFrozenPattern();
        return;
    }
    
    // Clear the canvas for active drawing
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    
    if (selectedDots.value.length === 0) return;
    
    ctx.value.beginPath();
    
    // Create gradient
    const gradient = ctx.value.createLinearGradient(0, 0, canvas.value.width, canvas.value.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(40, 40, 40, 0.8)');
    gradient.addColorStop(1, 'rgba(80, 80, 80, 0.9)');
    
    ctx.value.strokeStyle = gradient;
    ctx.value.lineWidth = 12;
    ctx.value.lineCap = 'round';
    ctx.value.lineJoin = 'round';
    
    ctx.value.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.value.shadowBlur = 10;
    ctx.value.shadowOffsetX = 2;
    ctx.value.shadowOffsetY = 4;
    
    // Draw current pattern
    selectedDots.value.forEach((dotIndex, i) => {
        const dot = dots.value[dotIndex];
        if (i === 0) {
            ctx.value.moveTo(dot.x, dot.y);
        } else {
            ctx.value.lineTo(dot.x, dot.y);
        }
    });
    
    // Draw line to current point only during active drawing
    if (currentPoint && isDrawing.value) {
        const lastDot = dots.value[selectedDots.value[selectedDots.value.length - 1]];
        if (lastDot) {
            ctx.value.lineTo(currentPoint.x, currentPoint.y);
        }
    }
    
    ctx.value.stroke();
};

// Clear pattern method
const clearPattern = () => {
    if (!canvas.value || !ctx.value) return;
    selectedDots.value = [];
    patternCache.value = null;
    drawPattern();
};

// Watch for changes in selected dots
watch(selectedDots, () => {
    drawPattern();
});

// Expose methods
defineExpose({
    clearPattern
});
</script> 