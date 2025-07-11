import type { List } from '../list/models/list';
import type { Game } from '../parser/models/game';

export type ListValidator = (list: List, game: Game) => string[];
