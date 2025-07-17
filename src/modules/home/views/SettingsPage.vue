<template>
  <div class="settings-view">
    <BackButton
      class="back-btn"
      :size="36"
    />

    <h1>Settings</h1>
        <div class="section">
      <ToggleBox v-model="isDark">Dark Mode</ToggleBox>
    </div>
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
        style="margin-bottom: 0.7rem"
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
    <div class="section socials">
      <span>Join our community or view the project:</span>
      <div class="social-links">
        <a
          href="https://discord.gg/Fn6ZUFb9vZ" target="_blank"
          class="social-btn discord"
          aria-label="Discord"
        >
          <FontAwesomeIcon icon="fa-brands fa-discord" /> Discord
        </a>
        <a
          href="https://github.com/Harrison-Miller/sigdex" target="_blank"
          class="social-btn github"
          aria-label="GitHub"
        >
          <FontAwesomeIcon icon="fa-brands fa-github" /> GitHub
        </a>
      </div>
      <div class="social-links" style="margin-top: 0.7em; justify-content: center;">
        <a
          href="https://ko-fi.com/F1F11I630O"
          target="_blank"
          class="social-btn kofi"
          aria-label="Ko-fi"
        >
          <img src="/assets/brands/kofi_symbol.png" alt="Ko-fi" style="height:1.2em;vertical-align:middle;" />
          Support on Ko-fi
        </a>
      </div>
    </div>
    <div class="section legal">
      <strong>Disclaimer:</strong> This app is not affiliated with Games Workshop. It only downloads
      data from BSData.
    </div>
    <div class="section version"><strong>Version:</strong> {{ SIGDEX_VERSION }}</div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SIGDEX_VERSION } from '../../../version';
import BackButton from '../../core/components/BackButton.vue';
import ListButton from '../../shared/components/ListButton.vue';
import ToggleBox from '../../core/components/ToggleBox.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { clearAllFavorites } from '../../../favorites';
import { clearGameCache } from '../../shared/composables/useGame';
import { saveGithubRepo } from '../../../github/config';
import { clearAllLists } from '../../../list/manage';
import { UNIT_SETTINGS_KEY } from '../../shared/composables/useUnitSettings';
import { useDark } from '@vueuse/core';

const isDark = useDark();

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
.socials {
  font-size: 0.95em;
  margin-bottom: 1.5rem;
}
.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 0.7em;
  justify-content: center;
}
.social-btn {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-weight: 600;
  padding: 0.5em 1.1em;
  border-radius: 6px;
  text-decoration: none;
  font-size: 1.08em;
  transition: background 0.2s, color 0.2s;
}
.social-btn.discord {
  background: #5865F2;
  color: #fff;
}
.social-btn.discord:hover {
  background: #4752C4;
}
.social-btn.github {
  background: #24292F;
  color: #fff;
}
.social-btn.github:hover {
  background: #1b1f23;
}
.social-btn.kofi {
  background: #FF5E5B;
  color: #fff;
}
.social-btn.kofi:hover {
  background: #e04e4b;
}
.version {
  color: #888;
  font-size: 0.9em;
}
.dark-toggle-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
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
