-- Remove phone number column from members table
ALTER TABLE members DROP COLUMN IF EXISTS phone;
