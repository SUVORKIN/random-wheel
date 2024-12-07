<template>
  <div id="label" class="lotLabel" :style="styleObject">
    {{ item.name }}
  </div>
</template>

<script setup lang="ts">
import type { LotData } from "@/types";
import { computed, onMounted, reactive, ref } from "vue";

const props = defineProps<{
  item: LotData;
}>();
const radius = 200;
const circle = ref<DOMRect>();
const label = ref<DOMRect>();
const centerPoints = computed(() => {
  if (circle.value) {
    return {
      x: (circle.value.left + circle.value.right) / 2,
      y: (circle.value.top + circle.value.bottom) / 2,
    };
  }
  return {};
});

const xPos = computed(() => {
  if (centerPoints.value) {
    // return (Math.cos(props.item.labelAngle) * radius) / 4 + 200;
  }
  return 200;
});

const yPos = computed(() => {
  if (centerPoints.value) {
    // return (Math.sin(props.item.labelAngle) * radius) / 4 + 200;
  }
  return 200;
});

const styleObject = reactive({
  // transform: `rotate(${props.item.labelAngle}deg)`,
  top: `${yPos.value}px`,
  left: `${xPos.value}px`,
});

onMounted(() => {
  circle.value = document
    .getElementById("wheel-content")
    ?.getBoundingClientRect();

  label.value = document.getElementById("label")?.getBoundingClientRect();
});
</script>

<style>
.lotLabel {
  position: absolute;
  z-index: 2;
  color: #fff;
  width: auto;
}
</style>
