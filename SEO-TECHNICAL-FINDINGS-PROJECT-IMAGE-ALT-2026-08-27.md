# SEO Technical Findings — project_image_pairs Alt Text Gap
**Date:** 2026-08-27
**Branch:** seo/daily-2026-08-27
**Status:** Confirmed — requires content migration

## Finding

`project_image_pairs` table (304 rows total) has significant alt text coverage gaps:

| Column | Null/empty rows | % of table |
|--------|----------------|-------------|
| `before_alt_text_en` | 150 / 304 | 49% |
| `after_alt_text_en` | 112 / 304 | 37% |
| `before_alt_text_zh` | 150 / 304 | 49% |
| `after_alt_text_zh` | 38 / 304 | 12% |

Note: `before_alt_text_en` and `before_alt_text_zh` have identical null patterns — the same 150 rows are missing both.

## Existing Migration

`scripts/migrations/2026-08-23-project-image-pairs-after-alt-zh.sql` covers 58 rows of `after_alt_text_zh` — that column's remaining gap (38 rows) is now from that batch.

## Action Required

Content team to provide alt text for 150 before-images and 112 after-images. Alt text should:
- Describe the visual: room type, city/location, visible features, design style
- Follow pattern: "Before: [room description] in [city] home" / "After: [room description] in [city] home"
- Examples:
  - Before: "Before: dated bathroom with avocado-green bathtub and laminate countertop in a Richmond townhouse"
  - After: "After: modern bathroom with frameless glass shower and quartz countertop in a Richmond townhouse"

Migration to be written once English alt text content is provided.

## WCAG Impact

Missing `alt=""` on before/after renovation images is a WCAG accessibility failure. Screen reader users cannot understand what the before/after images depict without alt text.

## Schema

`project_image_pairs` columns: id, project_id, before_image_url, before_alt_text_en, before_alt_text_zh, after_image_url, after_alt_text_en, after_alt_text_zh, title_en, title_zh, caption_en, caption_zh, photographer_credit, keywords, display_order, created_at, before_video_url, after_video_url, localizations
