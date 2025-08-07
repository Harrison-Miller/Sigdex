<template>
  <div class="faq-section">
    <h2 class="faq-section-title">{{ section.title }}</h2>
    <div v-if="section.questions && section.questions.length">
      <FAQQuestion
        v-for="(q, i) in section.questions"
        :key="'section-q-' + i"
        :question="q"
      />
    </div>
    <div v-if="section.rules && section.rules.length">
      <FAQRule
        v-for="(rule, i) in section.rules"
        :key="'rule-' + i"
        :rule="rule"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { IFAQSection } from './types';
import FAQQuestion from './FAQQuestion.vue';
import FAQRule from './FAQRule.vue';

defineProps<{ section: IFAQSection }>();
</script>
<style scoped>
.faq-section {
  background: var(--bg-head);
  margin: 0.5em;
}
.faq-section-title {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 1em;
  color: var(--text-main);
  text-align: left;
}
</style>
