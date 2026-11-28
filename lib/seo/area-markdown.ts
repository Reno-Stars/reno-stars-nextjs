import { Marked } from 'marked';

/**
 * Markdown renderer for service-area body copy.
 *
 * In this DB copy a "~" is always a RANGE ("5~6주", "6~8주", "$14,000~$17,000"),
 * never strikethrough. GFM pairs two single tildes into <del>, and the sanitizer
 * then drops the tag, so "5~6주 … $14,000~$17,000(2~3주" rendered as "56주 …
 * $14,000$17,000(2~3주" — and once a price is removed the pairing shifts and
 * "2~3주" became "23주" (task 149). A strikethrough token is therefore printed
 * back as its literal "~…~", so every range keeps its tilde.
 */
export const areaContentRenderer = new Marked({
  renderer: {
    del({ tokens, raw }) {
      const tilde = raw.startsWith('~~') ? '~~' : '~';
      return `${tilde}${this.parser.parseInline(tokens)}${tilde}`;
    },
  },
});
