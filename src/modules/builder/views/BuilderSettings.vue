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
import BackButton from '../../../components/BackButton.vue';
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
.settings-back-btn {
  position: absolute;
  left: 1.2em;
  top: 1.2em;
  z-index: 2;
}
.settings-modal {
  min-width: 320px;
  max-width: 95vw;
}
.settings-modal label {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  font-weight: 500;
  margin-bottom: 1em;
}
.settings-modal input[type='text'] {
  width: 100%;
  font-size: 1.1em;
  padding: 0.7em 0.9em;
  border-radius: 6px;
  border: 1px solid #bbb;
  margin-top: 0.3em;
  box-sizing: border-box;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
  margin-top: 0.5em;
}
.modal-actions.single-action {
  justify-content: center;
  gap: 0;
}
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
