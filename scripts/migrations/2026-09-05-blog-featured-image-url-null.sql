-- Migrate featured_image_url for 8 blog posts that have NULL.
-- NOT APPLIED — needs human to run against the production database.
-- Idempotent WHERE guards ensure this can be re-run safely.

BEGIN;

UPDATE blog_posts SET
  featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND featured_image_url IS NULL;

UPDATE blog_posts SET
  featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '4915068e-8851-46f7-bfdf-628a4603d3fe'
  AND featured_image_url IS NULL;

UPDATE blog_posts SET
  featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = 'e6257f9d-a6fe-43ce-b06f-3a7b4304877b'
  AND featured_image_url IS NULL;

UPDATE blog_posts SET
  featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '2311bd71-d249-4143-8d7f-6dfb439c413c'
  AND featured_image_url IS NULL;

UPDATE blog_posts SET
  featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '48e499c1-38a7-4d00-bf54-b1cdd4568506'
  AND featured_image_url IS NULL;

UPDATE blog_posts SET
  featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '17e69f50-74b9-469e-8b87-11d3a4ed74ef'
  AND featured_image_url IS NULL;

UPDATE blog_posts SET
  featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = 'ebafaebf-3060-4dea-8dc3-508be25d95d6'
  AND featured_image_url IS NULL;

UPDATE blog_posts SET
  featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '094434be-7021-470b-a0c5-13fc680bd92d'
  AND featured_image_url IS NULL;

UPDATE blog_posts SET
  featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND featured_image_url IS NULL;

COMMIT;
