/**
 * WebMCP declarative API attributes (https://webmachinelearning.github.io/webmcp/).
 *
 * `toolname` + `tooldescription` on a <form> expose it as a tool to AI browsing
 * agents; Lighthouse's Agentic Browsing "WebMCP form coverage" audit checks for
 * them. React 19 passes unknown lowercase attributes through to the DOM, but
 * TypeScript's JSX typings need this augmentation to accept them.
 */
import 'react';

declare module 'react' {
  interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    /** WebMCP declarative API: action identifier for this form-as-tool. */
    toolname?: string;
    /** WebMCP declarative API: what the tool does, written for AI agents. */
    tooldescription?: string;
  }
}
