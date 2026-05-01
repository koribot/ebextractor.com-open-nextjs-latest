import { encodeTextToURI } from "./encodeTextToURI";

export const normaliseTitleToAdaptInUrl = (title: string): string => {
  if (!title || typeof title !== "string") {
    return "";
  }
  const replaced = title
    .toLowerCase()
    // Trim whitespace from start and end
    .trim()

    // Replace accented characters with their base equivalents
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

    // Replace ampersands with 'and'
    .replace(/&/g, "-and-")

    // Remove apostrophes and quotes
    .replace(/['"]/g, "")

    // Replace forward slashes with hyphens (or underscores if preferred)
    .replace(/\//g, "-")

    // Replace any non-alphanumeric characters (except hyphens) with hyphens
    .replace(/[^a-z0-9-]/g, "-")

    // Replace multiple consecutive hyphens with a single hyphen
    .replace(/-+/g, "-")

    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, "");
  return encodeTextToURI(replaced);
};
