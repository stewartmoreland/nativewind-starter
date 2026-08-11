// Required. Tailwind v4 under Metro runs through PostCSS; without this file you
// get silently zero styles on every platform, not just web.
// Must be .mjs — apps/native has no "type": "module".
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
