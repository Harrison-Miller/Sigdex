import SuperJSON from 'superjson';
import { List, type IList } from './models/list';
import { ListRegiment } from './models/regiment';
import { ListUnit } from './models/unit';

export const LIST_STORAGE_KEY = 'list:';

export function setupListSuperJSON() {
  SuperJSON.registerClass(List);
  SuperJSON.registerClass(ListRegiment);
  SuperJSON.registerClass(ListUnit);
}

export function createList(data: Partial<IList>): string | null {
  data.name = data.name?.trim() || '';
  if (!data.name) return null;

  data.id = Math.random().toString(36).slice(2, 10);
  const key = LIST_STORAGE_KEY + data.id;
  const list = new List(data);
  setupListSuperJSON();
  localStorage.setItem(key, SuperJSON.stringify(list));
  return list.id;
}

export interface IListItem {
  id: string;
  name: string;
  faction: string;
}

export function getAllLists(): IListItem[] {
  setupListSuperJSON();
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
        });
      } catch {
        // skip corrupted
        console.warn(`Failed to parse list from key: ${key}`);
      }
    }
  }
  return lists;
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
