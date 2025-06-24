export function findAllByTagAndAttr(
  root: Element,
  tagName: string,
  attrName: string,
  value: string
): Element[] {
  const elements = root.getElementsByTagName(tagName);
  const result: Element[] = [];
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const attrValue = element.getAttribute(attrName);
    if (attrValue && attrValue.toLowerCase() === value.toLowerCase()) {
      result.push(element);
    }
  }
  return result;
}

export function findAllByTagAndAttrPrefix(
  root: Element,
  tagName: string,
  attrName: string,
  valuePrefix: string
): Element[] {
  const elements = root.getElementsByTagName(tagName);
  const result: Element[] = [];
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const attrValue = element.getAttribute(attrName);
    if (attrValue && attrValue.toLowerCase().startsWith(valuePrefix.toLowerCase())) {
      result.push(element);
    }
  }
  return result;
}

export function findFirstByTagAndAttr(
  root: Element,
  tagName: string,
  attrName: string,
  value: string
): Element | null {
  const elements = root.getElementsByTagName(tagName);
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const attrValue = element.getAttribute(attrName);
    if (attrValue && attrValue.toLowerCase() === value.toLowerCase()) {
      return element;
    }
  }
  return null;
}

export function findFirstByTagAndAttrPrefix(
  root: Element,
  tagName: string,
  attrName: string,
  valuePrefix: string
): Element | null {
  const elements = root.getElementsByTagName(tagName);
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const attrValue = element.getAttribute(attrName);
    if (attrValue && attrValue.toLowerCase().startsWith(valuePrefix.toLowerCase())) {
      return element;
    }
  }
  return null;
}

export function findFirstByTagAndAllAttrs(
  root: Element,
  tagName: string,
  attrs: Record<string, string>
): Element | null {
  const elements = root.getElementsByTagName(tagName);
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    let match = true;
    for (const [attrName, value] of Object.entries(attrs)) {
      const attrValue = element.getAttribute(attrName);
      if (!attrValue || attrValue.toLowerCase() !== value.toLowerCase()) {
        match = false;
        break;
      }
    }
    if (match) {
      return element;
    }
  }
  return null;
}

export function findAllByTagAndAllAttrs(
  root: Element,
  tagName: string,
  attrs: Record<string, string>
): Element[] {
  const elements = root.getElementsByTagName(tagName);
  const result: Element[] = [];
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    let match = true;
    for (const [attrName, value] of Object.entries(attrs)) {
      const attrValue = element.getAttribute(attrName);
      if (!attrValue || attrValue.toLowerCase() !== value.toLowerCase()) {
        match = false;
        break;
      }
    }
    if (match) {
      result.push(element);
    }
  }
  return result;
}

export function getDirectChildByTagName(root: Element, tagName: string): Element | null {
  const children = getChildren(root);
  for (const child of children) {
    if (child.tagName.toLowerCase() === tagName.toLowerCase()) {
      return child;
    }
  }
  return null;
}

export function findAllDirectChildrenByTagAndAttr(
  root: Element,
  tagName: string,
  attrName: string,
  value: string
): Element[] {
  const children = getChildren(root);
  const result: Element[] = [];
  for (const child of children) {
    if (child.tagName.toLowerCase() === tagName.toLowerCase()) {
      const attrValue = child.getAttribute(attrName);
      if (attrValue && attrValue.toLowerCase() === value.toLowerCase()) {
        result.push(child);
      }
    }
  }
  return result;
}

// this is needed because children is undefined
// we can get childNodes and filter by nodeType
export function getChildren(root: Element): Element[] {
  const children: Element[] = [];
  for (let i = 0; i < root.childNodes.length; i++) {
    const child = root.childNodes[i];
    const type = child.nodeType;
    if (type == 1) {
      // Node.ELEMENT_NODE
      children.push(child as Element);
    }
  }
  return children;
}

// breadth-first search for child with tag name
export function findChildByTagName(root: Element, tagName: string): Element | null {
  const queue: Element[] = [root];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (current.tagName.toLowerCase() === tagName.toLowerCase()) {
      return current;
    }
    const children = getChildren(current);
    queue.push(...children);
  }
  return null;
}

// find closest ancestor with tag name
export function closestByTagName(child: Element, tagName: string): Element | null {
  let current: Element | null = child;
  while (current) {
    if (current.tagName.toLowerCase() === tagName.toLowerCase()) {
      return current;
    }
    current = current.parentNode as Element | null;
  }
  return null;
}
