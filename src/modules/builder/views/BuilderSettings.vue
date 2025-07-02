<template>
  <BackButton class="settings-back-btn" />
  <div class="modal settings-modal">
    <h1>List Settings</h1>
    <h2>{{ listName }}</h2>
    <label>
      Rename List
      <input v-model="newName" type="text" placeholder="New list name" />
    </label>
    <div class="modal-actions single-action">
      <button class="save-btn" @click="renameCurrentList" :disabled="!newName">Rename</button>
    </div>
    <hr />
    <button class="delete-btn" @click="deleteCurrentList">Delete List</button>
  </div>
</template>
<script setup lang="ts">
import BackButton from '../../core/components/BackButton.vue';
import { ref, computed, watch } from 'vue';
import { deleteList, renameList, getList } from '../../../utils/list-manager';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const listId = route.params.id as string;
const list = ref(getList(listId));
const listName = computed(() => list.value?.name || '');
const newName = ref(listName.value);

const router = useRouter();

watch(
  () => listId,
  () => {
    list.value = getList(listId);
    newName.value = list.value?.name || '';
  },
  { immediate: true }
);

function deleteCurrentList() {
  deleteList(listId);
  router.push({ path: '/' });
}

function renameCurrentList() {
  renameList(listId, newName.value);
  list.value = getList(listId); // update local list after rename
  router.replace({ name: 'BuilderSettings', params: { id: listId } });
}
</script>
<style scoped>
.save-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1.2em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.save-btn:disabled {
  background: #ccc;
  color: #888;
  cursor: not-allowed;
}
.save-btn:not(:disabled):hover {
  background: #1565c0;
}
.delete-btn {
  background: #a00;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1.2em;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.2em;
  width: 100%;
  transition: background 0.2s;
}
.delete-btn:hover {
  background: #c00;
}
</style>
