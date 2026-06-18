-- ============================================================
-- The Family Business — Database Schema
-- Run this in the Supabase SQL Editor in one shot.
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('customer', 'cook', 'admin');
CREATE TYPE delivery_slot AS ENUM ('early', 'late');
CREATE TYPE order_status AS ENUM (
    'pending',
    'authorized',
    'paid',
    'preparing',
    'delivered',
    'cancelled',
    'refunded'
);

-- ── 1. Kitchens ───────────────────────────────────────────────
-- Multi-kitchen ready. Day 1: one row seeded for the family kitchen.

CREATE TABLE kitchens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT        NOT NULL,
    active_zips TEXT[]      NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Profiles ───────────────────────────────────────────────
-- Mirrors Supabase auth.users 1-to-1.
-- kitchen_id: NULL for customers; set for cook/admin staff.
-- stripe_account_id: reserved for future Stripe Connect payouts.

CREATE TABLE profiles (
    id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    kitchen_id        UUID        REFERENCES kitchens(id) ON DELETE SET NULL,
    email             TEXT        UNIQUE NOT NULL,
    name              TEXT        NOT NULL,
    phone             TEXT        NOT NULL,
    role              user_role   NOT NULL DEFAULT 'customer',
    stripe_account_id TEXT        DEFAULT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Menu Items ─────────────────────────────────────────────
-- Dish catalog belonging to a kitchen.

CREATE TABLE menu_items (
    id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    kitchen_id  UUID           NOT NULL REFERENCES kitchens(id) ON DELETE CASCADE,
    name        TEXT           NOT NULL,
    description TEXT           NOT NULL,
    price       NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    image_url   TEXT,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── 4. Menu Schedule ──────────────────────────────────────────
-- Core engine: one dish per kitchen per date (enforced by unique constraint).
-- assigned_cook_id: Day 1 = any family member; Future = per-shift cook isolation.
-- max_capacity / orders_count: real-time inventory ceiling.

CREATE TABLE menu_schedule (
    id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    kitchen_id       UUID    NOT NULL REFERENCES kitchens(id) ON DELETE CASCADE,
    menu_item_id     UUID    NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    delivery_date    DATE    NOT NULL,
    assigned_cook_id UUID    NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    max_capacity     INTEGER NOT NULL DEFAULT 50 CHECK (max_capacity >= 0),
    orders_count     INTEGER NOT NULL DEFAULT 0  CHECK (orders_count >= 0),

    -- Prevents double-scheduling the same kitchen on the same date.
    CONSTRAINT unique_kitchen_delivery_date UNIQUE (kitchen_id, delivery_date),

    -- Prevents overselling.
    CONSTRAINT orders_within_capacity CHECK (orders_count <= max_capacity)
);

-- ── 5. Ingredients ────────────────────────────────────────────
-- Scaling ratios per dish; drives the Ingredient Calculator.

CREATE TABLE ingredients (
    id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id      UUID           NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name              TEXT           NOT NULL,
    per_unit_quantity NUMERIC(10, 3) NOT NULL CHECK (per_unit_quantity > 0),
    unit              TEXT           NOT NULL
);

-- ── 6. Orders ─────────────────────────────────────────────────
-- Immutable ledger row per transaction.
-- snapshot_* fields preserve the dish name and price at time of purchase,
-- making the record tamper-proof even if menu_items are later edited.
-- snapshot_kitchen_id: reserved for multi-kitchen RLS isolation (Future).
-- customer_id: nullable so guest checkouts don't break the schema.

CREATE TABLE orders (
    order_number              TEXT           PRIMARY KEY,
    customer_id               UUID           REFERENCES profiles(id) ON DELETE SET NULL,
    schedule_id               UUID           NOT NULL REFERENCES menu_schedule(id) ON DELETE RESTRICT,
    quantity                  INTEGER        NOT NULL CHECK (quantity > 0 AND quantity <= 15),
    time_slot                 delivery_slot  NOT NULL,
    status                    order_status   NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id  TEXT           NOT NULL,
    total_price               NUMERIC(10, 2) NOT NULL,
    customer_name             TEXT           NOT NULL,
    customer_phone            TEXT           NOT NULL,
    delivery_street           TEXT           NOT NULL,
    delivery_city             TEXT           NOT NULL,
    delivery_zip              TEXT           NOT NULL,
    created_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    snapshot_dish_name        TEXT           NOT NULL,
    snapshot_unit_price       NUMERIC(10, 2) NOT NULL,
    snapshot_kitchen_id       UUID           NOT NULL
);

-- ── Indexes ───────────────────────────────────────────────────
-- These cover the query patterns used day-to-day.

-- Menu schedule lookups by date range (weekly menu grid).
CREATE INDEX idx_menu_schedule_kitchen_date
    ON menu_schedule (kitchen_id, delivery_date);

-- Order lookups by customer (order history portal).
CREATE INDEX idx_orders_customer_id
    ON orders (customer_id);

-- Order lookups by schedule row (cook dashboard / ingredient calculator).
CREATE INDEX idx_orders_schedule_id
    ON orders (schedule_id);

-- Order status filter (admin dashboard active-order counts).
CREATE INDEX idx_orders_status
    ON orders (status);

-- Ingredient lookup per dish (ingredient calculator join).
CREATE INDEX idx_ingredients_menu_item_id
    ON ingredients (menu_item_id);

-- ── Seed: Family Kitchen ──────────────────────────────────────
-- One row anchoring all Day 1 operations.
-- Replace the zip codes with your actual delivery area.

INSERT INTO kitchens (name, active_zips)
VALUES (
    'The Family Kitchen',
    ARRAY['66221']
);
