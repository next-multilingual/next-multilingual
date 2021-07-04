declare module '*.properties' {
  const messages: { readonly [key: string]: string };
  export default messages;
}
