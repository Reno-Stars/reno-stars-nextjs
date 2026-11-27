/**
 * zh and zh-Hant share some hand-written strings in components (the `zhLoc`
 * branches). zh-Hant used to receive the SIMPLIFIED text; it now gets the
 * Traditional twin (task 158 #1, 2026-11-26). Both strings live side by side at
 * the call site so an edit to one is visibly an edit to the other.
 */
export function zhPick(locale: string, simplified: string, traditional: string): string {
  return locale === 'zh-Hant' ? traditional : simplified;
}
