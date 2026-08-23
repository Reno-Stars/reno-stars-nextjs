-- Migration: blog_posts meta_title_en + meta_description_en — kitchen renovation cost guide
-- Target: id fbfe62bc, slug: how-much-does-kitchen-renovation-cost-vancouver-2026
-- Content verified genuine English (full article body read this run)
-- NOT APPLIED — needs human to run after PR merge

UPDATE blog_posts
SET
  meta_title_en       = 'How Much Does a Kitchen Renovation Cost in Vancouver (2026)',
  meta_description_en = 'A typical full kitchen renovation in Metro Vancouver costs $30,000 to $72,000+. This guide covers all cost factors, price tiers, and budgeting tips for 2026.'
WHERE id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND (meta_title_en IS NULL OR meta_description_en IS NULL);
