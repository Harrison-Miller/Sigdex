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

  it('formats ^^text** as bold italics', () => {
    expect(formatText('^^bolditalic**')).toBe('<b><i>bolditalic</i></b>');
    expect(formatText('foo ^^bolditalic** bar')).toContain('<b><i>bolditalic</i></b>');
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

  it('formats complex mixed bold, italics, and bold-italics', () => {
    const input = `**Effect**: Set up that unit in reserve in ambush. It has now been deployed.\n*Designer’s Note: Any number of friendly* **^^Beasts of Chaos^^** *units can start the battle in reserve – even your entire Beasts of Chaos army!*`;
    const output = formatText(input);
    expect(output).toContain(
      '<b>Effect</b>: Set up that unit in reserve in ambush. It has now been deployed.'
    );
    expect(output).toContain('<i>Designer’s Note: Any number of friendly</i>');
    expect(output).toContain('<b><i>Beasts of Chaos</i></b>');
    expect(output).toContain(
      '<i>units can start the battle in reserve – even your entire Beasts of Chaos army!</i>'
    );
  });

  it('formats multi-line Idoneth Deepkin effect with correct newlines and formatting', () => {
    const input = `A different effect applies to friendly **^^Idoneth Deepkin^^** units each battle round, as shown below. For the fifth battle round onwards, repeat the sequence, starting with ‘Low Tide’.
**Battle Round 1:**
***Low Tide:*** For the rest of the battle round, subtract 1 from hit rolls for shooting attacks that target this unit and subtract 1 from hit rolls for combat attacks that target this unit if it did not use any **^^Charge^^** abilities this turn.
**Battle Round 2:**
***Flood Tide:*** For the rest of the battle round, this unit can use a **^^Run^^** ability and still use **^^Shoot^^** and/or **^^Charge^^** abilities later in the turn.
**Battle Round 3:**
***High Tide:*** For the rest of the battle round, this unit has **^^Strike-first^^**.
**Battle Round 4:**
***Ebb Tide:*** For the rest of the battle round, this unit can use a **^^Retreat^^** ability and still use **^^Shoot^^** and/or **^^Charge^^** abilities later in the turn.`;
    const output = formatText(input);
    // Check that each Battle Round header is on its own line
    expect(output).toContain('<br><b>Battle Round 1:</b>');
    expect(output).toContain('<br><b>Battle Round 2:</b>');
    expect(output).toContain('<br><b>Battle Round 3:</b>');
    expect(output).toContain('<br><b>Battle Round 4:</b>');
    // Check that **^^Idoneth Deepkin^^** is bold italics
    expect(output).toContain('<b><i>Idoneth Deepkin</i></b>');
    // Check that ***Low Tide:*** is formatted as bullet bold with newline
    expect(output).toContain('<br>• <b>Low Tide:</b>');
    // Check that **^^Charge^^** is bold italics
    expect(output).toContain('<b><i>Charge</i></b>');
    // Check that ***Flood Tide:***, ***High Tide:***, ***Ebb Tide:*** are formatted
    expect(output).toContain('<br>• <b>Flood Tide:</b>');
    expect(output).toContain('<br>• <b>High Tide:</b>');
    expect(output).toContain('<br>• <b>Ebb Tide:</b>');
  });
});
