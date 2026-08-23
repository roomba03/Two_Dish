-- ============================================================
-- Atomic order placement — run this in the Supabase SQL Editor.
--
-- Fixes a race condition: submitCheckoutOrder() used to read
-- menu_schedule.orders_count, decide in application code whether there was
-- room, then insert the order and update orders_count as separate steps.
-- Two checkouts landing in the same window could both pass the capacity/
-- time-slot check before either had written anything, both insert an order,
-- and oversell the last spot.
--
-- This function does the capacity check, time-slot check, order insert, and
-- orders_count increment inside a single transaction, taking a row lock on
-- the menu_schedule row first (`FOR UPDATE`) so a second concurrent call for
-- the same delivery day blocks until the first one commits or rolls back —
-- it then re-evaluates against the now-current count instead of a stale read.
-- ============================================================

CREATE OR REPLACE FUNCTION place_order(
    p_order_number             text,
    p_customer_id              uuid,
    p_schedule_id              uuid,
    p_quantity                 integer,
    p_time_slot                delivery_slot,
    p_stripe_payment_intent_id text,
    p_total_price              numeric,
    p_customer_name            text,
    p_customer_phone           text,
    p_delivery_street          text,
    p_delivery_city            text,
    p_delivery_zip             text,
    p_snapshot_dish_name       text,
    p_snapshot_unit_price      numeric,
    p_snapshot_kitchen_id      uuid
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_max_capacity  integer;
    v_orders_count  integer;
    v_remaining     integer;
    v_slot_count    integer;
    v_half_capacity numeric;
BEGIN
    -- Locks the row for the rest of this transaction — a concurrent call for
    -- the same schedule_id waits here instead of reading a stale count.
    SELECT max_capacity, orders_count INTO v_max_capacity, v_orders_count
    FROM menu_schedule
    WHERE id = p_schedule_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'SCHEDULE_NOT_FOUND';
    END IF;

    v_remaining := v_max_capacity - v_orders_count;
    IF p_quantity > v_remaining THEN
        RAISE EXCEPTION 'CAPACITY_EXCEEDED:%', v_remaining;
    END IF;

    -- A time slot fills up once it reaches half the day's capacity — the
    -- other half is reserved for the other slot. Mirrors the app-level rule
    -- in checkoutActions.ts / CheckoutForm.tsx.
    v_half_capacity := v_max_capacity / 2.0;

    SELECT COALESCE(SUM(quantity), 0) INTO v_slot_count
    FROM orders
    WHERE schedule_id = p_schedule_id
      AND time_slot = p_time_slot
      AND status <> 'cancelled';

    IF v_slot_count >= v_half_capacity THEN
        RAISE EXCEPTION 'SLOT_FULL';
    END IF;

    INSERT INTO orders (
        order_number, customer_id, schedule_id, quantity, time_slot, status,
        stripe_payment_intent_id, total_price, customer_name, customer_phone,
        delivery_street, delivery_city, delivery_zip,
        snapshot_dish_name, snapshot_unit_price, snapshot_kitchen_id
    ) VALUES (
        p_order_number, p_customer_id, p_schedule_id, p_quantity, p_time_slot, 'authorized',
        p_stripe_payment_intent_id, p_total_price, p_customer_name, p_customer_phone,
        p_delivery_street, p_delivery_city, p_delivery_zip,
        p_snapshot_dish_name, p_snapshot_unit_price, p_snapshot_kitchen_id
    );

    UPDATE menu_schedule
    SET orders_count = orders_count + p_quantity
    WHERE id = p_schedule_id;
END;
$$;
