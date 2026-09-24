-- Migration: 2026-09-23-service-areas-meta-description-en-overflow
-- Target: service_areas where meta_description_en exceeds 155 chars
-- Rows: Richmond (163 chars), West Vancouver (157 chars)
-- Status: NOT APPLIED — needs human to run
-- This migration is idempotent: re-running produces the same result

DO $$
DECLARE
    affected_count INTEGER;
BEGIN
    SELECT count(*) INTO affected_count
    FROM service_areas
    WHERE length(meta_description_en) > 155;

    IF affected_count = 0 THEN
        RAISE NOTICE 'No service_areas rows with meta_description_en > 155 chars — nothing to do.';
    ELSE
        RAISE NOTICE 'Found % rows to fix.', affected_count;

        UPDATE service_areas
        SET meta_description_en =
            CASE name_en
                WHEN 'Richmond'
                    THEN 'Trusted kitchen and bathroom renovation contractor in Richmond, BC. Serving residential and commercial clients with transparent pricing, licensed trades, and on-time delivery. Free consultation available.'
                WHEN 'West Vancouver'
                    THEN 'Experienced renovation contractor serving West Vancouver with custom home upgrades, bathroom remodels, and whole-house renovations. Licensed and insured. Free estimates.'
                ELSE meta_description_en
            END,
            updated_at = now()
        WHERE length(meta_description_en) > 155
          AND name_en IN ('Richmond', 'West Vancouver');

        RAISE NOTICE 'Updated % rows.', affected_count;
    END IF;
END;
$$;
