import { getBaseUrl } from '@/lib/utils';

interface VideoObjectSchemaProps {
  /** Video title shown in video search results. */
  name: string;
  description: string;
  /** Poster/thumbnail image — REQUIRED by Google for video indexing. */
  thumbnailUrl: string;
  /** Direct URL to the media file (mp4/mov on R2). */
  contentUrl: string;
  /** ISO date the video was published (Google-required). */
  uploadDate: string;
  /** Page the video lives on. Point this at the dedicated watch page even
   *  when the schema is emitted on an embedding page (e.g. the project case
   *  study) so Google consolidates signals onto the watch page. */
  url: string;
  /** BCP-47 locale for inLanguage. */
  locale?: string;
  /** ISO-8601 duration (e.g. 'PT1M30S') when known. */
  duration?: string;
}

/**
 * Schema.org VideoObject JSON-LD. Emit on the watch page
 * (`/[locale]/videos/[slug]/`) where the video is the main content, and on
 * the embedding project page with `url` pointing at the watch page. GSC
 * 2026-07-07: 86 video-bearing pages, 0 indexed — "Video isn't on a watch
 * page" + no VideoObject markup anywhere.
 */
export default function VideoObjectSchema({
  name,
  description,
  thumbnailUrl,
  contentUrl,
  uploadDate,
  url,
  locale,
  duration,
}: VideoObjectSchemaProps): React.ReactElement {
  const baseUrl = getBaseUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl: [thumbnailUrl],
    contentUrl,
    uploadDate,
    url: fullUrl,
    ...(locale && { inLanguage: locale }),
    ...(duration && { duration }),
    publisher: {
      '@type': 'Organization',
      name: 'Reno Stars',
      url: baseUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
