<template>
  <div class="settings-view">
    <BackButton
      class="back-btn"
      :size="36"
    />
    <h1>Settings</h1>
    <div class="section">
      <ListButton
        label="Clear BSData"
        :show-favorite-toggle="false"
        style="margin-bottom: 0.7rem"
        @click="clearBSDataHandler"
      />
      <ListButton
        label="Clear Favorites"
        :show-favorite-toggle="false"
        style="margin-bottom: 0.7rem"
        @click="clearFavorites"
      />
      <ListButton
        label="Clear Unit Default Settings"
        :show-favorite-toggle="false"
        @click="clearUnitDefaultSettings"
      />
      <ListButton
        label="Clear Lists"
        :show-favorite-toggle="false"
        @click="clearLists"
      />
    </div>
    <div class="section">
      <label class="input-label">GITHUB_REPO
        <input
          v-model="githubRepo"
          class="settings-input"
          placeholder="BSData/age-of-sigmar-4th"
          @change="saveGithubRepoHandler"
        >
      </label>
    </div>
    <div class="section legal">
      <strong>Disclaimer:</strong> This app is not affiliated with Games Workshop. It only downloads
      data from BSData.
    </div>
    <div class="section about">
      <strong>About:</strong> Sigdex is an open-source Age of Sigmar list builder.
      <a
        href="https://github.com/Harrison-Miller/sigdex"
        target="_blank"
      >GitHub page</a>
    </div>
    <div class="section version"><strong>Version:</strong> {{ SIGDEX_VERSION }}</div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SIGDEX_VERSION } from '../version';
import BackButton from '../modules/core/components/BackButton.vue';
import ListButton from '../modules/shared/components/ListButton.vue';
import { clearAllFavorites } from '../favorites';
import { clearGameCache } from '../modules/shared/composables/useGame';
import { saveGithubRepo } from '../github/config';
import { clearAllLists } from '../list/manage';
import { UNIT_SETTINGS_KEY } from '../modules/shared/composables/useUnitSettings';

const githubRepoKey = 'GITHUB_REPO';
const githubRepo = ref('');

onMounted(() => {
  githubRepo.value = localStorage.getItem(githubRepoKey) || '';
});

function clearBSDataHandler() {
  clearGameCache();
}
function saveGithubRepoHandler() {
  saveGithubRepo(githubRepo.value);
}

function clearFavorites() {
  clearAllFavorites();
}

function clearUnitDefaultSettings() {
  localStorage.removeItem(UNIT_SETTINGS_KEY);
}

function clearLists() {
  clearAllLists();
}
</script>
<style scoped>
.back-btn {
  position: absolute;
  left: 1.2rem;
  top: 1.2rem;
  z-index: 2;
}
.section {
  margin-bottom: 1.5rem;
}
.input-label {
  display: block;
  margin-bottom: 1rem;
  font-weight: 500;
}
.settings-input {
  width: 100%;
  font-size: 1.1rem;
  padding: 0.7em 1em;
  border-radius: 4px;
  border: 1.5px solid #222;
  margin-top: 0.3em;
  box-sizing: border-box;
  background: #f9f9f9;
}
.legal {
  color: #a00;
  font-size: 0.95em;
}
.about {
  font-size: 0.95em;
}
.version {
  color: #888;
  font-size: 0.9em;
}
@media (max-width: 600px) {
  .settings-view {
    padding: 0.5rem;
  }
  .settings-input {
    font-size: 1rem;
    padding: 0.9em 0.7em;
  }
}
</style>
