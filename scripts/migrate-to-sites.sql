-- Migration: Add project_sites table and project_external_products table
-- Run this against your production Neon database before deploying
--
-- Usage:
--   1. Connect to your Neon database using psql or the Neon console SQL editor
--   2. Run this entire script
--   3. Redeploy on Vercel
--
-- This migration:
--   - Creates the project_sites table
--   - Creates the project_external_products table
--   - Adds site_id column to projects (with a default site for existing projects)

-- ============================================================================
-- STEP 1: Create project_sites table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "project_sites" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "slug" varchar(100) NOT NULL,
    "title_en" varchar(200) NOT NULL,
    "title_zh" varchar(200) NOT NULL,
    "description_en" text NOT NULL,
    "description_zh" text NOT NULL,
    "location_city" varchar(100),
    "hero_image_url" varchar(500),
    "badge_en" varchar(50),
    "badge_zh" varchar(50),
    "show_as_project" boolean DEFAULT true NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    "is_published" boolean DEFAULT true NOT NULL,
    "published_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "project_sites_slug_unique" UNIQUE("slug")
);

-- Create indexes for project_sites
CREATE UNIQUE INDEX IF NOT EXISTS "project_sites_slug_idx" ON "project_sites" USING btree ("slug");
CREATE INDEX IF NOT EXISTS "project_sites_show_as_project_idx" ON "project_sites" USING btree ("show_as_project");
CREATE INDEX IF NOT EXISTS "project_sites_featured_idx" ON "project_sites" USING btree ("featured");

-- ============================================================================
-- STEP 2: Create project_external_products table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "project_external_products" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "project_id" uuid NOT NULL,
    "url" varchar(500) NOT NULL,
    "image_url" varchar(500),
    "label_en" varchar(200) NOT NULL,
    "label_zh" varchar(200) NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create index for project_external_products
CREATE INDEX IF NOT EXISTS "project_external_products_project_id_idx" ON "project_external_products" USING btree ("project_id");

-- Add foreign key for project_external_products
DO $$ BEGIN
    ALTER TABLE "project_external_products" ADD CONSTRAINT "project_external_products_project_id_projects_id_fk"
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- STEP 3: Add site_id to projects table
-- ============================================================================

-- Add columns if they don't exist
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "site_id" uuid;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "display_order_in_site" integer DEFAULT 0 NOT NULL;

-- Create a default site for migration (hidden from public)
INSERT INTO "project_sites" ("id", "slug", "title_en", "title_zh", "description_en", "description_zh", "show_as_project", "is_published")
SELECT
    gen_random_uuid(),
    'default-migration-site',
    'Default Migration Site',
    '默认迁移站点',
    'Default site created during migration for existing projects',
    '迁移期间为现有项目创建的默认站点',
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM "project_sites" WHERE "slug" = 'default-migration-site');

-- Update existing projects to use the default site
UPDATE "projects"
SET "site_id" = (SELECT "id" FROM "project_sites" WHERE "slug" = 'default-migration-site' LIMIT 1)
WHERE "site_id" IS NULL;

-- Make site_id NOT NULL after all projects have a site
ALTER TABLE "projects" ALTER COLUMN "site_id" SET NOT NULL;

-- Create index for site_id
CREATE INDEX IF NOT EXISTS "projects_site_id_idx" ON "projects" USING btree ("site_id");

-- Add foreign key for projects.site_id
DO $$ BEGIN
    ALTER TABLE "projects" ADD CONSTRAINT "projects_site_id_project_sites_id_fk"
    FOREIGN KEY ("site_id") REFERENCES "public"."project_sites"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- DONE!
-- ============================================================================
-- After running this script:
-- 1. Re-trigger the Vercel deployment
-- 2. Existing projects will be under the hidden "default-migration-site"
-- 3. Create proper sites in the admin panel and reassign projects as needed
