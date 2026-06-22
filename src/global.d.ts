// Type declarations for style side-effect imports so TypeScript (ts2882)
// recognizes `import "@/styles/styles.scss"` and similar global stylesheets.
declare module "*.scss";
declare module "*.sass";
declare module "*.css";

// CSS Modules
declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module "*.module.sass" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
