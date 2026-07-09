// Reuse the Open Graph card for Twitter/X (twitter:image, summary_large_image).
// `runtime` must be a string literal in this file — Next can't read it via re-export.
export const runtime = "edge";
export { default, alt, size, contentType } from "./opengraph-image";
