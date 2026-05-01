export function encodeTextToURI(text: string): string {
  // Check if the text is already encoded
  const isEncoded = (str: string): boolean => {
    return /%[0-9A-Fa-f]{2}/.test(str);
  };

  if (isEncoded(text)) {
    return text; // Return as is if already encoded
  }

  // If not encoded, proceed with encoding
  try {
    return encodeURIComponent(text);
  } catch (error) {
    // If that fails, encode individual characters
    return text.split('').map(char => {
      try {
        return encodeURIComponent(char);
      } catch {
        // If encoding fails, use the UTF-8 hex code
        return `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`;
      }
    }).join('');
  }
}