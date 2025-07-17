<template>
  <div class="list-list-component">
    <div class="list-actions-row">
      <button class="create-btn" @click="goToCreate">
        + Create
      </button>
      <button class="import-btn" @click="goToImport">
        <svg class="import-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4"/><rect x="4" y="17" width="16" height="4" rx="2"/></svg>
        Import
      </button>
    </div>
    <h2>Your Lists</h2>
    <div
      v-if="lists.length === 0"
      class="empty-message"
    >
      You have no saved lists yet.
    </div>
    <ul v-else>
      <li
        v-for="list in lists"
        :key="list.id"
      >
        <ListButton
          :label="`${list.name} | ${list.faction}`"
          @click="goToList(list)"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ListButton from '../../shared/components/ListButton.vue';
import { useRouter } from 'vue-router';
import { getAllLists, type IListItem } from '../../../list/manage';

const router = useRouter();
const lists = ref<IListItem[]>(getAllLists());

function goToCreate() {
  router.push({ name: 'CreateList' });
}

function goToImport() {
  router.push({ name: 'ListImport' });
}

function goToList(list: IListItem) {
  router.push({ name: 'ListBuilder', params: { id: list.id } });
}
</script>

<style scoped>
.list-list-component {
  /* padding: 1.5em 0.5em 0.5em 0.5em; */
  position: relative;
  min-height: 60vh;
}
.list-actions-row {
  display: flex;
  gap: 0.5em;
  /* margin-bottom: 0.7em; */
  justify-content: stretch;
  width: 100%;
}
.create-btn,
.import-btn {
  flex: 1 1 0;
  margin: 0;
  border-radius: 6px;
  padding: 0.5em 1.2em;
  font-weight: 600;
  cursor: pointer;
  font-size: 1.08em;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4em;
  justify-content: center;
}
.create-btn {
  background: #4caf50;
  color: #fff;
  border: none;
}
.create-btn:hover {
  background: #388e3c;
}
.import-btn {
  background: #1976d2;
  color: #fff;
  border: none;
}
.import-btn:hover {
  background: #0d47a1;
}
.import-icon {
  margin-right: 0.3em;
  vertical-align: middle;
}
.list-summary {
  font-size: 1.1em;
  margin-bottom: 0.5em;
}
.faction {
  color: #666;
  margin-left: 0.5em;
}
.empty-message {
  color: #888;
  text-align: center;
  margin-top: 2em;
}
ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}
li {
  margin-bottom: 0.7em;
}
li:last-child {
  margin-bottom: 0;
}
@media (max-width: 600px) {
  .fab {
    right: 1em;
    bottom: 1em;
  }
}
</style>
