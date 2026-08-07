/**
 * Renders the filled checklist as plain text for pasting into WeChat.
 *
 * Plain text on purpose: it survives WeChat, SMS and email intact, and the
 * office reads it on a phone. Unchecked items are kept and marked — what the
 * visitor did NOT confirm is the part the estimator needs to see.
 */

export interface SummaryItem {
  id: string;
  label: string;
}

export interface SummaryGroup {
  title: string;
  items: SummaryItem[];
}

interface BuildSummaryArgs {
  heading: string;
  scopeLine: string;
  groups: SummaryGroup[];
  checks: Record<string, boolean>;
  notes: Record<string, string>;
  outstandingLabel: string;
}

export function buildSummary({
  heading, scopeLine, groups, checks, notes, outstandingLabel,
}: BuildSummaryArgs): string {
  const lines: string[] = [heading];
  if (scopeLine) lines.push(scopeLine);

  let outstanding = 0;

  for (const group of groups) {
    if (group.items.length === 0) continue;
    lines.push('', group.title.toUpperCase());
    for (const item of group.items) {
      const done = Boolean(checks[item.id]);
      if (!done) outstanding += 1;
      lines.push(`${done ? '[x]' : '[ ]'} ${item.label}`);
      const note = notes[item.id]?.trim();
      if (note) {
        // Indent continuation lines so a multi-line note stays visually
        // attached to its check in a plain-text pane.
        for (const l of note.split('\n')) lines.push(`      ${l}`);
      }
    }
  }

  if (outstanding > 0) {
    lines.push('', `${outstandingLabel}: ${outstanding}`);
  }

  return lines.join('\n');
}
