import { describe, it, expect } from 'vitest';
import { formatText } from '../../src/utils/formatter';

describe('formatText', () => {
  it('adds <br> before bullets', () => {
    expect(formatText('foo • bar')).toBe('foo<br>• bar');
    expect(formatText('foo\n• bar')).toContain('<br>• bar');
  });

  it('formats ***text*** as bullet bold with newline', () => {
    expect(formatText('***Important***')).toBe('<br>• <b>Important</b>');
    expect(formatText('foo ***Important*** bar')).toContain('<br>• <b>Important</b>');
  });

  it('formats **number *text*** as bolded number - text with newline', () => {
    expect(formatText('**2 *Attacks***')).toBe('<br><b>2 - Attacks</b>');
    expect(formatText('foo **3 *Wounds*** bar')).toContain('<br><b>3 - Wounds</b>');
  });

  it('formats **text** as bold', () => {
    expect(formatText('**Bold**')).toBe('<b>Bold</b>');
    expect(formatText('foo **Bold** bar')).toContain('<b>Bold</b>');
  });

  it('formats ^^text^^ as italics', () => {
    expect(formatText('^^italic^^')).toBe('<i>italic</i>');
    expect(formatText('foo ^^italic^^ bar')).toContain('<i>italic</i>');
  });

  it('combines multiple formats', () => {
    const input = '***Important*** **2 *Attacks*** **Bold** ^^italic^^';
    const output = formatText(input);
    expect(output).toContain('<br>• <b>Important</b>');
    expect(output).toContain('<br><b>2 - Attacks</b>');
    expect(output).toContain('<b>Bold</b>');
    expect(output).toContain('<i>italic</i>');
  });

  it('nested formats', () => {
    const input = '**^^Nested^^**';
    const output = formatText(input);
    expect(output).toBe('<b><i>Nested</i></b>');
  });
});
