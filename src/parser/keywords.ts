export function parseKeywords(root: Element): string[] {
  return Array.from(root.getElementsByTagName('categoryLink'))
    .map((el) => el.getAttribute('name') || '')
    .filter(Boolean);
}
