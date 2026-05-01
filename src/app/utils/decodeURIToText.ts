export function decodeURIToText(text: string): string {
  // Check if the text is already decoded
  const isEncoded = (str: string): boolean => {
    // Check for valid percent-encoded sequences
    const encodedPattern = /%[0-9A-Fa-f]{2}/;
    return encodedPattern.test(str);
  };

  // If there are no percent-encoded sequences, assume it's already decoded
  if (!isEncoded(text)) {
    return text;
  }

  // If encoded, proceed with decoding
  try {
    return decodeURIComponent(text);
  } catch (error) {
    // If that fails, decode individual percent-encoded sequences
    return text.replace(/%[0-9A-Fa-f]{2}/g, (match) => {
      try {
        return decodeURIComponent(match);
      } catch {
        // If decoding fails, return the original matched sequence
        return match;
      }
    });
  }
}