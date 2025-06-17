// parsePoints.ts
// Standalone XML points parser for test and runtime use
import { findAllByTag } from './domUtils';
import { DOMParser as XmldomDOMParser } from 'xmldom';

declare const global: any;
if (typeof window === 'undefined' && typeof global.DOMParser === 'undefined') {
  global.DOMParser = XmldomDOMParser;
}

export function parsePoints(xml: string): Map<string, number> {
  const map = new Map<string, number>();
  let root: Element;
  if (typeof xml === 'string') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    root = doc.documentElement;
  } else {
    root = xml;
  }
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
