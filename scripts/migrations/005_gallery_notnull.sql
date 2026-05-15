-- Make alt_uk and title_uk required in gallery_items (main locale drives SEO).
-- Fill any remaining NULLs with empty string first so constraint doesn't fail.
UPDATE gallery_items SET alt_uk   = '' WHERE alt_uk   IS NULL;
UPDATE gallery_items SET title_uk = '' WHERE title_uk IS NULL;
UPDATE gallery_items SET alt_ru   = '' WHERE alt_ru   IS NULL;
UPDATE gallery_items SET title_ru = '' WHERE title_ru IS NULL;
UPDATE gallery_items SET alt_en   = '' WHERE alt_en   IS NULL;
UPDATE gallery_items SET title_en = '' WHERE title_en IS NULL;

ALTER TABLE gallery_items
  ALTER COLUMN alt_uk   SET NOT NULL,
  ALTER COLUMN title_uk SET NOT NULL,
  ALTER COLUMN alt_ru   SET NOT NULL,
  ALTER COLUMN title_ru SET NOT NULL,
  ALTER COLUMN alt_en   SET NOT NULL,
  ALTER COLUMN title_en SET NOT NULL;

-- Same for hero_slides alt columns
UPDATE hero_slides SET alt_uk = '' WHERE alt_uk IS NULL;
UPDATE hero_slides SET alt_ru = '' WHERE alt_ru IS NULL;
UPDATE hero_slides SET alt_en = '' WHERE alt_en IS NULL;

ALTER TABLE hero_slides
  ALTER COLUMN alt_uk SET NOT NULL,
  ALTER COLUMN alt_ru SET NOT NULL,
  ALTER COLUMN alt_en SET NOT NULL;
