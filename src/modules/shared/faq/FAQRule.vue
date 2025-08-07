<template>
  <div class="card faq-rule">
    <h3 class="faq-rule-title">{{ rule.title }}</h3>
    <div v-if="rule.questions && rule.questions.length">
      <FAQQuestion
        v-for="(q, i) in rule.questions"
        :key="'rule-q-' + i"
        :question="q"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { IFAQRule } from './types';
import FAQQuestion from './FAQQuestion.vue';

defineProps<{ rule: IFAQRule }>();
</script>
<style scoped>
.faq-rule {
  margin: 0.5em;
  background: var(--bg-sub);
  margin-bottom: 1.5em;
  padding: 0;
}
.faq-rule-title {
  font-size: 1.15em;
  font-weight: 600;
  margin-bottom: 0.7em;
  color: var(--text-main);
  text-align: left;
}
</style>
