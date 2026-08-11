// Side-effect CSS imports (global.css) and CSS modules used by the .web.tsx
// variants. Metro handles these; TypeScript needs to be told they exist.
declare module '*.css';
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
