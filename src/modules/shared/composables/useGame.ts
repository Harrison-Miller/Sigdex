import { ref, readonly } from 'vue';
import { Parser } from '../../../parser/v3/parser';
import { Game, type IGame } from '../../../parser/v3/models/game';
import { Unit } from '../../../parser/v3/models/unit';
import { Model } from '../../../parser/v3/models/model';
import { Army } from '../../../parser/v3/models/army';
import { GITHUB_REPO } from '../../../army';
import SuperJSON from 'superjson';

const GAME_STORAGE_KEY = 'game';
const GAME_TIMESTAMP_KEY = 'gameTimestamp';
const GAME_VERSION_KEY = 'SIGDEX_VERSION';
const GAME_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
const SIGDEX_VERSION = import.meta.env.VITE_APP_VERSION || '0.0.0';

function isGameCacheOutOfDate(): boolean {
  const cachedTimestamp = localStorage.getItem(GAME_TIMESTAMP_KEY);
  if (!cachedTimestamp) return true;
  const age = Date.now() - Number(cachedTimestamp);
  return age >= GAME_MAX_AGE_MS;
}

function isGameVersionOutOfDate(): boolean {
  const storedVersion = localStorage.getItem(GAME_VERSION_KEY);
  if (!storedVersion) return true;
  const [major, minor] = SIGDEX_VERSION.split('.').map(Number);
  const [storedMajor, storedMinor] = storedVersion.split('.').map(Number);
  if (isNaN(major) || isNaN(minor) || isNaN(storedMajor) || isNaN(storedMinor)) return true;
  return major > storedMajor || (major === storedMajor && minor > storedMinor);
}

const _game = ref<IGame | null>(null);
const _loading = ref(false);
const _error = ref<string | null>(null);
let _loadPromise: Promise<void> | null = null;

export function clearGameCache() {
  _game.value = null;
  _loading.value = false;
  _error.value = null;
  _loadPromise = null;
  localStorage.removeItem(GAME_STORAGE_KEY);
  localStorage.removeItem(GAME_TIMESTAMP_KEY);
  localStorage.removeItem(GAME_VERSION_KEY);
}

/**
 * useGame composable
 * Returns refs for the parsed game data, loading, and error. Triggers load in background if needed.
 * Usage:
 *   const { game, loading, error } = useGame();
 */
export function useGame() {
  if (!_game.value && !_loading.value && !_loadPromise) {
    loadGame();
  }
  return {
    game: readonly(_game),
    loading: readonly(_loading),
    error: readonly(_error),
  };
}

async function loadGame() {
  _loading.value = true;
  setupSuperJSON();
  try {
    let needsUpdate = isGameCacheOutOfDate() || isGameVersionOutOfDate();
    let cached = localStorage.getItem(GAME_STORAGE_KEY);
    if (!needsUpdate && cached) {
      _game.value = SuperJSON.parse(cached);
      _loading.value = false;
      return;
    }
    // Parse and store new game data
    const parser = new Parser(GITHUB_REPO);
    const game = await parser.parse();
    _game.value = game;
    localStorage.setItem(GAME_STORAGE_KEY, SuperJSON.stringify(game));
    localStorage.setItem(GAME_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(GAME_VERSION_KEY, SIGDEX_VERSION);
    _loading.value = false;
  } catch (e: any) {
    _error.value = e?.message || 'Failed to load game data';
    _loading.value = false;
  }
}

function setupSuperJSON() {
  SuperJSON.registerClass(Unit);
  SuperJSON.registerClass(Model);
  SuperJSON.registerClass(Army);
  SuperJSON.registerClass(Game);
}
