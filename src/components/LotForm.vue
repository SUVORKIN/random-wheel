<template>
  <div class="lot-form">
    <div style="min-width: 40px">{{ Math.floor(lotData.winChance) }}%</div>
    <input :id="lotData.id" v-model="name" type="text" autocomplete="false" />
    <input
      v-model="value"
      :id="value + lotData.id"
      style="width: 100px"
      type="number"
    />
    <span>+</span>
    <input v-model.trim="add" style="width: 80px" type="number" />
    <button :class="saveButtonClasses" @click="saveChanges">
      <span v-if="!isLast">Сохранить</span>
      <span v-else>Добавить</span>
    </button>
    <button v-if="!isLast" @click="handleRemoveClick">
      <span>-</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
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
const add = ref(0);
const handleRemoveClick = () => {
  emit("remove", props.lotData.id);
};

const saveChanges = () => {
  if (name.value) {
    emit("change", {
      ...props.lotData,
      name: name.value,
      value: Math.max(value.value + add.value, 0),
    });
    add.value = 0;
  }
};
const isSaved = ref(true);
watch([value, add, name], ([newValue, newAddition, newName]) => {
  if (
    newValue !== props.lotData.value ||
    newName !== props.lotData.name ||
    newAddition
  ) {
    isSaved.value = false;
  } else {
    isSaved.value = true;
  }
});

const saveButtonClasses = computed(() => ({
  "not-saved": !isSaved.value,
  "add-item": props.isLast,
}));
</script>

<style scoped>
.lot-form {
  display: flex;
  align-items: center;
}
</style>
