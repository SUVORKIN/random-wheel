<template>
  <div class="lot-form">
    <input :id="lotData.id" v-model="name" type="text" autocomplete="false"/>
    <input :id="value + lotData.id" v-model="value" type="number" />
    <button @click="saveChanges">
      <span v-if="!isLast">Save</span>
      <span v-else>+</span>
    </button>
    <button>
      <span @click="handleRemoveClick">-</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { LotData } from "@/types";

const props = defineProps<{
  lotData: LotData;
  isLast: boolean;
}>();

const emit = defineEmits<{
  (e: "change", lotData: LotData): void;
  (e: "remove", id: string): void;
}>();

const name = ref(props.lotData.name);
const value = ref(props.lotData.value);

const handleRemoveClick = () => {
  emit("remove", props.lotData.id);
};

const saveChanges = () => {
  if (name.value) {
    emit("change", {
      name: name.value,
      value: value.value,
      id: props.lotData.id,
      color: props.lotData.color,
      startAngleRad: 0,
      endAngleRad: 0,
      endAngle: 0,
      startAngle: 0,
    });
  }
};
</script>

<style scoped>
.lot-form {
  display: flex;
  align-items: center;
}
</style>
