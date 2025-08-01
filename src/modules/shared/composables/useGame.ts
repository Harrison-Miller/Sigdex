import { ref, computed, toValue } from 'vue';
import { Parser } from '../../../parser/parser';
import { Game } from '../../../parser/models/game';
import { Unit } from '../../../parser/models/unit';
import { Army } from '../../../parser/models/army';
import { type MaybeRefOrGetter } from '@vueuse/core';
import { BattleProfile } from '../../../parser/models/battleProfile';
import { Lore } from '../../../parser/models/lore';
import { DEFAULT_GITHUB_BRANCH, DEFAULT_GITHUB_REPO, GITHUB_BRANCH, GITHUB_REPO } from '../../../github/config';
import { SIGDEX_VERSION } from '../../../version';
import SuperJSON from 'superjson';
import LZString from 'lz-string';
import { getLatestCommit } from '../../../github/commit';

const GAME_STORAGE_KEY = 'game';
const GAME_COMMIT_KEY = 'gameCommit';
const GAME_VERSION_KEY = 'SIGDEX_VERSION';

function isGameCacheOutOfDate(latestCommit: string): boolean {
  const cachedCommit = localStorage.getItem(GAME_COMMIT_KEY);
  if (!cachedCommit) return true;
  return cachedCommit !== latestCommit;
}

function isGameVersionOutOfDate(): boolean {
  const storedVersion = localStorage.getItem(GAME_VERSION_KEY);
  if (!storedVersion) return true;
  const [major, minor] = SIGDEX_VERSION.split('.').map(Number);
  const [storedMajor, storedMinor] = storedVersion.split('.').map(Number);
  if (isNaN(major) || isNaN(minor) || isNaN(storedMajor) || isNaN(storedMinor)) return true;
  return major > storedMajor || (major === storedMajor && minor > storedMinor);
}

const _game = ref<Game | null>(null);
const _loading = ref(false);
const _error = ref<string | null>(null);
let _loadPromise: Promise<void> | null = null;

export function clearGameCache() {
  _game.value = null;
  _loading.value = false;
  _error.value = null;
  _loadPromise = null;
  localStorage.removeItem(GAME_STORAGE_KEY);
  localStorage.removeItem(GAME_COMMIT_KEY);
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
    game: _game,
    loading: _loading,
    error: _error,
  };
}

async function loadGame() {
  _loading.value = true;
  try {
    const repo = GITHUB_REPO.value || DEFAULT_GITHUB_REPO;
    const branch = GITHUB_BRANCH.value || DEFAULT_GITHUB_BRANCH;
    const latestCommit = await getLatestCommit(repo, branch);

    const needsUpdate = isGameCacheOutOfDate(latestCommit) || isGameVersionOutOfDate();
    const cached = localStorage.getItem(GAME_STORAGE_KEY);
    if (!needsUpdate && cached) {
      try {
        // try decompressing
        const decompressed = LZString.decompressFromUTF16(cached);
        if (!decompressed) throw new Error('Failed to decompress game data');
        _game.value = SuperJSON.parse(decompressed);
      } catch {
        // If decompression fails, assume it's a regular SuperJSON string
        _game.value = SuperJSON.parse(cached);
      }
      _loading.value = false;
      return;
    }
    // Parse and store new game data
    console.log('Loading game data from GitHub...', repo, branch);
    const parser = new Parser(repo, branch);
    const game = await parser.parse();
    _game.value = game;

    const data = SuperJSON.stringify(game);
    // Only compress in production
    if (import.meta.env.DEV) {
      localStorage.setItem(GAME_STORAGE_KEY, data);
      console.log('Stored uncompressed game data in development mode.');
    } else {
      const compressed = LZString.compressToUTF16(data);
      localStorage.setItem(GAME_STORAGE_KEY, compressed);
    }
    localStorage.setItem(GAME_COMMIT_KEY, latestCommit);
    localStorage.setItem(GAME_VERSION_KEY, SIGDEX_VERSION);
    _loading.value = false;
  } catch (e: any) {
    console.error('Failed to load game data:', e);
    try {
      // try cached if we failed (we might have failed because of network issues)
      const cached = localStorage.getItem(GAME_STORAGE_KEY);
      if (cached) {
        try {
          // try decompressing
          const decompressed = LZString.decompressFromUTF16(cached);
          if (!decompressed) throw new Error('Failed to decompress game data');
          _game.value = SuperJSON.parse(decompressed);
        } catch {
          // If decompression fails, assume it's a regular SuperJSON string
          _game.value = SuperJSON.parse(cached);
        }
        _loading.value = false;
        return;
      }
    } catch (e2: any) {
      _error.value = e2?.message || 'Failed to load game data';
      _loading.value = false;
    }
  }
}

/**
 * useArmy composable
 * Returns a ref to the requested army by name, always non-null (default: new Army()).
 * Usage:
 *   const { army, loading, error } = useArmy(armyName);
 */
export function useArmy(armyName: MaybeRefOrGetter<string>) {
  const { game, loading, error } = useGame();
  const army = computed(() => {
    if (!game.value) return new Army();
    const name = toValue(armyName);
    const found = game.value.armies.get(name);
    return found ?? new Army();
  });
  return { army, loading, error };
}

/**
 * useUnit composable
 * Returns refs for the requested unit (from global game) and its battleProfile (from army), given armyName and unitName.
 * Usage:
 *   const { unit, battleProfile, loading, error } = useUnit(armyName, unitName);
 */
export function useUnit(armyName: MaybeRefOrGetter<string>, unitName: MaybeRefOrGetter<string>) {
  const { game, loading, error } = useGame();
  const { army } = useArmy(armyName);
  const unit = computed(() => {
    const name = toValue(unitName);
    return game.value?.units.get(name) ?? new Unit({ name });
  });
  const battleProfile = computed(() => {
    const name = toValue(unitName);
    return army.value?.battleProfiles.get(name) ?? new BattleProfile({ name });
  });
  return { unit, battleProfile, loading, error };
}

export function useUniversalManifestationLore(loreName: MaybeRefOrGetter<string>) {
  const { game, loading, error } = useGame();
  const lore = computed(() => {
    if (!game.value) return new Lore();
    const name = toValue(loreName);
    return game.value?.universalManifestationLores.get(name) ?? new Lore({ name });
  });
  return { lore, loading, error };
}
