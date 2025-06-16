<script setup lang="ts">
const props = defineProps<{ keywords: string[] }>();

function formatKeyword(kw: string): string {
  // ***text*** => bullet bold with newline
  kw = kw.replace(/\*\*\*(.+?)\*\*\*/g, '<br>• <b>$1</b>');
  // **text** => bold
  kw = kw.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  // ^^text^^ => italics
  kw = kw.replace(/\^\^(.+?)\^\^/g, '<i>$1</i>');
  return kw;
}
</script>
<template>
  <div class="keywords-bar" v-if="props.keywords.length">
    <span v-for="kw in props.keywords" :key="kw" class="keyword" v-html="formatKeyword(kw)"></span>
  </div>
</template>
<style scoped>
.keywords-bar {
  background: #fff;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: #222;
  margin-top: 0.5rem;
  display: inline-block;
  border: 1.5px solid #222;
}
.keyword {
  background: #d6d6d6;
  border-radius: 4px;
  padding: 0.1em 0.5em;
  font-weight: 500;
  margin-right: 0.3em;
  white-space: nowrap;
  display: inline-block;
}
</style>
