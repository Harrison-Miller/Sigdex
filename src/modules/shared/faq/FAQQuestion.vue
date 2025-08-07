<template>
  <div class="faq-question">
    <div class="faq-question-q"><strong>Q: {{ question.question }}</strong></div>
    <div class="faq-question-a">A: {{ question.answer }}</div>
    <span
      class="favorite-icon"
      :class="{ active: isFavorited }"
      @click.stop="toggleFavorite"
    >
      <FontAwesomeIcon icon="star" />
    </span>
  </div>
</template>
<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { IFAQQuestion } from './types';
import { useFavorite } from '../../core/composables/useFavorite';

const props = defineProps<{ question: IFAQQuestion }>();

const { isFavorited, toggleFavorite } = useFavorite('faq', props.question.question);
</script>
<style scoped>
.faq-question {
  position: relative;
  margin: 0.5em;
  background: var(--bg-selected);
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 0.8em;
  padding-right: 3em;
}
.faq-question-q {
  font-weight: 500;
  margin-bottom: 0.3em;
  text-align: left;
}
.faq-question-a {
  margin-bottom: 0.2em;
  color: var(--text-main);
  text-align: left;
}
.faq-question-updated {
  font-size: 0.85em;
  color: var(--text-muted);
}

.favorite-icon {
  position: absolute;
  top: 0.8em;
  right: 0.8em;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: color 0.2s;
  width: 24px;
  height: 24px; 
  justify-content: center;
}

.favorite-icon.active svg {
  color: var(--color-yellow);
}

.favorite-icon svg {
  color: #aaa;
  font-size: 1.2em;
}
</style>
