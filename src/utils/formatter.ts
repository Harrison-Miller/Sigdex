export function formatText(text: string): string {
  if (!text) return '';
  // Add newline before every bullet (•)
  text = text.replace(/\s*•/g, '<br>•');
  // ***text*** => bullet bold with newline
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<br>• <b>$1</b>');
  // **number *text*** => bolded number - text, newline before
  text = text.replace(/\*\*(\d+) \*(.+?)\*\*\*/g, '<br><b>$1 - $2</b>');
  // **text** => bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  // ^^text^^ => italics
  text = text.replace(/\^\^(.+?)\^\^/g, '<i>$1</i>');
  return text;
}
