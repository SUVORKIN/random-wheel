<template>
  <div class="timer">
    <div class="time">
      <input
        @change="onMinutesChange"
        id="minuesinput"
        class="time-input"
        type="number"
        placeholder="Минуты"
        :disabled="isRunning"
        :value="formattedMinutes"
      />
      <span>:</span>

      <input
        @change="onSecondsChange"
        id="secondsInput"
        class="time-input"
        :class="{ highlighted: isSecondsHighlighted }"
        type="number"
        placeholder="Секунды"
        :disabled="isRunning"
        :value="formattedSeconds"
      />
      <!-- <p>{{ formattedTime }}</p> -->
    </div>
    <div>
      <button v-if="!isRunning" @click="startTimer">Старт</button>
      <button v-if="isRunning" @click="pause">Пауза</button>
      <button @click="addTime(60)">+1 минута</button>
      <button @click="addTime(-60)">-1 минута</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, type InputHTMLAttributes } from "vue";

const totalSeconds = ref(300);
const timer = ref<any>(undefined);
const isRunning = ref(false);
const isSecondsHighlighted = ref(false);

const formattedMinutes = computed(() => {
  const minutes = Math.floor(totalSeconds.value / 60);
  return String(minutes).padStart(2, "0");
});

const formattedSeconds = computed(() => {
  const seconds = totalSeconds.value % 60;
  return String(seconds).padStart(2, "0");
});

const startTimer = () => {
  if (timer.value) return;

  isRunning.value = true;
  timer.value = setInterval(() => {
    if (totalSeconds.value > 0 && isRunning.value) {
      totalSeconds.value--;
      if (totalSeconds.value < 60) {
        isSecondsHighlighted.value = true;
      }
    } else {
      clearInterval(timer.value);
      timer.value = undefined;
      isRunning.value = false;
      isSecondsHighlighted.value = false;
    }
  }, 1000);
};

const addTime = (value: number) => {
  totalSeconds.value += value;
};

const pause = () => (isRunning.value = false);

const onMinutesChange = (event: any) => {
  if (event.target.valueAsNumber) {
    const seconds = totalSeconds.value % 60;
    totalSeconds.value = event.target.valueAsNumber * 60 + seconds;
  }
};

const onSecondsChange = (event: any) => {
  if (event.target.valueAsNumber) {
    const minutes = Math.floor(totalSeconds.value / 60);
    totalSeconds.value = minutes * 60 + event.target.valueAsNumber;
  }
};

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
  display: flex;
}

.timer {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.time-input {
  height: 80px;
  width: 100px;
  font-size: 44px;
  text-align: center;
}

@keyframes blinking-border {
  0% {
    outline-color: #ff6767;
  }
  50% {
    outline-color: #ff676782;
  }
  100% {
    outline-color: #ff676700;
  }
}
.highlighted {
  outline: 2px solid #ff6767;
  animation: blinking-border 1s infinite;
}
</style>
