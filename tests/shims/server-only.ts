// Shim for the `server-only` Next.js marker package, which is bundled inside
// Next's runtime and doesn't resolve under Vitest. The real package only
// throws at module-load time when imported in client code — server code
// treats it as a no-op. Tests run server code in Node, so an empty export is
// the correct stand-in.
export {};
