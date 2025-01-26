<template>
  <div>
    <h1>Колесный аукцион</h1>
    <div class="app-content">
      <div class="forms mb-2 mr-2">
        <TypeSelection class="mb-2" v-model="type" @update:model-value="draw" />
        <Timer class="mb-2" />
        <div class="mb-2">
          <div>
            <div>
              <label for="duration">Время вращения в секундах</label> &nbsp;
              <input
                name="duration"
                id="duration"
                v-model="duration"
                type="text"
              />
              <button :disabled="isSpinning" class="start" @click="handleStart">
                Крутить колесо
              </button>
            </div>
          </div>
        </div>
        <div class="lots">
          <template
            v-for="(item, i) in itemsToDraw"
            :key="item.id + item.value + item.name + type"
          >
            <LotForm
              :lot-data="item"
              :is-last="i === items.length - 1"
              :isHighlighted="winner?.id === item.id"
              @change="handleChange"
              @remove="handleRemove"
            />
          </template>
          <button v-if="!items.length" @click="addItem">
            Добавить первый лот
          </button>
        </div>
      </div>
      <div class="wheel-content">
        <div class="winner d-flex">
          <h1 class="mr-2">
            {{ winner?.name || "" }}
          </h1>
          <button
            v-if="winner && !isSpinning && type === 1"
            @click="handleRemove(winner?.id)"
          >
            Удалить
          </button>
        </div>

        <div class="wheel-wrapper">
          <template v-if="itemsToDraw.length > 1">
            <div class="arrow"></div>
            <div class="outer-arrow"></div>
            <div class="central-image"></div>
          </template>
          <div id="wheel">
            <canvas
              class="canvas"
              ref="canvas"
              id="canvas"
              :width="WHEEL_DIAMETER"
              :height="WHEEL_DIAMETER"
            ></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import LotForm from "./components/LotForm.vue";
import { AUCTION_TYPE, type LotData } from "@/types";
import TypeSelection from "./components/TypeSelection.vue";
import Timer from "./components/Timer.vue";

const WHEEL_RADIUS = 350;
const WHEEL_DIAMETER = WHEEL_RADIUS * 2;
const duration = ref<number>(10);
const timeLeft = ref<number>(duration.value);
const items = ref<LotData[]>([]);
const winner = ref<LotData | null>(null);
const rotateAngle = ref(0);
const maxRotation = ref(0);
const canvas = ref<any | null>(); /* HTMLElement */
const wheel = ref<any | null>(); /* HTMLElement */
const speed = ref(1);
const startTime = ref(0);
const randomFinalExtention = ref(0);
const LSKey = "suvs-auc";
const type = ref(0);
const isSpinning = ref(false);
let ctx = {} as CanvasRenderingContext2D;

onMounted(() => {
  canvas.value = document.getElementById("canvas");
  wheel.value = document.getElementById("wheel");
  ctx = canvas.value!.getContext("2d");
  const LSItems = localStorage.getItem(LSKey);
  items.value.push(createItem());
  if (LSItems) {
    items.value = JSON.parse(LSItems);
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
  let itemsToDraw: LotData[] = [];
  items.value.forEach((item) => {
    endAngle += getAngleForItem(item);
    itemsToDraw.push({
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
  return itemsToDraw.sort((a, b) => b.value - a.value);
});

const handleChange = (lotData: LotData) => {
  items.value.splice(
    items.value.findIndex((i) => i.id === lotData.id),
    1,
    lotData
  );
  addItem();
  saveToLs(items.value);
  draw();
};

const handleRemove = (id: string) => {
  items.value.splice(
    items.value.findIndex((i) => i.id === id),
    1
  );
  saveToLs(items.value);
  winner.value = null;
  draw();
};

const draw = () => {
  const cx = 350;
  const cy = 350;
  const r = WHEEL_RADIUS;
  if (items.value.length > 1)
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
        ctx.fillStyle = item.textColor;

        //  add color contrast
        ctx.font = "16px sans-serif";
        ctx.fillText(item.name, 140, 5, 190);
        ctx.restore();

        // Winner
        const isWinner =
          (item.startAngle % 360 <= 270 && item.endAngle % 360 >= 270) ||
          item.endAngle === 360;
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
  isSpinning.value = true;
  rotate();
};

const rotate = () => {
  let t = (Date.now() - startTime.value) / 1000; // Время в секундах
  timeLeft.value = t;
  let angle = getSpeed(t, maxRotation.value, duration.value);

  if (t > duration.value && angle < 1) {
    isSpinning.value = false;
  } else {
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
  const percents =
    type.value === AUCTION_TYPE.ILIMINATION
      ? getEliminationChance(item)
      : getWinChance(item);

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

const getEliminationChance = (item: LotData) => {
  if (!item.value) {
    return 0;
  }
  const revertedValue = 1 / item.value;

  const sum = items.value.reduce((acc, current) => {
    if (current.value) {
      return acc + 1 / current.value;
    } else {
      return acc;
    }
  }, 0);

  return (revertedValue / sum) * 100;
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
  const luminance = getLuminance(r, g, b);
  return {
    name: "",
    value: 0,
    id: new Date().getTime().toString(),
    startAngleRad: 0,
    endAngleRad: 0,
    startAngle: 0,
    endAngle: 0,
    color: `rgb(${r}, ${g}, ${b})`,
    winChance: 100,
    textColor: luminance > 0.5 ? "black" : "white",
  };
};

const saveToLs = (data: LotData[]) => {
  window.localStorage.setItem(LSKey, JSON.stringify(data));
};

const getLuminance = (r: number, g: number, b: number) => {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
};
</script>
