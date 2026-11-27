// opencc-js 1.0.5 ships no type declarations; only the Converter factory is used.
declare module 'opencc-js' {
  export function Converter(options: { from: string; to: string }): (text: string) => string;
}
