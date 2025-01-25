<template>
  <div class="timer">
    <div class="time">
      <p>{{ formattedTime }}</p>
    </div>
    <div>
      <button v-if="!isRunning" @click="startTimer">Старт</button>
      <button v-if="isRunning" @click="pause">Пауза</button>
      <button @click="addTime(60)">+1 минута</button>
      <button @click="addTime(-60)">-1 минута</button>
      <button v-if="isRunning" @click="resetTimer">Сброс</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";

const totalSeconds = ref(300);
const timer = ref<any>(undefined);
const isRunning = ref(false);

const formattedTime = computed(() => {
  const minutes = Math.floor(totalSeconds.value / 60);
  const seconds = totalSeconds.value % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
});

const startTimer = () => {
  if (timer.value) return;

  isRunning.value = true;
  timer.value = setInterval(() => {
    if (totalSeconds.value > 0 && isRunning.value) {
      totalSeconds.value--;
    } else {
      clearInterval(timer.value);
      timer.value = undefined;
      isRunning.value = false;
    }
  }, 1000);
};

const resetTimer = () => {
  clearInterval(timer.value);
  timer.value = undefined;
  isRunning.value = false;
  totalSeconds.value = 300;
};

const addTime = (value: number) => {
  totalSeconds.value += value;
};

const pause = () => (isRunning.value = false);

onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<style lang="css" scoped>
.time {
  font-size: 50px;
  margin-right: 10px;
}

.timer {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
</style>
