-- Run this in the Supabase SQL Editor.
-- Adds delivery address fields to the profiles table so customers
-- can save their address and have it pre-filled at checkout.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS delivery_street TEXT,
  ADD COLUMN IF NOT EXISTS delivery_city   TEXT,
  ADD COLUMN IF NOT EXISTS delivery_zip    TEXT;
