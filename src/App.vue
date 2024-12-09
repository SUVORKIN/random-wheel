<template>
  <div>
    <h1>Колесо {{ duration }} - {{ maxRotation }} - {{ rotateAngle }}</h1>
  </div>

  <div class="container">
    <!--    <div class="winner" v-if="winner">{{ winner.name }}</div>-->
    <div class="forms mb-2">
      <div class="mb-2">
        <label for="duration">Время</label> &nbsp;
        <input name="duration" id="duration" v-model="duration" type="text" />
        <button class="start" @click="handleStart">Start</button>
      </div>
      {{ timeLeft }}
      <div class="lots">
        <template v-for="(item, i) in drawItems" :key="item.id">
          <LotForm
            :lot-data="item"
            :is-last="i === items.length - 1"
            @change="handleChange"
            @remove="handleRemove"
          />
        </template>
        <button v-if="!items.length" @click="addItem">+</button>
      </div>
    </div>
    <div>
      <div class="winner">
        <h2>{{ winner?.name || "" }}</h2>
      </div>

      <div class="wrapper">
        <div v-if="drawItems.length > 1" class="arrow"></div>
        <div id="wheel-content">
          <canvas
            class="canvas"
            ref="canvas"
            id="canvas"
            width="400"
            height="400"
            :style="wheelStyles"
          ></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import LotForm from "./components/LotForm.vue";
import demoData from "@/demoData";
import type { LotData } from "@/types";

const duration = ref<number>(10);
const timeLeft = ref<number>(duration.value);
const wheelStyles = ref();
const items = ref<LotData[]>(demoData);
const winner = ref<LotData | null>(null);
const rotateAngle = ref(0);
const maxRotation = ref(0);
let ctx = {} as CanvasRenderingContext2D;
const canvas = ref<any | null>(); /* HTMLElement */
const wheel = ref<any | null>(); /* HTMLElement */
const fps = 60;

onMounted(() => {
  canvas.value = document.getElementById("canvas");
  wheel.value = document.getElementById("wheel-content");
  ctx = canvas.value!.getContext("2d");
  draw();
});

const addItem = () => {
  if (!items.value.length || items.value[items.value.length - 1].value) {
    const { r, g, b } = getRandomColor();
    items.value.push({
      name: "",
      value: 0,
      id: new Date().getTime().toString(),
      startAngleRad: 0,
      endAngleRad: 0,
      startAngle: 0,
      endAngle: 0,
      color: `rgb(${r}, ${g}, ${b})`,
    });
  }
};

const drawItems = computed(() => {
  let startAngle = rotateAngle.value;
  let endAngle = rotateAngle.value;
  let drawItems: LotData[] = [];
  items.value.forEach((item) => {
    endAngle += getAngleForItem(item);
    drawItems.push({
      ...item,
      ...{
        endAngleRad: toRadians(endAngle),
        startAngleRad: toRadians(startAngle),
        startAngle: startAngle,
        endAngle: endAngle,
      },
    });
    startAngle = endAngle;
  });
  return drawItems.sort((a, b) => b.value - a.value);
});

const handleChange = (lotData: LotData) => {
  items.value.splice(
    items.value.findIndex((i) => i.id === lotData.id),
    1,
    lotData
  );
  addItem();
  draw();
};

const handleRemove = (id: string) => {
  items.value.splice(
    items.value.findIndex((i) => i.id === id),
    1
  );
  draw();
};

const draw = () => {
  const cx = 200;
  const cy = 200;
  const r = 200;
  drawItems.value.forEach((item) => {
    if (item.value) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, item.startAngleRad, item.endAngleRad);
      ctx.fillStyle = item.color;
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.fill();

      //   text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((item.startAngleRad + item.endAngleRad) / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";

      //  add color contrast
      ctx.font = "18px sans-serif";
      ctx.fillText(item.name, 100, 5, 170);
      ctx.restore();

      // Winner
      const isWinner =
        item.startAngle % 360 <= 270 && item.endAngle % 360 >= 270;
      if (isWinner) {
        winner.value = item;
      }
    }
  });
};

let startTime = ref(0);
const handleStart = () => {
  startTime.value = Date.now();
  const minValue = rotateAngle.value + (360 * duration.value) / 100 / 2;
  const maxValue = rotateAngle.value + ((360 * duration.value) / 100) * 2;
  maxRotation.value = getRandomRange(minValue, maxValue);
  timeLeft.value = duration.value;
  rotate();
};

const rotate = () => {
  let t = (Date.now() - startTime.value) / 1000; // Время в секундах
  timeLeft.value = t;
  let angle = getSpeed(t, maxRotation.value, duration.value / 4);

  if (t > duration.value && angle < 1) {
    // Колесо остановилось, можно выполнить дополнительные действия
  } else {
    // Обновляем позицию колеса, например:
    rotateAngle.value += (angle * Math.PI) / 180;
    window.requestAnimationFrame(rotate);
    draw();
  }
};

const speed = ref(1);
function getSpeed(t: number, deltaTheta: number, T: number) {
  // // если времени осталось от 5% до 1% возвращай предыдущее значение
  // debugger;
  // const percent = (t / T / 4) * 100;
  // console.log(percent);
  // if (percent > 90 && percent < 95) {
  //   return speed.value;
  // }
  speed.value =
    ((2 * deltaTheta) / (Math.PI * T)) *
    (1 - Math.cos((Math.PI * t) / (2 * T)));
  return speed.value;
}

const getRandomRange = (min: number, max: number) => {
  return Math.random() * 360 * duration.value + 1;
};

const getAngleForItem = (item: LotData) => {
  const sum = items.value.reduce((acc, current) => {
    return acc + current.value;
  }, 0);
  const percents = (item.value * 100) / sum;
  return (360 * percents) / 100;
};

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

const getRandomColor = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return { r, g, b };
};
</script>
