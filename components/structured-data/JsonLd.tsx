/**
 * Single JSON-LD emitter for all structured-data components.
 *
 * Serializes `data` and escapes `<` to `<` so a `</script>` sequence in
 * any DB/CMS-sourced field (job descriptions, review text, project titles)
 * cannot break out of the <script> tag — malformed HTML at best, stored XSS at
 * worst. Previously each of the 14 schema components inlined this; the copy in
 * JobPostingSchema had dropped the escape (the /careers job description is
 * DB-sourced), which is exactly the drift this component removes.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
