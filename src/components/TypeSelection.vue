<template>
  <div>
    <fieldset class="type-select-fieldset">
      <legend>Выберите тип определения победителя:</legend>
      <div>
        <label>
          <input
            type="radio"
            :value="0"
            v-model="selectedOption"
            @change="handleTypeChange(0)"
          />
          Классический
        </label>
        <label>
          <input
            type="radio"
            :value="1"
            v-model="selectedOption"
            @change="handleTypeChange(1)"
          />
          Выбывание
        </label>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  (e: "update:modelValue", id: number): void;
}>();

const props = defineProps<{
  modelValue: number;
}>();

const selectedOption = ref(props.modelValue);
const handleTypeChange = (value: number) => {
  emit("update:modelValue", value);
};
</script>
