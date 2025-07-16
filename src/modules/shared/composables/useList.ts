import { computed, ref, toValue, watch } from 'vue';
import { List } from '../../../list/models/list';
import SuperJSON from 'superjson';

export function deleteList(id: string) {
  localStorage.removeItem(`list:${id}`);
}

/**
 * useList composable
 * Loads and saves a list from localStorage using the given id (MaybeRefOrGetter).
 * Returns a ref to the List instance, always non-null (default: new List()).
 * Usage:
 *   const list = useList(listId);
 */
export function useList(id: string) {
  const key = computed(() => {
    const val = toValue(id);
    return val ? `list:${val}` : '';
  });

  // Manual localStorage read to avoid overwriting
  let initialList: List;
  const keyVal = key.value;
  const initialRaw = keyVal ? localStorage.getItem(keyVal) : null;
  if (initialRaw) {
    try {
      initialList = SuperJSON.parse(initialRaw) as List;
      // handle migrations
      if (!initialList.createdAt) initialList.createdAt = new Date(0);
      if (!initialList.modifiedAt) initialList.modifiedAt = new Date(0);
      if (!initialList.validator) initialList.validator = 'standard';
      if (!initialList.pointsCap) initialList.pointsCap = 2000;
      if (!initialList.regimentOfRenown) {
        initialList.regimentOfRenown = '';
        initialList.regimentOfRenownUnits = [];
      }
    } catch {
      initialList = new List();
    }
  } else {
    initialList = new List();
  }

  const listRef = ref<List>(initialList);

  // Watch for changes and write to localStorage only after valid load
  watch(
    [listRef, key],
    ([val, k]) => {
      if (!k || !val || val.name === '' || val.id === '' || !(val instanceof List)) {
        // fail safe so we don't save incomplete lists
        return;
      }
      try {
        localStorage.setItem(k, SuperJSON.stringify(val));
      } catch {
        console.warn('useList failed to write list to localStorage', k, val);
      }
    },
    { deep: true }
  );


  return listRef;
}
