-- Lets the admin upload a meal photo directly (stored in the DB, resized
-- and compressed to JPEG before saving) instead of only pasting an image URL.
alter table products
  add column image_data bytea,
  add column image_content_type text;
