import { describe, it, expect } from 'vitest';
import { DOMParser } from 'xmldom';
import { parseKeywords } from '../../src/parser/keywords';

describe('parseKeywords', () => {
  it('simple', () => {
    const xml = `
		<selectionEntry type="unit" name="Unit with keywords">
			<categoryLinks>
				<categoryLink name="Hero" />
				<categoryLink name="Infantry" />
			</categoryLinks>
		</selectionEntry>
			`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const keywords = parseKeywords(root);
    expect(keywords.length).toBe(2);
    expect(keywords).toEqual(['Hero', 'Infantry']);
  });
});
