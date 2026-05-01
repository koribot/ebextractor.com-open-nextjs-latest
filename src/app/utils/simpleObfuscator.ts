const KEY = 73;

function xorEncode(str: string) {
  return btoa(
    [...str]
      .map((c) => String.fromCharCode(c.charCodeAt(0) ^ KEY))
      .join("")
  );
}

function xorDecode(encoded: string) {
  const decoded = atob(encoded);
  return [...decoded]
    .map((c) => String.fromCharCode(c.charCodeAt(0) ^ KEY))
    .join("");
}

export { xorEncode, xorDecode };