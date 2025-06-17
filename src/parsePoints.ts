// parsePoints.ts
// Standalone XML points parser for test and runtime use
import { findAllByTag } from './domUtils';

export function parsePoints(armyInfo: string): Map<string, number> {
	const map = new Map<string, number>();
	let doc: Document;
	let parser: any;
	if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
		parser = new window.DOMParser();
	} else if (typeof globalThis.DOMParser !== 'undefined') {
		parser = new globalThis.DOMParser();
	} else {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { DOMParser: XmldomDOMParser } = require('xmldom');
		parser = new XmldomDOMParser();
	}
	doc = parser.parseFromString(armyInfo, 'application/xml');
	const root = doc.documentElement;
	const entryLinks = findAllByTag(root, 'entryLink');
	for (const el of entryLinks) {
		const name = el.getAttribute('name');
		const costs = findAllByTag(el, 'cost');
		for (const cost of costs) {
			if (cost.getAttribute('name') === 'pts' && name) {
				const value = Number(cost.getAttribute('value'));
				if (!isNaN(value)) {
					map.set(name, value);
				}
			}
		}
	}
	return map;
}
