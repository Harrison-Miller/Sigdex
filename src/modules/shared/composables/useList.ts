import { computed, toValue } from 'vue';
import { useStorage, type MaybeRefOrGetter } from '@vueuse/core';
import { List } from '../../../list/models/list';
import SuperJSON from 'superjson';

/**
 * useList composable
 * Loads and saves a list from localStorage using the given id (MaybeRefOrGetter).
 * Returns a ref to the List instance, always non-null (default: new List()).
 * Usage:
 *   const list = useList(listId);
 */
export function useList(id: MaybeRefOrGetter<string>) {
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
          const list = SuperJSON.parse(v) as List;
          // handle migrations
          if (!list.createdAt) {
            list.createdAt = new Date(0); // default to epoch if not set
          }
          if (!list.modifiedAt) {
            list.modifiedAt = new Date(0); // default to epoch if not set
          }
          if (!list.validator) {
            list.validator = 'standard'; // set default validator if not present
          }
          if (!list.pointsCap) {
            list.pointsCap = 2000; // set default points cap if not present
          }
          if (!list.regimentOfRenown) {
            list.regimentOfRenown = ''; // default to empty string if not set
            list.regimentOfRenownUnits = []; // ensure units are empty
          }
          return list;
        } catch {
          return new List();
        }
      },
      write: (v) => {
        if (v.name === '' || v.id === '' || v instanceof List === false) {
          // fail safe so we don't save incomplete lists
          throw new Error(`List must have a name and id before saving ${v.id}, ${v.name}`);
        }

        return SuperJSON.stringify(v);
      },
    },
  });
  return list;
}
