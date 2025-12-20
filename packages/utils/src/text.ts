export function safeTruncate(text: string, maxChars = 16000): string {
  if (!text) return text;
  if (text.length <= maxChars) return text;

  const half = Math.floor(maxChars / 2);

  return (
    text.slice(0, half) +
    "\n\n... [CONTENT TRUNCATED FOR LENGTH] ...\n\n" +
    text.slice(-half)
  );
}
