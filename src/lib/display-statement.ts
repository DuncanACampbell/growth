/** Strip wrapping quotes for display only; does not alter stored text. */
export function displayStatement(statement: string): string {
  const trimmed = statement.trim();
  const pairs: [string, string][] = [
    ['"', '"'],
    ['\u201C', '\u201D'],
    ['\u2018', '\u2019'],
    ["'", "'"],
  ];
  for (const [open, close] of pairs) {
    if (
      trimmed.length >= 2 &&
      trimmed.startsWith(open) &&
      trimmed.endsWith(close)
    ) {
      return trimmed.slice(open.length, -close.length).trim();
    }
  }
  return trimmed;
}
