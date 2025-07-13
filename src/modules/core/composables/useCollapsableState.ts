import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

// In-memory cache for the session (per tab)
const collapseState = new Map<string, boolean>();

/**
 * useCollapsableState - composable for persistent collapsable section state per route and key.
 *
 * @param key Unique key for the collapsable section within the current route
 * @param defaultCollapsed Whether the section should be collapsed by default (default: false)
 * @returns { collapsed, toggle }
 */
export function useCollapsableState(key: string, defaultCollapsed = false) {
  if (key === '') {
    const collapsed = ref(defaultCollapsed);
    return {
      collapsed: collapsed,
      toggle: () => {
        collapsed.value = !collapsed.value;
      },
    };
  }

  const route = useRoute();
  const stateKey = `${route.fullPath}::${key}`;

  // Only use defaultCollapsed if no state is stored yet
  const collapsed = ref(
    collapseState.has(stateKey) ? collapseState.get(stateKey)! : defaultCollapsed
  );

  // When user toggles, update the cache
  function toggle() {
    collapsed.value = !collapsed.value;
    collapseState.set(stateKey, collapsed.value);
  }

  // If route changes, update collapsed to match stored state (or defaultCollapsed)
  watch(
    () => route.fullPath,
    (newPath) => {
      const newKey = `${newPath}::${key}`;
      collapsed.value = collapseState.has(newKey) ? collapseState.get(newKey)! : defaultCollapsed;
    }
  );

  return { collapsed, toggle };
}
