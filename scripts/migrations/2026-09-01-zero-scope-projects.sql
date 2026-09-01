/**
 * Migration: Add project_scopes for zero-scope projects
 * Run: pnpm db:query -f scripts/migrations/2026-09-01-zero-scope-projects.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-09-01-zero-scope-projects.sql
 *
 * Context: 13 of 58 published projects have zero project_scopes rows.
 * Scope items describe the WORK PERFORMED on each project (e.g. "All Wall Tile",
 * "Countertop Replacement") — these are real completed projects with photos and
 * project descriptions, but no scope rows exist in the DB.
 *
 * Business input is required to determine what scopes were performed.
 * This migration is a placeholder that captures the known slug-to-title mapping
 * so the work is tracked and no duplicate effort occurs.
 *
 * Pending: business/PM to fill in scope_en / scope_zh for each project.
 */

-- 13 published projects with zero project_scopes
-- These are real completed projects; only the scope rows are missing.

-- 1. north-vancouver-bathroom-renovation-herringbone-tile
--    title_en: "Bathroom Renovation with Black Herringbone Tile in North Vancouver"
-- TODO: scope_en, scope_zh

-- 2. richmond-condo-flooring-renovation
--    title_en: "Condo Flooring Replacement in Richmond"
-- TODO: scope_en, scope_zh

-- 3. dental-clinic-renovation-burnaby
--    title_en: "Dental Clinic Renovation in Burnaby"
-- TODO: scope_en, scope_zh

-- 4. ensuite-bathroom-renovation-richmond
--    title_en: "Ensuite Bathroom Renovation with Walk-In Shower in Richmond"
-- TODO: scope_en, scope_zh

-- 5. hallway-bathroom-renovation-richmond
--    title_en: "Hallway Bathroom Renovation in Richmond"
-- TODO: scope_en, scope_zh

-- 6. richmond-house-renovation-kitchen-bathrooms-flooring
--    title_en: "House Renovation with Kitchen, Bathrooms and Flooring in Richmond"
-- TODO: scope_en, scope_zh

-- 7. vancouver-house-renovation-kitchen-and-bathrooms
--    title_en: "House Renovation with Kitchen, Bathrooms and New Flooring in Vancouver"
-- TODO: scope_en, scope_zh

-- 8. coquitlam-kitchen-renovation-quartz-island
--    title_en: "Kitchen Renovation with Waterfall Quartz Island in Coquitlam"
-- TODO: scope_en, scope_zh

-- 9. powder-room-renovation-richmond
--    title_en: "Powder Room Renovation in Richmond"
-- TODO: scope_en, scope_zh

-- 10. returning-customer-kitchen-renovation-richmond-white-shaker
--     title_en: "Returning Customer Kitchen Renovation in Richmond — White Shaker + Quartz"
-- TODO: scope_en, scope_zh

-- 11. vancouver-wfh-glass-partition-office-conversion
--     title_en: "WFH Office Conversion with Black-Frame Glass Partition"
-- TODO: scope_en, scope_zh

-- 12. richmond-whole-home-renovation-marble-kitchen
--     title_en: "Whole Home Renovation with Marble-Look Kitchen in Richmond"
-- TODO: scope_en, scope_zh

-- 13. delta-kitchen-renovation-apron-sink-quartz
--     title_en: "Whole House Renovation with Kitchen and Two Bathrooms in Delta"
-- TODO: scope_en, scope_zh
