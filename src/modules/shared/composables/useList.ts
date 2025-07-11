import { computed, toValue } from 'vue';
import { useStorage, type MaybeRefOrGetter } from '@vueuse/core';
import { List } from '../../../list/models/list';
import { setupListSuperJSON } from '../../../list/manage';
import SuperJSON from 'superjson';

/**
 * useList composable
 * Loads and saves a list from localStorage using the given id (MaybeRefOrGetter).
 * Returns a ref to the List instance, always non-null (default: new List()).
 * Usage:
 *   const list = useList(listId);
 */
export function useList(id: MaybeRefOrGetter<string>) {
  setupListSuperJSON();
  const key = computed(() => {
    const val = toValue(id);
    return val ? `list:${val}` : '';
  });
  // Always return a List instance, even if not found
  const list = useStorage(key, new List(), undefined, {
    serializer: {
      read: (v) => {
        try {
          if (!v) return new List();
          return SuperJSON.parse(v) as List;
        } catch {
          return new List();
        }
      },
      write: (v) => SuperJSON.stringify(v),
    },
  });
  return list;
}
