<template>
  <div 
    class="floating-header-buttons"
  >
    <button
      class="favorite-icon"
      :class="{ active: isFavorited }"
      @click.stop="toggleFavorite"
    >
      <FontAwesomeIcon icon="star" />
    </button>
  </div>
</template>
<script setup lang="ts">
import { useFavorite } from '../../core/composables/useFavorite';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const { type, name } = defineProps<{
  type: 'army' | 'unit';
  name: string;
}>();
const { isFavorited, toggleFavorite } = useFavorite(type, name);
</script>
<style>
.floating-header-buttons {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  padding: 1.2em 0.3em 0 0;
}

.favorite-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
}

.favorite-icon.active svg {
  color: var(--color-yellow);
}
.favorite-icon svg {
  color: #aaa;
  font-size: 2em;
}
</style>