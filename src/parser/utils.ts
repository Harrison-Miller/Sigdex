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
