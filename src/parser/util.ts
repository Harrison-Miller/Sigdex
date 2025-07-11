// fast-xml-parse utilities

import { XMLParser } from 'fast-xml-parser';

export function xmlParser(): XMLParser {
  return new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    parseAttributeValue: false,
    isArray: (name) => {
      const arrayNames = [
        'selectionEntry',
        'selectionEntryGroup',
        'profile',
        'constraint',
        'condition',
        'modifier',
        'categoryLink',
        'cost',
        'characteristic',
        'attribute',
        'entryLink',
        'categoryEntry',
        'modifierGroup',
        'infoLink',
      ];
      if (arrayNames.includes(name)) {
        return true;
      }
      return false;
    },
  });
}

// get the value of a node as an array even if it has a single value
export function nodeArray(node: any): any[] {
  if (!node) return [];
  if (Array.isArray(node)) return node;
  return [node];
}

export function mapTextNodesByName(node: any, tagName: string): Map<string, string> {
  const elements = nodeArray(node?.[tagName]);
  const values = new Map<string, string>();
  elements.forEach((element: any) => {
    const name = element['@_name'] || '';
    const value = element['#text'] || '';
    values.set(name, value);
  });
  return values;
}

// breadth-first search for nodes by tag name and attributes
export function findAllByTagAndAttrs(
  node: any,
  tagName: string,
  attrs: Record<string, string>,
  recurse: boolean = true
): any[] {
  const results: any[] = [];
  const queue: any[] = [node];

  while (queue.length > 0) {
    const currentNode = queue.shift();
    if (!currentNode) continue;

    if (typeof currentNode !== 'object') continue;

    const keys = Object.keys(currentNode);
    keys
      .filter((key) => key.toLowerCase() === tagName.toLowerCase())
      .forEach((key) => {
        const nodes = nodeArray(currentNode[key]);
        nodes.forEach((n: any) => {
          if (nodeMatchesAttrs(n, attrs)) {
            results.push(n);
          }
        });
      });

    if (recurse) {
      keys
        .filter((key) => !key.startsWith('@_') && key !== '#text')
        .forEach((key) => {
          const children = nodeArray(currentNode[key]);
          children.forEach((child) => {
            queue.push(child);
          });
        });
    }
  }

  return results;
}

export function findFirstByTagAndAttrs(
  node: any,
  tagName: string,
  attrs: Record<string, string>,
  recurse: boolean = true
): any | null {
  const results: any[] = [];
  const queue: any[] = [node];

  while (queue.length > 0) {
    const currentNode = queue.shift();
    if (!currentNode) continue;

    const keys = Object.keys(currentNode);
    keys
      .filter((key) => key.toLowerCase() === tagName.toLowerCase())
      .forEach((key) => {
        const nodes = nodeArray(currentNode[key]);
        nodes.forEach((n: any) => {
          if (nodeMatchesAttrs(n, attrs)) {
            results.push(n);
          }
        });
      });

    if (results.length > 0) {
      return results[0];
    }

    if (recurse) {
      keys
        .filter((key) => !key.startsWith('@_') && key !== '#text')
        .forEach((key) => {
          const children = nodeArray(currentNode[key]);
          children.forEach((child) => {
            queue.push(child);
          });
        });
    }
  }
  return null;
}

export function nodeMatchesAttrs(node: any, attrs: Record<string, string>): boolean {
  for (const [key, value] of Object.entries(attrs)) {
    const attrName = `@_${key}`;
    if (!node.hasOwnProperty(attrName) || node[attrName] !== value) {
      return false;
    }
  }
  return true;
}
