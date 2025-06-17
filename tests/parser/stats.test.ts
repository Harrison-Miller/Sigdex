import { describe, it, expect } from 'vitest';
import { DOMParser } from 'xmldom';
import { parseStats } from '../../src/parser/stats';

describe('parseStats', () => {
  it('simple', () => {
    const xml = `
		<selectionEntry type="unit" name="TestUnit">
			<profiles>
				<profile name="TestUnit" typeName="Unit">
					<characteristics>
						<characteristic name="Move">5"</characteristic>
						<characteristic name="Health">4</characteristic>
						<characteristic name="Save">6+</characteristic>
						<characteristic name="Control">2</characteristic>
					</characteristics>
				</profile>
			</profiles>
		</selectionEntry>
			`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const stats = parseStats(root);
    expect(stats.move).toBe('5"');
    expect(stats.health).toBe(4);
    expect(stats.save).toBe('6+');
    expect(stats.control).toBe('2');
    expect(stats.banishment).toBeUndefined();
  });

  it('with banishment', () => {
    const xml = `
		<selectionEntry type="unit" name="Endless Spell">
			<profiles>
				<profile name="Endless Spell" typeName="Manifestation">
					<characteristics>
						<characteristic name="Move">6"</characteristic>
						<characteristic name="Health">3</characteristic>
						<characteristic name="Save">5+</characteristic>
						<characteristic name="Banishment">8+</characteristic>
					</characteristics>
				</profile>
			</profiles>
		</selectionEntry>
			`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const stats = parseStats(root);
    expect(stats.move).toBe('6"');
    expect(stats.health).toBe(3);
    expect(stats.save).toBe('5+');
    expect(stats.banishment).toBe('8+');
    expect(stats.control).toBeUndefined();
  });
});
