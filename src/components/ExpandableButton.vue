<template>
  <div class="flex justify-center items-center relative w-full px-4">
    <div :class="[expanded ? 'opacity-0 pointer-events-none duration-300' : 'opacity-100 pointer-events-auto ']" @click="clickHandler" class="text-white text-3xl z-50 bg-black rounded-full h-18 flex justify-center items-center w-full pointer-events-auto">
      <div ref="buttonText">
        <slot name="button_text"></slot>
      </div>
    </div>

    <div class="w-screen h-[95dvh] flex justify-center items-center fixed top-0 left-0 pointer-events-none">
      <div ref="expander" class="absolute bg-white h-[1px] w-[1px]" :style="expanderStyle"></div>
    </div>

    <main ref="content" :class="[expanded ? 'pointer-events-auto scale-100 opacity-100 delay-100 duration-300 z-[999] p-2' : 'pointer-events-none scale-[0.5] opacity-0 duration-200 ', 'transition-all fixed h-[100dvh] w-[100dvw] bg-white top-0 left-0  ']">
      <nav class="absolute top-0 left-0 w-full flex justify-start items-center pointer-events-none p-6 bg-gradient-to-b">

        

        <button :id="`close-${buttonId}`" class="text-white text-4xl pointer-events-auto z-10" @click="clickHandler">
          <iconify-icon icon="mdi-light:arrow-left"/>
        </button>

        <!-- <div class="bg-red-500/50 -ml-10 w-[12rem] h-[12rem] absolute rounded-full blur-[5rem]"></div> -->
        
      </nav>

      <div class="bg-black w-full h-full overflow-hidden rounded-2xl">
        <slot name="content"></slot>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import anime from "animejs";

const expanded = ref(false);
const expander = ref(null);
const expanderStyle = reactive({
  transform: "translate(-50%, -50%)",
  left: "50%",
  top: "50%",
});

const props = defineProps({
  buttonId: {
    type: String,
    required: true,
  },
});

const buttonText = ref(null);

const cachedLeft = ref(0);
const cachedTop = ref(0);

const content = ref(null);

const emit = defineEmits(['close', 'open']);

const clickHandler = (event) => {
  const buttonRect = buttonText.value.getBoundingClientRect();
  console.log('ExpandableButton clickHandler called, expanded:', !expanded.value);
  cachedLeft.value = `${buttonRect.left + buttonRect.width / 2}px`;
  cachedTop.value = `${buttonRect.top + buttonRect.height / 2}px`;

  /// set content's origin

  content.value.style.transformOrigin = `${event.clientX}px ${event.clientY}px`;

  expanded.value = !expanded.value;

  if (expanded.value) {
    // Update expander position to the click coordinates
    expanderStyle.left = `${event.clientX}px`;
    expanderStyle.top = `${event.clientY}px`;

    // Expand the element using anime.js
    anime({
      targets: expander.value,
      width: "200vw",
      height: "200vh",
      duration: 300,
      easing: "linear",
    });

    // Emit open event when button is expanded
    emit('open');
  } else {
    console.log('ExpandableButton closing, emitting close event');
    expanderStyle.left = `${cachedLeft.value}px`;
    expanderStyle.top = `${cachedTop.value}px`;

    content.value.style.transformOrigin = `${cachedLeft.value} ${cachedTop.value}`;

    anime({
      targets: expander.value,
      width: "1px",
      height: "1px",
      duration: 300,
      easing: "linear",
    });

    // Emit close event when button is closed
    emit('close');
  }
};
</script>
