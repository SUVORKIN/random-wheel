<template>
  <div>
    <h1>Колесо</h1>
  </div>

  <div class="container">
    <div class="forms mb-2">
      <div class="mb-2">
        <label for="duration">Время</label> &nbsp;
        <input name="duration" id="duration" v-model="duration" type="text" />
        <button class="start" @click="handleStart">Start</button>
      </div>
      <div class="lots" v-if="items">
        <template
          v-for="(item, i) in itemsToDraw"
          :key="item.id + item.value + item.name"
        >
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
        <h1>{{ winner?.name || "" }}</h1>
      </div>

      <div class="wrapper">
        <div v-if="itemsToDraw.length > 1" class="arrow"></div>
        <div id="wheel-content">
          <canvas
            class="canvas"
            ref="canvas"
            id="canvas"
            width="600"
            height="600"
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

const duration = ref<number>(1);
const timeLeft = ref<number>(duration.value);
const wheelStyles = ref();
const items = ref<LotData[]>([]);
const winner = ref<LotData | null>(null);
const rotateAngle = ref(0);
const maxRotation = ref(0);
let ctx = {} as CanvasRenderingContext2D;
const canvas = ref<any | null>(); /* HTMLElement */
const wheel = ref<any | null>(); /* HTMLElement */
const speed = ref(1);
const startTime = ref(0);
const randomFinalExtention = ref(0);
const LSKey = "suvs-auc";
onMounted(() => {
  canvas.value = document.getElementById("canvas");
  wheel.value = document.getElementById("wheel-content");
  ctx = canvas.value!.getContext("2d");
  const lsItems = localStorage.getItem(LSKey);

  if (lsItems) {
    items.value = JSON.parse(lsItems);
  }
  if (items) {
    draw();
  }
});

const addItem = () => {
  if (!items.value.length || items.value[items.value.length - 1].value) {
    items.value.push(createItem());
  }
};

const itemsToDraw = computed(() => {
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
        winChance: getWinChance(item),
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
  saveToLs(items.value);
};

const handleRemove = (id: string) => {
  items.value.splice(
    items.value.findIndex((i) => i.id === id),
    1
  );
  draw();
  saveToLs(items.value);
};

const draw = () => {
  const cx = 300;
  const cy = 300;
  const r = 300;
  itemsToDraw.value.forEach((item) => {
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
      ctx.font = "16px sans-serif";
      ctx.fillText(item.name, 140, 5, 190);
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

const handleStart = () => {
  startTime.value = Date.now();
  maxRotation.value = getRandomRange();
  timeLeft.value = duration.value;
  randomFinalExtention.value = Math.random() * 10;

  rotate();
};

const rotate = () => {
  let t = (Date.now() - startTime.value) / 1000; // Время в секундах
  timeLeft.value = t;
  let angle = getSpeed(t, maxRotation.value, duration.value);

  if (t > duration.value && angle < 1) {
    // Колесо остановилось, можно выполнить дополнительные действия
  } else {
    // Обновляем позицию колеса, например:
    rotateAngle.value += (angle * Math.PI) / 180;
    window.requestAnimationFrame(rotate);
    draw();
  }
};

function getSpeed(t: number, deltaTheta: number, T: number) {
  if (speed.value < randomFinalExtention.value && t > T / 2 && t < T) {
    return speed.value;
  }
  speed.value =
    ((2 * deltaTheta) / (Math.PI * T)) *
    (1 - Math.sin((Math.PI * t) / (2 * T)) ** 2);
  return speed.value;
}

const getRandomRange = () => {
  const angle = ((Math.random() * 200) / 100) * 360;
  return angle + 360 * duration.value;
};

const getAngleForItem = (item: LotData) => {
  const percents = getWinChance(item);
  return (360 * percents) / 100;
};

const getWinChance = (item: LotData) => {
  if (!item.value) {
    return 0;
  }
  const sum = items.value.reduce((acc, current) => {
    return acc + current.value;
  }, 0);
  return (item.value * 100) / sum;
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

const createItem = (): LotData => {
  const { r, g, b } = getRandomColor();
  return {
    name: "",
    value: 0,
    id: new Date().getTime().toString(),
    startAngleRad: 0,
    endAngleRad: 0,
    startAngle: 0,
    endAngle: 0,
    color: `rgb(${r}, ${g}, ${b})`,
    winChance: 0,
  };
};

const saveToLs = (data: LotData[]) => {
  window.localStorage.setItem(LSKey, JSON.stringify(data));
};
</script>
