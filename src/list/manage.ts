import SuperJSON from 'superjson';
import { List, type IList } from './models/list';

export const LIST_NAME_MAX_LENGTH = 1000; // make this really high until we have better handling in the UI
export const LIST_STORAGE_KEY = 'list:';

export function createList(data: Partial<IList>): string | null {
  data.name = data.name?.trim() || '';
  if (!data.name) return null;

  if (data.name.length > LIST_NAME_MAX_LENGTH) {
    console.warn(`List name exceeds maximum length of ${LIST_NAME_MAX_LENGTH} characters.`);
    return null;
  }

  data.id = Math.random().toString(36).slice(2, 10);
  data.createdAt = new Date();
  const key = LIST_STORAGE_KEY + data.id;
  const list = new List(data);
  localStorage.setItem(key, SuperJSON.stringify(list));
  return list.id;
}

export interface IListItem {
  id: string;
  name: string;
  faction: string;
  modifiedAt: Date;
  pointsCap: number;
  validator: string;
}

export function getAllLists(): IListItem[] {
  const lists: IListItem[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LIST_STORAGE_KEY)) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const list = SuperJSON.parse(raw) as List;
        lists.push({
          id: list.id,
          name: list.name,
          faction: list.faction,
          modifiedAt: list.modifiedAt ? new Date(list.modifiedAt) : new Date(0),
          pointsCap: list.pointsCap,
          validator: list.validator
        });
      } catch {
        // skip corrupted
        console.warn(`Failed to parse list from key: ${key}`);
      }
    }
  }
  // Sort by modifiedAt (desc), then alpha by name
  return lists.filter((list) => list.name !== '').sort((a, b) => {
    if (b.modifiedAt?.getTime() !== a.modifiedAt?.getTime()) return b.modifiedAt?.getTime() - a.modifiedAt?.getTime();
    return a.name.localeCompare(b.name);
  });
}

const OLD_LIST_STORAGE_KEY = 'sigdex_list:';
export function clearAllLists(): void {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(LIST_STORAGE_KEY) || key.startsWith(OLD_LIST_STORAGE_KEY))) {
      localStorage.removeItem(key);
    }
  }
}
