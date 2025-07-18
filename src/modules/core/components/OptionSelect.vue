<template>
  <select v-model="selectedValue">
    <option
      v-if="placeholder"
      value=""
    >
      {{ placeholder }}
    </option>
    <template v-if="isArray">
      <option
        v-for="option in options as string[]"
        :key="option"
        :value="option"
      >
        {{ option }}
      </option>
    </template>
    <template v-else-if="isMap">
      <template
        v-for="[section, items] in options as Map<string, string[]>"
        :key="section"
      >
        <optgroup :label="section">
          <option
            v-for="item in items"
            :key="item"
            :value="item"
          >
            {{ item }}
          </option>
        </optgroup>
      </template>
    </template>
  </select>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
  options: string[] | Map<string, any[]>;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isArray = computed(() => Array.isArray(props.options));
const isMap = computed(() => props.options instanceof Map);

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});
</script>
<style scoped>
select {
  width: 100%;
  max-width: 420px;
  min-width: 220px;
  padding: 0.7em 1.2em 0.7em 0.9em;
  border: 1.7px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-head);;
  font-size: 1.08em;
  color: var(--text-main);
  margin-bottom: 0.7em;
  margin-top: 0.2em;
  transition: border 0.18s;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: inherit;
}

select:focus {
  border-color: var(--color-primary);
  outline: none;
  background: var(--bg-sub);
}
</style>
