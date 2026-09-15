-- Migration: service_areas — fix meta_description_en length violations
-- Date: 2026-09-15
-- Status: NOT APPLIED — needs human to run against live database
-- Finding: 2 rows with meta_description_en exceeding 155-char varchar limit
-- Source: DB query — services 11, service_areas 14, project_scopes 321,
--          projects 58 published, blog_posts 270 published
-- Idempotent: WHERE id IN (...) with exact IDs, safe to re-run

-- richmond: 163 chars → trim to 155
UPDATE service_areas
SET meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Visit our showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty. Free quote.'
WHERE id = '3c5aa447-404e-4fdd-8cf9-dc4759885c1c'
  AND LENGTH(meta_description_en) > 155;

-- west-vancouver: 157 chars → trim to 155
UPDATE service_areas
SET meta_description_en = 'Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-house builds. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.'
WHERE id = 'e375930b-2520-4b2d-a42b-d69336f1be30'
  AND LENGTH(meta_description_en) > 155;
