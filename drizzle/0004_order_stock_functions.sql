-- Reserves stock for every item of an order, all or nothing. Called in the same
-- db.batch (one transaction) that inserts the order, so a shortfall raises
-- insufficient_stock and rolls the order back too. Rows are locked in a fixed
-- (product_id, size) order so concurrent checkouts cannot deadlock.
CREATE OR REPLACE FUNCTION reserve_order_stock(p_order_id uuid) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT product_id, size, quantity FROM order_items
    WHERE order_id = p_order_id
    ORDER BY product_id, size
  LOOP
    UPDATE product_stock
    SET quantity = quantity - item.quantity
    WHERE product_id = item.product_id AND size = item.size AND quantity >= item.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'insufficient_stock'
        USING ERRCODE = 'P0001', DETAIL = coalesce(item.product_id::text, 'deleted') || ':' || item.size;
    END IF;
  END LOOP;
END;
$$;
