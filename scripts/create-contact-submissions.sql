-- Migration: contact_submissions — durable store for contact-form leads
--   pnpm db:query -f scripts/create-contact-submissions.sql
--
-- DDL, so it lives in scripts/ next to create-admin-credentials.sql rather than
-- in scripts/migrations/. That directory is AUTO-APPLIED and is for guarded data
-- UPDATEs only; tests/unit/migrations-are-safe.test.ts rejects CREATE/ALTER/DROP
-- there on purpose, so that nothing unattended can reshape the schema.
--
-- APPLIED to production 2026-09-03.
--
-- Between 2026-08-14 and 2026-09-03 the contact form accepted 7 submissions
-- (GA4 generate_lead) and delivered NONE. The deployment carried no
-- RESEND_API_KEY and no ODOO_* vars, so email returned false, the Odoo call
-- threw, the dead-letter's Telegram alert no-opped for want of a token, and the
-- action still returned success. The enquiries existed only as JSON lines in
-- pod stderr; pods are replaced constantly, and six were unrecoverable.
--
-- Delivery is best-effort by nature — Resend can be down, Odoo can be down, a
-- key can go missing. Durability must not be. The submission is now written
-- here BEFORE any delivery is attempted, on the one dependency the request
-- already has (DATABASE_URL is what renders the page), and the delivery outcome
-- is recorded against the row afterwards.
--
-- Idempotent: IF NOT EXISTS, so re-running is safe.

CREATE TABLE IF NOT EXISTS "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(320),
	"phone" varchar(50),
	"message" text NOT NULL,
	"city" varchar(120),
	"property_type" varchar(60),
	"delivered_crm" boolean DEFAULT false NOT NULL,
	"delivered_email" boolean DEFAULT false NOT NULL,
	"delivery_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");
