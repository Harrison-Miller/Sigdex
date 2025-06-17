// domUtils.ts
// DOM parsing utility functions for XML parsing

export function findFirstByTagAndAttr(
  root: Element,
  tag: string,
  attr: string,
  value: string
): Element | null {
  if (root.nodeType === 1 && root.tagName === tag && root.getAttribute(attr) === value) return root;
  if (!root.childNodes) return null;
  for (let i = 0; i < root.childNodes.length; i++) {
    const found = findFirstByTagAndAttr(root.childNodes[i] as Element, tag, attr, value);
    if (found) return found;
  }
  return null;
}

export function findAllByTagAndAttr(
  root: Element,
  tag: string,
  attr: string,
  value: string
): Element[] {
  let results: Element[] = [];
  if (root.nodeType === 1 && root.tagName === tag && root.getAttribute(attr)?.startsWith(value))
    results.push(root);
  if (!root.childNodes) return results;
  for (let i = 0; i < root.childNodes.length; i++) {
    results = results.concat(findAllByTagAndAttr(root.childNodes[i] as Element, tag, attr, value));
  }
  return results;
}

export function findAllByTagAndAttrEndsWith(
  root: Element,
  tag: string,
  attr: string,
  value: string
): Element[] {
  let results: Element[] = [];
  if (root.nodeType === 1 && root.tagName === tag && root.getAttribute(attr)?.endsWith(value))
    results.push(root);
  if (!root.childNodes) return results;
  for (let i = 0; i < root.childNodes.length; i++) {
    results = results.concat(
      findAllByTagAndAttrEndsWith(root.childNodes[i] as Element, tag, attr, value)
    );
  }
  return results;
}

export function findAllByTag(root: Element, tag: string): Element[] {
  let results: Element[] = [];
  if (root.nodeType === 1 && root.tagName === tag) results.push(root);
  if (!root.childNodes) return results;
  for (let i = 0; i < root.childNodes.length; i++) {
    results = results.concat(findAllByTag(root.childNodes[i] as Element, tag));
  }
  return results;
}
