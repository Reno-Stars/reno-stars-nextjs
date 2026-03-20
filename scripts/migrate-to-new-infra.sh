#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Reno Stars — Full Infrastructure Migration Script
# =============================================================================
#
# Migrates BOTH the database and S3 storage to new infrastructure.
#
# What it does:
#   1. Validates prerequisites and connectivity
#   2. Syncs all S3 objects from old bucket → new bucket
#   3. Dumps old database → restores to new database
#   4. Rewrites all image URLs in the new database
#   5. Verifies everything
#
# Usage:
#   1. Fill in the config below (or export as env vars before running)
#   2. Run: bash scripts/migrate-to-new-infra.sh
#   3. Add --dry-run to preview without making changes
#
# =============================================================================

# ======================== CONFIGURATION ======================================
# Fill in these values OR export them as environment variables before running.
# The script will use env vars if they're already set, otherwise uses defaults.
# =============================================================================

# --- Old Infrastructure (SOURCE) ---
OLD_DB_URL="${OLD_DB_URL:-}"                          # e.g. postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
OLD_S3_ENDPOINT="${OLD_S3_ENDPOINT:-}"                # e.g. https://account-id.r2.cloudflarestorage.com
OLD_S3_BUCKET="${OLD_S3_BUCKET:-reno-stars}"           # e.g. reno-stars
OLD_S3_ACCESS_KEY="${OLD_S3_ACCESS_KEY:-}"
OLD_S3_SECRET_KEY="${OLD_S3_SECRET_KEY:-}"
OLD_S3_PUBLIC_URL="${OLD_S3_PUBLIC_URL:-}"             # e.g. https://pub-xxx.r2.dev

# --- New Infrastructure (DESTINATION) ---
NEW_DB_URL="${NEW_DB_URL:-}"                          # e.g. postgresql://user:pass@company-db.example.com/renostars?sslmode=require
NEW_S3_ENDPOINT="${NEW_S3_ENDPOINT:-}"                # e.g. https://s3.us-east-1.amazonaws.com
NEW_S3_BUCKET="${NEW_S3_BUCKET:-}"                    # e.g. company-reno-stars
NEW_S3_ACCESS_KEY="${NEW_S3_ACCESS_KEY:-}"
NEW_S3_SECRET_KEY="${NEW_S3_SECRET_KEY:-}"
NEW_S3_PUBLIC_URL="${NEW_S3_PUBLIC_URL:-}"             # e.g. https://cdn.company.com  (NO trailing slash)
NEW_S3_REGION="${NEW_S3_REGION:-auto}"                 # e.g. us-east-1

# --- WordPress URL (for rewriting legacy URLs in DB) ---
OLD_WP_ORIGIN="${OLD_WP_ORIGIN:-https://reno-stars.com}"

# =============================================================================
# END CONFIGURATION — Do not edit below unless you know what you're doing
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/.migration-backup/$(date +%Y%m%d_%H%M%S)"
DRY_RUN=false
SKIP_S3=false
SKIP_DB=false

# Parse flags
for arg in "$@"; do
  case $arg in
    --dry-run)   DRY_RUN=true ;;
    --skip-s3)   SKIP_S3=true ;;
    --skip-db)   SKIP_DB=true ;;
    --help|-h)
      echo "Usage: bash scripts/migrate-to-new-infra.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --dry-run    Preview all actions without making changes"
      echo "  --skip-s3    Skip S3 migration (only migrate database)"
      echo "  --skip-db    Skip database migration (only migrate S3)"
      echo "  --help       Show this help message"
      exit 0
      ;;
  esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

log()   { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
err()   { echo -e "${RED}[✗]${NC} $*"; }
info()  { echo -e "${BLUE}[i]${NC} $*"; }
step()  { echo -e "\n${BOLD}${CYAN}═══ $* ═══${NC}\n"; }

# =============================================================================
# STEP 0: Validate Prerequisites
# =============================================================================

step "Step 0: Validating Prerequisites"

MISSING=()

# Check required tools
for cmd in psql pg_dump pg_restore aws; do
  if ! command -v "$cmd" &>/dev/null; then
    MISSING+=("$cmd")
  else
    log "$cmd found: $(command -v "$cmd")"
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  err "Missing required tools: ${MISSING[*]}"
  echo ""
  echo "Install them:"
  echo "  brew install postgresql awscli     # macOS"
  echo "  apt install postgresql-client awscli  # Ubuntu"
  exit 1
fi

# Validate config
validate_config() {
  local errors=0

  if [ "$SKIP_DB" = false ]; then
    if [ -z "$OLD_DB_URL" ]; then err "OLD_DB_URL is not set"; ((errors++)); fi
    if [ -z "$NEW_DB_URL" ]; then err "NEW_DB_URL is not set"; ((errors++)); fi
  fi

  if [ "$SKIP_S3" = false ]; then
    if [ -z "$OLD_S3_ENDPOINT" ];    then err "OLD_S3_ENDPOINT is not set";    ((errors++)); fi
    if [ -z "$OLD_S3_ACCESS_KEY" ];  then err "OLD_S3_ACCESS_KEY is not set";  ((errors++)); fi
    if [ -z "$OLD_S3_SECRET_KEY" ];  then err "OLD_S3_SECRET_KEY is not set";  ((errors++)); fi
    if [ -z "$OLD_S3_PUBLIC_URL" ];  then err "OLD_S3_PUBLIC_URL is not set";  ((errors++)); fi
    if [ -z "$NEW_S3_ENDPOINT" ];    then err "NEW_S3_ENDPOINT is not set";    ((errors++)); fi
    if [ -z "$NEW_S3_BUCKET" ];      then err "NEW_S3_BUCKET is not set";      ((errors++)); fi
    if [ -z "$NEW_S3_ACCESS_KEY" ];  then err "NEW_S3_ACCESS_KEY is not set";  ((errors++)); fi
    if [ -z "$NEW_S3_SECRET_KEY" ];  then err "NEW_S3_SECRET_KEY is not set";  ((errors++)); fi
    if [ -z "$NEW_S3_PUBLIC_URL" ];  then err "NEW_S3_PUBLIC_URL is not set";  ((errors++)); fi
  fi

  if [ $errors -gt 0 ]; then
    echo ""
    err "$errors configuration errors found. Set the variables at the top of this script or export them as env vars."
    exit 1
  fi
}

validate_config
log "All configuration validated"

# Strip trailing slashes from URLs
OLD_S3_PUBLIC_URL="${OLD_S3_PUBLIC_URL%/}"
NEW_S3_PUBLIC_URL="${NEW_S3_PUBLIC_URL%/}"
OLD_WP_ORIGIN="${OLD_WP_ORIGIN%/}"

# Show summary
echo ""
info "Migration Summary:"
echo "  ┌─────────────────────────────────────────────────────"
if [ "$SKIP_DB" = false ]; then
  echo "  │ Database:  OLD → NEW"
  echo "  │   $(echo "$OLD_DB_URL" | sed 's/:[^:@]*@/:***@/')"
  echo "  │   → $(echo "$NEW_DB_URL" | sed 's/:[^:@]*@/:***@/')"
fi
if [ "$SKIP_S3" = false ]; then
  echo "  │ S3:       ${OLD_S3_BUCKET} → ${NEW_S3_BUCKET}"
  echo "  │   ${OLD_S3_ENDPOINT}"
  echo "  │   → ${NEW_S3_ENDPOINT}"
  echo "  │ URLs:     ${OLD_S3_PUBLIC_URL} → ${NEW_S3_PUBLIC_URL}"
  echo "  │ WP URLs:  ${OLD_WP_ORIGIN}/wp-content/uploads/..."
  echo "  │   → ${NEW_S3_PUBLIC_URL}/uploads/..."
fi
echo "  │ Dry run:  $DRY_RUN"
echo "  └─────────────────────────────────────────────────────"

if [ "$DRY_RUN" = true ]; then
  warn "DRY RUN MODE — no changes will be made"
fi

echo ""
read -rp "Continue? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"
log "Backup directory: $BACKUP_DIR"

# =============================================================================
# STEP 1: Sync S3 Objects
# =============================================================================

if [ "$SKIP_S3" = false ]; then
  step "Step 1: Syncing S3 Objects (Old → New)"

  # Configure AWS CLI profiles for old and new S3
  export AWS_CONFIG_FILE="$BACKUP_DIR/aws_config"
  export AWS_SHARED_CREDENTIALS_FILE="$BACKUP_DIR/aws_credentials"

  cat > "$AWS_CONFIG_FILE" <<AWSCFG
[profile old-s3]
region = auto
output = json

[profile new-s3]
region = ${NEW_S3_REGION}
output = json
AWSCFG

  cat > "$AWS_SHARED_CREDENTIALS_FILE" <<AWSCREDS
[old-s3]
aws_access_key_id = ${OLD_S3_ACCESS_KEY}
aws_secret_access_key = ${OLD_S3_SECRET_KEY}

[new-s3]
aws_access_key_id = ${NEW_S3_ACCESS_KEY}
aws_secret_access_key = ${NEW_S3_SECRET_KEY}
AWSCREDS

  chmod 600 "$AWS_SHARED_CREDENTIALS_FILE"

  # 1a. Download all objects from old S3 to local backup
  info "Downloading from old S3 to local backup..."
  LOCAL_S3_BACKUP="$BACKUP_DIR/s3-objects"

  if [ "$DRY_RUN" = true ]; then
    warn "[DRY RUN] Would run: aws s3 sync s3://${OLD_S3_BUCKET} ${LOCAL_S3_BACKUP}"
    aws s3 ls "s3://${OLD_S3_BUCKET}/" \
      --endpoint-url "$OLD_S3_ENDPOINT" \
      --profile old-s3 \
      --recursive \
      --summarize 2>/dev/null || warn "Could not list old S3 bucket"
  else
    aws s3 sync "s3://${OLD_S3_BUCKET}" "$LOCAL_S3_BACKUP" \
      --endpoint-url "$OLD_S3_ENDPOINT" \
      --profile old-s3 \
      --no-progress
    log "Downloaded all objects to $LOCAL_S3_BACKUP"

    # Count files
    FILE_COUNT=$(find "$LOCAL_S3_BACKUP" -type f | wc -l | tr -d ' ')
    TOTAL_SIZE=$(du -sh "$LOCAL_S3_BACKUP" 2>/dev/null | cut -f1)
    log "Downloaded $FILE_COUNT files ($TOTAL_SIZE)"
  fi

  # 1b. Upload all objects to new S3
  info "Uploading to new S3..."

  if [ "$DRY_RUN" = true ]; then
    warn "[DRY RUN] Would run: aws s3 sync ${LOCAL_S3_BACKUP} s3://${NEW_S3_BUCKET}"
  else
    aws s3 sync "$LOCAL_S3_BACKUP" "s3://${NEW_S3_BUCKET}" \
      --endpoint-url "$NEW_S3_ENDPOINT" \
      --profile new-s3 \
      --no-progress
    log "Uploaded all objects to new S3 bucket: ${NEW_S3_BUCKET}"
  fi

  # 1c. Verify object counts match
  if [ "$DRY_RUN" = false ]; then
    info "Verifying S3 object counts..."
    OLD_COUNT=$(aws s3 ls "s3://${OLD_S3_BUCKET}/" \
      --endpoint-url "$OLD_S3_ENDPOINT" \
      --profile old-s3 \
      --recursive 2>/dev/null | wc -l | tr -d ' ')
    NEW_COUNT=$(aws s3 ls "s3://${NEW_S3_BUCKET}/" \
      --endpoint-url "$NEW_S3_ENDPOINT" \
      --profile new-s3 \
      --recursive 2>/dev/null | wc -l | tr -d ' ')

    if [ "$OLD_COUNT" = "$NEW_COUNT" ]; then
      log "S3 verified: $OLD_COUNT objects in old, $NEW_COUNT in new ✓"
    else
      warn "Object count mismatch: old=$OLD_COUNT, new=$NEW_COUNT"
      read -rp "Continue anyway? [y/N] " s3_confirm
      if [[ ! "$s3_confirm" =~ ^[Yy]$ ]]; then exit 1; fi
    fi
  fi

  # Cleanup temp AWS config
  rm -f "$AWS_CONFIG_FILE" "$AWS_SHARED_CREDENTIALS_FILE"
  unset AWS_CONFIG_FILE AWS_SHARED_CREDENTIALS_FILE

  log "S3 migration complete"
else
  info "Skipping S3 migration (--skip-s3)"
fi

# =============================================================================
# STEP 2: Database Dump & Restore
# =============================================================================

if [ "$SKIP_DB" = false ]; then
  step "Step 2: Database Dump & Restore"

  DB_DUMP_FILE="$BACKUP_DIR/database.dump"

  # 2a. Dump old database
  info "Dumping old database..."

  if [ "$DRY_RUN" = true ]; then
    warn "[DRY RUN] Would run: pg_dump → $DB_DUMP_FILE"
  else
    pg_dump "$OLD_DB_URL" \
      --no-owner \
      --no-acl \
      --no-comments \
      --format=custom \
      --file="$DB_DUMP_FILE"

    DUMP_SIZE=$(du -sh "$DB_DUMP_FILE" | cut -f1)
    log "Database dumped: $DB_DUMP_FILE ($DUMP_SIZE)"
  fi

  # 2b. Check if new database has existing tables
  if [ "$DRY_RUN" = false ]; then
    info "Checking new database..."
    EXISTING_TABLES=$(psql "$NEW_DB_URL" -t -c \
      "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

    if [ "$EXISTING_TABLES" -gt 0 ] 2>/dev/null; then
      warn "New database already has $EXISTING_TABLES tables!"
      read -rp "Drop all existing tables and restore? This is DESTRUCTIVE. [y/N] " drop_confirm
      if [[ ! "$drop_confirm" =~ ^[Yy]$ ]]; then
        err "Aborted. Clean the new database manually or use a fresh database."
        exit 1
      fi

      info "Dropping existing tables, types, and enums in new database..."
      psql "$NEW_DB_URL" -c "
        DO \$\$
        DECLARE r RECORD;
        BEGIN
          -- Drop all tables
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
          -- Drop all custom types/enums
          FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public' AND t.typtype = 'e') LOOP
            EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
          END LOOP;
        END\$\$;
      " 2>/dev/null
      log "Existing tables dropped"
    fi
  fi

  # 2c. Restore to new database
  info "Restoring database to new server..."

  if [ "$DRY_RUN" = true ]; then
    warn "[DRY RUN] Would run: pg_restore → new database"
  else
    pg_restore "$DB_DUMP_FILE" \
      --dbname="$NEW_DB_URL" \
      --no-owner \
      --no-acl \
      --single-transaction \
      --exit-on-error 2>&1 || {
        err "pg_restore failed. Check the error above."
        err "The new database may be in a partial state. You can re-run this script."
        exit 1
      }
    log "Database restored successfully"
  fi

  # 2d. Verify row counts
  if [ "$DRY_RUN" = false ]; then
    info "Verifying row counts..."

    TABLES=(
      services service_tags service_areas
      project_sites site_image_pairs site_external_products
      projects project_image_pairs project_scopes project_external_products
      blog_posts designs testimonials
      company_info showroom_info about_sections
      trust_badges faqs social_links partners
      contact_submissions batch_upload_jobs social_media_posts
    )

    VERIFY_SQL=""
    for t in "${TABLES[@]}"; do
      VERIFY_SQL+="SELECT '$t' AS tbl, count(*) AS cnt FROM $t UNION ALL "
    done
    # Remove trailing UNION ALL
    VERIFY_SQL="${VERIFY_SQL% UNION ALL }"
    VERIFY_SQL+=" ORDER BY tbl;"

    echo ""
    echo "  Table row counts (new database):"
    echo "  ─────────────────────────────────"
    psql "$NEW_DB_URL" -t -c "$VERIFY_SQL" 2>/dev/null | while read -r line; do
      if [ -n "$line" ]; then
        echo "  $line"
      fi
    done
    echo ""
    log "Database restore verified"
  fi
else
  info "Skipping database migration (--skip-db)"
fi

# =============================================================================
# STEP 3: Rewrite Image URLs in New Database
# =============================================================================

if [ "$SKIP_DB" = false ]; then
  step "Step 3: Rewriting Image URLs in New Database"

  # Two URL patterns to rewrite:
  #   1. WordPress:  https://reno-stars.com/wp-content/uploads/X  →  NEW_S3_PUBLIC_URL/uploads/X
  #   2. Old R2 CDN: https://pub-xxx.r2.dev/X                    →  NEW_S3_PUBLIC_URL/X
  #
  # Relative paths like /logo.jpg are left alone (handled by getAssetUrl() at runtime).

  WP_UPLOADS_PREFIX="${OLD_WP_ORIGIN}/wp-content/uploads/"
  NEW_UPLOADS_PREFIX="${NEW_S3_PUBLIC_URL}/uploads/"

  # Build the SQL for URL rewriting
  URL_REWRITE_SQL=$(cat <<EOSQL
-- =============================================================================
-- URL Rewriting: WordPress URLs + Old S3 Public URLs → New S3 Public URLs
-- =============================================================================

BEGIN;

-- ---- Helper: show what we're replacing ----
DO \$\$
BEGIN
  RAISE NOTICE 'Replacing WordPress URLs: ${WP_UPLOADS_PREFIX} → ${NEW_UPLOADS_PREFIX}';
  RAISE NOTICE 'Replacing S3 URLs: ${OLD_S3_PUBLIC_URL}/ → ${NEW_S3_PUBLIC_URL}/';
END\$\$;

-- ============================================================================
-- SIMPLE VARCHAR COLUMNS — WordPress URL pattern
-- ============================================================================

-- services
UPDATE services SET image_url = REPLACE(image_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE image_url LIKE '${WP_UPLOADS_PREFIX}%';
UPDATE services SET icon_url = REPLACE(icon_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE icon_url LIKE '${WP_UPLOADS_PREFIX}%';

-- project_sites
UPDATE project_sites SET hero_image_url = REPLACE(hero_image_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE hero_image_url LIKE '${WP_UPLOADS_PREFIX}%';

-- site_image_pairs
UPDATE site_image_pairs SET before_image_url = REPLACE(before_image_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE before_image_url LIKE '${WP_UPLOADS_PREFIX}%';
UPDATE site_image_pairs SET after_image_url = REPLACE(after_image_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE after_image_url LIKE '${WP_UPLOADS_PREFIX}%';

-- site_external_products
UPDATE site_external_products SET image_url = REPLACE(image_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE image_url LIKE '${WP_UPLOADS_PREFIX}%';

-- projects
UPDATE projects SET hero_image_url = REPLACE(hero_image_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE hero_image_url LIKE '${WP_UPLOADS_PREFIX}%';

-- project_image_pairs
UPDATE project_image_pairs SET before_image_url = REPLACE(before_image_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE before_image_url LIKE '${WP_UPLOADS_PREFIX}%';
UPDATE project_image_pairs SET after_image_url = REPLACE(after_image_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE after_image_url LIKE '${WP_UPLOADS_PREFIX}%';

-- project_external_products
UPDATE project_external_products SET image_url = REPLACE(image_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE image_url LIKE '${WP_UPLOADS_PREFIX}%';

-- blog_posts
UPDATE blog_posts SET featured_image_url = REPLACE(featured_image_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE featured_image_url LIKE '${WP_UPLOADS_PREFIX}%';

-- company_info
UPDATE company_info SET logo_url = REPLACE(logo_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE logo_url LIKE '${WP_UPLOADS_PREFIX}%';
UPDATE company_info SET hero_video_url = REPLACE(hero_video_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE hero_video_url LIKE '${WP_UPLOADS_PREFIX}%';
UPDATE company_info SET hero_image_url = REPLACE(hero_image_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE hero_image_url LIKE '${WP_UPLOADS_PREFIX}%';

-- designs
UPDATE designs SET image_url = REPLACE(image_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE image_url LIKE '${WP_UPLOADS_PREFIX}%';

-- testimonials
UPDATE testimonials SET image_url = REPLACE(image_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE image_url LIKE '${WP_UPLOADS_PREFIX}%';

-- partners
UPDATE partners SET logo_url = REPLACE(logo_url, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE logo_url LIKE '${WP_UPLOADS_PREFIX}%';


-- ============================================================================
-- SIMPLE VARCHAR COLUMNS — Old S3 Public URL pattern
-- ============================================================================

-- services
UPDATE services SET image_url = REPLACE(image_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE image_url LIKE '${OLD_S3_PUBLIC_URL}/%';
UPDATE services SET icon_url = REPLACE(icon_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE icon_url LIKE '${OLD_S3_PUBLIC_URL}/%';

-- project_sites
UPDATE project_sites SET hero_image_url = REPLACE(hero_image_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE hero_image_url LIKE '${OLD_S3_PUBLIC_URL}/%';

-- site_image_pairs
UPDATE site_image_pairs SET before_image_url = REPLACE(before_image_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE before_image_url LIKE '${OLD_S3_PUBLIC_URL}/%';
UPDATE site_image_pairs SET after_image_url = REPLACE(after_image_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE after_image_url LIKE '${OLD_S3_PUBLIC_URL}/%';

-- site_external_products
UPDATE site_external_products SET image_url = REPLACE(image_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE image_url LIKE '${OLD_S3_PUBLIC_URL}/%';

-- projects
UPDATE projects SET hero_image_url = REPLACE(hero_image_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE hero_image_url LIKE '${OLD_S3_PUBLIC_URL}/%';

-- project_image_pairs
UPDATE project_image_pairs SET before_image_url = REPLACE(before_image_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE before_image_url LIKE '${OLD_S3_PUBLIC_URL}/%';
UPDATE project_image_pairs SET after_image_url = REPLACE(after_image_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE after_image_url LIKE '${OLD_S3_PUBLIC_URL}/%';

-- project_external_products
UPDATE project_external_products SET image_url = REPLACE(image_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE image_url LIKE '${OLD_S3_PUBLIC_URL}/%';

-- blog_posts
UPDATE blog_posts SET featured_image_url = REPLACE(featured_image_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE featured_image_url LIKE '${OLD_S3_PUBLIC_URL}/%';

-- company_info
UPDATE company_info SET logo_url = REPLACE(logo_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE logo_url LIKE '${OLD_S3_PUBLIC_URL}/%';
UPDATE company_info SET hero_video_url = REPLACE(hero_video_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE hero_video_url LIKE '${OLD_S3_PUBLIC_URL}/%';
UPDATE company_info SET hero_image_url = REPLACE(hero_image_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE hero_image_url LIKE '${OLD_S3_PUBLIC_URL}/%';

-- designs
UPDATE designs SET image_url = REPLACE(image_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE image_url LIKE '${OLD_S3_PUBLIC_URL}/%';

-- testimonials
UPDATE testimonials SET image_url = REPLACE(image_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE image_url LIKE '${OLD_S3_PUBLIC_URL}/%';

-- partners
UPDATE partners SET logo_url = REPLACE(logo_url, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE logo_url LIKE '${OLD_S3_PUBLIC_URL}/%';


-- ============================================================================
-- JSONB ARRAY COLUMN — social_media_posts.selected_image_urls
-- ============================================================================
-- This column stores a JSON array of URL strings: ["url1", "url2", ...]
-- We need to iterate each element and apply the same replacements.

-- WordPress URLs in JSONB arrays
UPDATE social_media_posts
SET selected_image_urls = (
  SELECT jsonb_agg(
    CASE
      WHEN elem::text LIKE '"${WP_UPLOADS_PREFIX}%'
        THEN to_jsonb(REPLACE(elem::text, '"${WP_UPLOADS_PREFIX}', '"${NEW_UPLOADS_PREFIX}'))::jsonb
      ELSE elem
    END
  )
  FROM jsonb_array_elements(selected_image_urls) AS elem
)
WHERE selected_image_urls IS NOT NULL
  AND selected_image_urls::text LIKE '%${WP_UPLOADS_PREFIX}%';

-- Old S3 URLs in JSONB arrays
UPDATE social_media_posts
SET selected_image_urls = (
  SELECT jsonb_agg(
    CASE
      WHEN elem::text LIKE '"${OLD_S3_PUBLIC_URL}/%'
        THEN to_jsonb(REPLACE(elem::text, '"${OLD_S3_PUBLIC_URL}/', '"${NEW_S3_PUBLIC_URL}/'))::jsonb
      ELSE elem
    END
  )
  FROM jsonb_array_elements(selected_image_urls) AS elem
)
WHERE selected_image_urls IS NOT NULL
  AND selected_image_urls::text LIKE '%${OLD_S3_PUBLIC_URL}/%';


-- ============================================================================
-- HTML CONTENT — blog_posts.content_en / content_zh
-- These may contain <img src="..."> with embedded asset URLs.
-- ============================================================================

-- WordPress URLs in blog HTML content
UPDATE blog_posts SET content_en = REPLACE(content_en, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE content_en LIKE '%${WP_UPLOADS_PREFIX}%';
UPDATE blog_posts SET content_zh = REPLACE(content_zh, '${WP_UPLOADS_PREFIX}', '${NEW_UPLOADS_PREFIX}')
  WHERE content_zh LIKE '%${WP_UPLOADS_PREFIX}%';

-- Old S3 URLs in blog HTML content
UPDATE blog_posts SET content_en = REPLACE(content_en, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE content_en LIKE '%${OLD_S3_PUBLIC_URL}/%';
UPDATE blog_posts SET content_zh = REPLACE(content_zh, '${OLD_S3_PUBLIC_URL}/', '${NEW_S3_PUBLIC_URL}/')
  WHERE content_zh LIKE '%${OLD_S3_PUBLIC_URL}/%';

-- Full WordPress origin in blog HTML content (for absolute <img src="https://reno-stars.com/wp-content/...">)
UPDATE blog_posts SET content_en = REPLACE(content_en, '${OLD_WP_ORIGIN}/wp-content/uploads/', '${NEW_UPLOADS_PREFIX}')
  WHERE content_en LIKE '%${OLD_WP_ORIGIN}/wp-content/uploads/%';
UPDATE blog_posts SET content_zh = REPLACE(content_zh, '${OLD_WP_ORIGIN}/wp-content/uploads/', '${NEW_UPLOADS_PREFIX}')
  WHERE content_zh LIKE '%${OLD_WP_ORIGIN}/wp-content/uploads/%';

COMMIT;
EOSQL
)

  # Save SQL to file for audit trail
  SQL_FILE="$BACKUP_DIR/url_rewrite.sql"
  echo "$URL_REWRITE_SQL" > "$SQL_FILE"
  log "URL rewrite SQL saved to: $SQL_FILE"

  if [ "$DRY_RUN" = true ]; then
    warn "[DRY RUN] Would execute URL rewrite SQL against new database"
    info "Preview the SQL at: $SQL_FILE"

    # Show a dry-run preview of what would change
    info "Previewing affected rows (read-only)..."
    PREVIEW_SQL=$(cat <<EOSQL2
SELECT 'WordPress URLs' AS pattern, count(*) AS affected_rows FROM (
  SELECT 1 FROM services WHERE image_url LIKE '${WP_UPLOADS_PREFIX}%' OR icon_url LIKE '${WP_UPLOADS_PREFIX}%'
  UNION ALL SELECT 1 FROM project_sites WHERE hero_image_url LIKE '${WP_UPLOADS_PREFIX}%'
  UNION ALL SELECT 1 FROM site_image_pairs WHERE before_image_url LIKE '${WP_UPLOADS_PREFIX}%' OR after_image_url LIKE '${WP_UPLOADS_PREFIX}%'
  UNION ALL SELECT 1 FROM projects WHERE hero_image_url LIKE '${WP_UPLOADS_PREFIX}%'
  UNION ALL SELECT 1 FROM project_image_pairs WHERE before_image_url LIKE '${WP_UPLOADS_PREFIX}%' OR after_image_url LIKE '${WP_UPLOADS_PREFIX}%'
  UNION ALL SELECT 1 FROM blog_posts WHERE featured_image_url LIKE '${WP_UPLOADS_PREFIX}%'
  UNION ALL SELECT 1 FROM company_info WHERE logo_url LIKE '${WP_UPLOADS_PREFIX}%' OR hero_video_url LIKE '${WP_UPLOADS_PREFIX}%' OR hero_image_url LIKE '${WP_UPLOADS_PREFIX}%'
  UNION ALL SELECT 1 FROM designs WHERE image_url LIKE '${WP_UPLOADS_PREFIX}%'
  UNION ALL SELECT 1 FROM partners WHERE logo_url LIKE '${WP_UPLOADS_PREFIX}%'
  UNION ALL SELECT 1 FROM blog_posts WHERE content_en LIKE '%${WP_UPLOADS_PREFIX}%' OR content_zh LIKE '%${WP_UPLOADS_PREFIX}%'
) t
UNION ALL
SELECT 'Old S3 URLs', count(*) FROM (
  SELECT 1 FROM services WHERE image_url LIKE '${OLD_S3_PUBLIC_URL}/%' OR icon_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 1 FROM project_sites WHERE hero_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 1 FROM site_image_pairs WHERE before_image_url LIKE '${OLD_S3_PUBLIC_URL}/%' OR after_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 1 FROM projects WHERE hero_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 1 FROM project_image_pairs WHERE before_image_url LIKE '${OLD_S3_PUBLIC_URL}/%' OR after_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 1 FROM blog_posts WHERE featured_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 1 FROM company_info WHERE logo_url LIKE '${OLD_S3_PUBLIC_URL}/%' OR hero_video_url LIKE '${OLD_S3_PUBLIC_URL}/%' OR hero_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 1 FROM designs WHERE image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 1 FROM partners WHERE logo_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 1 FROM blog_posts WHERE content_en LIKE '%${OLD_S3_PUBLIC_URL}/%' OR content_zh LIKE '%${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 1 FROM social_media_posts WHERE selected_image_urls::text LIKE '%${OLD_S3_PUBLIC_URL}/%'
) t;
EOSQL2
)
    # In dry-run, preview against OLD database (since new doesn't exist yet)
    psql "$OLD_DB_URL" -c "$PREVIEW_SQL" 2>/dev/null || warn "Could not preview (old DB may not be accessible)"

  else
    info "Executing URL rewrite SQL..."
    psql "$NEW_DB_URL" -f "$SQL_FILE" 2>&1
    log "URL rewriting complete"
  fi

  # ==========================================================================
  # STEP 4: Verify No Old URLs Remain
  # ==========================================================================

  step "Step 4: Verifying No Old URLs Remain"

  if [ "$DRY_RUN" = true ]; then
    warn "[DRY RUN] Would verify against new database"
  else
    STALE_CHECK_SQL=$(cat <<EOSQL3
-- Check for any remaining old URLs in varchar columns
SELECT 'STALE URL FOUND' AS status, table_name, column_name, url_value
FROM (
  SELECT 'services' AS table_name, 'image_url' AS column_name, image_url AS url_value FROM services WHERE image_url LIKE '${WP_UPLOADS_PREFIX}%' OR image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'services', 'icon_url', icon_url FROM services WHERE icon_url LIKE '${WP_UPLOADS_PREFIX}%' OR icon_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'project_sites', 'hero_image_url', hero_image_url FROM project_sites WHERE hero_image_url LIKE '${WP_UPLOADS_PREFIX}%' OR hero_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'site_image_pairs', 'before_image_url', before_image_url FROM site_image_pairs WHERE before_image_url LIKE '${WP_UPLOADS_PREFIX}%' OR before_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'site_image_pairs', 'after_image_url', after_image_url FROM site_image_pairs WHERE after_image_url LIKE '${WP_UPLOADS_PREFIX}%' OR after_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'site_external_products', 'image_url', image_url FROM site_external_products WHERE image_url LIKE '${WP_UPLOADS_PREFIX}%' OR image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'projects', 'hero_image_url', hero_image_url FROM projects WHERE hero_image_url LIKE '${WP_UPLOADS_PREFIX}%' OR hero_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'project_image_pairs', 'before_image_url', before_image_url FROM project_image_pairs WHERE before_image_url LIKE '${WP_UPLOADS_PREFIX}%' OR before_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'project_image_pairs', 'after_image_url', after_image_url FROM project_image_pairs WHERE after_image_url LIKE '${WP_UPLOADS_PREFIX}%' OR after_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'project_external_products', 'image_url', image_url FROM project_external_products WHERE image_url LIKE '${WP_UPLOADS_PREFIX}%' OR image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'blog_posts', 'featured_image_url', featured_image_url FROM blog_posts WHERE featured_image_url LIKE '${WP_UPLOADS_PREFIX}%' OR featured_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'company_info', 'logo_url', logo_url FROM company_info WHERE logo_url LIKE '${WP_UPLOADS_PREFIX}%' OR logo_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'company_info', 'hero_video_url', hero_video_url FROM company_info WHERE hero_video_url LIKE '${WP_UPLOADS_PREFIX}%' OR hero_video_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'company_info', 'hero_image_url', hero_image_url FROM company_info WHERE hero_image_url LIKE '${WP_UPLOADS_PREFIX}%' OR hero_image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'designs', 'image_url', image_url FROM designs WHERE image_url LIKE '${WP_UPLOADS_PREFIX}%' OR image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'testimonials', 'image_url', image_url FROM testimonials WHERE image_url LIKE '${WP_UPLOADS_PREFIX}%' OR image_url LIKE '${OLD_S3_PUBLIC_URL}/%'
  UNION ALL SELECT 'partners', 'logo_url', logo_url FROM partners WHERE logo_url LIKE '${WP_UPLOADS_PREFIX}%' OR logo_url LIKE '${OLD_S3_PUBLIC_URL}/%'
) stale_urls
LIMIT 20;
EOSQL3
)

    STALE_RESULTS=$(psql "$NEW_DB_URL" -t -c "$STALE_CHECK_SQL" 2>/dev/null)
    if [ -z "$STALE_RESULTS" ] || [ "$(echo "$STALE_RESULTS" | grep -c 'STALE')" -eq 0 ]; then
      log "No stale old URLs found in the new database ✓"
    else
      warn "Found stale URLs that were not rewritten:"
      echo "$STALE_RESULTS"
    fi

    # Sample some rewritten URLs to eyeball
    info "Sample rewritten URLs from new database:"
    psql "$NEW_DB_URL" -c "
      SELECT 'services.image_url' AS source, image_url FROM services WHERE image_url IS NOT NULL LIMIT 2
      UNION ALL
      SELECT 'projects.hero_image_url', hero_image_url FROM projects WHERE hero_image_url IS NOT NULL LIMIT 2
      UNION ALL
      SELECT 'designs.image_url', image_url FROM designs WHERE image_url IS NOT NULL LIMIT 2
      UNION ALL
      SELECT 'blog_posts.featured_image_url', featured_image_url FROM blog_posts WHERE featured_image_url IS NOT NULL LIMIT 2
      UNION ALL
      SELECT 'company_info.hero_video_url', hero_video_url FROM company_info WHERE hero_video_url IS NOT NULL LIMIT 1;
    " 2>/dev/null
  fi
fi

# =============================================================================
# STEP 5: Summary & Next Steps
# =============================================================================

step "Step 5: Migration Complete!"

if [ "$DRY_RUN" = true ]; then
  warn "This was a DRY RUN. No changes were made."
  info "Re-run without --dry-run to execute the migration."
else
  log "All data migrated successfully"
  log "Backup saved to: $BACKUP_DIR"
  echo ""
  info "Next steps:"
  echo ""
  echo "  1. Update your Vercel/deployment environment variables:"
  echo "     ┌──────────────────────────────────────────────────"
  echo "     │ DATABASE_URL=${NEW_DB_URL}"
  echo "     │ S3_ENDPOINT=${NEW_S3_ENDPOINT}"
  echo "     │ S3_BUCKET=${NEW_S3_BUCKET}"
  echo "     │ S3_ACCESS_KEY=${NEW_S3_ACCESS_KEY}"
  echo "     │ S3_SECRET_KEY=***"
  echo "     │ S3_PUBLIC_URL=${NEW_S3_PUBLIC_URL}"
  echo "     │ NEXT_PUBLIC_STORAGE_PROVIDER=${NEW_S3_PUBLIC_URL}"
  echo "     └──────────────────────────────────────────────────"
  echo ""
  echo "  2. Update lib/storage.ts if your domain changes:"
  echo "     export const PROD_ORIGIN = 'https://your-new-domain.com';"
  echo ""
  echo "  3. Test locally by pointing .env.local to the new infra:"
  echo "     pnpm dev"
  echo ""
  echo "  4. Deploy to Vercel and verify all images load correctly."
  echo ""
  echo "  5. Keep the old S3 bucket and database alive for at least"
  echo "     2 weeks as a rollback safety net."
  echo ""
fi
